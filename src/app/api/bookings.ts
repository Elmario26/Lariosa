import { apiRequest } from './client';
import {
  combineDateAndTime,
  formatDateForApi,
  formatTimeForApi,
} from '../../utils/bookingDateTime';

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface BookingCar {
  id: number;
  brand: string;
  model: string;
  year: string;
  color?: string;
}

export interface BookingCustomer {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;
}

export interface TestDriveBooking {
  id: number;
  status: BookingStatus;
  requestedDateTime: string;
  notes?: string | null;
  staffRemarks?: string | null;
  customer: BookingCustomer;
  car: BookingCar;
  approvedBy?: { id: number; email: string; fullName: string } | null;
  approvedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookingPayload {
  carId: number;
  requestedDateTime: string;
  notes?: string;
}

export interface UpdateBookingPayload {
  carId?: number;
  requestedDateTime?: string;
  notes?: string | null;
}

interface ListBookingsResponse {
  success: boolean;
  count: number;
  data: TestDriveBooking[];
}

interface SingleBookingResponse {
  success?: boolean;
  message?: string;
  booking?: TestDriveBooking;
  data?: TestDriveBooking;
}

/** POST /api/test-drive-bookings */
export const createTestDriveBookingAPI = async (
  payload: CreateBookingPayload,
  token: string
): Promise<TestDriveBooking> => {
  const res = await apiRequest<SingleBookingResponse>('/test-drive-bookings', {
    method: 'POST',
    token,
    body: payload,
  });
  const booking = res.booking ?? res.data;
  if (!booking) {
    throw { status: 422, message: 'Invalid booking response from server' };
  }
  return booking;
};

/** GET /api/test-drive-bookings */
export const getTestDriveBookingsAPI = async (
  token: string,
  status?: BookingStatus
): Promise<TestDriveBooking[]> => {
  const query = status ? `?status=${status}` : '';
  const res = await apiRequest<ListBookingsResponse>(`/test-drive-bookings${query}`, {
    method: 'GET',
    token,
  });
  return res.data ?? [];
};

/** GET /api/test-drive-bookings/{id} */
export const getTestDriveBookingByIdAPI = async (
  id: number,
  token: string
): Promise<TestDriveBooking> => {
  const res = await apiRequest<SingleBookingResponse>(`/test-drive-bookings/${id}`, {
    method: 'GET',
    token,
  });
  const booking = res.data ?? res.booking;
  if (!booking) {
    throw { status: 404, message: 'Booking not found' };
  }
  return booking;
};

/** Format date + time for Symfony: YYYY-MM-DD HH:MM:SS */
export function formatDateTimeForApi(date: string, time: string): string {
  const d = date.trim();
  const t = time.trim();
  const normalizedTime = t.length === 5 ? `${t}:00` : t;
  return `${d} ${normalizedTime}`;
}

export function formatDateTimeFromDates(datePart: Date, timePart: Date): string {
  const combined = combineDateAndTime(datePart, timePart);
  return `${formatDateForApi(combined)} ${formatTimeForApi(combined)}:00`;
}

/** PUT/PATCH /api/test-drive-bookings/{id} */
export const updateTestDriveBookingAPI = async (
  id: number,
  payload: UpdateBookingPayload,
  token: string
): Promise<TestDriveBooking> => {
  const res = await apiRequest<SingleBookingResponse>(`/test-drive-bookings/${id}`, {
    method: 'PATCH',
    token,
    body: payload,
  });
  const booking = res.data ?? res.booking;
  if (!booking) {
    throw { status: 422, message: 'Invalid booking response from server' };
  }
  return booking;
};

/** DELETE /api/test-drive-bookings/{id} */
export const deleteTestDriveBookingAPI = async (id: number, token: string): Promise<void> => {
  await apiRequest<{ success?: boolean; message?: string }>(`/test-drive-bookings/${id}`, {
    method: 'DELETE',
    token,
  });
};

/** Only pending bookings can be edited or deleted by the customer */
export function canModifyBooking(booking: TestDriveBooking): boolean {
  return booking.status === 'pending';
}

export function formatBookingDateTime(iso: string): { date: string; time: string } {
  if (!iso) return { date: '—', time: '—' };
  const [datePart, timePart] = iso.split(' ');
  const time = timePart ? timePart.slice(0, 5) : '—';
  return { date: datePart ?? iso, time };
}

export function getBookingTitle(booking: TestDriveBooking): string {
  const car = booking.car;
  return `Test Drive — ${car.brand} ${car.model}`;
}
