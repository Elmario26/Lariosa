# LARIOSA — Data Flow Diagram (Level 1)

Use this document to draw your DFD. Format follows your example:
**Actor (Module) → Process → Database → Output**

---

## Legend

| Symbol | Meaning |
|--------|---------|
| **USER** | Customer using the LARIOSA mobile app (React Native) |
| **STAFF** | Ramle Wheels staff on the Symfony dashboard (approves/rejects bookings) |
| **P** | Process |
| **D** | Data store (database or local storage) |
| **O** | Output (what the user/staff sees) |

---

## External Entities

| ID | Entity | Description |
|----|--------|-------------|
| **USER** | Mobile App Customer | Browses inventory, books test drives & service, manages appointments |
| **STAFF** | Dashboard Panel | Reviews and updates test drive + service booking status (backend only) |

> Note: There is no admin panel inside the mobile app. Staff actions happen on the Symfony API / dashboard and flow back to the app via API polling.

---

## Processes

| ID | Process | Description |
|----|---------|-------------|
| **P1** | User Authentication | Login, register, Google sign-in, session restore |
| **P2** | Vehicle Browsing | Search, filter, list inventory |
| **P3** | Vehicle Detail View | View single car specs, photos, price |
| **P4** | Test Drive Booking | Create, edit, cancel test drive requests |
| **P5** | Service Appointment Booking | Book PMS / service visits |
| **P6** | Appointment Management | View, filter, refresh appointment list & details |
| **P7** | Profile Management | View profile, logout |
| **P8** | Test Drive Processing *(Staff)* | Approve / reject / complete test drives |
| **P9** | Service Booking Processing *(Staff)* | Approve / reject / complete service bookings |

---

## Data Stores

| ID | Data Store | Technology | Contents |
|----|------------|------------|----------|
| **D1** | Local Storage (Session / Cache) | AsyncStorage via redux-persist + direct writes | JWT session (`user`, `token`), vehicle filter prefs, service booking cache |
| **D2** | Vehicle Database | Symfony API (`/api/cars`) | Cars, brand, model, price, stock status, images |
| **D3** | Test Drive Booking Database | Symfony API (`/api/test-drive-bookings`) | Test drive requests, status, date/time, notes, staff remarks |
| **D4** | User Profile Database | Symfony API (`/api/register`, `/api/me`) | Customer accounts (ROLE_CUSTOMER), name, email |
| **D5** | Service Booking Database | Symfony API (`/api/service-bookings`) | Service appointments, status, vehicle description, staff remarks |
| **D6** | Staff Account Database | Symfony backend | Staff/admin credentials (not accessed by mobile app) |

---

## Outputs

| ID | Output | Shown To |
|----|--------|----------|
| **O1** | Login / Register Result | USER |
| **O2** | Vehicle List | USER |
| **O3** | Vehicle Details | USER |
| **O4** | Test Drive Confirmation | USER |
| **O5** | Service Booking Confirmation | USER |
| **O6** | Appointment List | USER |
| **O7** | Appointment Detail / Updated Status | USER |
| **O8** | Profile View | USER |
| **O9** | Updated Test Drive Status *(from staff)* | USER (via polling) |
| **O10** | Updated Service Status *(from staff)* | USER (via polling) |

---

## Data Flows (draw these arrows)

### USER → Authentication (P1)

```
USER ── Login Data (email/password or Google token) ──► P1 User Authentication
P1 ── Store Session ──► D1 Local Storage
D1 ── Session Data ──► P1
P1 ── Register Data ──► D4 User Profile Database
P1 ── Validate Login ──► D4 User Profile Database
P1 ── Login Result ──► O1 Login / Register Result
```

**API calls:** `POST /api/login`, `POST /api/login/google`, `POST /api/register`, `GET /api/me`

---

### USER → Vehicle Browsing (P2)

```
USER ── Search / Filter Request ──► P2 Vehicle Browsing
P2 ── Query Vehicles ──► D2 Vehicle Database
D2 ── Vehicle Records ──► P2
P2 ── Save Filter Prefs ──► D1 Local Storage
D1 ── Filter Prefs ──► P2
P2 ── Vehicle List ──► O2 Vehicle List
```

**API calls:** `GET /api/cars` (public, no JWT required)

---

### USER → Vehicle Detail (P3)

```
USER ── Vehicle ID ──► P3 Vehicle Detail View
P3 ── Fetch Car ──► D2 Vehicle Database
D2 ── Car Details + Images ──► P3
P3 ── Vehicle Details ──► O3 Vehicle Details
```

