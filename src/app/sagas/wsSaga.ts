import { eventChannel, EventChannel } from 'redux-saga';
import { SagaIterator } from 'redux-saga';
import {
  call,
  cancelled,
  fork,
  put,
  select,
  take,
  cancel,
} from 'redux-saga/effects';
import { AnyAction } from 'redux';
import { Socket } from 'socket.io-client';
import {
  USER_LOGIN_SUCCESS,
  LOGOUT_SUCCESS,
  SET_AUTH_STATE,
  USER_LOGIN_ERROR,
} from '../actions';
import {
  getBookingsRequest,
  wsBookingEventReceived,
  wsConnectionStateChanged,
  wsNotificationReceived,
  wsServiceEventReceived,
} from '../actions/bookings';
import { RootState } from '../store';
import { WS_EVENTS } from '../config/ws';
import { connectSocket, disconnectSocket } from '../ws/socketClient';
import {
  normalizeRealtimeServiceBooking,
  upsertLocalServiceBooking,
} from '../api/serviceBookings';

type WsChannelEvent =
  | { type: 'connected' }
  | { type: 'disconnected'; reason?: string }
  | { type: 'connect_error'; message?: string }
  | { type: 'booking_updated'; payload: unknown }
  | { type: 'service_updated'; payload: unknown }
  | { type: 'notification'; payload: unknown };

function createSocketChannel(socket: Socket): EventChannel<WsChannelEvent> {
  return eventChannel((emit) => {
    const onConnect = () => emit({ type: 'connected' });
    const onDisconnect = (reason: string) => emit({ type: 'disconnected', reason });
    const onConnectError = (error: Error) =>
      emit({ type: 'connect_error', message: error?.message });
    const onBookingUpdated = (payload: unknown) => emit({ type: 'booking_updated', payload });
    const onServiceUpdated = (payload: unknown) => emit({ type: 'service_updated', payload });
    const onNotification = (payload: unknown) => emit({ type: 'notification', payload });

    socket.on(WS_EVENTS.CONNECT, onConnect);
    socket.on(WS_EVENTS.DISCONNECT, onDisconnect);
    socket.on(WS_EVENTS.CONNECT_ERROR, onConnectError);
    socket.on(WS_EVENTS.BOOKING_UPDATED, onBookingUpdated);
    socket.on(WS_EVENTS.SERVICE_UPDATED, onServiceUpdated);
    socket.on(WS_EVENTS.USER_NOTIFICATION, onNotification);

    return () => {
      socket.off(WS_EVENTS.CONNECT, onConnect);
      socket.off(WS_EVENTS.DISCONNECT, onDisconnect);
      socket.off(WS_EVENTS.CONNECT_ERROR, onConnectError);
      socket.off(WS_EVENTS.BOOKING_UPDATED, onBookingUpdated);
      socket.off(WS_EVENTS.SERVICE_UPDATED, onServiceUpdated);
      socket.off(WS_EVENTS.USER_NOTIFICATION, onNotification);
    };
  });
}

function* runWsSession(token: string, userId?: string | number): SagaIterator {
  const socket: Socket = yield call(connectSocket, { token, userId });
  const channel: EventChannel<WsChannelEvent> = yield call(createSocketChannel, socket);

  try {
    while (true) {
      const event: WsChannelEvent = yield take(channel);
      switch (event.type) {
        case 'connected':
          yield put(wsConnectionStateChanged(true));
          break;
        case 'disconnected':
          yield put(wsConnectionStateChanged(false, event.reason));
          break;
        case 'connect_error':
          yield put(wsConnectionStateChanged(false, event.message));
          break;
        case 'booking_updated':
          yield put(wsBookingEventReceived(event.payload));
          yield put(getBookingsRequest({ silent: true }));
          break;
        case 'service_updated':
          {
            const localService = normalizeRealtimeServiceBooking(event.payload);
            if (localService) {
              yield call(upsertLocalServiceBooking, localService);
            }
          }
          yield put(wsServiceEventReceived(event.payload));
          break;
        case 'notification':
          yield put(wsNotificationReceived(event.payload));
          break;
        default:
          break;
      }
    }
  } finally {
    channel.close();
    if (yield cancelled()) {
      yield call(disconnectSocket);
      yield put(wsConnectionStateChanged(false, 'session_cancelled'));
    }
  }
}

export function* wsSaga(): SagaIterator {
  let wsTask: any = null;

  const auth: RootState['auth'] = yield select((state: RootState) => state.auth);
  if (auth.token) {
    wsTask = yield fork(runWsSession, auth.token, auth.user?.id);
  }

  while (true) {
    const action: AnyAction = yield take([
      USER_LOGIN_SUCCESS,
      LOGOUT_SUCCESS,
      SET_AUTH_STATE,
      USER_LOGIN_ERROR,
    ]);

    if (action.type === LOGOUT_SUCCESS || action.type === USER_LOGIN_ERROR) {
      if (wsTask) {
        yield cancel(wsTask);
        wsTask = null;
      } else {
        yield call(disconnectSocket);
      }
      continue;
    }

    const nextToken: string | null = action.payload?.token ?? null;
    const nextUserId: string | number | undefined = action.payload?.user?.id;

    if (!nextToken) continue;

    if (wsTask) {
      yield cancel(wsTask);
    }
    wsTask = yield fork(runWsSession, nextToken, nextUserId);
  }
}
