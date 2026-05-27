import React, { FC } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedModalShell from './animated/AnimatedModalShell';
import { THEME } from '../constants/theme';
import type { AppNotification } from '../utils/notifications';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export type { AppNotification, NotificationAction } from '../utils/notifications';

interface NotificationsPanelProps {
  visible: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onNotificationPress?: (notification: AppNotification) => void;
  onMarkAllRead?: () => void;
}

const WINDOW_HEIGHT = Dimensions.get('window').height;
const SHEET_MAX_HEIGHT = Math.round(WINDOW_HEIGHT * 0.72);
const HANDLE_HEADER_HEIGHT = 72;
const CLOSE_BTN_HEIGHT = 54;

const NotificationsPanel: FC<NotificationsPanelProps> = ({
  visible,
  onClose,
  notifications,
  onNotificationPress,
  onMarkAllRead,
}) => {
  const insets = useSafeAreaInsets();
  const sheetPaddingBottom = Math.max(insets.bottom, 16);
  const listHeight = Math.max(
    200,
    SHEET_MAX_HEIGHT - HANDLE_HEADER_HEIGHT - CLOSE_BTN_HEIGHT - sheetPaddingBottom - 24
  );

  const hasUnread = notifications.some((n) => !n.read);

  const renderItem: ListRenderItem<AppNotification> = ({ item }) => {
    const actionable = item.action.type !== 'none';
    return (
      <TouchableOpacity
        style={[styles.item, !item.read && styles.itemUnread]}
        onPress={() => onNotificationPress?.(item)}
        activeOpacity={actionable ? 0.75 : 1}
        disabled={!actionable || !onNotificationPress}
      >
        <View style={styles.itemIcon}>
          <Icon
            name={item.action.type === 'service' ? 'wrench' : 'bell-ring-outline'}
            size={20}
            color={THEME.accent}
          />
        </View>
        <View style={styles.itemBody}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.itemText} numberOfLines={3}>
            {item.body}
          </Text>
          <Text style={styles.itemTime}>{item.time}</Text>
        </View>
        {actionable && (
          <Icon name="chevron-right" size={22} color="#D1D5DB" style={styles.itemChevron} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <AnimatedModalShell
      visible={visible}
      onClose={onClose}
      placement="bottom"
      animation="slide-up"
      slideDistance={SHEET_MAX_HEIGHT}
      backdropOpacity={0.35}
      panelStyle={{
        ...styles.sheet,
        maxHeight: SHEET_MAX_HEIGHT,
        paddingBottom: sheetPaddingBottom,
      }}
    >
      <View style={styles.handle} />
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {onMarkAllRead && hasUnread && (
          <TouchableOpacity onPress={onMarkAllRead} activeOpacity={0.7}>
            <Text style={styles.markRead}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={[styles.list, { height: listHeight }]}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator
        nestedScrollEnabled
        bounces
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={styles.empty}>You&apos;re all caught up.</Text>}
      />

      <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.85}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
    </AnimatedModalShell>
  );
};

const styles = StyleSheet.create({
  sheet: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#111827' },
  markRead: { fontSize: 14, fontWeight: '600', color: THEME.accent },
  list: {
    width: '100%',
  },
  listContent: {
    paddingBottom: 8,
    flexGrow: 1,
  },
  empty: { textAlign: 'center', color: '#9CA3AF', paddingVertical: 32 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
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
  itemText: { fontSize: 13, color: '#6B7280', marginTop: 4, lineHeight: 18 },
  itemTime: { fontSize: 11, color: '#9CA3AF', marginTop: 6 },
  itemChevron: { marginLeft: 4 },
  closeBtn: {
    marginTop: 8,
    paddingVertical: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    alignItems: 'center',
  },
  closeText: { fontWeight: '700', color: '#374151' },
});

export default NotificationsPanel;
