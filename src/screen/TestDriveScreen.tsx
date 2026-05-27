import React, { useCallback, useEffect, useMemo, useState, useRef, FC } from 'react';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  StyleSheet,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  createBookingRequest,
  clearBookingError,
  clearBookingSuccessMessage,
} from '../app/actions/bookings';
import { getVehiclesRequest } from '../app/actions/vehicles';
import { formatDateTimeFromDates } from '../app/api/bookings';
import BookingDateTimePicker from '../components/BookingDateTimePicker';
import VehiclePickerRow, { type VehiclePickerItem } from '../components/VehiclePickerRow';
import { getDefaultBookingDateTime, validateFutureBooking } from '../utils/bookingDateTime';
import { RootState } from '../app/store';
import { ROUTES } from '../utils';
import { useAppDialog } from '../context/AppDialogContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../constants/theme';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface RouteParams {
  vehicle?: VehiclePickerItem;
}

const TestDriveScreen: FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const preselected = route.params?.vehicle;
  const dispatch = useDispatch();
  const dialog = useAppDialog();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content');
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(false);
        StatusBar.setBackgroundColor(THEME.background);
      }
    }, [])
  );

  const { vehicles: vehicleList, isLoading: vehiclesLoading } = useSelector(
    (s: RootState) => s.vehicles
  );
  const vehicles = useMemo(
    () => (Array.isArray(vehicleList) ? vehicleList : []) as VehiclePickerItem[],
    [vehicleList]
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
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Test Drive</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroText}>Experience your dream car</Text>
      </View>

      <Text style={styles.sectionLabel}>Select a vehicle</Text>

      {/* Outside vertical ScrollView so horizontal swipes are not captured by the parent */}
      <VehiclePickerRow
        vehicles={vehicles}
        selectedId={selectedId}
        onSelect={setSelectedId}
        loading={vehiclesLoading}
      />

      <ScrollView
        style={styles.formScroll}
        contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionLabel}>Preferred date & time</Text>
        <BookingDateTimePicker
          date={bookingDate}
          time={bookingTime}
          onDateChange={setBookingDate}
          onTimeChange={setBookingTime}
        />

        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>Notes (optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Any special requests?"
          placeholderTextColor="#9CA3AF"
          value={notes}
          onChangeText={setNotes}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          activeOpacity={0.88}
        >
          <Text style={styles.submitBtnText}>
            {isSubmitting ? 'Booking…' : 'Book Now'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  headerTitle: {
    marginLeft: 16,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  hero: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  heroText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  sectionLabel: {
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 20,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  sectionLabelSpaced: {
    marginTop: 8,
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    paddingHorizontal: 20,
  },
  notesInput: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    minHeight: 88,
    fontSize: 16,
    color: '#111827',
    marginBottom: 20,
    ...Platform.select({
      android: { elevation: 1 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
    }),
  },
  submitBtn: {
    backgroundColor: THEME.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default TestDriveScreen;
