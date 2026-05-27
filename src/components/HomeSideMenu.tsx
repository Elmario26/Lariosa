import React, { FC } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SIDE_MENU_ITEMS } from '../constants/homeDesign';
import { getUserDisplayName, getUserInitials } from '../utils/user';
import type { User } from '../app/actions';
import AnimatedModalShell from './animated/AnimatedModalShell';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.78, 320);

interface HomeSideMenuProps {
  visible: boolean;
  onClose: () => void;
  user: User | null | undefined;
  onNavigateTab: (tab: string) => void;
  onLogout: () => void;
}

const HomeSideMenu: FC<HomeSideMenuProps> = ({
  visible,
  onClose,
  user,
  onNavigateTab,
  onLogout,
}) => {
  return (
    <AnimatedModalShell
      visible={visible}
      onClose={onClose}
      placement="left"
      animation="slide-left"
      slideDistance={DRAWER_WIDTH}
      backdropOpacity={0.45}
      panelStyle={styles.drawer}
    >
      <View style={styles.profileBlock}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getUserInitials(user)}</Text>
        </View>
        <Text style={styles.profileName}>{getUserDisplayName(user)}</Text>
        <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
      </View>

      {SIDE_MENU_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.menuRow}
          onPress={() => {
            onNavigateTab(item.tab);
            onClose();
          }}
          activeOpacity={0.7}
        >
          <Icon name={item.icon} size={22} color="#374151" />
          <Text style={styles.menuLabel}>{item.label}</Text>
          <Icon name="chevron-right" size={20} color="#D1D5DB" />
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.menuRow, styles.logoutRow]}
        onPress={() => {
          onClose();
          onLogout();
        }}
        activeOpacity={0.7}
      >
        <Icon name="logout" size={22} color="#DC2626" />
        <Text style={[styles.menuLabel, styles.logoutText]}>Sign out</Text>
      </TouchableOpacity>
    </AnimatedModalShell>
  );
};

const styles = StyleSheet.create({
  drawer: {
    width: DRAWER_WIDTH,
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 48,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  profileBlock: {
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#76ABAE' },
  profileName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  profileEmail: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: '#374151' },
  logoutRow: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 20 },
  logoutText: { color: '#DC2626' },
});

export default HomeSideMenu;
