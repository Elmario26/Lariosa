import React, { useEffect, FC } from 'react';

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import {

  Text,

  TouchableOpacity,

  View,

  ScrollView,

  SafeAreaView,

  ActivityIndicator,

} from 'react-native';

import { useDispatch, useSelector } from 'react-redux';

import {

  getBookingDetailRequest,

  getBookingsRequest,

  deleteBookingRequest,

  clearBookingError,

} from '../app/actions/bookings';

import {

  formatBookingDateTime,

  getBookingTitle,

  canModifyBooking,

  type BookingStatus,

} from '../app/api/bookings';

import { RootState } from '../app/store';

import { ROUTES } from '../utils';
import { useAppDialog } from '../context/AppDialogContext';
import { THEME, getBookingStatusStyle } from '../constants/theme';

// @ts-ignore

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';



interface RouteParams {

  bookingId: number;

}



const statusStyle = (status: BookingStatus): { bg: string; text: string } =>
  getBookingStatusStyle(status);



const BookingDetailScreen: FC = () => {

  const navigation = useNavigation<any>();

  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();

  const bookingId = route.params?.bookingId;

  const dispatch = useDispatch();
  const dialog = useAppDialog();

  const { currentBooking, isLoading, isSubmitting, error } = useSelector((s: RootState) => s.bookings);



  useEffect(() => {

    if (bookingId) {

      dispatch(getBookingDetailRequest(bookingId));

    }

  }, [bookingId, dispatch]);



  useEffect(() => {

    if (error) {

      dialog.alert('Error', error, () => dispatch(clearBookingError()), 'danger');

    }

  }, [error, dispatch, dialog]);



  const handleRefresh = (): void => {

    if (bookingId) {

      dispatch(getBookingDetailRequest(bookingId));

      dispatch(getBookingsRequest({ silent: true }));

    }

  };



  const confirmDelete = (): void => {

    if (!bookingId) return;

    dialog.confirm({
      title: 'Cancel booking',
      message: 'Remove this test drive request? This cannot be undone.',
      cancelText: 'Keep',
      confirmText: 'Delete',
      destructive: true,
      onConfirm: () => {
        dispatch(deleteBookingRequest(bookingId));
        navigation.goBack();
      },
    });

  };



  if (!bookingId) {

    return (

      <SafeAreaView className="flex-1 justify-center items-center">

        <Text className="text-gray-600">Booking not found</Text>

      </SafeAreaView>

    );

  }



  const booking = currentBooking?.id === bookingId ? currentBooking : null;

  const colors = booking ? statusStyle(booking.status) : null;

  const { date, time } = booking ? formatBookingDateTime(booking.requestedDateTime) : { date: '', time: '' };

  const editable = booking ? canModifyBooking(booking) : false;



  return (

    <SafeAreaView className="flex-1 bg-app-bg">

      <View className="flex-row items-center px-5 py-4 bg-white">

        <TouchableOpacity onPress={() => navigation.goBack()}>

          <Icon name="arrow-left" size={24} color="#374151" />

        </TouchableOpacity>

        <Text className="text-gray-900 font-bold text-xl ml-4 flex-1">Booking Details</Text>

        <TouchableOpacity onPress={handleRefresh} disabled={isLoading}>

          <Icon name="refresh" size={22} color={THEME.accent} />

        </TouchableOpacity>

      </View>



      {isLoading && !booking ? (

        <View className="flex-1 justify-center items-center">

          <ActivityIndicator size="large" color={THEME.accent} />

        </View>

      ) : error && !booking ? (

        <View className="flex-1 justify-center items-center px-8">

          <Text className="text-red-600 text-center">{error}</Text>

          <TouchableOpacity onPress={handleRefresh} className="mt-4 bg-app-primary px-6 py-3 rounded-xl">

            <Text className="text-white font-semibold">Retry</Text>

          </TouchableOpacity>

        </View>

      ) : booking ? (

        <ScrollView className="flex-1 px-5 py-4" showsVerticalScrollIndicator={false}>

          <View className="bg-white p-5 rounded-2xl mb-4" style={{ elevation: 1 }}>

            <View className="flex-row justify-between items-start">

              <Text className="text-gray-900 font-bold text-lg flex-1 pr-2">

                {getBookingTitle(booking)}

              </Text>

              {colors && (

                <View style={{ backgroundColor: colors.bg }} className="px-3 py-1 rounded-full">

                  <Text className="text-xs font-semibold capitalize" style={{ color: colors.text }}>

                    {booking.status}

                  </Text>

                </View>

              )}

            </View>

            <Text className="text-gray-500 text-sm mt-2">

              {booking.car.year} · {booking.car.color || '—'}

            </Text>

          </View>



          <View className="bg-white p-5 rounded-2xl mb-4" style={{ elevation: 1 }}>

            <Text className="text-gray-900 font-bold text-base mb-3">Schedule</Text>

            <View className="flex-row items-center mb-2">

              <Icon name="calendar" size={18} color="#6B7280" />

              <Text className="text-gray-700 ml-2">{date}</Text>

            </View>

            <View className="flex-row items-center">

              <Icon name="clock-outline" size={18} color="#6B7280" />

              <Text className="text-gray-700 ml-2">{time}</Text>

            </View>

          </View>



          {booking.notes ? (

            <View className="bg-white p-5 rounded-2xl mb-4" style={{ elevation: 1 }}>

              <Text className="text-gray-900 font-bold text-base mb-2">Your notes</Text>

              <Text className="text-gray-600">{booking.notes}</Text>

            </View>

          ) : null}



          {booking.staffRemarks ? (

            <View className="bg-app-accent-muted p-5 rounded-2xl mb-4 border border-app-accent/30">

              <Text className="text-app-bg font-bold text-base mb-2">Staff remarks</Text>

              <Text className="text-gray-700">{booking.staffRemarks}</Text>

              {booking.approvedAt && (

                <Text className="text-app-accent text-xs mt-2">Updated {booking.approvedAt}</Text>

              )}

            </View>

          ) : null}



          {editable && (

            <View className="flex-row mb-6">

              <TouchableOpacity

                onPress={() => navigation.navigate(ROUTES.EDIT_BOOKING, { bookingId: booking.id })}

                disabled={isSubmitting}

                className="flex-1 flex-row items-center justify-center bg-app-primary py-3.5 rounded-xl"

                style={{ opacity: isSubmitting ? 0.7 : 1 }}

              >

                <Icon name="pencil" size={18} color="#fff" />

                <Text className="text-white font-bold ml-2">Edit</Text>

              </TouchableOpacity>

              <TouchableOpacity

                onPress={confirmDelete}

                disabled={isSubmitting}

                className="flex-1 flex-row items-center justify-center bg-red-50 py-3.5 rounded-xl border border-red-200"

                style={{ opacity: isSubmitting ? 0.7 : 1 }}

              >

                <Icon name="delete-outline" size={18} color="#DC2626" />

                <Text className="text-red-600 font-bold ml-2">Delete</Text>

              </TouchableOpacity>

            </View>

          )}



          {booking.status === 'pending' && !editable && (

            <Text className="text-gray-500 text-sm text-center mb-6">

              Waiting for staff approval.

            </Text>

          )}

        </ScrollView>

      ) : null}

    </SafeAreaView>

  );

};



export default BookingDetailScreen;

