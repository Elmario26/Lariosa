/**
 * Symfony backend connection — align with your Postman collection.
 *
 * Postman base URL example: http://localhost:8000
 * App API prefix (Symfony routes under /api): http://localhost:8000/api
 *
 * Endpoints (ramlewheels Symfony API — paths relative to API_BASE_URL):
 *   POST /login          — body: { email, password } → { token }
 *   POST /register       — body: { fullName, email, password } → ROLE_CUSTOMER (app users)
 *   GET  /me             — Authorization: Bearer <token>
 *   GET  /cars           — vehicle list (public; JWT optional)
 *   GET  /cars/{id}      — single car
 *   POST /test-drive-bookings — create (carId, requestedDateTime, notes?)
 *   GET  /test-drive-bookings — list own bookings (?status=pending|approved|...)
 *   GET  /test-drive-bookings/{id} — booking detail
 *   PATCH /test-drive-bookings/{id} — update pending booking (customer)
 *   DELETE /test-drive-bookings/{id} — cancel pending booking (customer)
 *
 * Not yet on API (service booking UI queues locally until added):
 *   GET  /services — catalog (oil change, PMS packages, tires, …)
 *   POST /service-bookings — create (serviceId, vehicleDescription, requestedDateTime, phone, notes?)
 *   GET  /service-bookings — list own service appointments
 *
 * Images (no /api): GET http://host:8000/images/cars/{filename}
 *
 * Images (no /api prefix): GET /images/cars/{filename}
 */

export type ApiEnvironment = 'ANDROID_EMULATOR' | 'IOS_SIMULATOR' | 'NETWORK' | 'PRODUCTION';

/**
 * Change this to match how you run the app:
 * - PRODUCTION / NETWORK → Railway or LAN Symfony server
 * - ANDROID_EMULATOR → http://10.0.2.2:8000 (Symfony on your PC)
 * - IOS_SIMULATOR → http://localhost:8000
 */
export const ENVIRONMENT: ApiEnvironment = 'PRODUCTION';

/** Your PC LAN IP — used when ENVIRONMENT is NETWORK (physical device on same Wi‑Fi) */
export const LOCAL_NETWORK_IP = '192.168.1.29';

/** Live Symfony API (Ramle Wheels on Railway) */
export const PRODUCTION_API_HOST =
  'https://ramlewheels-dashboard-access-control-production.up.railway.app';

const HOSTS: Record<ApiEnvironment, string> = {
  // Emulator + Symfony on your PC (same as Postman http://localhost:8000)
  ANDROID_EMULATOR: 'http://10.0.2.2:8000',
  IOS_SIMULATOR: 'http://localhost:8000',
  // Physical device on same Wi‑Fi as PC running Symfony
  NETWORK: `http://${LOCAL_NETWORK_IP}:8000`,
  PRODUCTION: PRODUCTION_API_HOST,
};

/** Strip trailing slashes so we never build ...app//api/register */
function trimSlashes(url: string): string {
  return url.replace(/\/+$/, '');
}

/** Origin without /api — images and static assets */
export const API_HOST = trimSlashes(HOSTS[ENVIRONMENT]);

/** JSON API base — must match Postman {{baseUrl}}/api */
export const API_BASE_URL = `${API_HOST}/api`;

/** Join API_BASE_URL + endpoint (e.g. /register) without duplicate slashes */
export function buildApiUrl(endpoint: string): string {
  const base = trimSlashes(API_BASE_URL);
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}

/** Car image route (Symfony: public/uploads/cars/) */
export const CAR_IMAGE_PATH = '/images/cars';

export function getCarImageUrl(filename: string): string {
  return `${API_HOST}${CAR_IMAGE_PATH}/${filename.replace(/^\//, '')}`;
}
