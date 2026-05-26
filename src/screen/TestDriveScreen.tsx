import React, { useEffect, useState, useRef, FC } from 'react';

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import {

  Text,

  TouchableOpacity,

  View,

  ScrollView,

  SafeAreaView,

  TextInput,

  Image,

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
import { useAppDialog } from '../context/AppDialogContext';

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
  const dialog = useAppDialog();



  const { vehicles: vehicleList, isLoading: vehiclesLoading } = useSelector(

    (s: RootState) => s.vehicles

  );

  const { isSubmitting, error, lastCreatedMessage, currentBooking } = useSelector(
    (s: RootState) => s.bookings
  );
  const didNavigateToBooking = useRef(false);

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

      dialog.alert('Booking failed', error, () => dispatch(clearBookingError()), 'danger');

    }

  }, [error, dispatch, dialog]);



  useEffect(() => {
    if (!lastCreatedMessage || !currentBooking?.id || didNavigateToBooking.current) return;
    didNavigateToBooking.current = true;
    dispatch(clearBookingSuccessMessage());
    navigation.replace(ROUTES.BOOKING_DETAIL, { bookingId: currentBooking.id });
  }, [lastCreatedMessage, currentBooking, navigation, dispatch]);



  const handleSubmit = (): void => {

    if (!isAuthenticated) {

      dialog.alert('Sign in required', 'Please log in to schedule a test drive.', undefined, 'warning');

      return;

    }

    if (!selectedId) {

      dialog.alert('Missing information', 'Please select a vehicle.', undefined, 'warning');

      return;

    }

    const validationError = validateFutureBooking(bookingDate, bookingTime);

    if (validationError) {

      dialog.alert('Invalid schedule', validationError, undefined, 'warning');

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

    <SafeAreaView className="flex-1 bg-app-bg">

      <View className="flex-row items-center px-5 py-4 bg-white">

        <TouchableOpacity onPress={() => navigation.goBack()}>

          <Icon name="arrow-left" size={24} color="#374151" />

        </TouchableOpacity>

        <Text className="text-gray-900 font-bold text-xl ml-4">Schedule Test Drive</Text>

      </View>



      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        <View className="bg-app-primary px-5 py-6">

          <Text className="text-white font-bold text-2xl">Experience your dream car</Text>

        </View>



        <View className="px-5 py-6">

          <Text className="text-gray-900 font-bold text-base mb-3">

            Select a vehicle {!selectedId && <Text className="text-red-500"></Text>}

          </Text>



          {vehiclesLoading && vehicleList.length === 0 ? (

            <ActivityIndicator color="#76ABAE" className="mb-6" />

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

                      borderColor: '#76ABAE',

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

            className="bg-app-primary px-6 py-4 rounded-2xl mb-20"

            style={{ opacity: isSubmitting ? 0.7 : 1 }}

          >

            {isSubmitting ? (

              <ActivityIndicator color="#fff" />

            ) : (

              <Text className="text-white font-bold text-center text-lg">Book Now</Text>

            )}

          </TouchableOpacity>

        </View>

      </ScrollView>

    </SafeAreaView>

  );

};



export default TestDriveScreen;

