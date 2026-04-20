import React, { FC } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
} from 'react-native';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ServiceItem {
  id: string;
  vehicle: string;
  service: string;
  date: string;
  cost: number;
  status: string;
  items: string[];
}

const SERVICE_HISTORY: ServiceItem[] = [
  {
    id: '1',
    vehicle: 'Toyota Camry 2024',
    service: 'Regular Maintenance',
    date: '2024-03-15',
    cost: 125.0,
    status: 'completed',
    items: ['Oil Change', 'Filter Replacement', 'Tire Rotation'],
  },
  {
    id: '2',
    vehicle: 'Toyota Camry 2024',
    service: 'Brake Inspection',
    date: '2024-02-20',
    cost: 0.0,
    status: 'completed',
    items: ['Brake Pad Check', 'Fluid Level Inspection'],
  },
  {
    id: '3',
    vehicle: 'Toyota Camry 2024',
    service: 'Annual Service',
    date: '2023-12-10',
    cost: 350.0,
    status: 'completed',
    items: ['Full Inspection', 'Transmission Fluid', 'Coolant Flush'],
  },
];

const getStatusColor = (status: string): { bg: string; text: string } => {
  switch (status) {
    case 'completed':
      return { bg: '#D1FAE5', text: '#059669' };
    case 'in_progress':
      return { bg: '#DBEAFE', text: '#2563EB' };
    case 'cancelled':
      return { bg: '#FEE2E2', text: '#DC2626' };
    default:
      return { bg: '#F3F4F6', text: '#6B7280' };
  }
};

const ServiceCard: FC<{ service: ServiceItem }> = ({ service }) => {
  const statusColors = getStatusColor(service.status);

  return (
    <View className="bg-white p-4 rounded-2xl mb-4" style={{ elevation: 2 }}>
      <View className="flex-row justify-between items-start mb-3">
        <View>
          <Text className="text-gray-900 font-bold text-lg">{service.service}</Text>
          <Text className="text-gray-500 text-sm mt-1">{service.vehicle}</Text>
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: statusColors.bg }}
        >
          <Text className="text-xs font-medium capitalize" style={{ color: statusColors.text }}>
            {service.status}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mb-3">
        <Icon name="calendar" size={16} color="#6B7280" />
        <Text className="text-gray-600 text-sm ml-2">{service.date}</Text>
        <Text className="text-gray-300 mx-2">|</Text>
        <Icon name="currency-usd" size={16} color="#6B7280" />
        <Text className="text-gray-600 text-sm ml-2">
          {service.cost === 0 ? 'Complimentary' : `$${service.cost.toFixed(2)}`}
        </Text>
      </View>

      <View className="border-t border-gray-100 pt-3">
        <Text className="text-gray-500 text-xs mb-2">Services Performed:</Text>
        <View className="flex-row flex-wrap">
          {service.items.map((item, index) => (
            <View
              key={index}
              className="bg-gray-100 px-3 py-1 rounded-full mr-2 mb-2"
            >
              <Text className="text-gray-700 text-xs">{item}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

type ServiceHistoryScreenProps = StackScreenProps<any, 'ServiceHistory'>;

const ServiceHistoryScreen: FC<ServiceHistoryScreenProps> = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-gray-900 font-bold text-xl ml-4">Service History</Text>
      </View>

      <ScrollView className="flex-1 px-5 py-4" showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View className="flex-row mb-6 space-x-3">
          <View className="flex-1 bg-white p-4 rounded-2xl" style={{ elevation: 1 }}>
            <Text className="text-gray-500 text-sm">Total Services</Text>
            <Text className="text-gray-900 font-bold text-2xl mt-2">{SERVICE_HISTORY.length}</Text>
          </View>
          <View className="flex-1 bg-white p-4 rounded-2xl" style={{ elevation: 1 }}>
            <Text className="text-gray-500 text-sm">Total Spent</Text>
            <Text className="text-gray-900 font-bold text-2xl mt-2">
              ${SERVICE_HISTORY.reduce((sum, s) => sum + s.cost, 0).toFixed(0)}
            </Text>
          </View>
        </View>

        {/* Service List */}
        {SERVICE_HISTORY.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ServiceHistoryScreen;
