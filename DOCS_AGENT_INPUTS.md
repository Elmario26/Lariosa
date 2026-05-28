# Docs Agent Inputs (Needed Info)

To write accurate documentation, other agents will need the following artifacts/info.
Fill in what you can; if something is not applicable, note why.

## 1) `AndroidManifest.xml`

- App name (label)
- Required permissions
- Activities (including the launcher activity)
- Any intent-filters / deep links
- Any application-level metadata (e.g., Google Sign-In config, Firebase config)

**File location (if known):** `android/app/src/main/AndroidManifest.xml` (typical)

## 2) Main Activity / Key Screens

- What the app does at a high level
- Entry points:
  - Main activity (what it launches) 
  - Navigation entry (first screen)
- List key screens and what each one does (auth, inventory, appointments/bookings, booking details, etc.)

**Include:**
- Screen names/titles
- User actions (e.g., sign in, request booking, cancel booking)
- Any major UI flows that require explanation

## 3) Data Models (Main Classes / Entities)

- The app’s main data types/entities
- Relationships between them (if relevant)
- Where they live in the codebase (file paths)

**Examples of what to include:**
- `User` / auth profile
- `Vehicle`
- `TestDriveBooking` / `ServiceBooking`
- Status enums and allowed values

## 4) `build.gradle`

- SDK versions:
  - `compileSdkVersion`
  - `targetSdkVersion`
  - `minSdkVersion`
  - `buildToolsVersion` (if present)
- Dependencies used by the app
- Android plugin versions (AGP) and Gradle plugin configuration
- Any signing configs or build variants (debug/release)

**File location (if known):**
- Project: `android/build.gradle`
- App: `android/app/build.gradle`

## Optional (if available)

- API base URL / environment notes (how local vs production works)
- Backend endpoint list (if not already documented)
- Any environment variables needed for mobile builds

