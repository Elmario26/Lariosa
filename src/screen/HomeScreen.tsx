import React, { useState, useMemo, FC, useCallback, useEffect } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '../utils';
import { getUserDisplayName } from '../utils/user';
import { logoutRequest } from '../app/actions';
import { getBookingsRequest } from '../app/actions/bookings';
import {
  formatBookingDateTime,
  getBookingTitle,
  type TestDriveBooking,
  type BookingStatus,
} from '../app/api/bookings';
import { HOME_SERVICE_TILES, HOME_COLORS, type HomeServiceTile } from '../constants/homeDesign';
import { CARD_SHADOW, THEME, getBookingStatusStyle } from '../constants/theme';
import { SCREEN_PADDING, TAB_BAR_BOTTOM_GAP } from '../constants/layout';
import HomeSideMenu from '../components/HomeSideMenu';
import NotificationsPanel from '../components/NotificationsPanel';
import type { AppNotification } from '../utils/notifications';
import { loadServiceBookingsForUser, type LocalServiceBooking } from '../app/api/serviceBookings';
import { buildAppNotifications, applyReadState } from '../utils/notifications';
import AnimatedPressable from '../components/animated/AnimatedPressable';
import { RootState } from '../app/store';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TILE_GAP = 12;
const TILE_WIDTH = (SCREEN_WIDTH - SCREEN_PADDING * 2 - TILE_GAP) / 2;

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
};

function countByStatus(bookings: TestDriveBooking[]) {
  const active = bookings.filter((b) => b.status === 'pending' || b.status === 'approved').length;
  const completed = bookings.filter((b) => b.status === 'completed').length;
  return { active, completed };
}

