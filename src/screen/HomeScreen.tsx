import React, { useState, useMemo, FC, useCallback } from 'react';
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
import { SCREEN_PADDING, TAB_BAR_BOTTOM_GAP } from '../constants/layout';
import HomeSideMenu from '../components/HomeSideMenu';
import NotificationsPanel, { type AppNotification } from '../components/NotificationsPanel';
import { RootState } from '../app/store';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TILE_GAP = 12;
const TILE_WIDTH = (SCREEN_WIDTH - SCREEN_PADDING * 2 - TILE_GAP) / 2;

const STATUS_TAG: Record<BookingStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: '#FEF3C7', text: '#D97706' },
  approved: { label: 'Approved', bg: '#DBEAFE', text: '#2563EB' },
  rejected: { label: 'Rejected', bg: '#FEE2E2', text: '#DC2626' },
  completed: { label: 'Completed', bg: '#D1FAE5', text: '#059669' },
};

function countByStatus(bookings: TestDriveBooking[]) {
  const active = bookings.filter((b) => b.status === 'pending' || b.status === 'approved').length;
  const completed = bookings.filter((b) => b.status === 'completed').length;
  return { active, completed };
}

function buildNotifications(bookings: TestDriveBooking[]): AppNotification[] {
  const items: AppNotification[] = bookings.slice(0, 5).map((b) => {
    const tag = STATUS_TAG[b.status];
    return {
      id: `booking-${b.id}`,
      title: `${tag.label}: ${getBookingTitle(b)}`,
      body: `Scheduled for ${formatBookingDateTime(b.requestedDateTime).date}`,
      time: b.updatedAt ?? b.createdAt ?? 'Recently',
      read: b.status !== 'pending',
    };
  });
  if (items.length < 3) {
    items.push({
      id: 'welcome',
      title: 'Welcome to LaRiosa',
      body: 'Browse inventory or schedule a test drive from the home screen.',
      time: 'Today',
      read: false,
    });
  }
  return items.slice(0, 6);
}

const HomeScreen: FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
  const { bookings } = useSelector((s: RootState) => s.bookings);

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = useCallback(() => {
    if (isAuthenticated) dispatch(getBookingsRequest());
  }, [dispatch, isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [loadBookings])
  );

  const stats = useMemo(() => countByStatus(bookings), [bookings]);
  const recentBookings = useMemo(() => bookings.slice(0, 6), [bookings]);
  const notifications = useMemo(() => buildNotifications(bookings), [bookings]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const onRefresh = (): void => {
    setRefreshing(true);
    loadBookings();
    setRefreshing(false);
  };

  const handleServicePress = (tile: HomeServiceTile): void => {
    if (tile.action.type === 'route') {
      navigation.navigate(tile.action.route);
    } else {
      navigation.navigate(tile.action.tab);
    }
  };

  const navigateTab = (tab: string): void => {
    navigation.navigate(tab);
  };

  const formatActivityDate = (iso: string): string => {
    const { date, time } = formatBookingDateTime(iso);
    const [y, m, d] = date.split('-');
    return `${d}.${m}.${y} at ${time}`;
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activityScroll}>
              {recentBookings.map((item) => {
                const tag = STATUS_TAG[item.status];
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.activityCard}
                    onPress={() => navigation.navigate(ROUTES.BOOKING_DETAIL, { bookingId: item.id })}
                    activeOpacity={0.9}
                  >
                    <View style={[styles.activityTag, { backgroundColor: '#E0F2FE' }]}>
                      <Text style={[styles.activityTagText, { color: '#0284C7' }]}>Test drive</Text>
                    </View>
                    <Text style={styles.activityTitle} numberOfLines={2}>
                      {getBookingTitle(item)}
                    </Text>
                    <Text style={styles.activityDate}>{formatActivityDate(item.requestedDateTime)}</Text>
                    <View style={[styles.statusPill, { backgroundColor: tag.bg }]}>
                      <Icon name="clock-outline" size={14} color={tag.text} />
                      <Text style={[styles.statusPillText, { color: tag.text }]}>{tag.label}</Text>
                    </View>
                  </TouchableOpacity>
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
              <TouchableOpacity
                key={tile.id}
                style={[
                  styles.serviceTile,
                  { backgroundColor: tile.color, width: TILE_WIDTH },
                  index === HOME_SERVICE_TILES.length - 1 && styles.serviceTileWide,
                ]}
                onPress={() => handleServicePress(tile)}
                activeOpacity={0.88}
              >
                <Icon name={tile.icon} size={36} color="#fff" />
                <Text style={styles.serviceTileText}>{tile.title}</Text>
              </TouchableOpacity>
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
        onMarkAllRead={() => setNotifOpen(false)}
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
    paddingTop: 8,
    paddingBottom: 4,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: HOME_COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: HOME_COLORS.text,
  },
  statLabel: {
    fontSize: 14,
    color: HOME_COLORS.textMuted,
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
  },
  activityCard: {
    width: 200,
    backgroundColor: HOME_COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
    color: HOME_COLORS.text,
    lineHeight: 20,
    minHeight: 40,
  },
  activityDate: {
    fontSize: 12,
    color: HOME_COLORS.textMuted,
    marginTop: 8,
    marginBottom: 12,
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
