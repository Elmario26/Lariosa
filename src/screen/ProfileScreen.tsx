import React, { FC, useEffect } from 'react';
import { Text, View, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '../utils';
import { getUserRequest, logoutRequest } from '../app/actions';
import { RootState } from '../app/store';
import { formatUserRole, getUserDisplayName, getUserInitials } from '../utils/user';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface MenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  color: string;
  action: string;
}

interface SettingsItem {
  id: string;
  title: string;
  icon: string;
  action: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    title: 'My Vehicles',
    subtitle: 'View your owned vehicles',
    icon: 'car-multiple',
    color: '#2563EB',
    action: 'vehicles',
  },
  {
    id: '2',
    title: 'Service History',
    subtitle: 'Past maintenance records',
    icon: 'history',
    color: '#059669',
    action: ROUTES.SERVICE_HISTORY,
  },
  {
    id: '3',
    title: 'Saved Vehicles',
    subtitle: 'Your favorite listings',
    icon: 'heart',
    color: '#DC2626',
    action: 'favorites',
  },
  {
    id: '4',
    title: 'Documents',
    subtitle: 'Warranty, insurance & more',
    icon: 'file-document',
    color: '#7C3AED',
    action: 'documents',
  },
];

const SETTINGS_ITEMS: SettingsItem[] = [
  {
    id: '1',
    title: 'Edit Profile',
    icon: 'account-edit',
    action: 'edit_profile',
  },
  {
    id: '2',
    title: 'Notifications',
    icon: 'bell-outline',
    action: 'notifications',
  },
  {
    id: '3',
    title: 'Payment Methods',
    icon: 'credit-card',
    action: 'payment',
  },
  {
    id: '4',
    title: 'Help & Support',
    icon: 'help-circle',
    action: 'support',
  },
];

const MenuItem: FC<{ item: MenuItem; onPress: () => void }> = ({ item, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center bg-white p-4 rounded-xl mb-3"
    style={{ elevation: 1 }}
  >
    <View
      className="w-12 h-12 rounded-xl justify-center items-center mr-4"
      style={{ backgroundColor: item.color + '15' }}
    >
      <Icon name={item.icon} size={24} color={item.color} />
    </View>
    <View className="flex-1">
      <Text className="text-gray-900 font-semibold text-base">{item.title}</Text>
      {item.subtitle && (
        <Text className="text-gray-500 text-sm mt-0.5">{item.subtitle}</Text>
      )}
    </View>
    <Icon name="chevron-right" size={20} color="#9CA3AF" />
  </TouchableOpacity>
);

const SettingItem: FC<{ item: SettingsItem; onPress: () => void }> = ({ item, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center bg-white px-4 py-3 border-b border-gray-100"
  >
    <Icon name={item.icon} size={20} color="#6B7280" />
    <Text className="text-gray-700 font-medium text-base ml-4 flex-1">{item.title}</Text>
    <Icon name="chevron-right" size={16} color="#9CA3AF" />
  </TouchableOpacity>
);

type ProfileScreenProps = StackScreenProps<any, 'Profile'>;

const ProfileDetail: FC<{ label: string; value?: string | null }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <View className="flex-row justify-between py-3 border-b border-gray-100">
      <Text className="text-gray-500 text-sm">{label}</Text>
      <Text className="text-gray-900 font-medium text-sm flex-1 text-right ml-4">{value}</Text>
    </View>
  );
};

const ProfileScreen: FC<ProfileScreenProps> = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(getUserRequest());
  }, [dispatch]);

  const handleLogout = (): void => {
    dispatch(logoutRequest());
  };

  const displayName = getUserDisplayName(user);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="bg-white px-5 py-8 border-b border-gray-100">
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 rounded-full bg-blue-600 justify-center items-center">
              <Text className="text-white font-bold text-lg">{getUserInitials(user)}</Text>
            </View>
            <View className="ml-4 flex-1">
              {isLoading && !user?.fullName ? (
                <ActivityIndicator size="small" color="#2563EB" />
              ) : (
                <>
                  <Text className="text-gray-900 font-bold text-xl">{displayName}</Text>
                  {user?.role ? (
                    <Text className="text-blue-600 text-sm mt-1 font-medium">
                      {formatUserRole(user.role)}
                    </Text>
                  ) : null}
                  <Text className="text-gray-500 text-sm mt-1">{user?.email || '—'}</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Account details from Symfony /api/me */}
        <View className="px-5 pt-6">
          <Text className="text-gray-900 font-bold text-base mb-3">Account Details</Text>
          <View className="bg-white rounded-xl px-4">
            <ProfileDetail label="Username" value={user?.username} />
            <ProfileDetail label="Email" value={user?.email} />
            <ProfileDetail label="Phone" value={user?.phone} />
            <ProfileDetail label="Status" value={user?.status} />
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-5 py-6">
          <Text className="text-gray-900 font-bold text-base mb-4">Quick Links</Text>
          {MENU_ITEMS.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              onPress={() => {
                if (item.action === ROUTES.SERVICE_HISTORY) {
                  navigation.navigate(ROUTES.SERVICE_HISTORY);
                }
              }}
            />
          ))}
        </View>

        {/* Settings Section */}
        <View className="px-5 py-6">
          <Text className="text-gray-900 font-bold text-base mb-4">Settings</Text>
          <View className="bg-white rounded-xl overflow-hidden">
            {SETTINGS_ITEMS.map((item) => (
              <SettingItem key={item.id} item={item} onPress={() => {}} />
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View className="px-5 py-6">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-600 px-6 py-4 rounded-2xl"
          >
            <Text className="text-white font-bold text-center text-lg">Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View className="px-5 py-4 mb-6">
          <Text className="text-gray-500 text-center text-xs">App Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
