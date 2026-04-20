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
  StatusBar,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '../utils';
import { logoutRequest, getFeaturedVehiclesRequest } from '../app/actions';
import { RootState } from '../app/store';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// API Base URL for images (adjust path as needed)
const API_BASE_URL = 'http://10.0.2.2:8000';

// Fallback images if API doesn't provide them
const FALLBACK_IMAGES = {
  sedan: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
  suv: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=400',
  truck: 'https://images.unsplash.com/photo-1551830820-330a71b99659?w=400',
  default: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
};

const PROMOTIONS = [
  {
    id: '1',
    title: 'Summer Sale',
    subtitle: 'Up to 15% off on select models',
    color: '#FF6B35',
  },
  {
    id: '2',
    title: '0% APR',
    subtitle: 'Financing available for qualified buyers',
    color: '#4ECDC4',
  },
];

interface Vehicle {
  id?: string;
  images?: string[];
  Year?: number;
  year?: number;
  status?: string;
  brand: string;
  make: string;
  price: number;
  [key: string]: any;
}

interface Promotion {
  id: string;
  title: string;
  subtitle: string;
  color: string;
}

const getVehicleImage = (vehicle: Vehicle): string => {
  // API returns images array, use first image
  if (vehicle.images && Array.isArray(vehicle.images) && vehicle.images.length > 0) {
    // Use the Symfony /images/cars/{filename} route (images are in public/uploads/cars/)
    const imageUrl = `${API_BASE_URL}/images/cars/${vehicle.images[0]}`;
    console.log('[IMAGE URL]:', imageUrl);
    return imageUrl;
  }
  // Fallback to unsplash images based on type
  console.log('[IMAGE URL]: Using fallback for', vehicle.brand, vehicle.make);
  return FALLBACK_IMAGES.default;
};

const VehicleCard: FC<{ vehicle: Vehicle; onPress: () => void }> = ({ vehicle, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="mr-4 w-64 bg-white rounded-2xl shadow-sm"
    style={{ elevation: 2 }}
  >
    <View className="relative">
      <Image
        source={{ uri: getVehicleImage(vehicle) }}
        className="w-full h-36 rounded-t-2xl"
        resizeMode="cover"
      />
      <View className="absolute top-2 left-2 bg-blue-600 px-2 py-1 rounded-full">
        <Text className="text-white text-xs font-semibold">{vehicle.Year || vehicle.year}</Text>
      </View>
    </View>
    <View className="p-3">
      <Text className="text-gray-500 text-xs uppercase tracking-wide">{vehicle.status}</Text>
      <Text className="text-gray-900 font-bold text-lg mt-1">
        {vehicle.brand} {vehicle.make}
      </Text>
      <Text className="text-blue-600 font-bold text-base mt-2">
        ₱{(vehicle.price || 0).toLocaleString()}
      </Text>
    </View>
  </TouchableOpacity>
);

const PromotionCard: FC<{ promotion: Promotion }> = ({ promotion }) => (
  <View
    className="mr-4 p-4 rounded-2xl w-48"
    style={{ backgroundColor: promotion.color }}
  >
    <Text className="text-white font-bold text-lg">{promotion.title}</Text>
    <Text className="text-white text-sm mt-1 opacity-90">{promotion.subtitle}</Text>
    <TouchableOpacity className="mt-3 bg-white px-3 py-2 rounded-full self-start">
      <Text className="text-xs font-semibold" style={{ color: promotion.color }}>
        Learn More
      </Text>
    </TouchableOpacity>
  </View>
);

type HomeScreenProps = StackScreenProps<any, 'Home'>;

const HomeScreen: FC<HomeScreenProps> = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { featuredVehicles, isLoading, error } = useSelector((state: RootState) => state.vehicles);
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(getFeaturedVehiclesRequest());
  }, [dispatch]);

  const handleRefresh = (): void => {
    setRefreshing(true);
    dispatch(getFeaturedVehiclesRequest());
    setRefreshing(false);
  };

  const handleLogout = (): void => {
    dispatch(logoutRequest());
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Header */}
        <View className="px-5 py-4 flex-row justify-between items-center">
          <View>
            <Text className="text-gray-500 text-sm">Welcome back,</Text>
            <Text className="text-gray-900 font-bold text-xl mt-1">{user?.email || 'Guest'}</Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="w-10 h-10 bg-red-100 rounded-full justify-center items-center"
          >
            <Icon name="logout" size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>

        {/* Promotions */}
        <View className="mt-4 px-5">
          <Text className="text-gray-900 font-bold text-lg mb-3">Special Offers</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {PROMOTIONS.map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} />
            ))}
          </ScrollView>
        </View>

        {/* Featured Vehicles */}
        <View className="mt-6 px-5 pb-6">
          <Text className="text-gray-900 font-bold text-lg mb-3">Featured Vehicles</Text>
          {isLoading && !refreshing ? (
            <ActivityIndicator size="large" color="#2563EB" />
          ) : error ? (
            <Text className="text-red-600">{error}</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {Array.isArray(featuredVehicles) && featuredVehicles.length > 0 ? (
                featuredVehicles.map((vehicle: Vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onPress={() => navigation.navigate(ROUTES.VEHICLE_DETAIL, { vehicle })}
                  />
                ))
              ) : (
                <Text className="text-gray-500">No vehicles available</Text>
              )}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
