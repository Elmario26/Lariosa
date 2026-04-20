import React, { useEffect, useState, FC } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '../utils';
import { getVehiclesRequest, setVehicleFilters } from '../app/actions';
import { RootState } from '../app/store';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const FILTERS = ['All', 'Sedan', 'SUV', 'Truck', 'Hybrid', 'Electric'];

// API Base URL for images
const API_BASE_URL = 'http://10.0.2.2:8000';

// Fallback images
const FALLBACK_IMAGES = {
  sedan: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
  suv: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=400',
  truck: 'https://images.unsplash.com/photo-1551830820-330a71b99659?w=400',
  default: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
};

interface Vehicle {
  id?: string;
  images?: string[];
  Year?: number;
  year?: number;
  status?: string;
  brand: string;
  make: string;
  price: number;
  conditions?: string;
  Mileage?: number;
  color?: string;
  [key: string]: any;
}

const getVehicleImage = (vehicle: Vehicle): string => {
  // API returns images array, use first image
  if (vehicle.images && Array.isArray(vehicle.images) && vehicle.images.length > 0) {
    // Use the Symfony /images/cars/{filename} route (images are in public/uploads/cars/)
    return `${API_BASE_URL}/images/cars/${vehicle.images[0]}`;
  }
  return FALLBACK_IMAGES.default;
};

const VehicleListItem: FC<{ vehicle: Vehicle; onPress: () => void }> = ({ vehicle, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm"
    style={{ elevation: 2 }}
  >
    <Image
      source={{ uri: getVehicleImage(vehicle) }}
      className="w-full h-44"
      resizeMode="cover"
    />
    <View className="p-4">
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-gray-500 text-xs uppercase tracking-wide">{vehicle.status}</Text>
          <Text className="text-gray-900 font-bold text-xl mt-1">
            {vehicle.brand} {vehicle.make}
          </Text>
        </View>
        <View className="bg-blue-50 px-3 py-1 rounded-full">
          <Text className="text-blue-600 font-semibold text-sm">{vehicle.Year || vehicle.year}</Text>
        </View>
      </View>

      <View className="flex-row mt-3 space-x-4">
        <View className="flex-row items-center">
          <Icon name="gas-station" size={16} color="#6B7280" />
          <Text className="text-gray-500 text-sm ml-1">{vehicle.conditions}</Text>
        </View>
        <View className="flex-row items-center">
          <Icon name="speedometer" size={16} color="#6B7280" />
          <Text className="text-gray-500 text-sm ml-1">{vehicle.Mileage} km</Text>
        </View>
        <View className="flex-row items-center">
          <Icon name="palette" size={16} color="#6B7280" />
          <Text className="text-gray-500 text-sm ml-1">{vehicle.color}</Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <Text className="text-blue-600 font-bold text-xl">
          ₱{(vehicle.price || 0).toLocaleString()}
        </Text>
        <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-full">
          <Text className="text-white font-semibold text-sm">View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

type InventoryScreenProps = StackScreenProps<any, 'Inventory'>;

const InventoryScreen: FC<InventoryScreenProps> = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { vehicles, isLoading, error, filters } = useSelector((state: RootState) => state.vehicles);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [activeFilter, setActiveFilter] = useState(filters.type || 'All');

  useEffect(() => {
    dispatch(
      getVehiclesRequest({
        search: searchQuery,
        type: activeFilter,
      })
    );
  }, [dispatch, searchQuery, activeFilter]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 py-4 shadow-sm">
        <Text className="text-gray-900 font-bold text-2xl">Inventory</Text>
        <Text className="text-gray-500 text-sm mt-1">Browse our collection</Text>
      </View>

      {/* Search Bar */}
      <View className="px-5 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
          <Icon name="magnify" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-2 text-gray-900"
            placeholder="Search vehicles..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-white px-5 py-3 border-b border-gray-100"
      >
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full mr-3 ${
              activeFilter === filter ? 'bg-blue-600' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`font-semibold text-sm ${
                activeFilter === filter ? 'text-white' : 'text-gray-700'
              }`}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Vehicle List */}
      <ScrollView className="flex-1 px-5 py-4" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
        ) : error ? (
          <Text className="text-red-600 text-center mt-10">{error}</Text>
        ) : Array.isArray(vehicles) && vehicles.length > 0 ? (
          vehicles.map((vehicle: Vehicle) => (
            <VehicleListItem
              key={vehicle.id}
              vehicle={vehicle}
              onPress={() => navigation.navigate(ROUTES.VEHICLE_DETAIL, { vehicle })}
            />
          ))
        ) : (
          <Text className="text-gray-500 text-center mt-10">No vehicles found</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default InventoryScreen;
