import React, { FC, ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '../utils';
import { getBookingsRequest, deleteBookingRequest } from '../app/actions/bookings';
import {
  formatBookingDateTime,
  getBookingTitle,
  canModifyBooking,
  type TestDriveBooking,
} from '../app/api/bookings';
import {
  loadLocalServiceBookings,
  deleteLocalServiceBooking,
  type LocalServiceBooking,
} from '../app/api/serviceBookings';
import { SCREEN_PADDING, TAB_BAR_BOTTOM_GAP } from '../constants/layout';
import { HOME_COLORS } from '../constants/homeDesign';
import { THEME, CARD_SHADOW, getBookingStatusStyle } from '../constants/theme';
import FilterChipRow, { type FilterChipOption } from '../components/FilterChipRow';
import { RootState } from '../app/store';
import { useAppDialog } from '../context/AppDialogContext';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const POLL_INTERVAL_MS = 8000;

type FilterKey = 'all' | 'service' | 'test_drive';

const FILTER_OPTIONS: FilterChipOption[] = [
  { key: 'all', label: 'All' },
  { key: 'service', label: 'Service' },
  { key: 'test_drive', label: 'Test drives' },
];

function capitalizeStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

interface AppointmentCardProps {
  type: 'service' | 'test_drive';
  title: string;
  subtitle: string;
  date: string;
  time: string;
  status: string;
  statusStyle: { bg: string; text: string };
  notes?: string | null;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  deleteLabel?: string;
  actionsDisabled?: boolean;
}

const AppointmentCard: FC<AppointmentCardProps> = ({
  type,
  title,
  subtitle,
  date,
  time,
  status,
  statusStyle,
  notes,
  onPress,
  onEdit,
  onDelete,
  deleteLabel = 'Cancel',
  actionsDisabled,
}) => {
  const isService = type === 'service';
  const iconName = isService ? 'wrench' : 'car';
  const iconColor = isService ? THEME.primary : THEME.accent;
  const iconBg = isService ? THEME.primaryMuted : THEME.accentMuted;
  const typeLabel = isService ? 'Service' : 'Test drive';

  const body = (
    <>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: iconBg }]}>
          <Icon name={iconName} size={22} color={iconColor} />
        </View>
        <View style={styles.cardHeaderText}>
          <View style={styles.cardTitleRow}>
            <View style={styles.typePill}>
              <Text style={styles.typePillText}>{typeLabel}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {capitalizeStatus(status)}
              </Text>
            </View>
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.cardSub} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaChip}>
          <Icon name="calendar-month-outline" size={16} color={THEME.accent} />
          <Text style={styles.metaChipText}>{date}</Text>
        </View>
        <View style={styles.metaChip}>
          <Icon name="clock-outline" size={16} color={THEME.accent} />
          <Text style={styles.metaChipText}>{time}</Text>
        </View>
      </View>

      {notes ? (
        <Text style={styles.notes} numberOfLines={2}>
          {notes}
        </Text>
      ) : null}
    </>
  );

  const showActions = onEdit || onDelete;

  return (
    <View style={styles.card}>
      {onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.cardTouchable}>
          {body}
        </TouchableOpacity>
      ) : (
        <View style={styles.cardTouchable}>{body}</View>
      )}
      {showActions && (
        <View style={styles.cardActions}>
          {onEdit && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onEdit}
              disabled={actionsDisabled}
              activeOpacity={0.7}
            >
              <Icon name="pencil-outline" size={18} color={THEME.accent} />
              <Text style={styles.actionEdit}>Edit</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionBtn, !onEdit && styles.actionBtnFull]}
              onPress={onDelete}
              disabled={actionsDisabled}
              activeOpacity={0.7}
            >
              <Icon name="close-circle-outline" size={18} color={THEME.error} />
              <Text style={styles.actionDelete}>{deleteLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const AppointmentsScreen: FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const dialog = useAppDialog();
  const insets = useSafeAreaInsets();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasLoadedOnce = useRef(false);
  const [serviceBookings, setServiceBookings] = useState<LocalServiceBooking[]>([]);
  const [filter, setFilter] = useState<FilterKey>('all');

  const { bookings, isLoading, isRefreshing, isSubmitting, error } = useSelector(
    (s: RootState) => s.bookings
  );
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);

  const syncBookings = useCallback(
    (opts: { silent?: boolean; refresh?: boolean } = {}) => {
      if (isAuthenticated) {
        dispatch(getBookingsRequest(opts));
      }
    },
    [dispatch, isAuthenticated]
  );

  const loadServiceBookings = useCallback(async () => {
    const items = await loadLocalServiceBookings();
    setServiceBookings(items);
  }, []);

  const onPullRefresh = useCallback(() => {
    syncBookings({ refresh: true });
    void loadServiceBookings();
  }, [syncBookings, loadServiceBookings]);

  useFocusEffect(
    useCallback(() => {
      void loadServiceBookings();

      if (!isAuthenticated) return undefined;

      const silent = hasLoadedOnce.current || bookings.length > 0;
      syncBookings({ silent });
      hasLoadedOnce.current = true;

      pollRef.current = setInterval(() => syncBookings({ silent: true }), POLL_INTERVAL_MS);

      return () => {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      };
    }, [syncBookings, isAuthenticated, bookings.length, loadServiceBookings])
  );

  const totalCount = serviceBookings.length + bookings.length;
  const pendingCount = useMemo(() => {
    const servicePending = serviceBookings.length;
    const testPending = bookings.filter((b) => b.status === 'pending').length;
    return servicePending + testPending;
  }, [serviceBookings, bookings]);

  const appointmentFilterOptions = useMemo<FilterChipOption[]>(
    () =>
      FILTER_OPTIONS.map((opt) => ({
        ...opt,
        count:
          opt.key === 'all'
            ? totalCount
            : opt.key === 'service'
              ? serviceBookings.length
              : bookings.length,
      })),
    [totalCount, serviceBookings.length, bookings.length]
  );

  const showService = filter === 'all' || filter === 'service';
  const showTestDrive = filter === 'all' || filter === 'test_drive';

  const filteredEmpty =
    (filter === 'service' && serviceBookings.length === 0) ||
    (filter === 'test_drive' && bookings.length === 0);

  const handleDeleteService = (item: LocalServiceBooking): void => {
    dialog.confirm({
      title: 'Cancel service request',
      message: `Remove your ${item.serviceName} appointment request?`,
      cancelText: 'Keep',
      confirmText: 'Remove',
      destructive: true,
      onConfirm: async () => {
        await deleteLocalServiceBooking(item.id);
        await loadServiceBookings();
      },
    });
  };

  const handleDeleteTestDrive = (item: TestDriveBooking): void => {
    dialog.confirm({
      title: 'Cancel booking',
      message: 'Remove this test drive request? This cannot be undone.',
      cancelText: 'Keep',
      confirmText: 'Delete',
      destructive: true,
      onConfirm: () => dispatch(deleteBookingRequest(item.id)),
    });
  };

  const showInitialLoader = isLoading && bookings.length === 0 && serviceBookings.length === 0;
  const hasAnyAppointment = totalCount > 0;
  const bottomPad = 72 + insets.bottom + TAB_BAR_BOTTOM_GAP;

  const renderContent = (): ReactNode => {
    if (!isAuthenticated) {
      return (
        <View style={styles.guestCard}>
          <View style={styles.emptyIconWrap}>
            <Icon name="account-lock-outline" size={36} color={THEME.accent} />
          </View>
          <Text style={styles.emptyTitle}>Sign in to view appointments</Text>
          <Text style={styles.emptySub}>
            Book test drives and service visits once you are logged in.
          </Text>
        </View>
      );
    }

    if (showInitialLoader) {
      return <ActivityIndicator color={THEME.accent} style={styles.loader} />;
    }

    if (error && bookings.length === 0 && serviceBookings.length === 0) {
      return (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconWrap, styles.emptyIconError]}>
            <Icon name="cloud-off-outline" size={36} color={THEME.error} />
          </View>
          <Text style={styles.emptyTitle}>Could not load appointments</Text>
          <Text style={styles.emptySub}>{error}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => syncBookings({})}>
            <Text style={styles.primaryBtnText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!hasAnyAppointment) {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Icon name="calendar-blank-outline" size={40} color={THEME.accent} />
          </View>
          <Text style={styles.emptyTitle}>No appointments yet</Text>
          <Text style={styles.emptySub}>
            Schedule a test drive or book a service for your vehicle.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate(ROUTES.BOOK_APPOINTMENT, { intent: 'service' })}
          >
            <Icon name="wrench-clock" size={20} color="#fff" style={styles.btnIcon} />
            <Text style={styles.primaryBtnText}>Book service</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate(ROUTES.TEST_DRIVE)}
          >
            <Icon name="car-clock" size={20} color={THEME.accent} style={styles.btnIcon} />
            <Text style={styles.secondaryBtnText}>Schedule test drive</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredEmpty) {
      return (
        <View style={styles.filteredEmpty}>
          <Text style={styles.filteredEmptyText}>Nothing in this category yet.</Text>
        </View>
      );
    }

    return (
      <>
        {showService &&
          serviceBookings.map((item) => {
            const { date, time } = formatBookingDateTime(item.requestedDateTime);
            return (
              <AppointmentCard
                key={item.id}
                type="service"
                title={item.serviceName}
                subtitle={item.vehicleDescription}
                date={date}
                time={time}
                status="pending"
                statusStyle={getBookingStatusStyle('pending')}
                notes={item.notes}
                onDelete={() => handleDeleteService(item)}
                deleteLabel="Remove"
              />
            );
          })}
        {showTestDrive &&
          bookings.map((item) => {
            const { date, time } = formatBookingDateTime(item.requestedDateTime);
            const modifiable = canModifyBooking(item);
            return (
              <AppointmentCard
                key={String(item.id)}
                type="test_drive"
                title={getBookingTitle(item)}
                subtitle={`${item.car.brand} ${item.car.model}`}
                date={date}
                time={time}
                status={item.status}
                statusStyle={getBookingStatusStyle(item.status)}
                notes={item.notes}
                onPress={() => navigation.navigate(ROUTES.BOOKING_DETAIL, { bookingId: item.id })}
                onEdit={modifiable ? () => navigation.navigate(ROUTES.EDIT_BOOKING, { bookingId: item.id }) : undefined}
                onDelete={modifiable ? () => handleDeleteTestDrive(item) : undefined}
                actionsDisabled={isSubmitting}
              />
            );
          })}
      </>
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Appointments</Text>
          {isAuthenticated && hasAnyAppointment && (
            <Text style={styles.headerSub}>
              {totalCount} total{pendingCount > 0 ? ` · ${pendingCount} pending` : ''}
            </Text>
          )}
        </View>
      </View>

      {isAuthenticated && (
        <View style={styles.quickRow}>
          <TouchableOpacity
            style={styles.quickChip}
            onPress={() => navigation.navigate(ROUTES.BOOK_APPOINTMENT, { intent: 'service' })}
            activeOpacity={0.85}
          >
            <View style={[styles.quickChipIcon, { backgroundColor: THEME.primaryMuted }]}>
              <Icon name="plus" size={18} color={THEME.primary} />
            </View>
            <Text style={styles.quickChipText}>Book service</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickChip}
            onPress={() => navigation.navigate(ROUTES.TEST_DRIVE)}
            activeOpacity={0.85}
          >
            <View style={[styles.quickChipIcon, { backgroundColor: THEME.accentMuted }]}>
              <Icon name="plus" size={18} color={THEME.accent} />
            </View>
            <Text style={styles.quickChipText}>Test drive</Text>
          </TouchableOpacity>
        </View>
      )}

      {isAuthenticated && hasAnyAppointment && (
        <FilterChipRow
          style={styles.filterRowWrap}
          options={appointmentFilterOptions}
          value={filter}
          onChange={(key) => setFilter(key as FilterKey)}
          hideZeroCount
          alwaysShowKeys={['all']}
        />
      )}

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          isAuthenticated ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onPullRefresh}
              tintColor={THEME.accent}
            />
          ) : undefined
        }
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: HOME_COLORS.background },
  header: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: HOME_COLORS.text,
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 14,
    color: HOME_COLORS.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  quickRow: {
    flexDirection: 'row',
    paddingHorizontal: SCREEN_PADDING,
    gap: 10,
    marginTop: 12,
    marginBottom: 4,
  },
  quickChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    ...CARD_SHADOW,
  },
  quickChipIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  quickChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: HOME_COLORS.text,
    flex: 1,
  },
  filterRowWrap: {
    paddingHorizontal: SCREEN_PADDING,
    marginTop: 14,
    marginBottom: 10,
  },
  list: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 12,
  },
  loader: { marginTop: 48 },
  card: {
    backgroundColor: THEME.card,
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    ...CARD_SHADOW,
  },
  cardTouchable: { padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardHeaderText: { flex: 1 },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: THEME.background,
  },
  typePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: HOME_COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: HOME_COLORS.text,
    lineHeight: 22,
  },
  cardSub: {
    fontSize: 13,
    color: HOME_COLORS.textMuted,
    marginTop: 3,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  metaChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.background,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  metaChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: HOME_COLORS.text,
    flex: 1,
  },
  notes: {
    fontSize: 13,
    color: HOME_COLORS.textMuted,
    marginTop: 12,
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: THEME.border,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    gap: 6,
  },
  actionBtnFull: { flex: 1 },
  actionEdit: { color: THEME.accent, fontWeight: '600', fontSize: 14 },
  actionDelete: { color: THEME.error, fontWeight: '600', fontSize: 14 },
  guestCard: {
    backgroundColor: THEME.card,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    ...CARD_SHADOW,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyIconError: {
    backgroundColor: THEME.errorMuted,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: HOME_COLORS.text,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    color: HOME_COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  filteredEmpty: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  filteredEmptyText: {
    fontSize: 14,
    color: HOME_COLORS.textMuted,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 24,
    minWidth: 220,
    ...CARD_SHADOW,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.card,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 12,
    minWidth: 220,
    borderWidth: 1,
    borderColor: THEME.accent,
  },
  secondaryBtnText: { color: THEME.accent, fontWeight: '700', fontSize: 16 },
  btnIcon: { marginRight: 8 },
});

export default AppointmentsScreen;
