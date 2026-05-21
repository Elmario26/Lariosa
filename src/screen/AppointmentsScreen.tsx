import React, { FC, JSX, useCallback, useRef } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
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
  type BookingStatus,
} from '../app/api/bookings';
import { SCREEN_PADDING, TAB_BAR_BOTTOM_GAP } from '../constants/layout';
import { HOME_COLORS } from '../constants/homeDesign';
import { RootState } from '../app/store';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const POLL_INTERVAL_MS = 8000;

const getStatusColor = (status: BookingStatus | string): { bg: string; text: string } => {
  switch (status) {
    case 'approved':
      return { bg: '#DBEAFE', text: '#2563EB' };
    case 'pending':
      return { bg: '#FEF3C7', text: '#D97706' };
    case 'completed':
      return { bg: '#D1FAE5', text: '#059669' };
    case 'rejected':
      return { bg: '#FEE2E2', text: '#DC2626' };
    default:
      return { bg: '#F3F4F6', text: '#6B7280' };
  }
};

const AppointmentsScreen: FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { bookings, isLoading, isSubmitting, error } = useSelector((s: RootState) => s.bookings);
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);

  const loadBookings = useCallback(() => {
    if (isAuthenticated) dispatch(getBookingsRequest());
  }, [dispatch, isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      loadBookings();
      pollRef.current = setInterval(loadBookings, POLL_INTERVAL_MS);
      return () => {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      };
    }, [loadBookings])
  );

  const handleDelete = (item: TestDriveBooking): void => {
    Alert.alert('Cancel booking', 'Remove this test drive request?', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => dispatch(deleteBookingRequest(item.id)),
      },
    ]);
  };

  const renderBooking = (item: TestDriveBooking): JSX.Element => {
    const statusColor = getStatusColor(item.status);
    const { date, time } = formatBookingDateTime(item.requestedDateTime);
    const modifiable = canModifyBooking(item);

    return (
      <View key={String(item.id)} style={styles.card}>
        <TouchableOpacity
          onPress={() => navigation.navigate(ROUTES.BOOKING_DETAIL, { bookingId: item.id })}
          style={styles.cardBody}
          activeOpacity={0.9}
        >
          <View style={styles.cardTop}>
            <View style={styles.cardIcon}>
              <Icon name="car" size={24} color="#2563EB" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{getBookingTitle(item)}</Text>
              <Text style={styles.cardSub}>Test drive</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.statusText, { color: statusColor.text }]}>{item.status}</Text>
            </View>
          </View>
          <View style={styles.cardMeta}>
            <Icon name="calendar" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{date}</Text>
            <Icon name="clock-outline" size={16} color="#6B7280" style={{ marginLeft: 12 }} />
            <Text style={styles.metaText}>{time}</Text>
          </View>
        </TouchableOpacity>
        {modifiable && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate(ROUTES.EDIT_BOOKING, { bookingId: item.id })}
              disabled={isSubmitting}
            >
              <Icon name="pencil-outline" size={18} color="#2563EB" />
              <Text style={styles.actionEdit}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleDelete(item)}
              disabled={isSubmitting}
            >
              <Icon name="delete-outline" size={18} color="#DC2626" />
              <Text style={styles.actionDelete}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const bottomPad = 72 + insets.bottom + TAB_BAR_BOTTOM_GAP;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My appointments</Text>
        <Text style={styles.headerSub}>Your test drive bookings</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadBookings} tintColor={HOME_COLORS.accent} />
        }
      >
        {!isAuthenticated ? (
          <Text style={styles.empty}>Log in to see your appointments.</Text>
        ) : isLoading && bookings.length === 0 ? (
          <ActivityIndicator color={HOME_COLORS.accent} style={{ marginTop: 40 }} />
        ) : error && bookings.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={loadBookings}>
              <Text style={styles.primaryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : bookings.length > 0 ? (
          bookings.map((b) => renderBooking(b))
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.empty}>No appointments yet.</Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigation.navigate(ROUTES.TEST_DRIVE)}
            >
              <Text style={styles.primaryBtnText}>Schedule test drive</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: HOME_COLORS.background },
  header: {
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: HOME_COLORS.text },
  headerSub: { fontSize: 14, color: HOME_COLORS.textMuted, marginTop: 4 },
  list: { padding: SCREEN_PADDING, paddingTop: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  cardBody: { padding: 16 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: HOME_COLORS.text },
  cardSub: { fontSize: 13, color: HOME_COLORS.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  metaText: { fontSize: 13, color: '#6B7280', marginLeft: 6 },
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  actionEdit: { color: '#2563EB', fontWeight: '600', marginLeft: 6 },
  actionDelete: { color: '#DC2626', fontWeight: '600', marginLeft: 6 },
  empty: { textAlign: 'center', color: HOME_COLORS.textMuted, marginTop: 40 },
  emptyBox: { alignItems: 'center', marginTop: 40 },
  errorText: { color: '#DC2626', textAlign: 'center', marginBottom: 12 },
  primaryBtn: { backgroundColor: '#2563EB', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, marginTop: 12 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
});

export default AppointmentsScreen;