const HomeScreen: FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, token } = useSelector((s: RootState) => s.auth);
  const { bookings } = useSelector((s: RootState) => s.bookings);

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [serviceBookings, setServiceBookings] = useState<LocalServiceBooking[]>([]);
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(() => new Set());

  const loadBookings = useCallback(() => {
    if (isAuthenticated) dispatch(getBookingsRequest({ silent: true }));
  }, [dispatch, isAuthenticated]);

  const loadServiceBookings = useCallback(async () => {
    if (!isAuthenticated) {
      setServiceBookings([]);
      return;
    }
    const items = await loadServiceBookingsForUser(token);
    setServiceBookings(items);
  }, [isAuthenticated, token]);

  useFocusEffect(
    useCallback(() => {
      loadBookings();
      void loadServiceBookings();
    }, [loadBookings, loadServiceBookings])
  );

  useEffect(() => {
    if (notifOpen) void loadServiceBookings();
  }, [notifOpen, loadServiceBookings]);

  const stats = useMemo(() => countByStatus(bookings), [bookings]);
  const recentBookings = useMemo(() => bookings.slice(0, 6), [bookings]);
  const notifications = useMemo(
    () => applyReadState(buildAppNotifications(bookings, serviceBookings), readNotifIds),
    [bookings, serviceBookings, readNotifIds]
  );
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markNotificationRead = useCallback((id: string) => {
    setReadNotifIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setReadNotifIds(new Set(notifications.map((n) => n.id)));
  }, [notifications]);

  const handleNotificationPress = useCallback(
    (notification: AppNotification) => {
      markNotificationRead(notification.id);
      setNotifOpen(false);

      switch (notification.action.type) {
        case 'test_drive':
          navigation.navigate(ROUTES.BOOKING_DETAIL, {
            kind: 'test_drive',
            bookingId: notification.action.bookingId,
          });
          break;
        case 'service':
          navigation.navigate(ROUTES.BOOKING_DETAIL, {
            kind: 'service',
            serviceBookingId: notification.action.serviceBookingId,
          });
          break;
        case 'appointments':
          navigation.navigate(ROUTES.MY_APPOINTMENTS);
          break;
        default:
          break;
      }
    },
    [markNotificationRead, navigation]
  );

  const onRefresh = (): void => {
    setRefreshing(true);
    loadBookings();
    setRefreshing(false);
  };

  const handleServicePress = (tile: HomeServiceTile): void => {
    if (tile.action.type === 'route') {
      navigation.navigate(tile.action.route, tile.action.params);
    } else {
      navigation.navigate(tile.action.tab);
    }
  };

  const navigateTab = (tab: string): void => {
    navigation.navigate(tab);
  };

  const formatActivityDate = (iso: string): string => {
    const { date, time } = formatBookingDateTime(iso);
    return `${date} at ${time}`;
  };

  const scrollBottom = 88 + insets.bottom + TAB_BAR_BOTTOM_GAP;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={HOME_COLORS.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: scrollBottom }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={HOME_COLORS.accent} />
        }
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setMenuOpen(true)} activeOpacity={0.8}>
            <Icon name="menu" size={24} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setNotifOpen(true)} activeOpacity={0.8}>
            <Icon name="bell-outline" size={24} color="#374151" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.hello}>Hello{user ? `, ${getUserDisplayName(user).split(' ')[0]}` : ''}!</Text>
          <Text style={styles.subHello}>What do you plan to do today?</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate(ROUTES.MY_APPOINTMENTS)}
            activeOpacity={0.85}
          >
            <Text style={styles.statNumber}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate(ROUTES.MY_APPOINTMENTS)}
            activeOpacity={0.85}
          >
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </TouchableOpacity>
        </View>

        {/* Recent activity */}
        {recentBookings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>Recent activity</Text>
              <TouchableOpacity onPress={() => navigation.navigate(ROUTES.MY_APPOINTMENTS)}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.activityScroll}
              contentContainerStyle={styles.activityScrollContent}
            >
              {recentBookings.map((item) => {
                const tag = getBookingStatusStyle(item.status);
                return (
                  <View key={item.id} style={styles.activityCardWrap}>
                    <AnimatedPressable
                      style={styles.activityCard}
                      onPress={() => navigation.navigate(ROUTES.BOOKING_DETAIL, { bookingId: item.id })}
                    >
                      <View style={[styles.activityTag, { backgroundColor: tag.bg }]}>
                        <Text style={[styles.activityTagText, { color: tag.text }]}>Test drive</Text>
                      </View>
                      <Text style={styles.activityTitle} numberOfLines={2}>
                        {getBookingTitle(item)}
                      </Text>
                      <Text style={styles.activityDate}>{formatActivityDate(item.requestedDateTime)}</Text>
                      <View style={[styles.statusPill, { backgroundColor: tag.bg }]}>
                        <Icon name="clock-outline" size={14} color={tag.text} />
                        <Text style={[styles.statusPillText, { color: tag.text }]}>
                          {STATUS_LABEL[item.status]}
                        </Text>
                      </View>
                    </AnimatedPressable>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Services grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitlePadded}>Services</Text>
          <View style={styles.tilesGrid}>
            {HOME_SERVICE_TILES.map((tile, index) => (
              <AnimatedPressable
                key={tile.id}
                style={[
                  styles.serviceTile,
                  { backgroundColor: tile.color, width: TILE_WIDTH },
                  index === HOME_SERVICE_TILES.length - 1 && styles.serviceTileWide,
                ]}
                onPress={() => handleServicePress(tile)}
              >
                <Icon name={tile.icon} size={36} color="#fff" />
                <Text style={styles.serviceTileText}>{tile.title}</Text>
              </AnimatedPressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <HomeSideMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
        onNavigateTab={navigateTab}
        onLogout={() => dispatch(logoutRequest())}
      />

      <NotificationsPanel
        visible={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onNotificationPress={handleNotificationPress}
        onMarkAllRead={handleMarkAllRead}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: HOME_COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 12,
    paddingBottom: 4,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: HOME_COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    ...CARD_SHADOW,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  greeting: {
    paddingHorizontal: SCREEN_PADDING,
    marginTop: 8,
    marginBottom: 20,
  },
  hello: {
    fontSize: 32,
    fontWeight: '800',
    color: HOME_COLORS.text,
    letterSpacing: -0.5,
  },
  subHello: {
    fontSize: 16,
    color: HOME_COLORS.textMuted,
    marginTop: 6,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SCREEN_PADDING,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: HOME_COLORS.card,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    ...CARD_SHADOW,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: HOME_COLORS.textOnCard,
  },
  statLabel: {
    fontSize: 14,
    color: HOME_COLORS.textMutedOnCard,
    marginTop: 4,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: HOME_COLORS.text,
    marginBottom: 14,
  },
  sectionTitlePadded: {
    fontSize: 18,
    fontWeight: '700',
    color: HOME_COLORS.text,
    paddingHorizontal: SCREEN_PADDING,
    marginBottom: 14,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: HOME_COLORS.accent,
    paddingRight: SCREEN_PADDING,
  },
  activityScroll: {
    paddingLeft: SCREEN_PADDING,
    overflow: 'visible',
  },
  activityScrollContent: {
    paddingTop: 6,
    paddingBottom: 8,
    paddingRight: SCREEN_PADDING,
  },
  activityCardWrap: {
    marginRight: 12,
    paddingBottom: 10,
  },
  activityCard: {
    width: 200,
    backgroundColor: HOME_COLORS.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    ...CARD_SHADOW,
  },
  activityTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  activityTagText: { fontSize: 11, fontWeight: '700' },
  activityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: HOME_COLORS.textOnCard,
    lineHeight: 20,
    minHeight: 40,
  },
  activityDate: {
    fontSize: 12,
    color: HOME_COLORS.textMutedOnCard,
    marginTop: 8,
    marginBottom: 10,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusPillText: { fontSize: 12, fontWeight: '700' },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SCREEN_PADDING,
    gap: TILE_GAP,
  },
  serviceTile: {
    height: 120,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  serviceTileWide: {
    width: SCREEN_WIDTH - SCREEN_PADDING * 2,
  },
  serviceTileText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
});

export default HomeScreen;
