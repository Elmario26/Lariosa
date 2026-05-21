import React, { useState, FC } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { ROUTES } from '../utils';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

interface Specification {
  icon: string;
  label: string;
  value: string;
}

interface Vehicle {
  image?: string;
  type?: string;
  brand: string;
  model?: string;
  make?: string;
  year?: number;
  price: number;
  [key: string]: any;
}

interface RouteParams {
  vehicle?: Vehicle;
}

const SPECIFICATIONS: Specification[] = [
  { icon: 'engine', label: 'Engine', value: '2.5L 4-Cylinder' },
  { icon: 'car-shift-pattern', label: 'Transmission', value: '8-Speed Auto' },
  { icon: 'fuel', label: 'Fuel Type', value: 'Gasoline' },
  { icon: 'speedometer', label: 'Mileage', value: '28 MPG Combined' },
  { icon: 'seat', label: 'Seating', value: '5 Passengers' },
  { icon: 'palette', label: 'Color', value: 'Midnight Black' },
];

const FEATURES = [
  'Leather Seats',
  'Sunroof',
  'Navigation System',
  'Backup Camera',
  'Bluetooth',
  'Heated Seats',
  'Keyless Entry',
  'Cruise Control',
];

type VehicleDetailScreenProps = StackScreenProps<any, 'VehicleDetail'>;

const VehicleDetailScreen: FC<VehicleDetailScreenProps> = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { vehicle } = (route.params as RouteParams) || {};
  const [isFavorite, setIsFavorite] = useState(false);

  if (!vehicle) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>Vehicle not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="absolute top-0 left-0 right-0 z-10 flex-row justify-between p-5 pt-12">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 bg-white/90 rounded-full justify-center items-center shadow-sm"
        >
          <Icon name="chevron-left" size={24} color="#374151" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsFavorite(!isFavorite)}
          className="w-10 h-10 bg-white/90 rounded-full justify-center items-center shadow-sm"
        >
          <Icon
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#EF4444' : '#374151'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <Image
          source={{ uri: vehicle.image || 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400' }}
          className="w-full h-72"
          resizeMode="cover"
        />

        {/* Content */}
        <View className="px-5 pt-6 pb-8">
          {/* Title Section */}
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1">
              <Text className="text-gray-500 text-sm uppercase tracking-wide">
                {vehicle.type || 'Vehicle'}
              </Text>
              <Text className="text-gray-900 font-bold text-2xl mt-1">
                {vehicle.brand} {vehicle.model || vehicle.make}
              </Text>
            </View>
            <View className="bg-blue-50 px-4 py-2 rounded-full">
              <Text className="text-blue-600 font-bold">{vehicle.year}</Text>
            </View>
          </View>

          {/* Price */}
          <Text className="text-blue-600 font-bold text-3xl mb-6">
            ₱{(vehicle.price || 0).toLocaleString()}
          </Text>

          {/* Action Buttons */}
          <View className="flex-row mb-8 space-x-3">
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.TEST_DRIVE, { vehicle })}
              className="flex-1 bg-blue-600 py-4 rounded-2xl flex-row justify-center items-center"
            >
              <Icon name="car-clock" size={20} color="#fff" />
              <Text className="text-white font-bold ml-2">Test Drive</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.BOOK_APPOINTMENT, { vehicle })}
              className="flex-1 bg-gray-200 py-4 rounded-2xl flex-row justify-center items-center"
            >
              <Icon name="calendar-check" size={20} color="#2563EB" />
              <Text className="text-blue-600 font-bold ml-2">Book</Text>
            </TouchableOpacity>
          </View>

          {/* Specifications */}
          <Text className="text-gray-900 font-bold text-lg mb-4">Specifications</Text>
          <View className="bg-gray-50 rounded-2xl p-4 mb-8">
            {SPECIFICATIONS.map((spec, index) => (
              <View
                key={spec.label}
                className={`flex-row justify-between items-center py-3 ${
                  index < SPECIFICATIONS.length - 1 ? 'border-b border-gray-200' : ''
                }`}
              >
                <View className="flex-row items-center">
                  <Icon name={spec.icon} size={20} color="#2563EB" />
                  <Text className="text-gray-600 ml-3">{spec.label}</Text>
                </View>
                <Text className="text-gray-900 font-semibold">{spec.value}</Text>
              </View>
            ))}
          </View>

          {/* Features */}
          <Text className="text-gray-900 font-bold text-lg mb-4">Features</Text>
          <View className="flex-row flex-wrap">
            {FEATURES.map((feature) => (
              <View
                key={feature}
                className="bg-blue-50 px-4 py-2 rounded-full mr-2 mb-2"
              >
                <Text className="text-blue-600 font-medium text-sm">{feature}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <View className="mt-8 bg-gray-50 p-4 rounded-2xl">
            <Text className="text-gray-900 font-semibold mb-2">About this vehicle</Text>
            <Text className="text-gray-600 leading-6">
              This premium vehicle offers exceptional performance, comfort, and reliability. Well-maintained
              with full service history. Ideal for those seeking quality and elegance in their daily drive.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VehicleDetailScreen;
