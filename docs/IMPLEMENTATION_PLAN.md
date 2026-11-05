# Destiny — Implementation Plan

## Project Overview

**Destiny** is a ride-booking platform (Uber/Ola inspired) consisting of:
- Django REST API Backend
- React + Vite Admin Dashboard
- React Native + Expo Passenger App
- React Native + Expo Driver App
- Supabase PostgreSQL Database

---

## Project Folder Structure

```
destiny/
│
├── backend/                      ← Django REST API
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env
│   ├── destiny/                  ← Django project settings
│   ├── authentication/
│   ├── users/
│   ├── drivers/
│   ├── vehicles/
│   ├── rides/
│   ├── locations/
│   ├── payments/
│   ├── ratings/
│   └── notifications/
│
├── admin-dashboard/              ← React + Vite Web App
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── passenger-app/                ← React Native + Expo
│   ├── app/
│   ├── package.json
│   └── app.json
│
├── driver-app/                   ← React Native + Expo
│   ├── app/
│   ├── package.json
│   └── app.json
│
├── docs/                         ← Project Documentation
└── README.md
```

---

## Development Order

```
Phase 1: Backend API (Django)
        ↓
Phase 2: Admin Dashboard (React + Vite)
        ↓
Phase 3: Passenger App (React Native + Expo)
        ↓
Phase 4: Driver App (React Native + Expo)
```

---

## Phase 1 — Backend API (Django)

> Duration: 2–3 Weeks

### Step 1.1 — Project Setup

- [x] Create `backend/` folder inside `destiny/`
- [x] Create Python virtual environment
- [x] Install dependencies:
  - `django`
  - `djangorestframework`
  - `djangorestframework-simplejwt`
  - `django-cors-headers`
  - `psycopg2-binary`
  - `python-decouple`
- [x] Create `requirements.txt`
- [x] Initialize Django project: `django-admin startproject destiny .`
- [x] Configure `settings.py`:
  - Database → Supabase PostgreSQL
  - Installed apps
  - CORS settings
  - JWT settings
  - REST Framework settings
- [x] Create `.env` file for secrets (DB credentials, secret key, JWT config)
- [x] Test database connection

### Step 1.2 — Create Django Apps

- [x] `python manage.py startapp authentication`
- [x] `python manage.py startapp users`
- [x] `python manage.py startapp drivers`
- [x] `python manage.py startapp vehicles`
- [x] `python manage.py startapp rides`
- [x] `python manage.py startapp locations`
- [x] `python manage.py startapp payments`
- [x] `python manage.py startapp ratings`
- [x] `python manage.py startapp notifications`

### Step 1.3 — Database Models

- [x] **Users Model** — id, full_name, email, phone, password, role (PASSENGER / DRIVER / ADMIN)
- [x] **Drivers Model** — user_id, license_number, is_approved, is_online, rating
- [x] **Vehicles Model** — driver_id, vehicle_number, vehicle_model, vehicle_type, vehicle_color
- [x] **Rides Model** — passenger_id, driver_id, pickup/destination address & coordinates, estimated_fare, final_fare, status, timestamps
- [x] **Driver Locations Model** — driver_id, latitude, longitude, updated_at
- [x] **Ratings Model** — ride_id, passenger_id, driver_id, rating (1–5), review
- [x] **Payments Model** — ride_id, amount, payment_method, payment_status
- [x] Run migrations: `python manage.py makemigrations && python manage.py migrate`

### Step 1.4 — Authentication APIs

- [x] `POST /api/v1/auth/register/` — Register Passenger
- [x] `POST /api/v1/auth/register/driver/` — Register Driver
- [x] `POST /api/v1/auth/login/` — Login (returns JWT access + refresh tokens)
- [x] `POST /api/v1/auth/token/refresh/` — Refresh JWT token
- [x] `POST /api/v1/auth/logout/` — Logout
- [x] Implement JWT authentication using `djangorestframework-simplejwt`
- [x] Implement password hashing
- [x] Implement role-based access control (PASSENGER / DRIVER / ADMIN)

