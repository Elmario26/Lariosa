/**

 * Symfony backend connection — align with your Postman collection.

 *

 * Postman base URL example: http://localhost:8000

 * App API prefix (Symfony routes under /api): http://localhost:8000/api

 *

 * Endpoints (ramlewheels Symfony API — paths relative to API_BASE_URL):

 *   POST /login          — body: { email, password } → { token }
 *   POST /login/google   — body: { idToken } → { token }

 *   POST /register       — body: { fullName, email, password } → ROLE_CUSTOMER (app users)

 *   GET  /me             — Authorization: Bearer <token>

 *   GET  /cars           — vehicle list (public; JWT optional)

 *   GET  /cars/{id}      — single car

 *   GET  /api/car-images/{filename} — public car photo (mobile app)

 *   POST /test-drive-bookings — create (carId, requestedDateTime, notes?)

 *   ...

 *

 * Car photos (try in order): /api/car-images/, /images/cars/, /uploads/cars/

 */



export type ApiEnvironment = 'ANDROID_EMULATOR' | 'IOS_SIMULATOR' | 'NETWORK' | 'PRODUCTION';



/**

 * Change this to match how you run the app:

 * - PRODUCTION / NETWORK → Railway or LAN Symfony server

 * - ANDROID_EMULATOR → http://10.0.2.2:8000 (Symfony on your PC)

 * - IOS_SIMULATOR → http://localhost:8000

 */

export const ENVIRONMENT: ApiEnvironment = 'PRODUCTION';



/**

 * When false, service appointments are stored on-device only (no POST /service-bookings).

 * Turn on after the Symfony API ships service bookings (avoids 404 noise on Railway).

 */

export const SERVICE_BOOKINGS_REMOTE_ENABLED = true;



/** Your PC LAN IP — used when ENVIRONMENT is NETWORK (physical device on same Wi‑Fi) */

export const LOCAL_NETWORK_IP = '192.168.1.29';



/** Live Symfony API (Ramle Wheels on Railway) */

export const PRODUCTION_API_HOST =

  'https://ramlewheels-dashboard-access-control-production.up.railway.app';



const HOSTS: Record<ApiEnvironment, string> = {

  ANDROID_EMULATOR: 'http://10.0.2.2:8000',

  IOS_SIMULATOR: 'http://localhost:8000',

  NETWORK: `http://${LOCAL_NETWORK_IP}:8000`,

  PRODUCTION: PRODUCTION_API_HOST,

};



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



/** Legacy Symfony routes (fallback if /api/car-images is unavailable) */

export const CAR_IMAGE_PATH = '/images/cars';

export const CAR_IMAGE_STATIC_PATH = '/uploads/cars';



export type CarImageRef =

  | string

  | { filename?: string; url?: string; name?: string }

  | null

  | undefined;



function encodeFilename(filename: string): string {

  return encodeURIComponent(filename).replace(/%2F/g, '/');

}



/** Build every URL the app should try for one image reference */

export function getCarImageCandidateUrls(filenameOrPath: string): string[] {

  const trimmed = filenameOrPath.trim();

  if (!trimmed) return [];



  if (/^https?:\/\//i.test(trimmed)) return [trimmed];

  if (trimmed.startsWith('//')) return [`https:${trimmed}`];



  if (trimmed.startsWith('/api/car-images/')) {

    return [`${API_HOST}${trimmed}`];

  }



  if (trimmed.startsWith('/images/') || trimmed.startsWith('/uploads/')) {

    return [`${API_HOST}${trimmed}`];

  }



  const filename = trimmed.replace(/^.*[/\\]/, '');

  const encoded = encodeFilename(filename);



  return [

    buildApiUrl(`/car-images/${encoded}`),

    `${API_HOST}${CAR_IMAGE_PATH}/${encoded}`,

    `${API_HOST}${CAR_IMAGE_STATIC_PATH}/${encoded}`,

  ];

}



/** @deprecated Use getCarImageCandidateUrls — returns primary API route */

export function getCarImageUrl(filenameOrPath: string): string {

  return getCarImageCandidateUrls(filenameOrPath)[0] ?? '';

}



/** @deprecated CarImage now uses full candidate list */

export function getCarImageAlternateUrl(uri: string): string | null {

  const candidates = getCarImageCandidateUrls(uri);

  return candidates[1] ?? null;

}



export function resolveCarImageUris(ref: CarImageRef): string[] {

  if (ref == null) return [];



  if (typeof ref === 'object') {

    if (ref.url) return getCarImageCandidateUrls(ref.url);

    const name = ref.filename ?? ref.name;

    if (name) return getCarImageCandidateUrls(name);

    return [];

  }



  const value = String(ref).trim();

  if (!value || value === '[object Object]') return [];

  return getCarImageCandidateUrls(value);

}



export function resolveCarImageRef(ref: CarImageRef): string | null {

  return resolveCarImageUris(ref)[0] ?? null;

}


