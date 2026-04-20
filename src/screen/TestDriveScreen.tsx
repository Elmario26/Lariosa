import React, { useState, FC } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  image: string;
}

const FEATURED_VEHICLES: Vehicle[] = [
  {
    id: '1',
    brand: 'Toyota',
    model: 'Camry',
    year: 2024,
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
  },
  {
    id: '2',
    brand: 'Honda',
    model: 'CR-V',
    year: 2024,
    image: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=400',
  },
  {
    id: '3',
    brand: 'BMW',
    model: 'X5',
    year: 2023,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400',
  },
];

type TestDriveScreenProps = StackScreenProps<any, 'TestDrive'>;

const TestDriveScreen: FC<TestDriveScreenProps> = () => {
  const navigation = useNavigation<any>();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');

  const handleSubmit = (): void => {
    if (!selectedVehicle || !name || !phone || !preferredDate) {
      Alert.alert('Missing Information', 'Please fill in all required fields and select a vehicle');
      return;
    }
    Alert.alert(
      'Test Drive Scheduled!',
      `Your test drive for the ${selectedVehicle.brand} ${selectedVehicle.model} has been scheduled for ${preferredDate}.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-gray-900 font-bold text-xl ml-4">Schedule Test Drive</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View className="bg-blue-600 px-5 py-6">
          <Text className="text-white font-bold text-2xl">Experience Your Dream Car</Text>
          <Text className="text-blue-100 text-sm mt-1">
            Book a test drive and feel the difference
          </Text>
        </View>

        <View className="px-5 py-6">
          {/* Vehicle Selection */}
          <Text className="text-gray-900 font-bold text-base mb-3">
            Select a Vehicle {!selectedVehicle && <Text className="text-red-500">*</Text>}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6"
          >
            {FEATURED_VEHICLES.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                onPress={() => setSelectedVehicle(vehicle)}
                className="mr-4 rounded-2xl overflow-hidden"
                style={{
                  width: 160,
                  elevation: 2,
                  borderWidth: selectedVehicle?.id === vehicle.id ? 2 : 0,
                  borderColor: '#2563EB',
                }}
              >
                <Image source={{ uri: vehicle.image }} className="w-full h-24" resizeMode="cover" />
                <View className="bg-white p-2">
                  <Text className="text-gray-900 font-semibold text-sm">
                    {vehicle.brand} {vehicle.model}
                  </Text>
                  <Text className="text-gray-500 text-xs">{vehicle.year}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Personal Information */}
          <Text className="text-gray-900 font-bold text-base mb-3">Your Information</Text>
          <View className="bg-white p-4 rounded-2xl mb-6" style={{ elevation: 1 }}>
            <Text className="text-gray-500 text-sm mb-2">Full Name *</Text>
            <TextInput
              className="border-b border-gray-200 py-2 text-gray-900"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
            />

            <Text className="text-gray-500 text-sm mb-2 mt-4">Email Address</Text>
            <TextInput
              className="border-b border-gray-200 py-2 text-gray-900"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <Text className="text-gray-500 text-sm mb-2 mt-4">Phone Number *</Text>
            <TextInput
              className="border-b border-gray-200 py-2 text-gray-900"
              placeholder="Enter your phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Date & Time Selection */}
          <Text className="text-gray-900 font-bold text-base mb-3">Preferred Date & Time</Text>
          <TouchableOpacity
            className="bg-white p-4 rounded-2xl mb-4 flex-row items-center justify-between"
            style={{ elevation: 1 }}
          >
            <View className="flex-row items-center">
              <Icon name="calendar" size={20} color="#2563EB" />
              <Text className="text-gray-700 ml-3">{preferredDate || 'Select a date'}</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white p-4 rounded-2xl mb-6 flex-row items-center justify-between"
            style={{ elevation: 1 }}
          >
            <View className="flex-row items-center">
              <Icon name="clock-outline" size={20} color="#2563EB" />
              <Text className="text-gray-700 ml-3">{preferredTime || 'Select a time'}</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-blue-600 px-6 py-4 rounded-2xl mb-20"
          >
            <Text className="text-white font-bold text-center text-lg">Schedule Test Drive</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TestDriveScreen;
