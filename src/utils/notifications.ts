import type { TestDriveBooking, BookingStatus } from '../app/api/bookings';
import { getBookingTitle } from '../app/api/bookings';
import type { LocalServiceBooking } from '../app/api/serviceBookings';
import {
  formatBookingDateTime,
  formatDisplayDate,
  parseBookingDateTimeString,
} from './bookingDateTime';

export type NotificationAction =
  | { type: 'test_drive'; bookingId: number }
  | { type: 'service'; serviceBookingId: string }
  | { type: 'appointments' }
  | { type: 'none' };

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  action: NotificationAction;
}

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
};

function formatNotificationTime(value?: string | null): string {
  if (!value) return 'Recently';
  const fromApi = parseBookingDateTimeString(value);
  if (fromApi) return formatDisplayDate(fromApi);
  try {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return formatDisplayDate(d);
  } catch {
    /* fall through */
  }
  return value;
}

function sortKey(iso?: string | null): number {
  if (!iso) return 0;
  const parsed = parseBookingDateTimeString(iso);
  if (parsed) return parsed.getTime();
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

export function buildAppNotifications(
  testDrives: TestDriveBooking[],
  serviceBookings: LocalServiceBooking[] = []
): AppNotification[] {
  type Row = AppNotification & { _sort: number };
  const rows: Row[] = [];

  for (const b of testDrives) {
    const { date, time } = formatBookingDateTime(b.requestedDateTime);
    rows.push({
      id: `test-drive-${b.id}`,
      title: `${STATUS_LABEL[b.status]} · Test drive`,
      body: `${getBookingTitle(b)} — ${date} at ${time}`,
      time: formatNotificationTime(b.updatedAt ?? b.createdAt ?? b.requestedDateTime),
      read: b.status !== 'pending',
      action: { type: 'test_drive', bookingId: b.id },
      _sort: sortKey(b.updatedAt ?? b.createdAt ?? b.requestedDateTime),
    });
  }

  for (const s of serviceBookings) {
    const { date, time } = formatBookingDateTime(s.requestedDateTime);
    rows.push({
      id: `service-${s.id}`,
      title: 'Service request',
      body: `${s.serviceName} — ${date} at ${time}`,
      time: formatNotificationTime(s.createdAt),
      read: s.status === 'synced',
      action: { type: 'service', serviceBookingId: s.id },
      _sort: sortKey(s.createdAt ?? s.requestedDateTime),
    });
  }

  rows.sort((a, b) => b._sort - a._sort);

  const items: AppNotification[] = rows.map(({ _sort: _, ...n }) => n);

  if (items.length === 0) {
    items.push({
      id: 'welcome',
      title: 'Welcome to Ramle Wheels',
      body: 'Browse inventory or schedule a test drive from the home screen.',
      time: 'Today',
      read: false,
      action: { type: 'none' },
    });
  }

  return items;
}

export function applyReadState(
  notifications: AppNotification[],
  readIds: ReadonlySet<string>
): AppNotification[] {
  return notifications.map((n) => ({
    ...n,
    read: readIds.has(n.id) || n.read,
  }));
}