### Step 1.5 — User APIs

- [x] `GET /api/v1/users/me/` — Get current user profile
- [x] `PUT /api/v1/users/me/` — Update user profile

### Step 1.6 — Driver APIs

- [x] `GET /api/v1/drivers/me/` — Get driver profile
- [x] `PUT /api/v1/drivers/me/` — Update driver profile
- [x] `POST /api/v1/drivers/status/` — Toggle online/offline
- [x] `GET /api/v1/drivers/nearby/` — Get nearby available drivers
- [x] `GET /api/v1/drivers/{driver_id}/` — Get driver details
- [x] `GET /api/v1/drivers/earnings/` — Get driver earnings summary
- [x] `GET /api/v1/drivers/{driver_id}/ratings/` — Get driver ratings

### Step 1.7 — Vehicle APIs

- [x] `POST /api/v1/vehicles/` — Add vehicle
- [x] `GET /api/v1/vehicles/me/` — Get my vehicles
- [x] `PUT /api/v1/vehicles/{vehicle_id}/` — Update vehicle
- [x] `DELETE /api/v1/vehicles/{vehicle_id}/` — Delete vehicle

### Step 1.8 — Location APIs

- [x] `POST /api/v1/locations/update/` — Update driver GPS location
- [x] `GET /api/v1/locations/driver/{driver_id}/` — Get driver location

### Step 1.9 — Ride APIs

- [x] `POST /api/v1/rides/` — Create ride request
- [x] `GET /api/v1/rides/{ride_id}/` — Get ride details
- [x] `GET /api/v1/rides/my-rides/` — Passenger ride history
- [x] `GET /api/v1/rides/requests/` — Driver pending ride requests
- [x] `POST /api/v1/rides/{ride_id}/accept/` — Driver accepts ride
- [x] `POST /api/v1/rides/{ride_id}/reject/` — Driver rejects ride
- [x] `POST /api/v1/rides/{ride_id}/status/` — Update ride status
- [x] `POST /api/v1/rides/{ride_id}/cancel/` — Cancel ride
- [x] Implement ride status flow:
  ```
  REQUESTED → SEARCHING_DRIVER → ACCEPTED → DRIVER_ARRIVING → ARRIVED → IN_PROGRESS → COMPLETED / CANCELLED
  ```

### Step 1.10 — Fare APIs

- [x] `POST /api/v1/fares/estimate/` — Estimate fare based on pickup & destination coordinates
- [x] Implement fare calculation logic (distance-based)

### Step 1.11 — Rating APIs

- [x] `POST /api/v1/ratings/` — Passenger rates driver (1–5 stars)
- [x] Validate: only completed rides can be rated
- [x] Validate: a passenger can rate a ride only once
- [x] Auto-update driver's average rating after each new rating

### Step 1.12 — Payment APIs

- [x] `POST /api/v1/payments/` — Create payment record
- [x] `GET /api/v1/payments/{payment_id}/` — Get payment details
- [x] Supported methods: CASH, ONLINE, WALLET

### Step 1.13 — Admin APIs

- [x] `GET /api/v1/admin/dashboard/` — Platform statistics
- [x] `GET /api/v1/admin/users/` — List all users
- [x] `GET /api/v1/admin/drivers/` — List all drivers
- [x] `POST /api/v1/admin/drivers/{driver_id}/approve/` — Approve driver
- [x] `POST /api/v1/admin/drivers/{driver_id}/suspend/` — Suspend driver
- [x] `GET /api/v1/admin/rides/` — List all rides

### Step 1.14 — Security & Final Backend Tasks

- [x] Role-based permission classes for all endpoints
- [x] Input validation on all serializers
- [x] Rate limiting on sensitive endpoints (login, register)
- [x] CORS configuration for frontend origins
- [x] Store all secrets in `.env` (never hardcode)
- [x] Test all APIs using Postman
- [x] Fix bugs and edge cases

---

## Phase 2 — Admin Dashboard (React + Vite)

