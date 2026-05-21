import React, { useEffect, useState, FC } from 'react';

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import {

  Text,

  TouchableOpacity,

  View,

  ScrollView,

  SafeAreaView,

  TextInput,

  Image,

  Alert,

  ActivityIndicator,

} from 'react-native';

import { useDispatch, useSelector } from 'react-redux';

import {

  createBookingRequest,

  clearBookingError,

  clearBookingSuccessMessage,

} from '../app/actions/bookings';

import { getVehiclesRequest } from '../app/actions/vehicles';

import { formatDateTimeFromDates } from '../app/api/bookings';

import { getCarImageUrl } from '../app/config/api';

import BookingDateTimePicker from '../components/BookingDateTimePicker';

import { getDefaultBookingDateTime, validateFutureBooking } from '../utils/bookingDateTime';

import { RootState } from '../app/store';

import { ROUTES } from '../utils';

// @ts-ignore

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';



interface VehicleParam {

  id: string | number;

  brand: string;

  model?: string;

  make?: string;

  year?: number;

  images?: string[];

  image?: string;

}



interface RouteParams {

  vehicle?: VehicleParam;

}



const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400';



const getVehicleImage = (vehicle: VehicleParam): string => {

  if (vehicle.image) return vehicle.image;

  if (vehicle.images?.length) return getCarImageUrl(vehicle.images[0]);

  return FALLBACK_IMAGE;

};



const TestDriveScreen: FC = () => {

  const navigation = useNavigation<any>();

  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();

  const preselected = route.params?.vehicle;

  const dispatch = useDispatch();



  const { vehicles: vehicleList, isLoading: vehiclesLoading } = useSelector(

    (s: RootState) => s.vehicles

  );

  const { isSubmitting, error, lastCreatedMessage } = useSelector((s: RootState) => s.bookings);

  const { isAuthenticated } = useSelector((s: RootState) => s.auth);



  const defaults = getDefaultBookingDateTime();

  const [selectedId, setSelectedId] = useState<string | null>(

    preselected ? String(preselected.id) : null

  );

  const [bookingDate, setBookingDate] = useState(defaults.date);

  const [bookingTime, setBookingTime] = useState(defaults.time);

  const [notes, setNotes] = useState('');



  useEffect(() => {

    dispatch(getVehiclesRequest({ itemsPerPage: 20 }));

  }, [dispatch]);



  useEffect(() => {

    if (error) {

      Alert.alert('Booking failed', error, [{ text: 'OK', onPress: () => dispatch(clearBookingError()) }]);

    }

  }, [error, dispatch]);



  useEffect(() => {

    if (!lastCreatedMessage) return;

    Alert.alert('Request submitted', lastCreatedMessage, [

      {

        text: 'View bookings',

        onPress: () => {

          dispatch(clearBookingSuccessMessage());

          navigation.navigate(ROUTES.MY_APPOINTMENTS);

        },

      },

      {

        text: 'OK',

        onPress: () => {

          dispatch(clearBookingSuccessMessage());

          navigation.goBack();

        },

      },

    ]);

  }, [lastCreatedMessage, navigation, dispatch]);



  const handleSubmit = (): void => {

    if (!isAuthenticated) {

      Alert.alert('Sign in required', 'Please log in to schedule a test drive.');

      return;

    }

    if (!selectedId) {

      Alert.alert('Missing information', 'Please select a vehicle.');

      return;

    }

    const validationError = validateFutureBooking(bookingDate, bookingTime);

    if (validationError) {

      Alert.alert('Invalid schedule', validationError);

      return;

    }

    dispatch(

      createBookingRequest({

        carId: Number(selectedId),

        requestedDateTime: formatDateTimeFromDates(bookingDate, bookingTime),

        notes: notes.trim() || undefined,

      })

    );

  };



  return (

    <SafeAreaView className="flex-1 bg-gray-50">

      <View className="flex-row items-center px-5 py-4 bg-white">

        <TouchableOpacity onPress={() => navigation.goBack()}>

          <Icon name="arrow-left" size={24} color="#374151" />

        </TouchableOpacity>

        <Text className="text-gray-900 font-bold text-xl ml-4">Schedule Test Drive</Text>

      </View>



      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        <View className="bg-blue-600 px-5 py-6">

          <Text className="text-white font-bold text-2xl">Experience your dream car</Text>

          <Text className="text-blue-100 text-sm mt-1">

            Pick a car and a future date — past times are blocked.

          </Text>

        </View>



        <View className="px-5 py-6">

          <Text className="text-gray-900 font-bold text-base mb-3">

            Select a vehicle {!selectedId && <Text className="text-red-500">*</Text>}

          </Text>



          {vehiclesLoading && vehicleList.length === 0 ? (

            <ActivityIndicator color="#2563EB" className="mb-6" />

          ) : (

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">

              {vehicleList.map((vehicle: VehicleParam) => {

                const id = String(vehicle.id);

                const selected = selectedId === id;

                return (

                  <TouchableOpacity

                    key={id}

                    onPress={() => setSelectedId(id)}

                    className="mr-4 rounded-2xl overflow-hidden"

                    style={{

                      width: 160,

                      elevation: 2,

                      borderWidth: selected ? 2 : 0,

                      borderColor: '#2563EB',

                    }}

                  >

                    <Image

                      source={{ uri: getVehicleImage(vehicle) }}

                      className="w-full h-24"

                      resizeMode="cover"

                    />

                    <View className="bg-white p-2">

                      <Text className="text-gray-900 font-semibold text-sm">

                        {vehicle.brand} {vehicle.model || vehicle.make}

                      </Text>

                      <Text className="text-gray-500 text-xs">{vehicle.year}</Text>

                    </View>

                  </TouchableOpacity>

                );

              })}

            </ScrollView>

          )}



          <Text className="text-gray-900 font-bold text-base mb-3">Preferred date & time</Text>

          <BookingDateTimePicker

            date={bookingDate}

            time={bookingTime}

            onDateChange={setBookingDate}

            onTimeChange={setBookingTime}

          />



          <Text className="text-gray-900 font-bold text-base mb-3 mt-4">Notes (optional)</Text>

          <TextInput

            className="bg-white p-4 rounded-2xl mb-6 text-gray-900 min-h-[80px]"

            style={{ elevation: 1, textAlignVertical: 'top' }}

            placeholder="Any special requests?"

            value={notes}

            onChangeText={setNotes}

            multiline

          />



          <TouchableOpacity

            onPress={handleSubmit}

            disabled={isSubmitting}

            className="bg-blue-600 px-6 py-4 rounded-2xl mb-20"

            style={{ opacity: isSubmitting ? 0.7 : 1 }}

          >

            {isSubmitting ? (

              <ActivityIndicator color="#fff" />

            ) : (

              <Text className="text-white font-bold text-center text-lg">Submit test drive request</Text>

            )}

          </TouchableOpacity>

        </View>

      </ScrollView>

    </SafeAreaView>

  );

};



export default TestDriveScreen;

