import React, { useCallback, useEffect, useState, FC } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  getBookingDetailRequest,
  getBookingsRequest,
  deleteBookingRequest,
  clearBookingError,
} from '../app/actions/bookings';
import {
  deleteLocalServiceBooking,
  getLocalServiceBookingById,
  canModifyServiceBooking,
  serviceBookingLockedReason,
  type LocalServiceBooking,
} from '../app/api/serviceBookings';
import { canModifyBooking, testDriveLockedReason } from '../app/api/bookings';
import { RootState } from '../app/store';
import { ROUTES } from '../utils';
import { useAppDialog } from '../context/AppDialogContext';
import { THEME } from '../constants/theme';
import AppointmentDetailView from '../components/booking/AppointmentDetailView';
import {
  mapServiceBookingToAppointmentDetail,
  mapTestDriveToAppointmentDetail,
  parseBookingDetailRoute,
  type BookingDetailRouteParams,
} from '../utils/appointmentDetail';
import type { AppointmentDetailData } from '../types/appointmentDetail';

// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const FALLBACK_POLL_INTERVAL_MS = 30000;

const BookingDetailScreen: FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: BookingDetailRouteParams }, 'params'>>();
  const parsed = parseBookingDetailRoute(route.params);
  const dispatch = useDispatch();
  const dialog = useAppDialog();

  const { currentBooking, isLoading, isSubmitting, error, wsConnected, lastServiceRealtimeAt } = useSelector(
    (s: RootState) => s.bookings
  );
  const { token } = useSelector((s: RootState) => s.auth);

  const [serviceBooking, setServiceBooking] = useState<LocalServiceBooking | null>(null);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);

  const isService = parsed?.kind === 'service';
  const testDriveId = parsed?.kind === 'test_drive' ? parsed.bookingId : null;
  const serviceId = parsed?.kind === 'service' ? parsed.serviceBookingId : null;

  const loadServiceBooking = useCallback(async () => {
    if (!serviceId) return;
    setServiceLoading(true);
    setServiceError(null);
    try {
      const item = await getLocalServiceBookingById(serviceId, token);
      if (!item) {
        setServiceError('Service appointment not found.');
        setServiceBooking(null);
      } else {
        setServiceBooking(item);
      }
    } catch {
      setServiceError('Could not load this appointment.');
      setServiceBooking(null);
    } finally {
      setServiceLoading(false);
    }
  }, [serviceId, token]);

  const refreshTestDriveDetail = useCallback(
    (silent = false) => {
      if (!testDriveId) return;
      dispatch(getBookingDetailRequest(testDriveId, { silent }));
    },
    [testDriveId, dispatch]
  );

  useFocusEffect(
    useCallback(() => {
      if (isService) {
        void loadServiceBooking();
        if (!wsConnected) {
          const intervalId = setInterval(() => {
            void loadServiceBooking();
          }, FALLBACK_POLL_INTERVAL_MS);

          return () => {
            clearInterval(intervalId);
          };
        }
        return undefined;
      }

      if (testDriveId) {
        refreshTestDriveDetail(false);
        if (!wsConnected) {
          const intervalId = setInterval(() => {
            refreshTestDriveDetail(true);
          }, FALLBACK_POLL_INTERVAL_MS);

          return () => {
            clearInterval(intervalId);
          };
        }
        return undefined;
      }

      return undefined;
    }, [isService, testDriveId, loadServiceBooking, refreshTestDriveDetail, wsConnected])
  );

  useEffect(() => {
    if (isService && serviceId && lastServiceRealtimeAt) {
      void loadServiceBooking();
    }
  }, [isService, serviceId, lastServiceRealtimeAt, loadServiceBooking]);

  useEffect(() => {
    if (!isService && error) {
      dialog.alert('Error', error, () => dispatch(clearBookingError()), 'danger');
    }
  }, [error, dispatch, dialog, isService]);

  const handleRefresh = (): void => {
    if (testDriveId) {
      refreshTestDriveDetail(false);
      dispatch(getBookingsRequest({ silent: true }));
      return;
    }
    void loadServiceBooking();
  };

  if (!parsed) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-app-bg">
        <Text className="text-gray-600">Appointment not found</Text>
      </SafeAreaView>
    );
  }

  const testDriveBooking =
    testDriveId && currentBooking?.id === testDriveId ? currentBooking : null;

  const confirmDeleteTestDrive = (bookingId: number): void => {
    if (testDriveBooking && !canModifyBooking(testDriveBooking)) {
      dialog.alert(
        'Cannot cancel',
        testDriveLockedReason(testDriveBooking) ?? 'Only pending bookings can be cancelled.',
        undefined,
        'warning'
      );
      return;
    }
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

  const confirmDeleteService = (): void => {
    if (!serviceId) return;
    if (serviceBooking && !canModifyServiceBooking(serviceBooking)) {
      dialog.alert(
        'Cannot cancel',
        serviceBookingLockedReason(serviceBooking) ??
          'This appointment can no longer be cancelled.',
        undefined,
        'warning'
      );
      return;
    }
    dialog.confirm({
      title: 'Remove request',
      message: 'Remove this service appointment from your device?',
      cancelText: 'Keep',
      confirmText: 'Remove',
      destructive: true,
      onConfirm: async () => {
        try {
          await deleteLocalServiceBooking(serviceId, token);
          navigation.goBack();
        } catch (err: unknown) {
          const message =
            (err as { message?: string })?.message ?? 'Could not cancel this appointment.';
          dialog.alert('Cannot cancel', message, undefined, 'warning');
        }
      },
    });
  };

  let detail: AppointmentDetailData | null = null;
  if (testDriveBooking) {
    detail = mapTestDriveToAppointmentDetail(testDriveBooking);
  } else if (serviceBooking) {
    detail = mapServiceBookingToAppointmentDetail(serviceBooking);
  }

  const loading = isService ? serviceLoading && !serviceBooking : isLoading && !testDriveBooking;
  const loadError = isService ? serviceError : error && !testDriveBooking ? error : null;
  const screenTitle = isService ? 'Service details' : 'Test drive details';

  return (
    <SafeAreaView className="flex-1 bg-app-bg">
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Go back">
          <Icon name="arrow-left" size={24} color={THEME.text} />
        </TouchableOpacity>
        <Text className="text-gray-900 font-bold text-xl ml-4 flex-1">{screenTitle}</Text>
        <TouchableOpacity onPress={handleRefresh} disabled={loading}>
          <Icon name="refresh" size={22} color={THEME.accent} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={THEME.accent} />
        </View>
      ) : loadError && !detail ? (
        <View className="flex-1 justify-center items-center px-8">
          <Text className="text-red-600 text-center">{loadError}</Text>
          <TouchableOpacity
            onPress={handleRefresh}
            className="mt-4 bg-app-primary px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : detail ? (
        <ScrollView className="flex-1 px-5 py-4" showsVerticalScrollIndicator={false}>
          <AppointmentDetailView
            detail={detail}
            isSubmitting={isSubmitting}
            deleteLabel={isService ? 'Remove' : 'Delete'}
            onEdit={
              detail.canEdit && testDriveId
                ? () => navigation.navigate(ROUTES.EDIT_BOOKING, { bookingId: testDriveId })
                : undefined
            }
            onDelete={
              detail.canDelete
                ? isService
                  ? confirmDeleteService
                  : testDriveId
                    ? () => confirmDeleteTestDrive(testDriveId)
                    : undefined
                : undefined
            }
          />
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
};

export default BookingDetailScreen;
