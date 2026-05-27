import type { BookingStatus, TestDriveBooking } from '../app/api/bookings';
import type { LocalServiceBooking, LocalServiceBookingStatus } from '../app/api/serviceBookings';

const TEST_DRIVE_STATUSES: BookingStatus[] = ['pending', 'approved', 'rejected', 'completed'];

const SERVICE_MODIFIABLE_STATUSES: LocalServiceBookingStatus[] = ['pending', 'synced'];

/** Normalize API status strings (case, whitespace) for permission checks */
export function normalizeTestDriveStatus(status: unknown): BookingStatus | null {
  if (status == null || status === '') return null;
  const raw = String(status).trim().toLowerCase();
  return TEST_DRIVE_STATUSES.includes(raw as BookingStatus) ? (raw as BookingStatus) : null;
}

export function normalizeServiceBookingStatus(status: unknown): LocalServiceBookingStatus | null {
  if (status == null || status === '') return null;
  const raw = String(status).trim().toLowerCase();
  const allowed: LocalServiceBookingStatus[] = [
    'pending',
    'synced',
    'approved',
    'rejected',
    'completed',
  ];
  return allowed.includes(raw as LocalServiceBookingStatus)
    ? (raw as LocalServiceBookingStatus)
    : null;
}

/** Map API status to a known value; unknown values lock the booking (no cancel/edit) */
export function resolveServiceBookingStatus(status: unknown): LocalServiceBookingStatus {
  const normalized = normalizeServiceBookingStatus(status);
  if (normalized) return normalized;
  if (status == null || status === '') return 'pending';
  return 'approved';
}

/** Customer may edit or cancel only while the test drive is still pending */
export function canModifyTestDriveBooking(
  booking: Pick<TestDriveBooking, 'status'>
): boolean {
  return normalizeTestDriveStatus(booking.status) === 'pending';
}

/**
 * Customer may cancel a service request while it is pending, synced (submitted),
 * or still a local-only draft. Approved, rejected, and completed visits are locked.
 */
export function canModifyServiceBooking(
  booking: Pick<LocalServiceBooking, 'status' | 'id'>
): boolean {
  if (booking.id.startsWith('local-')) return true;
  const status = normalizeServiceBookingStatus(booking.status);
  return status != null && SERVICE_MODIFIABLE_STATUSES.includes(status);
}

export function testDriveLockedReason(
  booking: Pick<TestDriveBooking, 'status'>
): string | null {
  if (canModifyTestDriveBooking(booking)) return null;
  const status = normalizeTestDriveStatus(booking.status);
  switch (status) {
    case 'approved':
      return 'This test drive is approved and can no longer be changed or cancelled.';
    case 'completed':
      return 'This test drive is completed and cannot be changed or cancelled.';
    case 'rejected':
      return 'This request was declined and cannot be edited.';
    default:
      return 'Only pending test drives can be edited or cancelled.';
  }
}

export function serviceBookingLockedReason(
  booking: Pick<LocalServiceBooking, 'status' | 'id'>
): string | null {
  if (canModifyServiceBooking(booking)) return null;
  const status = normalizeServiceBookingStatus(booking.status);
  switch (status) {
    case 'approved':
      return 'This service visit is confirmed and can no longer be cancelled.';
    case 'completed':
      return 'This service visit is completed and cannot be cancelled.';
    case 'rejected':
      return 'This service request was declined.';
    default:
      return 'This appointment can no longer be cancelled.';
  }
}