> Duration: 1 Week

### Step 2.1 — Project Setup

- [x] Create `admin-dashboard/` folder inside `destiny/`
- [x] Initialize project: `npm create vite@latest`
- [x] Install dependencies:
  - `react-router-dom` — routing
  - `axios` — API calls
  - `tailwindcss` — styling
  - `recharts` or `chart.js` — analytics charts
- [x] Configure Tailwind CSS
- [x] Configure Axios base URL pointing to Django backend
- [x] Set up `.env` for API URL

### Step 2.2 — Authentication

- [x] Login page (email + password)
- [x] JWT token storage (localStorage)
- [x] Protected routes (redirect to login if not authenticated)
- [x] Logout functionality

### Step 2.3 — Dashboard Page

- [x] Display platform statistics:
  - Total Passengers
  - Total Drivers
  - Active Drivers
  - Total Rides
  - Active Rides
- [x] Charts for ride trends, earnings overview

### Step 2.4 — User Management

- [x] List all passengers
- [x] Search and filter passengers
- [x] View passenger details

### Step 2.5 — Driver Management

- [x] List all drivers with approval status
- [x] Approve driver account
- [x] Suspend driver account
- [x] View driver details (license, vehicle, rating)

### Step 2.6 — Ride Management

- [x] List all rides with status filter
- [x] View ride details (passenger, driver, route, fare)
- [x] Monitor active rides

### Step 2.7 — Final Admin Dashboard Tasks

- [x] Responsive design (works on desktop and tablet)
- [x] Error handling and loading states
- [x] Test all features end-to-end with real backend

---

## Phase 3 — Passenger App (React Native + Expo)

> Duration: 2 Weeks

### Step 3.1 — Project Setup

- [x] Create `passenger-app/` folder inside `destiny/`
- [x] Initialize project: `npx create-expo-app passenger-app`
- [x] Install dependencies:
  - `expo-router` — navigation
  - `axios` — API calls
  - `expo-location` — GPS access
  - `react-native-maps` — map display
  - `@react-native-async-storage/async-storage` — token storage
- [x] Configure Axios base URL
- [x] Set up `.env` for API URL

### Step 3.2 — Authentication Screens

- [x] Splash / Welcome Screen
- [x] Register Screen (full_name, email, phone, password)
- [x] Login Screen (email, password)
- [x] JWT token storage using AsyncStorage
- [x] Auto-login if token exists

### Step 3.3 — Profile Screens

- [x] View Profile Screen
- [x] Edit Profile Screen (full_name, phone)
- [x] Logout

### Step 3.4 — Home / Booking Screen

- [x] Map view showing current location
- [x] Pickup location input (auto-fill with current GPS)
- [x] Destination input
- [x] Show fare estimate after destination selected
- [x] "Book Ride" button

### Step 3.5 — Ride Tracking Screen

- [x] Show current ride status
- [x] Show assigned driver details (name, vehicle, rating)
- [x] Real-time status updates:
  ```
  SEARCHING_DRIVER → ACCEPTED → DRIVER_ARRIVING → ARRIVED → IN_PROGRESS → COMPLETED
  ```
- [x] Cancel ride option (before driver arrives)

### Step 3.6 — Rating Screen

- [x] Show after ride is COMPLETED
- [x] 1–5 star rating selector
- [x] Optional review text input
- [x] Submit rating

### Step 3.7 — Ride History Screen

- [x] List all past rides
- [x] Show ride details (date, route, fare, driver, status)

### Step 3.8 — Final Passenger App Tasks

- [x] Handle network errors gracefully
- [x] Loading indicators on all API calls
- [x] Test on Android device / emulator
- [x] Create release build
- [ ] Submit to Amazon Appstore

---

## Phase 4 — Driver App (React Native + Expo)

> Duration: 1–2 Weeks

### Step 4.1 — Project Setup

- [ ] Create `driver-app/` folder inside `destiny/`
- [ ] Initialize project: `npx create-expo-app driver-app`
- [ ] Install same dependencies as Passenger App
- [ ] Configure Axios base URL

