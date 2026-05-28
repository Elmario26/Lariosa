import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVICE_BOOKINGS_REMOTE_ENABLED } from '../config/api';
import {
  canModifyServiceBooking,
  resolveServiceBookingStatus,
  serviceBookingLockedReason,
} from '../../utils/bookingPermissions';
import { apiRequest } from './client';

export {
  canModifyServiceBooking,
  resolveServiceBookingStatus,
  serviceBookingLockedReason,
};

const STORAGE_KEY = '@lariosa/service_booking_requests';

/** API statuses + `synced` for legacy local rows after successful POST */
export type LocalServiceBookingStatus =
  | 'pending'
  | 'synced'
  | 'approved'
  | 'rejected'
  | 'completed';

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
  /** Added by staff approval endpoint (/approve). */
  staffRemarks?: string | null;
  /** Added by staff approval endpoint (/approve). */
  approvedAt?: string | null;
}

export interface ServiceBookingSubmitResult {
  booking: LocalServiceBooking;
  savedLocally: boolean;
}

interface RemoteServiceBooking {
  id: number;
  serviceId: string;
  serviceName: string;
  vehicleDescription: string;
  requestedDateTime: string;
  phone: string;
  notes?: string | null;
  status: string;
  staffRemarks?: string | null;
  approvedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface RealtimeServiceBookingPayload {
  booking?: unknown;
  data?: unknown;
  id?: string | number;
  serviceBookingId?: string | number;
  serviceId?: string;
  serviceName?: string;
  vehicleDescription?: string;
  requestedDateTime?: string;
  phone?: string;
  notes?: string | null;
  status?: string;
  staffRemarks?: string | null;
  approvedAt?: string | null;
  createdAt?: string;
}

interface CreateServiceBookingResponse {
  success?: boolean;
  message?: string;
  data?: { id: number } | RemoteServiceBooking;
  booking?: RemoteServiceBooking;
}

interface ListServiceBookingsResponse {
  success?: boolean;
  count?: number;
  data?: RemoteServiceBooking[];
}

export const SERVICE_BOOKINGS_API_PATH = '/service-bookings';

let remoteEndpointUnavailable = !SERVICE_BOOKINGS_REMOTE_ENABLED;

export function isServiceBookingsRemoteEnabled(): boolean {
  return SERVICE_BOOKINGS_REMOTE_ENABLED && !remoteEndpointUnavailable;
}

function mapRemoteToLocal(remote: RemoteServiceBooking): LocalServiceBooking {
  const status = resolveServiceBookingStatus(remote.status);
  return {
    id: String(remote.id),
    serviceId: remote.serviceId,
    serviceName: remote.serviceName,
    vehicleDescription: remote.vehicleDescription,
    requestedDateTime: remote.requestedDateTime,
    phone: remote.phone,
    notes: remote.notes ?? undefined,
    status,
    createdAt: remote.createdAt ?? new Date().toISOString(),
    staffRemarks: remote.staffRemarks ?? undefined,
    approvedAt: remote.approvedAt ?? null,
  };
}

function extractRemoteBooking(res: CreateServiceBookingResponse): RemoteServiceBooking | null {
  if (res.booking?.id) return res.booking;
  if (res.data && typeof res.data === 'object' && 'id' in res.data) {
    const data = res.data;
    if ('serviceId' in data) return data as RemoteServiceBooking;
    if (typeof data.id === 'number') {
      return { id: data.id } as RemoteServiceBooking;
    }
  }
  return null;
}

async function tryRemoteServiceBooking(
  payload: ServiceBookingPayload,
  token: string
): Promise<LocalServiceBooking | null> {
  if (remoteEndpointUnavailable) return null;

  try {
    const res = await apiRequest<CreateServiceBookingResponse>(SERVICE_BOOKINGS_API_PATH, {
      method: 'POST',
      token,
      body: payload,
    });
    const remote = extractRemoteBooking(res);
    if (remote?.id) {
      return mapRemoteToLocal({
        ...payload,
        id: remote.id,
        serviceId: remote.serviceId ?? payload.serviceId,
        serviceName: remote.serviceName ?? payload.serviceName,
        vehicleDescription: remote.vehicleDescription ?? payload.vehicleDescription,
        requestedDateTime: remote.requestedDateTime ?? payload.requestedDateTime,
        phone: remote.phone ?? payload.phone,
        notes: remote.notes ?? payload.notes,
        status: remote.status ?? 'pending',
        createdAt: remote.createdAt,
        approvedAt: (remote as any).approvedAt,
        staffRemarks: (remote as any).staffRemarks,
      });
    }
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    if (status === 404 || status === 405) {
      remoteEndpointUnavailable = true;
      if (__DEV__) {
        console.log(
          '[Service bookings] POST /service-bookings not available — saving on device.'
        );
      }
      return null;
    }
    throw err;
  }
  return null;
}

/** GET /api/service-bookings — customer's bookings from Symfony */
export async function fetchRemoteServiceBookings(
  token: string,
  status?: string
): Promise<LocalServiceBooking[]> {
  if (remoteEndpointUnavailable) return [];

  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  try {
    const res = await apiRequest<ListServiceBookingsResponse>(
      `${SERVICE_BOOKINGS_API_PATH}${query}`,
      { method: 'GET', token }
    );
    return (res.data ?? []).map(mapRemoteToLocal);
  } catch (err: unknown) {
    const code = (err as { status?: number })?.status;
    if (code === 404 || code === 405) {
      remoteEndpointUnavailable = true;
      return [];
    }
    throw err;
  }
}

export async function deleteRemoteServiceBooking(id: string, token: string): Promise<void> {
  if (remoteEndpointUnavailable || id.startsWith('local-')) return;
  await apiRequest(`${SERVICE_BOOKINGS_API_PATH}/${id}`, {
    method: 'DELETE',
    token,
  });
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

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function coerceId(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

export function normalizeRealtimeServiceBooking(
  payload: unknown
): LocalServiceBooking | null {
  const root = (toRecord(payload) ?? {}) as RealtimeServiceBookingPayload;
  const nested =
    toRecord(root.booking) ??
    toRecord(root.data) ??
    toRecord(payload) ??
    ({} as Record<string, unknown>);

  const id = coerceId(nested.id ?? root.id ?? root.serviceBookingId);
  if (!id) return null;

  const serviceId = String(
    nested.serviceId ?? root.serviceId ?? `service-${id}`
  );
  const requestedDateTime = String(
    nested.requestedDateTime ?? root.requestedDateTime ?? new Date().toISOString()
  );

  return {
    id,
    serviceId,
    serviceName: String(nested.serviceName ?? root.serviceName ?? 'Service appointment'),
    vehicleDescription: String(
      nested.vehicleDescription ?? root.vehicleDescription ?? 'Vehicle'
    ),
    requestedDateTime,
    phone: String(nested.phone ?? root.phone ?? ''),
    notes: (nested.notes ?? root.notes ?? undefined) as string | undefined,
    status: resolveServiceBookingStatus(String(nested.status ?? root.status ?? 'pending')),
    createdAt: String(nested.createdAt ?? root.createdAt ?? new Date().toISOString()),
    staffRemarks: (nested.staffRemarks ?? root.staffRemarks ?? null) as string | null,
    approvedAt: (nested.approvedAt ?? root.approvedAt ?? null) as string | null,
  };
}

export async function upsertLocalServiceBooking(
  booking: LocalServiceBooking
): Promise<LocalServiceBooking[]> {
  const existing = await loadLocalServiceBookings();
  const next = [booking, ...existing.filter((item) => item.id !== booking.id)];
  await saveLocalServiceBookings(next);
  return next;
}

/**
 * Submit a service appointment. Uses the API when enabled and available; otherwise saves locally.
 */
export async function submitServiceBookingRequest(
  payload: ServiceBookingPayload,
  token?: string | null
): Promise<ServiceBookingSubmitResult> {
  if (token && SERVICE_BOOKINGS_REMOTE_ENABLED) {
    const remote = await tryRemoteServiceBooking(payload, token);
    if (remote) {
      const existing = await loadLocalServiceBookings();
      const withoutDup = existing.filter((b) => b.id !== remote.id);
      await saveLocalServiceBookings([remote, ...withoutDup]);
      return { booking: remote, savedLocally: false };
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
  return { booking: entry, savedLocally: true };
}

/** Merge API bookings with any legacy local-only rows not yet on the server */
export async function loadServiceBookingsForUser(token?: string | null): Promise<LocalServiceBooking[]> {
  const localOnly = (await loadLocalServiceBookings()).filter((b) => b.id.startsWith('local-'));

  if (token && SERVICE_BOOKINGS_REMOTE_ENABLED) {
    try {
      const remote = await fetchRemoteServiceBookings(token);
      const merged = [...remote];
      for (const local of localOnly) {
        if (!merged.some((r) => r.serviceId === local.serviceId && r.requestedDateTime === local.requestedDateTime)) {
          merged.push(local);
        }
      }
      merged.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
      await saveLocalServiceBookings(merged);
      return merged;
    } catch {
      return loadLocalServiceBookings();
    }
  }

  return loadLocalServiceBookings();
}

export async function fetchRemoteServiceBookingById(
  id: string,
  token: string
): Promise<LocalServiceBooking | null> {
  if (remoteEndpointUnavailable || id.startsWith('local-')) return null;
  try {
    const res = await apiRequest<{ success?: boolean; data?: RemoteServiceBooking }>(
      `${SERVICE_BOOKINGS_API_PATH}/${id}`,
      { method: 'GET', token }
    );
    return res.data ? mapRemoteToLocal(res.data) : null;
  } catch {
    return null;
  }
}

export async function getLocalServiceBookingById(
  id: string,
  token?: string | null
): Promise<LocalServiceBooking | null> {
  const all = await loadLocalServiceBookings();
  const cached = all.find((b) => b.id === id) ?? null;
  const shouldFetchRemote = Boolean(token && /^\d+$/.test(id));

  // If this is a remote booking (numeric id) and we have a token,
  // always try to fetch latest status/remarks even if we already cached it.
  if (shouldFetchRemote) {
    const remote = await fetchRemoteServiceBookingById(id, token as string);
    if (remote) {
      await saveLocalServiceBookings([remote, ...all.filter((b) => b.id !== id)]);
      return remote;
    }
    return cached;
  }

  return cached;
}

export async function deleteLocalServiceBooking(id: string, token?: string | null): Promise<void> {
  const booking = await getLocalServiceBookingById(id, token);
  if (booking && !canModifyServiceBooking(booking)) {
    throw {
      message:
        serviceBookingLockedReason(booking) ??
        'This appointment can no longer be cancelled.',
    };
  }

  if (token && !id.startsWith('local-')) {
    try {
      await deleteRemoteServiceBooking(id, token);
    } catch {
      /* still remove locally if server already processed cancellation */
    }
  }
  const existing = await loadLocalServiceBookings();
  await saveLocalServiceBookings(existing.filter((b) => b.id !== id));
}
