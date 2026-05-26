import React, { useEffect, useState, FC } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  getBookingDetailRequest,
  updateBookingRequest,
  clearBookingError,
  clearBookingSuccessMessage,
} from '../app/actions/bookings';
import { formatDateTimeFromDates, getBookingTitle, canModifyBooking } from '../app/api/bookings';
import BookingDateTimePicker from '../components/BookingDateTimePicker';
import {
  getDefaultBookingDateTime,
  parseRequestedDateTime,
  validateFutureBooking,
} from '../utils/bookingDateTime';
import { RootState } from '../app/store';
import { useAppDialog } from '../context/AppDialogContext';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface RouteParams {
  bookingId: number;
}

const EditBookingScreen: FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const bookingId = route.params?.bookingId;
  const dispatch = useDispatch();
  const dialog = useAppDialog();

  const { currentBooking, isLoading, isSubmitting, error, lastActionMessage } = useSelector(
    (s: RootState) => s.bookings
  );

  const defaults = getDefaultBookingDateTime();
  const [bookingDate, setBookingDate] = useState(defaults.date);
  const [bookingTime, setBookingTime] = useState(defaults.time);
  const [notes, setNotes] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (bookingId) {
      dispatch(getBookingDetailRequest(bookingId));
    }
  }, [bookingId, dispatch]);

  useEffect(() => {
    if (currentBooking?.id === bookingId && !initialized) {
      if (!canModifyBooking(currentBooking)) {
        dialog.alert('Cannot edit', 'Only pending bookings can be changed.', () => navigation.goBack(), 'warning');
        return;
      }
      const { date, time } = parseRequestedDateTime(currentBooking.requestedDateTime);
      setBookingDate(date);
      setBookingTime(time);
      setNotes(currentBooking.notes ?? '');
      setInitialized(true);
    }
  }, [currentBooking, bookingId, initialized, navigation, dialog]);

  useEffect(() => {
    if (error) {
      dialog.alert('Update failed', error, () => dispatch(clearBookingError()), 'danger');
    }
  }, [error, dispatch, dialog]);

  useEffect(() => {
    if (!lastActionMessage) return;
    dialog.alert('Saved', lastActionMessage, () => {
      dispatch(clearBookingSuccessMessage());
      navigation.goBack();
    }, 'success');
  }, [lastActionMessage, navigation, dispatch, dialog]);

  const handleSave = (): void => {
    const validationError = validateFutureBooking(bookingDate, bookingTime);
    if (validationError) {
      dialog.alert('Invalid schedule', validationError, undefined, 'warning');
      return;
    }
    if (!bookingId) return;
    dispatch(
      updateBookingRequest(bookingId, {
        requestedDateTime: formatDateTimeFromDates(bookingDate, bookingTime),
        notes: notes.trim() || null,
      })
    );
  };

  if (!bookingId) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text>Booking not found</Text>
      </SafeAreaView>
    );
  }

  const booking = currentBooking?.id === bookingId ? currentBooking : null;

  return (
    <SafeAreaView className="flex-1 bg-app-bg">
      <View className="flex-row items-center px-5 py-4 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-gray-900 font-bold text-xl ml-4">Edit booking</Text>
      </View>

      {isLoading && !booking ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#76ABAE" />
        </View>
      ) : booking ? (
        <ScrollView className="flex-1 px-5 py-6" showsVerticalScrollIndicator={false}>
          <View className="bg-white p-4 rounded-2xl mb-6" style={{ elevation: 1 }}>
            <Text className="text-gray-900 font-bold text-base">{getBookingTitle(booking)}</Text>
            <Text className="text-gray-500 text-sm mt-1">Only pending bookings can be edited.</Text>
          </View>

          <Text className="text-gray-900 font-bold text-base mb-3">New date & time</Text>
          <BookingDateTimePicker
            date={bookingDate}
            time={bookingTime}
            onDateChange={setBookingDate}
            onTimeChange={setBookingTime}
          />

          <Text className="text-gray-900 font-bold text-base mb-3 mt-4">Notes</Text>
          <TextInput
            className="bg-white p-4 rounded-2xl mb-6 text-gray-900 min-h-[80px]"
            style={{ elevation: 1, textAlignVertical: 'top' }}
            placeholder="Optional notes"
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <TouchableOpacity
            onPress={handleSave}
            disabled={isSubmitting}
            className="bg-app-primary px-6 py-4 rounded-2xl mb-20"
            style={{ opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-center text-lg">Save changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
};

export default EditBookingScreen;
