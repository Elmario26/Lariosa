import React, { FC } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read?: boolean;
}

interface NotificationsPanelProps {
  visible: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead?: () => void;
}

const NotificationsPanel: FC<NotificationsPanelProps> = ({
  visible,
  onClose,
  notifications,
  onMarkAllRead,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            {onMarkAllRead && notifications.some((n) => !n.read) && (
              <TouchableOpacity onPress={onMarkAllRead}>
                <Text style={styles.markRead}>Mark all read</Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <Text style={styles.empty}>You&apos;re all caught up.</Text>
            ) : (
              notifications.map((n) => (
                <View key={n.id} style={[styles.item, !n.read && styles.itemUnread]}>
                  <View style={styles.itemIcon}>
                    <Icon name="bell-ring-outline" size={20} color="#2563EB" />
                  </View>
                  <View style={styles.itemBody}>
                    <Text style={styles.itemTitle}>{n.title}</Text>
                    <Text style={styles.itemText}>{n.body}</Text>
                    <Text style={styles.itemTime}>{n.time}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 24,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  markRead: { fontSize: 14, fontWeight: '600', color: '#2563EB' },
  list: { paddingHorizontal: 16 },
  empty: { textAlign: 'center', color: '#9CA3AF', paddingVertical: 32 },
  item: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  itemUnread: { backgroundColor: '#EFF6FF' },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemBody: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  itemText: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  itemTime: { fontSize: 11, color: '#9CA3AF', marginTop: 6 },
  closeBtn: {
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    alignItems: 'center',
  },
  closeText: { fontWeight: '700', color: '#374151' },
});

export default NotificationsPanel;
