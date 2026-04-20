import React, { useState, FC } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SERVICES = [
  { id: '1', name: 'Test Drive', icon: 'car-clock' },
  { id: '2', name: 'Vehicle Service', icon: 'wrench' },
  { id: '3', name: 'Consultation', icon: 'account-tie' },
  { id: '4', name: 'Trade-In', icon: 'swap-horizontal' },
];

const TIME_SLOTS = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
];

interface Vehicle {
  year?: number;
  brand: string;
  model?: string;
  make?: string;
  [key: string]: any;
}

interface RouteParams {
  vehicle?: Vehicle;
}

type BookAppointmentScreenProps = StackScreenProps<any, 'BookAppointment'>;

const BookAppointmentScreen: FC<BookAppointmentScreenProps> = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { vehicle } = (route.params as RouteParams) || {};

  const [selectedService, setSelectedService] = useState('1');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (): void => {
    if (!name || !phone || !selectedDate || !selectedTime) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }
    Alert.alert(
      'Booking Confirmed',
      'Your appointment has been scheduled. You will receive a confirmation shortly.',
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
        <Text className="text-gray-900 font-bold text-xl ml-4">Book Appointment</Text>
      </View>

      <ScrollView className="flex-1 px-5 py-4" showsVerticalScrollIndicator={false}>
        {/* Vehicle Info (if from vehicle detail) */}
        {vehicle && (
          <View className="bg-blue-50 p-4 rounded-2xl mb-4">
            <Text className="text-blue-600 text-sm font-medium">Booking for:</Text>
            <Text className="text-gray-900 font-bold text-lg mt-1">
              {vehicle.year} {vehicle.brand} {vehicle.model || vehicle.make}
            </Text>
          </View>
        )}

        {/* Service Type */}
        <Text className="text-gray-900 font-bold text-base mb-3">Service Type</Text>
        <View className="flex-row flex-wrap mb-6">
          {SERVICES.map((service) => (
            <TouchableOpacity
              key={service.id}
              onPress={() => setSelectedService(service.id)}
              className={`flex-row items-center px-4 py-3 rounded-xl mr-2 mb-2 ${
                selectedService === service.id ? 'bg-blue-600' : 'bg-white'
              }`}
              style={{ elevation: selectedService === service.id ? 0 : 1 }}
            >
              <Icon
                name={service.icon}
                size={18}
                color={selectedService === service.id ? '#fff' : '#6B7280'}
              />
              <Text
                className={`ml-2 font-medium text-sm ${
                  selectedService === service.id ? 'text-white' : 'text-gray-700'
                }`}
              >
                {service.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Personal Info */}
        <Text className="text-gray-900 font-bold text-base mb-3">Personal Information</Text>
        <View className="bg-white p-4 rounded-2xl mb-6" style={{ elevation: 1 }}>
          <Text className="text-gray-500 text-sm mb-2">Full Name *</Text>
          <TextInput
            className="border-b border-gray-200 py-2 text-gray-900"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
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

        {/* Date Selection */}
        <Text className="text-gray-900 font-bold text-base mb-3">Preferred Date</Text>
        <TouchableOpacity
          className="bg-white p-4 rounded-2xl mb-6 flex-row items-center justify-between"
          style={{ elevation: 1 }}
        >
          <View className="flex-row items-center">
            <Icon name="calendar" size={20} color="#2563EB" />
            <Text className="text-gray-700 ml-3">{selectedDate || 'Select a date'}</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Time Slots */}
        <Text className="text-gray-900 font-bold text-base mb-3">Preferred Time</Text>
        <View className="flex-row flex-wrap mb-6">
          {TIME_SLOTS.map((time) => (
            <TouchableOpacity
              key={time}
              onPress={() => setSelectedTime(time)}
              className={`px-4 py-2 rounded-xl mr-2 mb-2 ${
                selectedTime === time ? 'bg-blue-600' : 'bg-white'
              }`}
              style={{ elevation: selectedTime === time ? 0 : 1 }}
            >
              <Text
                className={`font-medium text-sm ${
                  selectedTime === time ? 'text-white' : 'text-gray-700'
                }`}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-blue-600 px-6 py-4 rounded-2xl mb-6"
        >
          <Text className="text-white font-bold text-center text-lg">Confirm Booking</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookAppointmentScreen;
