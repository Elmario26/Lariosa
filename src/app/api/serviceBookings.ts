import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './client';

const STORAGE_KEY = '@lariosa/service_booking_requests';

/**
 * Backend gap (Symfony API entrypoint as of 2026-05):
 *   GET /api → only `cars` and `testDriveBooking`
 *   No `/api/services`, `/api/service-bookings`, or `/api/appointments`
 *
 * When the backend adds service bookings, wire submitServiceBookingRequest
 * to POST /api/service-bookings (see ServiceBookingPayload).
 */

export type LocalServiceBookingStatus = 'pending' | 'synced';

export interface ServiceBookingPayload {
  serviceId: string;
  serviceName: string;
  vehicleDescription: string;
  requestedDateTime: string;
  phone: string;
  notes?: string;
}

export interface LocalServiceBooking extends ServiceBookingPayload {
  id: string;
  status: LocalServiceBookingStatus;
  createdAt: string;
}

interface FutureServiceBookingResponse {
  success?: boolean;
  message?: string;
  data?: { id: number };
}

/** Reserved for when Symfony exposes service bookings */
export const SERVICE_BOOKINGS_API_PATH = '/service-bookings';

async function tryRemoteServiceBooking(
  payload: ServiceBookingPayload,
  token: string
): Promise<LocalServiceBooking | null> {
  try {
    const res = await apiRequest<FutureServiceBookingResponse>(SERVICE_BOOKINGS_API_PATH, {
      method: 'POST',
      token,
      body: payload,
    });
    if (res.data?.id) {
      return {
        ...payload,
        id: String(res.data.id),
        status: 'synced',
        createdAt: new Date().toISOString(),
      };
    }
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    if (status !== 404 && status !== 405) {
      throw err;
    }
  }
  return null;
}

export async function loadLocalServiceBookings(): Promise<LocalServiceBooking[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as LocalServiceBooking[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveLocalServiceBookings(items: LocalServiceBooking[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * Submit a service appointment. Uses the API when available; otherwise queues locally.
 */
export async function submitServiceBookingRequest(
  payload: ServiceBookingPayload,
  token?: string | null
): Promise<LocalServiceBooking> {
  if (token) {
    const remote = await tryRemoteServiceBooking(payload, token);
    if (remote) {
      const existing = await loadLocalServiceBookings();
      await saveLocalServiceBookings([remote, ...existing]);
      return remote;
    }
  }

  const entry: LocalServiceBooking = {
    ...payload,
    id: `local-${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  const existing = await loadLocalServiceBookings();
  await saveLocalServiceBookings([entry, ...existing]);
  return entry;
}

export async function deleteLocalServiceBooking(id: string): Promise<void> {
  const existing = await loadLocalServiceBookings();
  await saveLocalServiceBookings(existing.filter((b) => b.id !== id));
}
