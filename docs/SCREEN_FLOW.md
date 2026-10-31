# Screen Flow — All Applications

> This document lists every screen in the Passenger App, Driver App, and Admin Dashboard.

---

## 1. Passenger App — Screen List

### Auth Screens
```
SplashScreen
    ↓
WelcomeScreen
    ↓
├── LoginScreen
│       ↓
│   HomeScreen
│
└── RegisterScreen
        ↓
    LoginScreen
```

| Screen | Description |
|---|---|
| `SplashScreen` | App logo shown briefly on launch |
| `WelcomeScreen` | Two buttons — Login and Register |
| `RegisterScreen` | Form: full_name, email, phone, password |
| `LoginScreen` | Form: email, password → returns JWT tokens |

---

### Main Screens (Bottom Tab Navigation)

```
HomeScreen (Tab 1)
RideHistoryScreen (Tab 2)
ProfileScreen (Tab 3)
```

| Screen | Description |
|---|---|
| `HomeScreen` | Map view + pickup/destination input + Book Ride button |
| `RideHistoryScreen` | List of all past rides |
| `ProfileScreen` | User info + Edit Profile + Logout |

---

### Ride Flow Screens

```
HomeScreen
    ↓ (Book Ride)
FareEstimateScreen
    ↓ (Confirm Booking)
SearchingDriverScreen
    ↓ (Driver Found)
RideTrackingScreen
    ↓ (Ride Completed)
RatingScreen
    ↓
HomeScreen
```

| Screen | Description |
|---|---|
| `FareEstimateScreen` | Shows distance, estimated time, and fare before confirming |
| `SearchingDriverScreen` | Loading animation while system finds a driver |
| `RideTrackingScreen` | Shows driver info, vehicle details, live ride status updates |
| `RatingScreen` | 1–5 star rating + optional review text after ride completes |

---

### Other Screens

| Screen | Description |
|---|---|
| `EditProfileScreen` | Edit full_name and phone |
| `RideDetailScreen` | Full details of a past ride |

---

### Passenger App — Full Screen Map

```
SplashScreen
└── WelcomeScreen
    ├── RegisterScreen → LoginScreen
    └── LoginScreen
            ↓
        [Bottom Tabs]
        ├── HomeScreen
        │   ├── FareEstimateScreen
        │   │   └── SearchingDriverScreen
        │   │       └── RideTrackingScreen
        │   │           └── RatingScreen
        │   └── RideDetailScreen
        │
        ├── RideHistoryScreen
        │   └── RideDetailScreen
        │
        └── ProfileScreen
            └── EditProfileScreen
```

---

## 2. Driver App — Screen List

### Auth Screens

```
SplashScreen
    ↓
WelcomeScreen
    ↓
├── LoginScreen
│       ↓
│   (if approved)  HomeScreen
│   (if pending)   PendingApprovalScreen
│
└── RegisterScreen
        ↓
    PendingApprovalScreen
```

| Screen | Description |
|---|---|
| `SplashScreen` | App logo on launch |
| `WelcomeScreen` | Login and Register buttons |
| `RegisterScreen` | Form: full_name, email, phone, password, license_number |
| `LoginScreen` | Email + password login |
| `PendingApprovalScreen` | Shown when driver account is not yet approved by admin |

---

### Main Screens (Bottom Tab Navigation)

```
HomeScreen (Tab 1)
EarningsScreen (Tab 2)
RideHistoryScreen (Tab 3)
ProfileScreen (Tab 4)
```

| Screen | Description |
|---|---|
| `HomeScreen` | Online/Offline toggle + incoming ride requests |
| `EarningsScreen` | Total earnings, today's earnings, total rides |
| `RideHistoryScreen` | List of all completed rides |
| `ProfileScreen` | Driver info + vehicle management + logout |

---

### Ride Flow Screens

```
HomeScreen (Online)
    ↓ (Ride Request arrives)
RideRequestScreen
    ↓ (Accept)
ActiveRideScreen
    ↓ (Complete Ride)
RideCompletedScreen
    ↓
HomeScreen
```

