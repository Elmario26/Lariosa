import { API_HOST } from './api';

export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  BOOKING_UPDATED: 'booking.updated',
  SERVICE_UPDATED: 'service.updated',
  USER_NOTIFICATION: 'notification.user',
  SUBSCRIBE_USER: 'subscribe.user',
} as const;

function toWsUrl(httpUrl: string): string {
  if (httpUrl.startsWith('https://')) {
    return httpUrl.replace('https://', 'wss://');
  }
  if (httpUrl.startsWith('http://')) {
    return httpUrl.replace('http://', 'ws://');
  }
  return httpUrl;
}

/**
 * WebSocket endpoint.
 *
 * Default: reuse API host.
 * If you run a separate socket gateway, set this to that host (example: http://192.168.1.29:4000).
 */
export const WS_GATEWAY_HOST = API_HOST;

export const WS_BASE_URL = toWsUrl(WS_GATEWAY_HOST);