### Step 4.2 — Authentication Screens

- [ ] Splash / Welcome Screen
- [ ] Register Screen (full_name, email, phone, password, license_number)
- [ ] Login Screen
- [ ] Show "pending approval" screen if `is_approved = false`

### Step 4.3 — Profile & Vehicle Screens

- [ ] View/Edit Driver Profile
- [ ] Add Vehicle Screen (vehicle_number, model, type, color)
- [ ] View My Vehicles
- [ ] Edit / Delete Vehicle

### Step 4.4 — Home / Availability Screen

- [ ] Toggle Online / Offline switch
- [ ] Show current online status
- [ ] When online: show incoming ride requests

### Step 4.5 — Ride Request Screen

- [ ] Show ride request notification with:
  - Passenger pickup location
  - Destination
  - Estimated fare
- [ ] Accept button
- [ ] Reject button
- [ ] Countdown timer for response

### Step 4.6 — Active Ride Screen

- [ ] Show passenger details
- [ ] Map with pickup location
- [ ] Status update buttons:
  - "I'm Arriving" → DRIVER_ARRIVING
  - "I've Arrived" → ARRIVED
  - "Start Ride" → IN_PROGRESS
  - "Complete Ride" → COMPLETED
- [ ] Update GPS location in real time while on ride

### Step 4.7 — Earnings Screen

- [ ] Total earnings
- [ ] Today's earnings
- [ ] Total rides completed

### Step 4.8 — Ride History Screen

- [ ] List all completed rides
- [ ] Show ride details (date, passenger, route, fare)

### Step 4.9 — Final Driver App Tasks

- [ ] Handle network errors gracefully
- [ ] Loading indicators on all API calls
- [ ] Test on Android device / emulator
- [ ] Create release build
- [ ] Submit to Amazon Appstore

---

## Deployment Plan

### Backend (Django)

```
GitHub Repository
      ↓
Hosting Platform (Render / Railway)
      ↓
Live Django REST API
```

### Admin Dashboard

```
GitHub Repository
      ↓
Vercel / Netlify
      ↓
Live Admin Dashboard
```

### Mobile Apps

```
Release Build (Expo)
      ↓
Amazon Appstore
      ↓
destiny Passenger App
destiny Driver App
```

### Database

- Supabase PostgreSQL (free tier)
- Supabase Storage
- Supabase Realtime

---

## Timeline Summary

| Phase | What | Duration |
|---|---|---|
| Phase 1 | Django Backend + All APIs | 2–3 Weeks |
| Phase 2 | Admin Dashboard | 1 Week |
| Phase 3 | Passenger App | 2 Weeks |
| Phase 4 | Driver App | 1–2 Weeks |
| **Total** | **Full MVP** | **~6–8 Weeks** |

---

## API Response Format

### Success
```json
{
  "success": true,
  "message": "Request successful",
  "data": {}
}
```

### Error
```json
{
  "success": false,
  "message": "Error message",
  "errors": {}
}
```

---

## Security Checklist

- [ ] JWT authentication on all protected routes
- [ ] Password hashing (Django default)
- [ ] Role-based access control (PASSENGER / DRIVER / ADMIN)
- [ ] Input validation on all API endpoints
- [ ] CORS configured for allowed origins only
- [ ] All secrets stored in `.env` files
- [ ] Rate limiting on login and register endpoints
- [ ] HTTPS in production
- [ ] Never expose Supabase service role keys
- [ ] Never expose Django secret key

---

## Tech Stack Summary

```
Mobile Apps  : React Native + Expo
Admin        : React + Vite + Tailwind CSS
Backend      : Django + Django REST Framework
Database     : Supabase PostgreSQL
Storage      : Supabase Storage
Realtime     : Supabase Realtime / WebSockets
Auth         : JWT (djangorestframework-simplejwt)
```

---

*Document Version: 1.0*
*Project: Destiny Ride-Booking Platform*