| Screen | Description |
|---|---|
| `RideRequestScreen` | Shows passenger pickup, destination, fare — Accept / Reject buttons + timer |
| `ActiveRideScreen` | Map + passenger info + status update buttons (Arriving → Arrived → Start → Complete) |
| `RideCompletedScreen` | Summary of completed ride — fare, distance |

---

### Profile & Vehicle Screens

| Screen | Description |
|---|---|
| `EditProfileScreen` | Edit full_name, phone |
| `VehicleListScreen` | List of driver's vehicles |
| `AddVehicleScreen` | Form: vehicle_number, model, type, color |
| `EditVehicleScreen` | Edit existing vehicle details |

---

### Driver App — Full Screen Map

```
SplashScreen
└── WelcomeScreen
    ├── RegisterScreen → PendingApprovalScreen
    └── LoginScreen
            ↓
        (if not approved) PendingApprovalScreen
        (if approved) ↓
        [Bottom Tabs]
        ├── HomeScreen
        │   └── RideRequestScreen
        │       └── ActiveRideScreen
        │           └── RideCompletedScreen
        │
        ├── EarningsScreen
        │
        ├── RideHistoryScreen
        │   └── RideDetailScreen
        │
        └── ProfileScreen
            ├── EditProfileScreen
            ├── VehicleListScreen
            │   ├── AddVehicleScreen
            │   └── EditVehicleScreen
```

---

## 3. Admin Dashboard — Page List

### Auth Pages

| Page | Description |
|---|---|
| `LoginPage` | Admin email + password login |

---

### Main Pages (Sidebar Navigation)

```
Sidebar
├── Dashboard
├── Users (Passengers)
├── Drivers
├── Rides
└── Settings (optional)
```

---

### Page Details

| Page | Description |
|---|---|
| `DashboardPage` | Stats cards (total passengers, drivers, rides, active rides) + charts |
| `UsersPage` | Table of all passengers — search, filter, view details |
| `UserDetailPage` | Single passenger info — name, email, phone, ride count |
| `DriversPage` | Table of all drivers — approval status, online status, rating |
| `DriverDetailPage` | Driver info — license, vehicle, rating, ride history |
| `RidesPage` | Table of all rides — filter by status, date |
| `RideDetailPage` | Full ride details — passenger, driver, route, fare, status timeline |

---

### Admin Dashboard — Full Page Map

```
LoginPage
    ↓
[Sidebar Layout]
├── DashboardPage
│
├── UsersPage
│   └── UserDetailPage
│
├── DriversPage
│   └── DriverDetailPage
│       ├── Approve Driver
│       └── Suspend Driver
│
└── RidesPage
    └── RideDetailPage
```

---

## 4. Screen Summary

### Passenger App
| # | Screen |
|---|---|
| 1 | SplashScreen |
| 2 | WelcomeScreen |
| 3 | RegisterScreen |
| 4 | LoginScreen |
| 5 | HomeScreen |
| 6 | FareEstimateScreen |
| 7 | SearchingDriverScreen |
| 8 | RideTrackingScreen |
| 9 | RatingScreen |
| 10 | RideHistoryScreen |
| 11 | RideDetailScreen |
| 12 | ProfileScreen |
| 13 | EditProfileScreen |

### Driver App
| # | Screen |
|---|---|
| 1 | SplashScreen |
| 2 | WelcomeScreen |
| 3 | RegisterScreen |
| 4 | LoginScreen |
| 5 | PendingApprovalScreen |
| 6 | HomeScreen |
| 7 | RideRequestScreen |
| 8 | ActiveRideScreen |
| 9 | RideCompletedScreen |
| 10 | EarningsScreen |
| 11 | RideHistoryScreen |
| 12 | RideDetailScreen |
| 13 | ProfileScreen |
| 14 | EditProfileScreen |
| 15 | VehicleListScreen |
| 16 | AddVehicleScreen |
| 17 | EditVehicleScreen |

### Admin Dashboard
| # | Page |
|---|---|
| 1 | LoginPage |
| 2 | DashboardPage |
| 3 | UsersPage |
| 4 | UserDetailPage |
| 5 | DriversPage |
| 6 | DriverDetailPage |
| 7 | RidesPage |
| 8 | RideDetailPage |

---

*Document Version: 1.0*
*Project: Destiny Ride-Booking Platform*