**API calls:** `GET /api/cars/{id}`, `GET /api/car-images/{filename}`

---

### USER → Test Drive Booking (P4)

```
USER ── Test Drive Request (carId, date/time, notes) ──► P4 Test Drive Booking
P4 ── Read Session ──► D1 Local Storage
D1 ── JWT Token ──► P4
P4 ── Save Booking ──► D3 Test Drive Booking Database
D3 ── Booking Record ──► P4
P4 ── Test Drive Confirmation ──► O4 Test Drive Confirmation
```

**Update / cancel (pending only):**
```
USER ── Edit / Cancel Request ──► P4
P4 ── Update / Delete ──► D3
P4 ── Updated Confirmation ──► O4
```

**API calls:** `POST`, `PATCH`, `DELETE /api/test-drive-bookings`

---

### USER → Service Appointment (P5)

```
USER ── Service Booking Request (service, vehicle, date/time, phone) ──► P5 Service Appointment Booking
P5 ── Read Session ──► D1 Local Storage
D1 ── JWT Token ──► P5
P5 ── Save Booking ──► D5 Service Booking Database
P5 ── Cache Booking ──► D1 Local Storage          ← merged local cache
D5 ── Booking Record ──► P5
P5 ── Service Booking Confirmation ──► O5 Service Booking Confirmation
```

**Fallback (API unavailable):**
```
P5 ── Save Locally Only ──► D1 Local Storage       ← id: local-{timestamp}
```

**API calls:** `POST /api/service-bookings`

---

### USER → Appointment Management (P6)

```
USER ── View Appointments ──► P6 Appointment Management
P6 ── Read Session ──► D1 Local Storage
P6 ── Fetch Test Drives ──► D3 Test Drive Booking Database
P6 ── Fetch / Merge Service Bookings ──► D5 Service Booking Database
P6 ── Read Service Cache ──► D1 Local Storage
P6 ── Merge & Cache ──► D1 Local Storage
D3 + D5 + D1 ── Appointment Records ──► P6
P6 ── Appointment List ──► O6 Appointment List
P6 ── Appointment Detail ──► O7 Appointment Detail / Updated Status
```

**Polling:** App refreshes every **8 seconds** on list & detail screens.

**API calls:** `GET /api/test-drive-bookings`, `GET /api/service-bookings`

---

### USER → Profile (P7)

```
USER ── View Profile / Logout ──► P7 Profile Management
P7 ── Read Session ──► D1 Local Storage
P7 ── Fetch Profile ──► D4 User Profile Database
D4 ── User Data ──► P7
P7 ── Profile View ──► O8 Profile View
P7 ── Clear Session (logout) ──► D1 Local Storage
```

**API calls:** `GET /api/me`

---

### STAFF → Test Drive Processing (P8)

```
STAFF ── Order Processing Request ──► P8 Test Drive Processing
P8 ── Read Orders ──► D3 Test Drive Booking Database
P8 ── Update Status (approve/reject/complete) ──► D3
D3 ── Updated Order ──► P8
P8 ── Processed Order Status ──► (internal dashboard)
```

**Effect on mobile app:**
```
D3 ── Updated Status ──► P6 Appointment Management ──► O9 Updated Test Drive Status
```

---

### STAFF → Service Booking Processing (P9)

```
STAFF ── Booking Update Request ──► P9 Service Booking Processing
P9 ── Read Bookings ──► D5 Service Booking Database
P9 ── Update Status + Staff Remarks ──► D5
D5 ── Updated Booking ──► P9
P9 ── Updated Booking Status ──► (internal dashboard)
```

**Effect on mobile app:**
```
D5 ── Updated Status ──► P6 ──► Cache ──► D1
P6 ──► O10 Updated Service Status
```
---

## Quick Reference — What Uses AsyncStorage (D1)

| Data | How it gets into D1 |
|------|---------------------|
| Login session (user, token) | API response → Redux → redux-persist → AsyncStorage |
| Vehicle search/filter prefs | User action → Redux → redux-persist → AsyncStorage |
| Service booking cache | API response (or local fallback) → direct AsyncStorage write |
| Test drive bookings | **Not** stored in AsyncStorage — kept in Redux memory only, fetched from API |

---

## API Environment

All remote databases (D2–D6) are accessed through the Symfony JSON API. Base URL is configured in `src/app/config/api.ts` (`PRODUCTION`, `NETWORK`, `ANDROID_EMULATOR`, `IOS_SIMULATOR`).
