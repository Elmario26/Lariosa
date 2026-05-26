import React, { FC } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SIDE_MENU_ITEMS } from '../constants/homeDesign';
import { getUserDisplayName, getUserInitials } from '../utils/user';
import type { User } from '../app/actions';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.drawer} onPress={(e) => e.stopPropagation()}>
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
          >
            <Icon name="logout" size={22} color="#DC2626" />
            <Text style={[styles.menuLabel, styles.logoutText]}>Sign out</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawer: {
    width: '78%',
    maxWidth: 320,
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
