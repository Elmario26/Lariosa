import {
  canModifyBooking,
  getBookingTitle,
  testDriveLockedReason,
  type TestDriveBooking,
} from '../app/api/bookings';
import {
  canModifyServiceBooking,
  serviceBookingLockedReason,
} from '../app/api/serviceBookings';
import {
  formatBookingDateTime,
  formatDisplayDate,
  formatDisplayTime12h,
  parseBookingDateTimeString,
} from './bookingDateTime';
import type { LocalServiceBooking } from '../app/api/serviceBookings';
import { THEME } from '../constants/theme';
import type { AppointmentDetailData } from '../types/appointmentDetail';

export type BookingDetailRouteParams =
  | { kind?: 'test_drive'; bookingId: number }
  | { kind: 'service'; serviceBookingId: string };

export function parseBookingDetailRoute(
  params?: Partial<BookingDetailRouteParams & { bookingId?: number | string }>
):
  | { kind: 'test_drive'; bookingId: number }
  | { kind: 'service'; serviceBookingId: string }
  | null {
  if (!params) return null;

  if (params.kind === 'service' && 'serviceBookingId' in params && params.serviceBookingId) {
    return { kind: 'service', serviceBookingId: params.serviceBookingId };
  }

  if (typeof params.bookingId === 'number' && Number.isFinite(params.bookingId)) {
    return { kind: 'test_drive', bookingId: params.bookingId };
  }

  return null;
}

function formatTimestampLabel(value: string): string {
  if (!value) return '—';
  const fromApi = parseBookingDateTimeString(value);
  if (fromApi) {
    return `${formatDisplayDate(fromApi)} at ${formatDisplayTime12h(fromApi)}`;
  }
  try {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return `${formatDisplayDate(d)} at ${formatDisplayTime12h(d)}`;
    }
  } catch {
    /* fall through */
  }
  return value;
}

export function mapTestDriveToAppointmentDetail(booking: TestDriveBooking): AppointmentDetailData {
  const { date, time } = formatBookingDateTime(booking.requestedDateTime);
  const modifiable = canModifyBooking(booking);
  const car = booking.car;

  return {
    kind: 'test_drive',
    id: String(booking.id),
    title: getBookingTitle(booking),
    subtitle: `${car.year} · ${car.color || '—'}`,
    typeLabel: 'Test drive',
    icon: 'car',
    iconColor: THEME.accent,
    iconBg: THEME.accentMuted,
    status: booking.status,
    statusKey: booking.status,
    date,
    time,
    rows: [
      {
        icon: 'car-outline',
        label: 'Vehicle',
        value: `${car.brand} ${car.model}`,
      },
      {
        icon: 'identifier',
        label: 'Reference',
        value: `#${booking.id}`,
      },
    ],
    notes: booking.notes,
    staffRemarks: booking.staffRemarks,
    staffRemarksAt: booking.approvedAt ? formatTimestampLabel(booking.approvedAt) : null,
    footerMessage: modifiable
      ? 'Waiting for staff approval. You can edit or cancel while this request is pending.'
      : testDriveLockedReason(booking) ?? undefined,
    canEdit: modifiable,
    canDelete: modifiable,
  };
}

export function mapServiceBookingToAppointmentDetail(
  booking: LocalServiceBooking
): AppointmentDetailData {
  const { date, time } = formatBookingDateTime(booking.requestedDateTime);
  const displayStatus =
    booking.status === 'synced' ? 'submitted' : booking.status;

  return {
    kind: 'service',
    id: booking.id,
    title: booking.serviceName,
    subtitle: booking.vehicleDescription,
    typeLabel: 'Service',
    icon: 'wrench',
    iconColor: THEME.primary,
    iconBg: THEME.primaryMuted,
    status: displayStatus,
    statusKey: booking.status === 'synced' ? 'approved' : booking.status,
    date,
    time,
    rows: [
      {
        icon: 'phone-outline',
        label: 'Contact phone',
        value: booking.phone || '—',
      },
      {
        icon: 'calendar-plus',
        label: 'Submitted',
        value: formatTimestampLabel(booking.createdAt),
      },
      {
        icon: 'identifier',
        label: 'Reference',
        value: booking.id.startsWith('local-') ? 'Local request' : `#${booking.id}`,
      },
    ],
    notes: booking.notes,
    staffRemarks: booking.staffRemarks,
    staffRemarksAt: booking.approvedAt
      ? formatTimestampLabel(booking.approvedAt)
      : null,
    footerMessage: (() => {
      if (booking.id.startsWith('local-')) {
        return 'Saved on this device until synced with the server. You can remove it while it is still pending.';
      }
      if (canModifyServiceBooking(booking)) {
        return 'Waiting for staff confirmation. You can cancel while this request is still pending.';
      }
      return serviceBookingLockedReason(booking) ?? undefined;
    })(),
    canEdit: false,
    canDelete: canModifyServiceBooking(booking),
  };
}
