import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { createBottomTabNavigator, BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import React, { FC } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROUTES } from '../utils';
import { THEME } from '../constants/theme';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from '../screen/HomeScreen';
import InventoryScreen from '../screen/InventoryScreen';
import AppointmentsScreen from '../screen/AppointmentsScreen';
import ProfileScreen from '../screen/ProfileScreen';
import VehicleDetailScreen from '../screen/VehicleDetailScreen';
import BookAppointmentScreen from '../screen/BookAppointmentScreen';
import TestDriveScreen from '../screen/TestDriveScreen';
import BookingDetailScreen from '../screen/BookingDetailScreen';
import EditBookingScreen from '../screen/EditBookingScreen';
import ServiceHistoryScreen from '../screen/ServiceHistoryScreen';
import type { BookingDetailRouteParams } from '../utils/appointmentDetail';
import { stackScreenOptions, tabScreenOptions } from './screenTransitions';

export type MainStackParamList = {
  TabNavigator: undefined;
  [ROUTES.VEHICLE_DETAIL]: { vehicle?: any };
  [ROUTES.BOOK_APPOINTMENT]: {
    vehicle?: any;
    intent?: 'service' | 'financing' | 'trade-in';
  };
  [ROUTES.TEST_DRIVE]: { vehicle?: any };
  [ROUTES.BOOKING_DETAIL]: BookingDetailRouteParams;
  [ROUTES.EDIT_BOOKING]: { bookingId: number };
  [ROUTES.SERVICE_HISTORY]: undefined;
};

export type TabParamList = {
  [ROUTES.HOME]: undefined;
  [ROUTES.INVENTORY]: undefined;
  [ROUTES.MY_APPOINTMENTS]: undefined;
  [ROUTES.PROFILE]: undefined;
};

export type MainNavProps = StackNavigationProp<MainStackParamList>;
export type TabNavProps = BottomTabNavigationProp<TabParamList>;

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<MainStackParamList>();

const TabNavigator: FC = () => {
  const insets = useSafeAreaInsets();
  const tabHeight = 56 + Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      detachInactiveScreens
      screenOptions={({ route }) => ({
        ...tabScreenOptions,
        tabBarStyle: {
          height: tabHeight,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          backgroundColor: THEME.card,
          borderTopWidth: 1,
          borderTopColor: THEME.cardBorder,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: THEME.accent,
        tabBarInactiveTintColor: THEME.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'circle';

          if (route.name === ROUTES.HOME) {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === ROUTES.INVENTORY) {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === ROUTES.MY_APPOINTMENTS) {
            iconName = focused ? 'clipboard-text' : 'clipboard-text-outline';
          } else if (route.name === ROUTES.PROFILE) {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name={ROUTES.HOME}
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name={ROUTES.INVENTORY}
        component={InventoryScreen}
        options={{ tabBarLabel: 'Inventory' }}
      />
      <Tab.Screen
        name={ROUTES.MY_APPOINTMENTS}
        component={AppointmentsScreen}
        options={{ tabBarLabel: 'Appointments' }}
      />
      <Tab.Screen
        name={ROUTES.PROFILE}
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const MainNavigation: FC = () => {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="TabNavigator" component={TabNavigator} />
      <Stack.Screen name={ROUTES.VEHICLE_DETAIL} component={VehicleDetailScreen} />
      <Stack.Screen name={ROUTES.BOOK_APPOINTMENT} component={BookAppointmentScreen} />
      <Stack.Screen name={ROUTES.TEST_DRIVE} component={TestDriveScreen} />
      <Stack.Screen name={ROUTES.BOOKING_DETAIL} component={BookingDetailScreen} />
      <Stack.Screen name={ROUTES.EDIT_BOOKING} component={EditBookingScreen} />
      <Stack.Screen name={ROUTES.SERVICE_HISTORY} component={ServiceHistoryScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigation;
