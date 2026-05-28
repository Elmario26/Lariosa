# Backend WebSocket Setup (Symfony + LARIOSA app)

This project now includes a Socket.IO gateway at `backend/websocket`.

Use it to push realtime booking updates to mobile clients after staff actions.

## 1) Run the websocket gateway

```bash
cd backend/websocket
cp .env.example .env
npm install
npm run start
```

Environment variables:

- `PORT`: gateway port (`4000` default)
- `CORS_ORIGIN`: allowed origins (`*` for local testing)
- `JWT_SECRET`: same secret used by Symfony JWT tokens
- `INTERNAL_EMIT_TOKEN`: shared secret used by Symfony when posting events

## 2) Point mobile app to gateway

In `src/app/config/ws.ts`, set:

```ts
export const WS_GATEWAY_HOST = 'http://YOUR_HOST_IP:4000';
```

Examples:

- Android emulator + local machine: `http://10.0.2.2:4000`
- Physical device on same Wi-Fi: `http://192.168.x.x:4000`

## 3) Emit events from Symfony after status updates

After staff approves/rejects/completes a booking, call gateway REST endpoints:

### Test drive update

`POST /events/booking-updated`

Body:

```json
{
  "userId": 123,
  "booking": {
    "id": 42,
    "status": "approved",
    "requestedDateTime": "2026-05-30T10:00:00+08:00",
    "updatedAt": "2026-05-28T11:00:00+08:00"
  }
}
```

### Service update

`POST /events/service-updated`

Body:

```json
{
  "userId": 123,
  "booking": {
    "id": 88,
    "serviceId": "pms-5k",
    "serviceName": "PMS 5,000km",
    "vehicleDescription": "Toyota Vios 2023",
    "requestedDateTime": "2026-05-31T09:30:00+08:00",
    "status": "approved",
    "staffRemarks": "Please arrive 15 minutes early",
    "updatedAt": "2026-05-28T11:00:00+08:00"
  }
}
```

Required header for all emit endpoints:

```
x-internal-token: <INTERNAL_EMIT_TOKEN>
```

## 4) Event names expected by mobile app

- `booking.updated`
- `service.updated`
- `notification.user`
- `subscribe.user` (optional fallback)

## 5) Quick test with curl

```bash
curl -X POST http://localhost:4000/events/booking-updated \
  -H "Content-Type: application/json" \
  -H "x-internal-token: change-this-too" \
  -d "{\"userId\":123,\"booking\":{\"id\":42,\"status\":\"approved\",\"requestedDateTime\":\"2026-05-30T10:00:00+08:00\"}}"
```

