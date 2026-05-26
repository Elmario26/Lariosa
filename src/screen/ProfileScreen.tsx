import React, { FC, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '../utils';
import { getUserRequest, logoutRequest } from '../app/actions';
import { RootState } from '../app/store';
import { formatUserRole, getUserDisplayName, getUserInitials } from '../utils/user';
import { HOME_COLORS } from '../constants/homeDesign';
import { THEME, CARD_SHADOW } from '../constants/theme';
import { SCREEN_PADDING, TAB_BAR_BOTTOM_GAP } from '../constants/layout';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  bg: string;
  onPress: () => void;
}

interface SettingsRow {
  id: string;
  title: string;
  icon: string;
  onPress?: () => void;
}

type ProfileScreenProps = StackScreenProps<any, 'Profile'>;

const ProfileScreen: FC<ProfileScreenProps> = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(getUserRequest());
  }, [dispatch]);

  const displayName = getUserDisplayName(user);
  const bottomPad = 72 + insets.bottom + TAB_BAR_BOTTOM_GAP;

  const quickActions: QuickAction[] = [
    {
      id: 'appointments',
      label: 'Appointments',
      icon: 'calendar-check-outline',
      color: THEME.accent,
      bg: THEME.accentMuted,
      onPress: () => navigation.navigate(ROUTES.MY_APPOINTMENTS),
    },
    {
      id: 'service',
      label: 'Book service',
      icon: 'wrench-clock',
      color: THEME.primary,
      bg: THEME.primaryMuted,
      onPress: () => navigation.navigate(ROUTES.BOOK_APPOINTMENT, { intent: 'service' }),
    },
    {
      id: 'history',
      label: 'Service history',
      icon: 'history',
      color: THEME.success,
      bg: THEME.successMuted,
      onPress: () => navigation.navigate(ROUTES.SERVICE_HISTORY),
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: 'car-outline',
      color: THEME.brand,
      bg: '#E8EAED',
      onPress: () => navigation.navigate(ROUTES.INVENTORY),
    },
  ];

  const settingsRows: SettingsRow[] = [
    { id: 'edit', title: 'Edit profile', icon: 'account-edit-outline' },
    { id: 'notifications', title: 'Notifications', icon: 'bell-outline' },
    { id: 'help', title: 'Help & support', icon: 'help-circle-outline' },
  ];

  const accountFields = [
    { label: 'Email', value: user?.email },
    { label: 'Phone', value: user?.phone },
    { label: 'Username', value: user?.username },
    { label: 'Status', value: user?.status },
  ].filter((f) => f.value);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]}
      >
        {/* Profile hero */}
        <View style={styles.heroCard}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              {isLoading && !user?.fullName ? (
                <ActivityIndicator color={THEME.textInverse} />
              ) : (
                <Text style={styles.avatarText}>{getUserInitials(user)}</Text>
              )}
            </View>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          {user?.role ? (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{formatUserRole(user.role)}</Text>
            </View>
          ) : null}
          <Text style={styles.email}>{user?.email || '—'}</Text>
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionLabel}>Quick actions</Text>
        <View style={styles.quickGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickTile}
              onPress={action.onPress}
              activeOpacity={0.85}
            >
              <View style={[styles.quickIcon, { backgroundColor: action.bg }]}>
                <Icon name={action.icon} size={22} color={action.color} />
              </View>
              <Text style={styles.quickLabel} numberOfLines={2}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Account */}
        {accountFields.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Account</Text>
            <View style={styles.card}>
              {accountFields.map((field, index) => (
                <View
                  key={field.label}
                  style={[styles.detailRow, index < accountFields.length - 1 && styles.detailBorder]}
                >
                  <Text style={styles.detailLabel}>{field.label}</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>
                    {field.value}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Settings */}
        <Text style={styles.sectionLabel}>Settings</Text>
        <View style={styles.card}>
          {settingsRows.map((row, index) => (
            <TouchableOpacity
              key={row.id}
              style={[styles.settingsRow, index < settingsRows.length - 1 && styles.detailBorder]}
              onPress={row.onPress}
              activeOpacity={row.onPress ? 0.7 : 1}
              disabled={!row.onPress}
            >
              <View style={styles.settingsIcon}>
                <Icon name={row.icon} size={20} color={THEME.textMuted} />
              </View>
              <Text style={styles.settingsTitle}>{row.title}</Text>
              <Icon name="chevron-right" size={20} color="#C4C4C4" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={() => dispatch(logoutRequest())} activeOpacity={0.85}>
          <Icon name="logout" size={20} color={THEME.error} />
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>LaRiosa · Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: HOME_COLORS.background,
  },
  header: {
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: 16,
    backgroundColor: HOME_COLORS.background,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: HOME_COLORS.text,
  },
  scroll: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 4,
  },
  heroCard: {
    backgroundColor: THEME.card,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    marginBottom: 28,
    ...CARD_SHADOW,
  },
  avatarRing: {
    padding: 4,
    borderRadius: 48,
    backgroundColor: THEME.accentMuted,
    marginBottom: 14,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: THEME.textInverse,
    fontSize: 28,
    fontWeight: '800',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: HOME_COLORS.text,
    letterSpacing: -0.3,
  },
  roleBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: THEME.accentMuted,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.accent,
    textTransform: 'capitalize',
  },
  email: {
    fontSize: 14,
    color: HOME_COLORS.textMuted,
    marginTop: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: HOME_COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  quickTile: {
    width: '48%',
    backgroundColor: THEME.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    ...CARD_SHADOW,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: HOME_COLORS.text,
    lineHeight: 18,
  },
  card: {
    backgroundColor: THEME.card,
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    ...CARD_SHADOW,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  detailBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: THEME.border,
  },
  detailLabel: {
    fontSize: 14,
    color: HOME_COLORS.textMuted,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: HOME_COLORS.text,
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: THEME.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingsTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: HOME_COLORS.text,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.card,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: THEME.errorMuted,
    gap: 8,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.error,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: HOME_COLORS.textMuted,
    marginBottom: 8,
  },
});

export default ProfileScreen;
