import React, { useState, FC, JSX } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { ROUTES } from '../utils';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Appointment {
  id: string;
  type: string;
  title: string;
  date: string;
  time: string;
  status: string;
  location: string;
}

interface Service {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  route: string;
}

const APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    type: 'test_drive',
    title: 'Test Drive - Toyota Camry',
    date: '2024-04-15',
    time: '10:00 AM',
    status: 'confirmed',
    location: 'Main Showroom',
  },
  {
    id: '2',
    type: 'service',
    title: 'Regular Maintenance',
    date: '2024-04-20',
    time: '2:00 PM',
    status: 'pending',
    location: 'Service Center',
  },
  {
    id: '3',
    type: 'consultation',
    title: 'Financing Consultation',
    date: '2024-04-10',
    time: '11:00 AM',
    status: 'completed',
    location: 'Finance Office',
  },
];

const SERVICES: Service[] = [
  {
    id: '1',
    title: 'Schedule Test Drive',
    subtitle: 'Experience your dream car',
    icon: 'car-clock',
    color: '#2563EB',
    route: ROUTES.TEST_DRIVE,
  },
  {
    id: '2',
    title: 'Book Service',
    subtitle: 'Maintenance & repairs',
    icon: 'wrench-clock',
    color: '#059669',
    route: ROUTES.BOOK_APPOINTMENT,
  },
  {
    id: '3',
    title: 'Financing',
    subtitle: 'Explore payment options',
    icon: 'calculator',
    color: '#7C3AED',
    route: ROUTES.BOOK_APPOINTMENT,
  },
  {
    id: '4',
    title: 'Trade-In Valuation',
    subtitle: 'Get a quote for your car',
    icon: 'swap-horizontal',
    color: '#DC2626',
    route: ROUTES.BOOK_APPOINTMENT,
  },
];

const getStatusColor = (status: string): { bg: string; text: string } => {
  switch (status) {
    case 'confirmed':
      return { bg: '#DBEAFE', text: '#2563EB' };
    case 'pending':
      return { bg: '#FEF3C7', text: '#D97706' };
    case 'completed':
      return { bg: '#D1FAE5', text: '#059669' };
    case 'cancelled':
      return { bg: '#FEE2E2', text: '#DC2626' };
    default:
      return { bg: '#F3F4F6', text: '#6B7280' };
  }
};

const getTypeIcon = (type: string): string => {
  switch (type) {
    case 'test_drive':
      return 'car';
    case 'service':
      return 'wrench';
    case 'consultation':
      return 'account-tie';
    default:
      return 'calendar';
  }
};

type BookingsScreenProps = StackScreenProps<any, 'Bookings'>;

const BookingsScreen: FC<BookingsScreenProps> = () => {
  const navigation = useNavigation<any>();
  const [selectedTab, setSelectedTab] = useState<'appointments' | 'services'>('appointments');

  const renderAppointment = ({ item }: { item: Appointment }): JSX.Element => {
    const statusColor = getStatusColor(item.status);
    return (
      <View className="bg-white p-4 rounded-2xl mb-4 border border-gray-100" style={{ elevation: 1 }}>
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-start flex-1">
            <View
              className="w-12 h-12 rounded-xl justify-center items-center mr-4"
              style={{ backgroundColor: '#DBEAFE' }}
            >
              <Icon name={getTypeIcon(item.type)} size={24} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-bold text-base">{item.title}</Text>
              <Text className="text-gray-500 text-sm mt-1">{item.location}</Text>
            </View>
          </View>
          <View style={{ backgroundColor: statusColor.bg }} className="px-3 py-1 rounded-full">
            <Text className="text-xs font-semibold capitalize" style={{ color: statusColor.text }}>
              {item.status}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center mt-4 pt-3 border-t border-gray-100">
          <Icon name="calendar" size={16} color="#6B7280" />
          <Text className="text-gray-600 text-sm ml-2">{item.date}</Text>
          <Icon name="clock-outline" size={16} color="#6B7280" className="ml-4" />
          <Text className="text-gray-600 text-sm ml-2">{item.time}</Text>
        </View>
      </View>
    );
  };

  const renderService = ({ item }: { item: Service }): JSX.Element => (
    <TouchableOpacity
      onPress={() => navigation.navigate(item.route)}
      className="bg-white p-4 rounded-2xl mb-4 flex-row items-center"
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
        <Text className="text-gray-500 text-sm mt-0.5">{item.subtitle}</Text>
      </View>
      <Icon name="chevron-right" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 py-4 shadow-sm">
        <Text className="text-gray-900 font-bold text-2xl">Bookings</Text>
        <Text className="text-gray-500 text-sm mt-1">Manage your appointments</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white border-b border-gray-100">
        <TouchableOpacity
          onPress={() => setSelectedTab('appointments')}
          className={`flex-1 py-4 border-b-2 ${
            selectedTab === 'appointments' ? 'border-blue-600' : 'border-gray-100'
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              selectedTab === 'appointments' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            My Appointments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedTab('services')}
          className={`flex-1 py-4 border-b-2 ${
            selectedTab === 'services' ? 'border-blue-600' : 'border-gray-100'
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              selectedTab === 'services' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            Services
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5 py-4" showsVerticalScrollIndicator={false}>
        {selectedTab === 'appointments' ? (
          APPOINTMENTS.length > 0 ? (
            APPOINTMENTS.map((appointment) => (
              <View key={appointment.id}>{renderAppointment({ item: appointment })}</View>
            ))
          ) : (
            <Text className="text-gray-500 text-center mt-10">No appointments scheduled</Text>
          )
        ) : SERVICES.length > 0 ? (
          SERVICES.map((service) => <View key={service.id}>{renderService({ item: service })}</View>)
        ) : (
          <Text className="text-gray-500 text-center mt-10">No services available</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookingsScreen;
