# Product Requirements Document (PRD)

## Project Name
**destiny**

## 1. Product Overview
destiny is a ride-booking platform inspired by services such as Uber and Ola. The system connects passengers with nearby drivers through mobile applications.

The platform consists of:
- Passenger Mobile App
- Driver Mobile App
- Admin Web Dashboard
- Central Backend API
- Supabase PostgreSQL Database

## 2. Problem Statement
Passengers need a convenient way to request transportation, while drivers need a platform to receive and manage ride requests.

destiny provides a digital platform where:
1. Passengers request rides.
2. Nearby drivers receive ride requests.
3. Drivers accept or reject requests.
4. Passengers can track ride status.
5. Administrators manage users, drivers, and rides.

## 3. Target Users
### Passenger
Users who want to book transportation.

### Driver
Users who provide transportation services.

### Administrator
Users responsible for managing the entire platform.

## 4. Core Features

### Passenger App
- User registration and login
- Profile management
- Pickup location selection
- Destination selection
- Fare estimation
- Ride booking
- Driver information
- Ride status tracking
- Ride history
- Driver rating

### Driver App
- Driver registration
- Profile management
- Vehicle management
- Online/Offline availability
- Receive ride requests
- Accept or reject rides
- Update current location
- Start ride
- Complete ride
- View earnings
- View ride history

### Admin Dashboard
- Admin authentication
- Manage passengers
- Manage drivers
- Approve driver accounts
- Manage vehicles
- Monitor active rides
- View ride history
- Manage pricing
- View platform analytics

## 5. Ride Flow
```text
Passenger Creates Ride Request
            ↓
System Finds Available Drivers
            ↓
Driver Receives Request
            ↓
Driver Accepts Ride
            ↓
Passenger Gets Driver Details
            ↓
Driver Arrives at Pickup
            ↓
Ride Starts
            ↓
Ride Completes
            ↓
Passenger Rates Driver
```

## 6. Ride Status
```text
REQUESTED
SEARCHING_DRIVER
ACCEPTED
DRIVER_ARRIVING
ARRIVED
IN_PROGRESS
COMPLETED
CANCELLED
```

## 7. Future Features
- Real-time GPS tracking
- Live map navigation
- Multiple vehicle categories
- Digital payments
- Push notifications
- Ride scheduling
- Emergency/SOS button
- Promo codes
- Dynamic pricing
- AI-based demand prediction
