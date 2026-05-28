import { io, Socket } from 'socket.io-client';
import { WS_BASE_URL, WS_EVENTS } from '../config/ws';

type SocketAuth = {
  token: string;
  userId?: string | number;
};

let socket: Socket | null = null;

export function connectSocket(auth: SocketAuth): Socket {
  if (socket) {
    socket.auth = auth;
    if (!socket.connected) {
      socket.connect();
    } else if (auth.userId != null) {
      socket.emit(WS_EVENTS.SUBSCRIBE_USER, { userId: auth.userId });
    }
    return socket;
  }

  socket = io(WS_BASE_URL, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    forceNew: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 15000,
    timeout: 15000,
    auth,
  });

  socket.on(WS_EVENTS.CONNECT, () => {
    const currentAuth = socket?.auth as SocketAuth | undefined;
    const userId = currentAuth?.userId;
    if (userId != null) {
      socket?.emit(WS_EVENTS.SUBSCRIBE_USER, { userId });
    }
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}
