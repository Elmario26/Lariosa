import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { createBottomTabNavigator, BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import React, { FC } from 'react';
import { ROUTES } from '../utils';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// screens
import HomeScreen from '../screen/HomeScreen';
import InventoryScreen from '../screen/InventoryScreen';
import BookingsScreen from '../screen/BookingsScreen';
import ProfileScreen from '../screen/ProfileScreen';
import VehicleDetailScreen from '../screen/VehicleDetailScreen';
import BookAppointmentScreen from '../screen/BookAppointmentScreen';
import TestDriveScreen from '../screen/TestDriveScreen';
import ServiceHistoryScreen from '../screen/ServiceHistoryScreen';

export type MainStackParamList = {
  TabNavigator: undefined;
  [ROUTES.VEHICLE_DETAIL]: { vehicle?: any };
  [ROUTES.BOOK_APPOINTMENT]: { vehicle?: any };
  [ROUTES.TEST_DRIVE]: undefined;
  [ROUTES.SERVICE_HISTORY]: undefined;
};

export type TabParamList = {
  [ROUTES.HOME]: undefined;
  [ROUTES.INVENTORY]: undefined;
  [ROUTES.BOOKINGS]: undefined;
  [ROUTES.PROFILE]: undefined;
};

export type MainNavProps = StackNavigationProp<MainStackParamList>;
export type TabNavProps = BottomTabNavigationProp<TabParamList>;

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<MainStackParamList>();

// Main Tab Navigator
const TabNavigator: FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          height: 64,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: -4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';

          if (route.name === ROUTES.HOME) {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === ROUTES.INVENTORY) {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === ROUTES.BOOKINGS) {
            iconName = focused ? 'calendar-check' : 'calendar-check-outline';
          } else if (route.name === ROUTES.PROFILE) {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name={ROUTES.HOME} component={HomeScreen} />
      <Tab.Screen name={ROUTES.INVENTORY} component={InventoryScreen} />
      <Tab.Screen name={ROUTES.BOOKINGS} component={BookingsScreen} />
      <Tab.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Main Stack Navigator (wraps tabs + modal screens)
const MainNavigation: FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="TabNavigator" component={TabNavigator} />
      <Stack.Screen
        name={ROUTES.VEHICLE_DETAIL}
        component={VehicleDetailScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name={ROUTES.BOOK_APPOINTMENT}
        component={BookAppointmentScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name={ROUTES.TEST_DRIVE}
        component={TestDriveScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name={ROUTES.SERVICE_HISTORY}
        component={ServiceHistoryScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigation;
