# System Architecture

## 1. High-Level Architecture
```text
Passenger App ────────┐
                      │
Driver App ───────────┼──→ Django REST API ───→ Supabase PostgreSQL
                      │            │
Admin Dashboard ──────┘            ├──→ Supabase Storage
                                   └──→ Realtime Services
```

## 2. Applications

### Passenger Application
Responsible for:
- Ride booking
- Ride tracking
- Driver information
- Ride history

### Driver Application
Responsible for:
- Receiving ride requests
- Accepting rides
- Updating GPS location
- Managing rides

### Admin Dashboard
Responsible for:
- Platform management
- Driver approval
- User management
- Analytics

## 3. Backend Architecture
```text
Django Project
│
├── authentication/
├── users/
├── drivers/
├── vehicles/
├── rides/
├── locations/
├── payments/
├── ratings/
└── notifications/
```

## 4. API Communication
```text
Mobile Applications
        │
        ▼
REST API
        │
        ▼
Django REST Framework
        │
        ▼
Business Logic
        │
        ▼
Supabase PostgreSQL
```

## 5. Real-Time Architecture
```text
Driver GPS
    ↓
Location Update
    ↓
Backend / Realtime Service
    ↓
Passenger Application
    ↓
Live Map Update
```
