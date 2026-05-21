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
 *   GET  /cars           — API Platform collection (requires JWT)
 *   GET  /cars/{id}      — single car
 *   POST /test-drive-bookings — create (carId, requestedDateTime, notes?)
 *   GET  /test-drive-bookings — list own bookings (?status=pending|approved|...)
 *   GET  /test-drive-bookings/{id} — booking detail
 *   PATCH /test-drive-bookings/{id} — update pending booking (customer)
 *   DELETE /test-drive-bookings/{id} — cancel pending booking (customer)
 * Images (no /api): GET http://host:8000/images/cars/{filename}
 *
 * Images (no /api prefix): GET /images/cars/{filename}
 */

export type ApiEnvironment = 'ANDROID_EMULATOR' | 'IOS_SIMULATOR' | 'NETWORK' | 'PRODUCTION';

/** Change this to match how you run the app */
export const ENVIRONMENT: ApiEnvironment = 'ANDROID_EMULATOR';

/** Your PC LAN IP — used when ENVIRONMENT is NETWORK (physical device on same Wi‑Fi) */
export const LOCAL_NETWORK_IP = '192.168.1.29';

const HOSTS: Record<ApiEnvironment, string> = {
  // Android emulator → host machine localhost
  ANDROID_EMULATOR: 'http://10.0.2.2:8000',
  // iOS simulator / Metro on same machine
  IOS_SIMULATOR: 'http://localhost:8000',
  // Physical phone/tablet (must match Postman host, but use LAN IP instead of localhost)
  NETWORK: `http://${LOCAL_NETWORK_IP}:8000`,
  PRODUCTION: 'https://your-production-api.com',
};

/** Origin without /api — images and static assets */
export const API_HOST = HOSTS[ENVIRONMENT];

/** JSON API base — must match Postman {{baseUrl}}/api */
export const API_BASE_URL = `${API_HOST}/api`;

/** Car image route (Symfony: public/uploads/cars/) */
export const CAR_IMAGE_PATH = '/images/cars';

export function getCarImageUrl(filename: string): string {
  return `${API_HOST}${CAR_IMAGE_PATH}/${filename}`;
}
