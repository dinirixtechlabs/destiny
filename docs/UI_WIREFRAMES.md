# destiny — UI Wireframes

This document contains screen-by-screen text-based wireframes for the destiny ride-booking platform.

- **Passenger App** — React Native + Expo
- **Driver App** — React Native + Expo
- **Admin Dashboard** — React + Vite + Tailwind CSS

---

## Table of Contents

- [Passenger App](#passenger-app)
  - [Navigation Flow](#passenger-navigation-flow)
  - [Splash Screen](#passenger-splash-screen)
  - [Login Screen](#passenger-login-screen)
  - [Register Screen](#passenger-register-screen)
  - [Home Screen (Map + Booking)](#passenger-home-screen)
  - [Fare Estimate Screen](#passenger-fare-estimate-screen)
  - [Ride Tracking Screen](#passenger-ride-tracking-screen)
  - [Rating Screen](#passenger-rating-screen)
  - [Ride History Screen](#passenger-ride-history-screen)
  - [Profile Screen](#passenger-profile-screen)
  - [Edit Profile Screen](#passenger-edit-profile-screen)
- [Driver App](#driver-app)
  - [Navigation Flow](#driver-navigation-flow)
  - [Splash Screen](#driver-splash-screen)
  - [Login Screen](#driver-login-screen)
  - [Register Screen](#driver-register-screen)
  - [Pending Approval Screen](#driver-pending-approval-screen)
  - [Home Screen (Online/Offline)](#driver-home-screen)
  - [Ride Request Popup](#driver-ride-request-popup)
  - [Active Ride Screen](#driver-active-ride-screen)
  - [Earnings Screen](#driver-earnings-screen)
  - [Ride History Screen](#driver-ride-history-screen)
  - [Profile Screen](#driver-profile-screen)
  - [Vehicle Management Screen](#driver-vehicle-management-screen)
- [Admin Dashboard](#admin-dashboard)
  - [Navigation Flow](#admin-navigation-flow)
  - [Login Page](#admin-login-page)
  - [Dashboard Page](#admin-dashboard-page)
  - [Users List Page](#admin-users-list-page)
  - [Drivers List Page](#admin-drivers-list-page)
  - [Driver Detail Page](#admin-driver-detail-page)
  - [Rides List Page](#admin-rides-list-page)
  - [Ride Detail Page](#admin-ride-detail-page)

---

# Passenger App

## Passenger Navigation Flow

```text
┌──────────┐
│  Splash  │
└────┬─────┘
     │
     ▼
┌──────────────────────────────┐
│  Has Token?                  │
│  YES ──────► Home (Map)      │
│  NO  ──────► Login           │
└──────────────────────────────┘

┌──────────┐    ┌────────────┐
│  Login   │◄──►│  Register  │
└────┬─────┘    └────────────┘
     │
     ▼
┌──────────────────────────────────────────────┐
│              Home (Map + Booking)             │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Profile  │  │  History  │  │  Book Ride │  │
│  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
│       │              │              │          │
│       ▼              ▼              ▼          │
│  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │  View /  │  │  Ride    │  │ Fare        │ │
│  │  Edit    │  │  Details  │  │ Estimate    │ │
│  │  Profile │  │          │  └──────┬──────┘ │
│  └──────────┘  └──────────┘        │         │
│                                     ▼         │
│                              ┌─────────────┐  │
│                              │ Ride        │  │
│                              │ Tracking    │  │
│                              └──────┬──────┘  │
│                                     │         │
│                                     ▼         │
│                              ┌─────────────┐  │
│                              │ Rating      │  │
│                              └─────────────┘  │
└──────────────────────────────────────────────┘
```

---

## Passenger Splash Screen

**Purpose:** Brand introduction, auto-login check.

```
┌─────────────────────────────┐
│                             │
│                             │
│                             │
│         ┌───────────┐       │
│         │  destiny  │       │
│         │   logo    │       │
│         └───────────┘       │
│                             │
│        d e s t i n y        │
│      Your ride, your way    │
│                             │
│         ◌ loading...        │
│                             │
│                             │
│                             │
└─────────────────────────────┘
```

**Behavior:**
- Show for 2 seconds
- Check AsyncStorage for JWT token
- Valid token → navigate to **Home Screen**
- No token / expired → navigate to **Login Screen**

---

## Passenger Login Screen

**Purpose:** Authenticate existing passengers.

```
┌─────────────────────────────┐
│                             │
│        d e s t i n y        │
│                             │
│  ┌───────────────────────┐  │
│  │ Email                 │  │
│  │ john@example.com      │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Password              │  │
│  │ ••••••••         👁   │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │        LOGIN          │  │
│  └───────────────────────┘  │
│                             │
│    Don't have an account?   │
│         Register →          │
│                             │
└─────────────────────────────┘
```

**Key Elements:**
- Email input field (keyboard type: email)
- Password input field (secure entry, toggle visibility icon)
- "Login" button — calls `POST /api/v1/auth/login/`
- Link to Register Screen
- Error message area (invalid credentials)
- Loading spinner on submit

**API:** `POST /api/v1/auth/login/` → stores JWT tokens in AsyncStorage

---

## Passenger Register Screen

**Purpose:** Create a new passenger account.

```
┌─────────────────────────────┐
│  ←  Back                    │
│                             │
│      Create Account         │
│                             │
│  ┌───────────────────────┐  │
│  │ Full Name             │  │
│  │ John Doe              │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Email                 │  │
│  │ john@example.com      │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Phone Number          │  │
│  │ 9876543210            │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Password              │  │
│  │ ••••••••         👁   │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Confirm Password      │  │
│  │ ••••••••         👁   │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │      REGISTER         │  │
│  └───────────────────────┘  │
│                             │
│   Already have an account?  │
│          Login →            │
│                             │
└─────────────────────────────┘
```

**Key Elements:**
- Full Name, Email, Phone, Password, Confirm Password fields
- Client-side validation (email format, password match, phone length)
- "Register" button — calls `POST /api/v1/auth/register/`
- Link back to Login Screen
- Back arrow navigation

**API:** `POST /api/v1/auth/register/` → on success, navigate to Login

---

## Passenger Home Screen

**Purpose:** Map view with ride booking interface.

```
┌─────────────────────────────┐
│  ☰                   👤     │
│ ┌─────────────────────────┐ │
│ │                         │ │
│ │                         │ │
│ │     ┌─────────────┐     │ │
│ │     │ MAP VIEW    │     │ │
│ │     │             │     │ │
│ │     │    📍       │     │ │
│ │     │  (current   │     │ │
│ │     │  location)  │     │ │
│ │     │             │     │ │
│ │     └─────────────┘     │ │
│ │                         │ │
│ │                         │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ ◉ Pickup Location      │ │
│ │   Current Location  📍  │ │
│ ├─────────────────────────┤ │
│ │ ◎ Where to?             │ │
│ │   Enter destination...  │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │     BOOK RIDE  →        │ │
│ └─────────────────────────┘ │
│                             │
│  🏠 Home  📋 History  👤   │
└─────────────────────────────┘
```

**Key Elements:**
- Full-screen map (`react-native-maps`) centered on user's current GPS location
- Pickup location input — auto-filled with current location via `expo-location`
- Destination input — tappable, opens location search
- "Book Ride" button — disabled until destination is entered
- Hamburger menu (☰) — links to Profile, History, Settings
- Bottom tab navigation: Home, History, Profile

**Behavior:**
1. On load, request location permission and get current GPS
2. User taps "Where to?" → location search with text input
3. After destination selected → show Fare Estimate Screen
4. "Book Ride" → calls `POST /api/v1/rides/` → navigate to Ride Tracking

**APIs:**
- `expo-location` for GPS
- `POST /api/v1/fares/estimate/` for fare preview
- `POST /api/v1/rides/` to create ride request

---

## Passenger Fare Estimate Screen

**Purpose:** Show estimated fare before confirming the ride.

```
┌─────────────────────────────┐
│  ←  Back                    │
│                             │
│ ┌─────────────────────────┐ │
│ │       MAP VIEW          │ │
│ │   📍 A ─ ─ ─ ─ 📍 B    │ │
│ │   (pickup)    (dest)    │ │
│ └─────────────────────────┘ │
│                             │
│  ┌─────────────────────────┐│
│  │  TRIP SUMMARY           ││
│  │                         ││
│  │  Pickup:                ││
│  │  📍 123 Main Street     ││
│  │                         ││
│  │  Destination:           ││
│  │  📍 456 Park Avenue     ││
│  │                         ││
│  │  ─────────────────────  ││
│  │                         ││
│  │  Distance:    10.5 km   ││
│  │  Duration:    ~25 min   ││
│  │  Est. Fare:   ₹250      ││
│  │                         ││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │     CONFIRM BOOKING     ││
│  └─────────────────────────┘│
│                             │
└─────────────────────────────┘
```

**Key Elements:**
- Map with route line from pickup to destination
- Trip summary card: pickup address, destination address, distance, estimated duration, estimated fare
- "Confirm Booking" button — creates ride request
- Back button to edit pickup/destination

**API:** `POST /api/v1/fares/estimate/` → displays result, then `POST /api/v1/rides/` on confirm

---

## Passenger Ride Tracking Screen

**Purpose:** Track ride status in real time.

```
┌─────────────────────────────┐
│                             │
│ ┌─────────────────────────┐ │
│ │       MAP VIEW          │ │
│ │                         │ │
│ │   🚗 ─ ─ ─ ► 📍        │ │
│ │  (driver)   (pickup)    │ │
│ │                         │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │  Status: DRIVER ARRIVING│ │
│ │  ═══════════░░░░░░░░░░  │ │
│ │                         │ │
│ │  ● Searching   ✓       │ │
│ │  ● Accepted    ✓       │ │
│ │  ● Arriving    ◄       │ │
│ │  ○ Arrived              │ │
│ │  ○ In Progress          │ │
│ │  ○ Completed            │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 👤 Driver Name          │ │
│ │ ⭐ 4.8  │ Swift Dzire   │ │
│ │ OD-07-AB-1234 │ White   │ │
│ └─────────────────────────┘ │
│                             │
│  ┌────────┐  ┌────────────┐ │
│  │  CALL  │  │ CANCEL RIDE│ │
│  └────────┘  └────────────┘ │
│                             │
└─────────────────────────────┘
```

**Key Elements:**
- Map showing driver location and route
- Status progress bar with ride states:
  `SEARCHING_DRIVER → ACCEPTED → DRIVER_ARRIVING → ARRIVED → IN_PROGRESS → COMPLETED`
- Driver info card: name, rating, vehicle model, number, color
- "Call Driver" button
- "Cancel Ride" button — visible only before ARRIVED status
- Status auto-refreshes via polling `GET /api/v1/rides/{ride_id}/`

**Behavior:**
- Poll ride status every 5 seconds (or use Supabase Realtime)
- On COMPLETED → navigate to Rating Screen
- On CANCELLED → navigate back to Home

**APIs:**
- `GET /api/v1/rides/{ride_id}/` — poll for status updates
- `POST /api/v1/rides/{ride_id}/cancel/` — cancel ride

---

## Passenger Rating Screen

**Purpose:** Rate the driver after ride completion.

```
┌─────────────────────────────┐
│                             │
│       Ride Completed!       │
│                             │
│    ┌───────────────────┐    │
│    │  Fare: ₹250       │    │
│    │  Distance: 10.5km │    │
│    │  Duration: 28 min  │    │
│    └───────────────────┘    │
│                             │
│     Rate your driver        │
│                             │
│     ☆  ☆  ☆  ☆  ☆          │
│     1  2  3  4  5           │
│                             │
│  ┌───────────────────────┐  │
│  │ Write a review        │  │
│  │ (optional)            │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │    SUBMIT RATING      │  │
│  └───────────────────────┘  │
│                             │
│        Skip →               │
│                             │
└─────────────────────────────┘
```

**Key Elements:**
- Ride summary (fare, distance, duration)
- 1–5 star selector (tappable stars)
- Optional review text input
- "Submit Rating" button
- "Skip" link to go back to Home without rating

**API:** `POST /api/v1/ratings/` with `ride_id`, `rating`, `review`

---

## Passenger Ride History Screen

**Purpose:** View all past rides.

```
┌─────────────────────────────┐
│  ←  Ride History            │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📅 Oct 30, 2026  2:30PM│ │
│ │ 📍 123 Main St          │ │
│ │ 📍 456 Park Ave         │ │
│ │ ₹250  │  COMPLETED  ✓   │ │
│ │ Driver: Ravi K.  ⭐ 4.8 │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📅 Oct 28, 2026  9:15AM│ │
│ │ 📍 789 Oak Road         │ │
│ │ 📍 321 Elm Street       │ │
│ │ ₹180  │  COMPLETED  ✓   │ │
│ │ Driver: Anil S.  ⭐ 4.5 │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📅 Oct 25, 2026  6:00PM│ │
│ │ 📍 555 River Rd         │ │
│ │ 📍 222 Hill St          │ │
│ │ ₹0    │  CANCELLED  ✕   │ │
│ └─────────────────────────┘ │
│                             │
│       Load More ↓           │
│                             │
│  🏠 Home  📋 History  👤   │
└─────────────────────────────┘
```

**Key Elements:**
- Scrollable list of past rides
- Each ride card: date, time, pickup, destination, fare, status, driver name, driver rating
- Tap a ride card → view ride detail (reuse Ride Tracking layout)
- Status badges: COMPLETED (green), CANCELLED (red)
- Pagination / "Load More" at bottom

**API:** `GET /api/v1/rides/my-rides/`

---

## Passenger Profile Screen

**Purpose:** View user profile and access settings.

```
┌─────────────────────────────┐
│  ←  Profile                 │
│                             │
│         ┌─────┐             │
│         │ 👤  │             │
│         └─────┘             │
│       John Doe              │
│   john@example.com          │
│                             │
│  ┌───────────────────────┐  │
│  │ 📱 Phone              │  │
│  │    9876543210          │  │
│  ├───────────────────────┤  │
│  │ 📧 Email              │  │
│  │    john@example.com   │  │
│  ├───────────────────────┤  │
│  │ 📅 Joined             │  │
│  │    Oct 2026            │  │
│  ├───────────────────────┤  │
│  │ 🚗 Total Rides        │  │
│  │    15                  │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │    EDIT PROFILE        │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │      LOGOUT           │  │
│  └───────────────────────┘  │
│                             │
│  🏠 Home  📋 History  👤   │
└─────────────────────────────┘
```

**Key Elements:**
- Avatar / profile picture placeholder
- Full name, email, phone, join date, ride count
- "Edit Profile" button → navigate to Edit Profile Screen
- "Logout" button → clear AsyncStorage, navigate to Login

**API:** `GET /api/v1/users/me/`

---

## Passenger Edit Profile Screen

**Purpose:** Update profile information.

```
┌─────────────────────────────┐
│  ←  Edit Profile            │
│                             │
│         ┌─────┐             │
│         │ 👤  │             │
│         └─────┘             │
│                             │
│  ┌───────────────────────┐  │
│  │ Full Name             │  │
│  │ John Doe              │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Phone Number          │  │
│  │ 9876543210            │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Email (read-only)     │  │
│  │ john@example.com      │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │    SAVE CHANGES       │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

**Key Elements:**
- Editable fields: Full Name, Phone Number
- Read-only field: Email (greyed out)
- "Save Changes" button — calls `PUT /api/v1/users/me/`
- Success toast notification on save
- Back arrow to return to Profile Screen

**API:** `PUT /api/v1/users/me/`

---

# Driver App

## Driver Navigation Flow

```text
┌──────────┐
│  Splash  │
└────┬─────┘
     │
     ▼
┌──────────────────────────────────────┐
│  Has Token?                          │
│  YES ──► is_approved?               │
│          YES ──► Home (Online/Off)   │
│          NO  ──► Pending Approval    │
│  NO  ──────► Login                   │
└──────────────────────────────────────┘

┌──────────┐    ┌────────────┐
│  Login   │◄──►│  Register  │
└────┬─────┘    └────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────┐
│              Home (Online / Offline)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ Earnings │  │ History  │  │ Profile  │            │
│  └──────────┘  └──────────┘  └────┬─────┘            │
│                                   │                   │
│                              ┌────┴─────┐            │
│                              │ Vehicle  │            │
│                              │ Mgmt     │            │
│                              └──────────┘            │
│                                                       │
│  When online + ride request arrives:                  │
│  ┌──────────────┐    ┌────────────────┐              │
│  │ Ride Request  │──►│  Active Ride   │              │
│  │ Popup         │    │  Screen        │              │
│  └──────────────┘    └────────────────┘              │
└──────────────────────────────────────────────────────┘
```

---

## Driver Splash Screen

**Purpose:** Brand introduction, auto-login check for drivers.

```
┌─────────────────────────────┐
│                             │
│                             │
│                             │
│         ┌───────────┐       │
│         │  destiny  │       │
│         │   logo    │       │
│         └───────────┘       │
│                             │
│        d e s t i n y        │
│          D R I V E R        │
│                             │
│         ◌ loading...        │
│                             │
│                             │
│                             │
└─────────────────────────────┘
```

**Behavior:**
- Show for 2 seconds
- Check AsyncStorage for JWT token
- Valid token + `is_approved = true` → **Home Screen**
- Valid token + `is_approved = false` → **Pending Approval Screen**
- No token → **Login Screen**

---

## Driver Login Screen

**Purpose:** Authenticate existing drivers.

```
┌─────────────────────────────┐
│                             │
│    d e s t i n y  Driver    │
│                             │
│  ┌───────────────────────┐  │
│  │ Email                 │  │
│  │ driver@example.com    │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Password              │  │
│  │ ••••••••         👁   │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │        LOGIN          │  │
│  └───────────────────────┘  │
│                             │
│    Don't have an account?   │
│     Register as Driver →    │
│                             │
└─────────────────────────────┘
```

**Key Elements:**
- Email and password fields
- "Login" button → `POST /api/v1/auth/login/`
- Link to Driver Register Screen
- Error display for invalid credentials

**API:** `POST /api/v1/auth/login/` → check role is DRIVER, store JWT

---

## Driver Register Screen

**Purpose:** Create a new driver account.

```
┌─────────────────────────────┐
│  ←  Back                    │
│                             │
│    Register as Driver       │
│                             │
│  ┌───────────────────────┐  │
│  │ Full Name             │  │
│  │ Driver Name           │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Email                 │  │
│  │ driver@example.com    │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Phone Number          │  │
│  │ 9876543210            │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ License Number        │  │
│  │ DL123456789           │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Password              │  │
│  │ ••••••••         👁   │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Confirm Password      │  │
│  │ ••••••••         👁   │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │      REGISTER         │  │
│  └───────────────────────┘  │
│                             │
│   Already have an account?  │
│          Login →            │
│                             │
└─────────────────────────────┘
```

**Key Elements:**
- Full Name, Email, Phone, License Number, Password, Confirm Password
- License Number is driver-specific (not in passenger registration)
- "Register" button → `POST /api/v1/auth/register/driver/`
- On success → navigate to Login with success message

**API:** `POST /api/v1/auth/register/driver/`

---

## Driver Pending Approval Screen

**Purpose:** Shown when driver account is not yet approved by admin.

```
┌─────────────────────────────┐
│                             │
│                             │
│                             │
│         ⏳                  │
│                             │
│    Account Under Review     │
│                             │
│  Your driver account is     │
│  pending admin approval.    │
│                             │
│  You'll be able to go       │
│  online once approved.      │
│                             │
│                             │
│  ┌───────────────────────┐  │
│  │    CHECK STATUS       │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │      LOGOUT           │  │
│  └───────────────────────┘  │
│                             │
│                             │
└─────────────────────────────┘
```

**Key Elements:**
- Hourglass / waiting icon
- Message explaining approval is pending
- "Check Status" button → re-fetches driver profile to check `is_approved`
- "Logout" button

**Behavior:**
- If `is_approved` becomes `true` on check → navigate to Home Screen
- Otherwise show "Still pending" message

**API:** `GET /api/v1/drivers/me/` → check `is_approved` field

---

## Driver Home Screen

**Purpose:** Online/Offline toggle and incoming ride requests.

```
┌─────────────────────────────┐
│  ☰                   👤     │
│ ┌─────────────────────────┐ │
│ │                         │ │
│ │       MAP VIEW          │ │
│ │                         │ │
│ │         📍              │ │
│ │    (your location)      │ │
│ │                         │ │
│ │                         │ │
│ └─────────────────────────┘ │
│                             │
│  ┌─────────────────────────┐│
│  │                         ││
│  │   ┌─────────────────┐   ││
│  │   │  🔴 OFFLINE     │   ││
│  │   │  ─────●─────    │   ││
│  │   │  🟢 ONLINE      │   ││
│  │   └─────────────────┘   ││
│  │                         ││
│  │  Status: You're offline ││
│  │  Go online to receive   ││
│  │  ride requests.         ││
│  │                         ││
│  └─────────────────────────┘│
│                             │
│  🏠 Home 💰 Earn 📋 Hist 👤│
└─────────────────────────────┘
```

**Key Elements:**
- Full-screen map centered on driver's current location
- Large Online/Offline toggle switch
- Status text: "You're offline" / "You're online — waiting for rides"
- When online: GPS location updates sent to server periodically
- Hamburger menu (☰) → Profile, Vehicle Management, Settings
- Bottom tab navigation: Home, Earnings, History, Profile

**Behavior:**
- Toggle → calls `POST /api/v1/drivers/status/` with `is_online: true/false`
- When online: poll `GET /api/v1/rides/requests/` for incoming ride requests
- When a ride request arrives → show Ride Request Popup

**APIs:**
- `POST /api/v1/drivers/status/`
- `POST /api/v1/locations/update/` (periodic GPS updates)
- `GET /api/v1/rides/requests/`

---

## Driver Ride Request Popup

**Purpose:** Modal overlay showing incoming ride request details.

```
┌─────────────────────────────┐
│                             │
│ ┌─────────────────────────┐ │
│ │  (map background dimmed)│ │
│ └─────────────────────────┘ │
│                             │
│ ╔═════════════════════════╗ │
│ ║   NEW RIDE REQUEST!     ║ │
│ ║                         ║ │
│ ║  Pickup:                ║ │
│ ║  📍 123 Main Street     ║ │
│ ║                         ║ │
│ ║  Destination:           ║ │
│ ║  📍 456 Park Avenue     ║ │
│ ║                         ║ │
│ ║  Distance: 10.5 km      ║ │
│ ║  Est. Fare: ₹250        ║ │
│ ║                         ║ │
│ ║   ⏱ 00:25 remaining     ║ │
│ ║                         ║ │
│ ║  ┌────────┐ ┌────────┐  ║ │
│ ║  │ REJECT │ │ ACCEPT │  ║ │
│ ║  │  ✕     │ │  ✓     │  ║ │
│ ║  └────────┘ └────────┘  ║ │
│ ╚═════════════════════════╝ │
│                             │
└─────────────────────────────┘
```

**Key Elements:**
- Modal overlay on top of map
- Pickup and destination addresses
- Distance and estimated fare
- Countdown timer (30 seconds to respond)
- "Accept" button (green) → `POST /api/v1/rides/{ride_id}/accept/`
- "Reject" button (red) → `POST /api/v1/rides/{ride_id}/reject/`
- If timer expires → auto-reject

**APIs:**
- `POST /api/v1/rides/{ride_id}/accept/`
- `POST /api/v1/rides/{ride_id}/reject/`

---

## Driver Active Ride Screen

**Purpose:** Manage the current ride with status progression buttons.

```
┌─────────────────────────────┐
│                             │
│ ┌─────────────────────────┐ │
│ │       MAP VIEW          │ │
│ │                         │ │
│ │   🚗 ─ ─ ─ ► 📍        │ │
│ │  (you)     (pickup)     │ │
│ │                         │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │  Passenger: John Doe    │ │
│ │  📱 9876543210          │ │
│ │                         │ │
│ │  Pickup:                │ │
│ │  📍 123 Main Street     │ │
│ │                         │ │
│ │  Destination:           │ │
│ │  📍 456 Park Avenue     │ │
│ │                         │ │
│ │  Fare: ₹250             │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │  Current: ACCEPTED      │ │
│ │                         │ │
│ │  ┌───────────────────┐  │ │
│ │  │  I'M ARRIVING  →  │  │ │
│ │  └───────────────────┘  │ │
│ └─────────────────────────┘ │
│                             │
└─────────────────────────────┘
```

**Status Progression Buttons:**
The button changes based on the current ride status:

```text
Status: ACCEPTED
  Button: [ I'M ARRIVING ]  → sets DRIVER_ARRIVING

Status: DRIVER_ARRIVING
  Button: [ I'VE ARRIVED ]  → sets ARRIVED

Status: ARRIVED
  Button: [ START RIDE ]    → sets IN_PROGRESS

Status: IN_PROGRESS
  Button: [ COMPLETE RIDE ] → sets COMPLETED
```

**Key Elements:**
- Map with navigation to pickup / destination
- Passenger info card (name, phone — tappable to call)
- Pickup and destination addresses
- Fare display
- Single action button that changes with ride status
- GPS location updates sent continuously during active ride

**APIs:**
- `POST /api/v1/rides/{ride_id}/status/` — update ride status
- `POST /api/v1/locations/update/` — periodic location updates

---

## Driver Earnings Screen

**Purpose:** View earnings summary.

```
┌─────────────────────────────┐
│  ←  Earnings                │
│                             │
│  ┌─────────────────────────┐│
│  │    TODAY'S EARNINGS     ││
│  │                         ││
│  │       ₹ 750             ││
│  │                         ││
│  │    3 rides completed    ││
│  └─────────────────────────┘│
│                             │
│  ┌────────────┬────────────┐│
│  │ Total      │ Total      ││
│  │ Earnings   │ Rides      ││
│  │            │            ││
│  │  ₹ 5,000   │    25      ││
│  └────────────┴────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │  Recent Rides           ││
│  │                         ││
│  │  Oct 30 │ ₹250 │ 10.5km││
│  │  Oct 30 │ ₹180 │ 7.2km ││
│  │  Oct 30 │ ₹320 │ 14km  ││
│  │                         ││
│  │  View All History →     ││
│  └─────────────────────────┘│
│                             │
│  🏠 Home 💰 Earn 📋 Hist 👤│
└─────────────────────────────┘
```

**Key Elements:**
- Today's earnings card (large highlighted amount, ride count)
- Summary cards: Total earnings, Total rides
- Recent rides list (last 3-5 rides with date, fare, distance)
- "View All History" link → navigates to Ride History

**API:** `GET /api/v1/drivers/earnings/`

---

## Driver Ride History Screen

**Purpose:** View all completed rides.

```
┌─────────────────────────────┐
│  ←  Ride History            │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📅 Oct 30, 2026  2:30PM│ │
│ │ 📍 123 Main St          │ │
│ │ 📍 456 Park Ave         │ │
│ │ ₹250  │  COMPLETED  ✓   │ │
│ │ Passenger: John D.      │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📅 Oct 28, 2026  9:15AM│ │
│ │ 📍 789 Oak Road         │ │
│ │ 📍 321 Elm Street       │ │
│ │ ₹180  │  COMPLETED  ✓   │ │
│ │ Passenger: Priya R.     │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📅 Oct 25, 2026  6:00PM│ │
│ │ 📍 555 River Rd         │ │
│ │ 📍 222 Hill St          │ │
│ │ ₹320  │  COMPLETED  ✓   │ │
│ │ Passenger: Amit K.      │ │
│ └─────────────────────────┘ │
│                             │
│       Load More ↓           │
│                             │
│  🏠 Home 💰 Earn 📋 Hist 👤│
└─────────────────────────────┘
```

**Key Elements:**
- Scrollable list of completed rides
- Each card: date, time, pickup, destination, fare, status, passenger name
- Pagination / infinite scroll
- Tap a card → view ride detail

**API:** `GET /api/v1/rides/my-rides/`

---

## Driver Profile Screen

**Purpose:** View and manage driver profile.

```
┌─────────────────────────────┐
│  ←  Profile                 │
│                             │
│         ┌─────┐             │
│         │ 👤  │             │
│         └─────┘             │
│       Driver Name           │
│    ⭐ 4.8 (25 rides)        │
│                             │
│  ┌───────────────────────┐  │
│  │ 📱 Phone              │  │
│  │    9876543210          │  │
│  ├───────────────────────┤  │
│  │ 📧 Email              │  │
│  │    driver@example.com  │  │
│  ├───────────────────────┤  │
│  │ 🪪 License            │  │
│  │    DL123456789         │  │
│  ├───────────────────────┤  │
│  │ ✅ Status              │  │
│  │    Approved            │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │   EDIT PROFILE        │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │   MANAGE VEHICLES     │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │      LOGOUT           │  │
│  └───────────────────────┘  │
│                             │
│  🏠 Home 💰 Earn 📋 Hist 👤│
└─────────────────────────────┘
```

**Key Elements:**
- Avatar, name, rating (stars), total rides
- Profile info: phone, email, license number, approval status
- "Edit Profile" → edit name, phone (similar to passenger edit)
- "Manage Vehicles" → navigate to Vehicle Management Screen
- "Logout" button

**APIs:**
- `GET /api/v1/drivers/me/`
- `GET /api/v1/users/me/`

---

## Driver Vehicle Management Screen

**Purpose:** Add, view, edit, and delete vehicles.

```
┌─────────────────────────────┐
│  ←  My Vehicles             │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🚗 Swift Dzire          │ │
│ │ OD-07-AB-1234 │ White   │ │
│ │ Type: CAR               │ │
│ │                 ✏️  🗑️  │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🏍️ Honda Activa         │ │
│ │ OD-07-CD-5678 │ Black   │ │
│ │ Type: BIKE              │ │
│ │                 ✏️  🗑️  │ │
│ └─────────────────────────┘ │
│                             │
│                             │
│  ┌───────────────────────┐  │
│  │   + ADD VEHICLE       │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘

  ─── Add Vehicle Form ───

┌─────────────────────────────┐
│  ←  Add Vehicle             │
│                             │
│  ┌───────────────────────┐  │
│  │ Vehicle Number        │  │
│  │ OD-07-AB-1234         │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Vehicle Model         │  │
│  │ Swift Dzire           │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Vehicle Type     ▼    │  │
│  │ CAR / BIKE / AUTO     │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ Vehicle Color         │  │
│  │ White                 │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │    SAVE VEHICLE       │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

**Key Elements:**
- List of driver's vehicles
- Each vehicle card: model, number, color, type, edit (✏️) and delete (🗑️) icons
- "+ Add Vehicle" button → opens add vehicle form
- Add/Edit form: vehicle number, model, type (dropdown), color
- Delete confirmation dialog

**APIs:**
- `GET /api/v1/vehicles/me/`
- `POST /api/v1/vehicles/`
- `PUT /api/v1/vehicles/{vehicle_id}/`
- `DELETE /api/v1/vehicles/{vehicle_id}/`

---

# Admin Dashboard

## Admin Navigation Flow

```text
┌──────────┐
│  Login   │
└────┬─────┘
     │ (JWT auth)
     ▼
┌──────────────────────────────────────────┐
│            Sidebar Navigation            │
│                                          │
│  ┌──────────┐                            │
│  │Dashboard │──► Stats + Charts          │
│  ├──────────┤                            │
│  │Users     │──► Users List              │
│  ├──────────┤                            │
│  │Drivers   │──► Drivers List            │
│  │          │    └──► Driver Detail       │
│  │          │        (Approve / Suspend)  │
│  ├──────────┤                            │
│  │Rides     │──► Rides List              │
│  │          │    └──► Ride Detail         │
│  ├──────────┤                            │
│  │Logout    │──► Login                   │
│  └──────────┘                            │
└──────────────────────────────────────────┘
```

---

## Admin Login Page

**Purpose:** Authenticate admin users.

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│                                                      │
│              d e s t i n y  Admin                     │
│                                                      │
│          ┌──────────────────────────┐                 │
│          │                          │                 │
│          │  Email                   │                 │
│          │  ┌────────────────────┐  │                 │
│          │  │ admin@destiny.com  │  │                 │
│          │  └────────────────────┘  │                 │
│          │                          │                 │
│          │  Password                │                 │
│          │  ┌────────────────────┐  │                 │
│          │  │ ••••••••           │  │                 │
│          │  └────────────────────┘  │                 │
│          │                          │                 │
│          │  ┌────────────────────┐  │                 │
│          │  │      LOGIN         │  │                 │
│          │  └────────────────────┘  │                 │
│          │                          │                 │
│          └──────────────────────────┘                 │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Key Elements:**
- Centered login card on full-page background
- Email and Password fields
- "Login" button → `POST /api/v1/auth/login/` (validates ADMIN role)
- JWT tokens stored in localStorage
- Error message for invalid credentials
- Redirect to Dashboard on success

**API:** `POST /api/v1/auth/login/`

---

## Admin Dashboard Page

**Purpose:** Platform overview with statistics and charts.

```
┌──────────────────────────────────────────────────────┐
│  destiny Admin                        👤 Admin  [↪]  │
├────────────┬─────────────────────────────────────────┤
│            │                                         │
│  📊 Dash   │  Dashboard                              │
│            │                                         │
│  👥 Users  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│            │  │Total │ │Total │ │Active│ │Active│   │
│  🚗 Drivers│  │Users │ │Drvrs │ │Drvrs │ │Rides │   │
│            │  │      │ │      │ │      │ │      │   │
│  🛣️ Rides  │  │ 1000 │ │  250 │ │   75 │ │   20 │   │
│            │  └──────┘ └──────┘ └──────┘ └──────┘   │
│  ↪ Logout  │                                         │
│            │  ┌─────────────────────────────────┐    │
│            │  │     RIDES OVER TIME (Chart)     │    │
│            │  │                                 │    │
│            │  │  ▐                              │    │
│            │  │  ▐  ▐                           │    │
│            │  │  ▐  ▐  ▐     ▐                  │    │
│            │  │  ▐  ▐  ▐  ▐  ▐  ▐               │    │
│            │  │  Mon Tue Wed Thu Fri Sat         │    │
│            │  └─────────────────────────────────┘    │
│            │                                         │
│            │  ┌─────────────────────────────────┐    │
│            │  │   RIDE STATUS BREAKDOWN (Pie)   │    │
│            │  │                                 │    │
│            │  │   Completed: 85%                │    │
│            │  │   Cancelled: 10%                │    │
│            │  │   Active:     5%                │    │
│            │  └─────────────────────────────────┘    │
│            │                                         │
├────────────┴─────────────────────────────────────────┤
│  © destiny admin dashboard                           │
└──────────────────────────────────────────────────────┘
```

**Key Elements:**
- Left sidebar with navigation links: Dashboard, Users, Drivers, Rides, Logout
- Stats cards row: Total Users, Total Drivers, Active Drivers, Active Rides
- Line/bar chart: Rides over time (using recharts or chart.js)
- Pie chart: Ride status breakdown
- Header with admin name and logout button

**API:** `GET /api/v1/admin/dashboard/`

---

## Admin Users List Page

**Purpose:** View and search all passengers.

```
┌──────────────────────────────────────────────────────┐
│  destiny Admin                        👤 Admin  [↪]  │
├────────────┬─────────────────────────────────────────┤
│            │                                         │
│  📊 Dash   │  Users (Passengers)                     │
│            │                                         │
│  👥 Users  │  ┌─────────────────────┐  Total: 1000   │
│            │  │ 🔍 Search users...  │                │
│  🚗 Drivers│  └─────────────────────┘                │
│            │                                         │
│  🛣️ Rides  │  ┌─────┬──────────┬──────────┬────────┐ │
│            │  │ #   │ Name     │ Email    │ Phone  │ │
│  ↪ Logout  │  ├─────┼──────────┼──────────┼────────┤ │
│            │  │ 1   │ John D.  │ john@... │ 98765  │ │
│            │  │ 2   │ Priya R. │ priya@.. │ 87654  │ │
│            │  │ 3   │ Amit K.  │ amit@... │ 76543  │ │
│            │  │ 4   │ Sara M.  │ sara@... │ 65432  │ │
│            │  │ 5   │ Ravi P.  │ ravi@... │ 54321  │ │
│            │  └─────┴──────────┴──────────┴────────┘ │
│            │                                         │
│            │  ◄ 1  2  3  4  5 ►                      │
│            │                                         │
├────────────┴─────────────────────────────────────────┤
│  © destiny admin dashboard                           │
└──────────────────────────────────────────────────────┘
```

**Key Elements:**
- Page title with total count
- Search bar — filter by name, email, or phone
- Sortable data table with columns: #, Name, Email, Phone, Joined Date
- Pagination controls
- Click a row to view user details (optional modal or inline)

**API:** `GET /api/v1/admin/users/`

---

## Admin Drivers List Page

**Purpose:** View all drivers with approval/suspension controls.

```
┌──────────────────────────────────────────────────────┐
│  destiny Admin                        👤 Admin  [↪]  │
├────────────┬─────────────────────────────────────────┤
│            │                                         │
│  📊 Dash   │  Drivers                                │
│            │                                         │
│  👥 Users  │  ┌─────────────────────┐  Total: 250    │
│            │  │ 🔍 Search drivers.. │                │
│  🚗 Drivers│  └─────────────────────┘                │
│            │                                         │
│  🛣️ Rides  │  Filter: [All ▼] [Approved ▼]          │
│            │                                         │
│  ↪ Logout  │  ┌───┬────────┬──────┬──────┬────────┐  │
│            │  │ # │ Name   │ ⭐   │Status│ Action │  │
│            │  ├───┼────────┼──────┼──────┼────────┤  │
│            │  │ 1 │ Ravi K │ 4.8  │ ✅   │ View → │  │
│            │  │ 2 │ Anil S │ 4.5  │ ✅   │ View → │  │
│            │  │ 3 │ New D. │  —   │ ⏳   │ View → │  │
│            │  │ 4 │ Susp.D │ 3.2  │ 🚫   │ View → │  │
│            │  └───┴────────┴──────┴──────┴────────┘  │
│            │                                         │
│            │  Status Legend:                          │
│            │  ✅ Approved  ⏳ Pending  🚫 Suspended  │
│            │                                         │
│            │  ◄ 1  2  3 ►                            │
│            │                                         │
├────────────┴─────────────────────────────────────────┤
│  © destiny admin dashboard                           │
└──────────────────────────────────────────────────────┘
```

**Key Elements:**
- Search bar for drivers
- Filter dropdown: All / Pending / Approved / Suspended
- Table columns: #, Name, Rating, Status, Action
- Status badges with icons
- "View →" link → navigates to Driver Detail Page
- Pagination

**API:** `GET /api/v1/admin/drivers/`

---

## Admin Driver Detail Page

**Purpose:** View driver details, approve or suspend.

```
┌──────────────────────────────────────────────────────┐
│  destiny Admin                        👤 Admin  [↪]  │
├────────────┬─────────────────────────────────────────┤
│            │                                         │
│  📊 Dash   │  ← Back to Drivers                      │
│            │                                         │
│  👥 Users  │  Driver Details                          │
│            │                                         │
│  🚗 Drivers│  ┌─────────────────────────────────┐    │
│            │  │  👤 Ravi Kumar                   │    │
│  🛣️ Rides  │  │                                 │    │
│            │  │  Email: ravi@example.com         │    │
│  ↪ Logout  │  │  Phone: 9876543210              │    │
│            │  │  License: DL123456789            │    │
│            │  │  Rating: ⭐ 4.8                  │    │
│            │  │  Status: ✅ Approved              │    │
│            │  │  Online: 🟢 Yes                  │    │
│            │  │  Joined: Oct 15, 2026            │    │
│            │  └─────────────────────────────────┘    │
│            │                                         │
│            │  Vehicle(s)                              │
│            │  ┌─────────────────────────────────┐    │
│            │  │ 🚗 Swift Dzire │ OD-07-AB-1234  │    │
│            │  │    CAR  │  White                 │    │
│            │  └─────────────────────────────────┘    │
│            │                                         │
│            │  Actions                                 │
│            │  ┌──────────────┐ ┌────────────────┐    │
│            │  │  ✅ APPROVE   │ │  🚫 SUSPEND    │    │
│            │  └──────────────┘ └────────────────┘    │
│            │                                         │
│            │  Ride History (last 5)                   │
│            │  ┌─────┬──────────┬───────┬──────┐      │
│            │  │Date │ Route    │ Fare  │Status│      │
│            │  ├─────┼──────────┼───────┼──────┤      │
│            │  │10/30│ A → B    │ ₹250  │  ✓   │      │
│            │  │10/28│ C → D    │ ₹180  │  ✓   │      │
│            │  └─────┴──────────┴───────┴──────┘      │
│            │                                         │
├────────────┴─────────────────────────────────────────┤
│  © destiny admin dashboard                           │
└──────────────────────────────────────────────────────┘
```

**Key Elements:**
- Back link to Drivers List
- Driver info card: name, email, phone, license, rating, status, online status, join date
- Vehicle(s) section showing registered vehicles
- Action buttons:
  - "Approve" (green) → `POST /api/v1/admin/drivers/{driver_id}/approve/`
  - "Suspend" (red) → `POST /api/v1/admin/drivers/{driver_id}/suspend/`
  - Buttons are context-aware (hide Approve if already approved, etc.)
- Recent ride history table
- Confirmation dialog before approve/suspend actions

**APIs:**
- `GET /api/v1/admin/drivers/` (with driver ID filter)
- `POST /api/v1/admin/drivers/{driver_id}/approve/`
- `POST /api/v1/admin/drivers/{driver_id}/suspend/`

---

## Admin Rides List Page

**Purpose:** View and filter all rides across the platform.

```
┌──────────────────────────────────────────────────────┐
│  destiny Admin                        👤 Admin  [↪]  │
├────────────┬─────────────────────────────────────────┤
│            │                                         │
│  📊 Dash   │  Rides                                  │
│            │                                         │
│  👥 Users  │  ┌─────────────────────┐  Total: 5000   │
│            │  │ 🔍 Search rides...  │                │
│  🚗 Drivers│  └─────────────────────┘                │
│            │                                         │
│  🛣️ Rides  │  Status: [All ▼]  Date: [All Time ▼]   │
│            │                                         │
│  ↪ Logout  │  ┌───┬────────┬────────┬──────┬──────┐  │
│            │  │ # │Passengr│ Driver │ Fare │Status│  │
│            │  ├───┼────────┼────────┼──────┼──────┤  │
│            │  │ 1 │ John D │ Ravi K │ ₹250 │  ✓   │  │
│            │  │ 2 │ Priya R│ Anil S │ ₹180 │  ✓   │  │
│            │  │ 3 │ Amit K │   —    │  ₹0  │  ✕   │  │
│            │  │ 4 │ Sara M │ Ravi K │ ₹320 │  🔄  │  │
│            │  │ 5 │ Ravi P │   —    │ ₹150 │  ⏳   │  │
│            │  └───┴────────┴────────┴──────┴──────┘  │
│            │                                         │
│            │  Status: ✓ Completed  ✕ Cancelled       │
│            │          🔄 In Progress  ⏳ Searching    │
│            │                                         │
│            │  ◄ 1  2  3  ... 50 ►                    │
│            │                                         │
├────────────┴─────────────────────────────────────────┤
│  © destiny admin dashboard                           │
└──────────────────────────────────────────────────────┘
```

**Key Elements:**
- Search bar (by passenger name, driver name, ride ID)
- Filter dropdowns: Status (All, Completed, Cancelled, In Progress, Searching), Date range
- Table columns: #, Passenger, Driver, Fare, Status, Date
- Click a row → navigate to Ride Detail Page
- Pagination with page numbers

**API:** `GET /api/v1/admin/rides/`

---

## Admin Ride Detail Page

**Purpose:** View full details of a specific ride.

```
┌──────────────────────────────────────────────────────┐
│  destiny Admin                        👤 Admin  [↪]  │
├────────────┬─────────────────────────────────────────┤
│            │                                         │
│  📊 Dash   │  ← Back to Rides                        │
│            │                                         │
│  👥 Users  │  Ride #abc123                            │
│            │                                         │
│  🚗 Drivers│  ┌─────────────────────────────────┐    │
│            │  │  Status: ✅ COMPLETED            │    │
│  🛣️ Rides  │  │                                 │    │
│            │  │  Requested: Oct 30, 2:00 PM      │    │
│  ↪ Logout  │  │  Completed: Oct 30, 2:35 PM      │    │
│            │  └─────────────────────────────────┘    │
│            │                                         │
│            │  ┌──────────────┬──────────────────┐    │
│            │  │ Passenger    │ Driver           │    │
│            │  │              │                  │    │
│            │  │ 👤 John Doe  │ 👤 Ravi Kumar    │    │
│            │  │ 📧 john@...  │ 📧 ravi@...      │    │
│            │  │ 📱 98765...  │ 📱 87654...      │    │
│            │  │              │ ⭐ 4.8            │    │
│            │  └──────────────┴──────────────────┘    │
│            │                                         │
│            │  Route                                   │
│            │  ┌─────────────────────────────────┐    │
│            │  │ Pickup: 📍 123 Main Street      │    │
│            │  │ Dest:   📍 456 Park Avenue      │    │
│            │  │ Distance: 10.5 km               │    │
│            │  └─────────────────────────────────┘    │
│            │                                         │
│            │  Fare                                    │
│            │  ┌─────────────────────────────────┐    │
│            │  │ Estimated: ₹250                 │    │
│            │  │ Final:     ₹250                 │    │
│            │  │ Payment:   CASH                 │    │
│            │  └─────────────────────────────────┘    │
│            │                                         │
│            │  Rating                                  │
│            │  ┌─────────────────────────────────┐    │
│            │  │ ⭐⭐⭐⭐⭐ 5/5                    │    │
│            │  │ "Great ride!"                   │    │
│            │  └─────────────────────────────────┘    │
│            │                                         │
├────────────┴─────────────────────────────────────────┤
│  © destiny admin dashboard                           │
└──────────────────────────────────────────────────────┘
```

**Key Elements:**
- Back link to Rides List
- Ride status with timestamps (requested, completed)
- Two-column layout: Passenger info and Driver info
- Route section: pickup address, destination address, distance
- Fare section: estimated fare, final fare, payment method
- Rating section: stars, review text (if submitted)
- Status timeline showing all state transitions

**API:** `GET /api/v1/rides/{ride_id}/` (admin access)

---

*Document Version: 1.0*
*Project: destiny Ride-Booking Platform*

