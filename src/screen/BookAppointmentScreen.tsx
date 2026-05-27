import React, { useEffect, useState, FC } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useAppDialog } from '../context/AppDialogContext';
import BookingDateTimePicker from '../components/BookingDateTimePicker';
import ServicePicker from '../components/ServicePicker';
import { INTENT_DEFAULT_SERVICE, getPmsServiceById } from '../constants/pmsServices';
import { submitServiceBookingRequest } from '../app/api/serviceBookings';
import { formatDateTimeFromDates } from '../app/api/bookings';
import { getDefaultBookingDateTime, validateFutureBooking } from '../utils/bookingDateTime';
import { HOME_COLORS } from '../constants/homeDesign';
import { THEME, CARD_SHADOW } from '../constants/theme';
import { RootState } from '../app/store';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Vehicle {
  year?: number;
  brand: string;
  model?: string;
  make?: string;
}

export type BookAppointmentIntent = 'service' | 'financing' | 'trade-in';

interface RouteParams {
  vehicle?: Vehicle;
  intent?: BookAppointmentIntent;
}

type BookAppointmentScreenProps = StackScreenProps<any, 'BookAppointment'>;

const INTENT_COPY: Record<
  BookAppointmentIntent,
  { title: string; headline: string; sub: string }
> = {
  service: {
    title: 'Book service',
    headline: 'Keep your vehicle in top shape',
    sub: 'Oil change, tires, PMS packages & more',
  },
  financing: {
    title: 'Financing inquiry',
    headline: 'Explore payment options',
    sub: 'We will contact you about financing',
  },
  'trade-in': {
    title: 'Trade-in valuation',
    headline: 'Get a fair trade-in estimate',
    sub: 'Tell us about your vehicle',
  },
};

