const express = require('express');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  transports: ['websocket', 'polling'],
});

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || '';
const INTERNAL_EMIT_TOKEN = process.env.INTERNAL_EMIT_TOKEN || '';

if (!Number.isFinite(PORT) || PORT <= 0) {
  console.error('Invalid PORT:', process.env.PORT);
  process.exit(1);
}

function roomForUser(userId) {
  return `user:${String(userId)}`;
}

function getUserIdFromToken(token) {
  if (!JWT_SECRET || !token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload.id ?? payload.userId ?? payload.sub ?? null;
  } catch {
    return null;
  }
}

function assertInternalToken(req, res, next) {
  if (!INTERNAL_EMIT_TOKEN) {
    return res.status(500).json({
      ok: false,
      message: 'INTERNAL_EMIT_TOKEN is not configured',
    });
  }
  const incoming = req.headers['x-internal-token'];
  if (incoming !== INTERNAL_EMIT_TOKEN) {
    return res.status(401).json({ ok: false, message: 'Unauthorized emitter' });
  }
  return next();
}

io.use((socket, next) => {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '');

  // Allow unauthenticated sockets in dev, but they will not auto-join rooms.
  if (!JWT_SECRET) {
    socket.data.userId = socket.handshake.auth?.userId ?? null;
    return next();
  }

  const userId = getUserIdFromToken(token);
  if (!userId) {
    return next(new Error('Invalid token'));
  }
  socket.data.userId = userId;
  return next();
});

io.on('connection', (socket) => {
  const authUserId = socket.data.userId;
  if (authUserId != null) {
    socket.join(roomForUser(authUserId));
  }

  socket.on('subscribe.user', ({ userId }) => {
    // Client-side fallback if backend token has no id claim.
    const safeUserId = userId ?? authUserId;
    if (safeUserId == null) return;
    socket.join(roomForUser(safeUserId));
  });
});

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'lariosa-websocket-gateway' });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/events/booking-updated', assertInternalToken, (req, res) => {
  const { userId, booking } = req.body;
  if (!userId || !booking) {
    return res.status(400).json({ ok: false, message: 'userId and booking are required' });
  }
  io.to(roomForUser(userId)).emit('booking.updated', { booking });
  return res.json({ ok: true });
});

app.post('/events/service-updated', assertInternalToken, (req, res) => {
  const { userId, booking } = req.body;
  if (!userId || !booking) {
    return res.status(400).json({ ok: false, message: 'userId and booking are required' });
  }
  io.to(roomForUser(userId)).emit('service.updated', { booking });
  return res.json({ ok: true });
});

app.post('/events/notification', assertInternalToken, (req, res) => {
  const { userId, notification } = req.body;
  if (!userId || !notification) {
    return res.status(400).json({ ok: false, message: 'userId and notification are required' });
  }
  io.to(roomForUser(userId)).emit('notification.user', notification);
  return res.json({ ok: true });
});

server.on('error', (error) => {
  console.error('WebSocket gateway failed to start:', error);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`WebSocket gateway listening on http://${HOST}:${PORT}`);
});