const BookAppointmentScreen: FC<BookAppointmentScreenProps> = () => {
  const navigation = useNavigation<any>();
  const dialog = useAppDialog();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { vehicle, intent = 'service' } = (route.params as RouteParams) || {};

  const { user, isAuthenticated, token } = useSelector((s: RootState) => s.auth);

  const copy = INTENT_COPY[intent];
  const defaults = getDefaultBookingDateTime();

  const [selectedServiceId, setSelectedServiceId] = useState(
    INTENT_DEFAULT_SERVICE[intent] ?? INTENT_DEFAULT_SERVICE.service
  );
  const [bookingDate, setBookingDate] = useState(defaults.date);
  const [bookingTime, setBookingTime] = useState(defaults.time);
  const [vehicleYear, setVehicleYear] = useState(vehicle?.year ? String(vehicle.year) : '');
  const [vehicleBrand, setVehicleBrand] = useState(vehicle?.brand ?? '');
  const [vehicleModel, setVehicleModel] = useState(vehicle?.model ?? vehicle?.make ?? '');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.phone) setPhone(user.phone);
  }, [user?.phone]);

  const buildVehicleDescription = (): string => {
    const parts = [vehicleYear, vehicleBrand, vehicleModel].filter(Boolean);
    return parts.join(' ').trim();
  };

  const handleSubmit = async (): Promise<void> => {
    if (!isAuthenticated) {
      dialog.alert('Sign in required', 'Please log in to book a service appointment.', undefined, 'warning');
      return;
    }

    const vehicleDescription = buildVehicleDescription();
    if (!vehicleBrand.trim() || !vehicleModel.trim()) {
      dialog.alert('Vehicle required', 'Enter your vehicle brand and model.', undefined, 'warning');
      return;
    }

    if (!phone.trim()) {
      dialog.alert('Phone required', 'Enter a contact number so we can confirm your appointment.', undefined, 'warning');
      return;
    }

    const validationError = validateFutureBooking(bookingDate, bookingTime);
    if (validationError) {
      dialog.alert('Invalid schedule', validationError, undefined, 'warning');
      return;
    }

    const service = getPmsServiceById(selectedServiceId);
    if (!service) {
      dialog.alert('Select a service', 'Choose the service you need from the list.', undefined, 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const { savedLocally } = await submitServiceBookingRequest(
        {
          serviceId: service.id,
          serviceName: service.name,
          vehicleDescription,
          requestedDateTime: formatDateTimeFromDates(bookingDate, bookingTime),
          phone: phone.trim(),
          notes: notes.trim() || undefined,
        },
        token
      );

      const successMessage = savedLocally
        ? `Your ${service.name.toLowerCase()} request is saved in the app. View it under Appointments → Service. Our team will confirm by phone once online booking is connected.`
        : `Your ${service.name.toLowerCase()} appointment was sent to the dealership. We will confirm by phone shortly.`;

      dialog.alert('Request submitted', successMessage, () => navigation.goBack(), 'success');
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message ?? 'Could not save your request. Please try again.';
      dialog.alert('Booking failed', message, undefined, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{copy.title}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Icon name="wrench-clock" size={28} color="#fff" />
            </View>
            <Text style={styles.heroTitle}>{copy.headline}</Text>
            <Text style={styles.heroSub}>{copy.sub}</Text>
          </View>

          <View style={styles.body}>
            {vehicle && (
              <View style={styles.vehicleBanner}>
                <Icon name="car" size={20} color={THEME.primary} />
                <View style={styles.vehicleBannerText}>
                  <Text style={styles.vehicleBannerLabel}>From inventory</Text>
                  <Text style={styles.vehicleBannerValue}>
                    {vehicle.year} {vehicle.brand} {vehicle.model || vehicle.make}
                  </Text>
                </View>
              </View>
            )}

            <Text style={styles.sectionTitle}>Service</Text>
            <ServicePicker
              value={selectedServiceId}
              onChange={setSelectedServiceId}
              disabled={isSubmitting}
            />

            <Text style={[styles.sectionTitle, styles.sectionGap]}>Your vehicle</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.fieldHalf}>
                  <Text style={styles.fieldLabel}>Year</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 2022"
                    placeholderTextColor="#9CA3AF"
                    value={vehicleYear}
                    onChangeText={setVehicleYear}
                    keyboardType="number-pad"
                    editable={!isSubmitting}
                  />
                </View>
                <View style={[styles.fieldHalf, styles.fieldHalfRight]}>
                  <Text style={styles.fieldLabel}>Brand *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Toyota"
                    placeholderTextColor="#9CA3AF"
                    value={vehicleBrand}
                    onChangeText={setVehicleBrand}
                    editable={!isSubmitting}
                  />
                </View>
              </View>
              <Text style={[styles.fieldLabel, styles.fieldLabelGap]}>Model *</Text>
              <TextInput
                style={styles.input}
                placeholder="Camry"
                placeholderTextColor="#9CA3AF"
                value={vehicleModel}
                onChangeText={setVehicleModel}
                editable={!isSubmitting}
              />
            </View>

            <Text style={[styles.sectionTitle, styles.sectionGap]}>Preferred date & time</Text>
            <BookingDateTimePicker
              date={bookingDate}
              time={bookingTime}
              onDateChange={setBookingDate}
              onTimeChange={setBookingTime}
              disabled={isSubmitting}
            />

            <Text style={[styles.sectionTitle, styles.sectionGap]}>Contact</Text>
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Phone number *</Text>
              <TextInput
                style={styles.input}
                placeholder="+63 9XX XXX XXXX"
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!isSubmitting}
              />
            </View>

            <Text style={[styles.sectionTitle, styles.sectionGap]}>Notes (optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Mileage, symptoms, preferred bay time…"
              placeholderTextColor="#9CA3AF"
              value={notes}
              onChangeText={setNotes}
              multiline
              editable={!isSubmitting}
            />

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              activeOpacity={0.9}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="calendar-check" size={22} color="#fff" style={styles.submitIcon} />
                  <Text style={styles.submitText}>Confirm service appointment</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: HOME_COLORS.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: THEME.card,
    borderBottomWidth: 1,
    borderBottomColor: THEME.cardBorder,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: THEME.text, marginLeft: 14 },
  scroll: { paddingBottom: 40 },
  hero: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 6 },
  body: { paddingHorizontal: 20, paddingTop: 20 },
  vehicleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.primaryMuted,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  vehicleBannerText: { marginLeft: 12, flex: 1 },
  vehicleBannerLabel: { fontSize: 12, color: THEME.primary, fontWeight: '600' },
  vehicleBannerValue: { fontSize: 16, fontWeight: '700', color: THEME.text, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: THEME.text, marginBottom: 10 },
  sectionGap: { marginTop: 22 },
  card: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    ...CARD_SHADOW,
  },
  row: { flexDirection: 'row' },
  fieldHalf: { flex: 1 },
  fieldHalfRight: { marginLeft: 12 },
  fieldLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 6 },
  fieldLabelGap: { marginTop: 14 },
  input: {
    fontSize: 16,
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
  },
  notesInput: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 16,
    minHeight: 96,
    fontSize: 15,
    color: THEME.text,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    ...CARD_SHADOW,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.primary,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitIcon: { marginRight: 8 },
  submitText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});

export default BookAppointmentScreen;
