# destiny API Design

## 1. Overview

This document defines the REST API structure for the destiny platform.

The API will be used by:

- Passenger Mobile App
- Driver Mobile App
- Admin Dashboard

### Backend

- Django
- Django REST Framework

### Database

- Supabase PostgreSQL

### Base API URL

```text
https://your-domain.com/api/v1/
```

---

# 2. Authentication

destiny uses JWT (JSON Web Token) authentication.

After successful login, the backend returns:

- Access Token
- Refresh Token

Protected requests must include:

```http
Authorization: Bearer <access_token>
```

---

# 3. API Response Format

## Successful Response

```json
{
  "success": true,
  "message": "Request successful",
  "data": {}
}
```

## Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": {}
}
```

---

# 4. Authentication APIs

## Register Passenger

### Endpoint

```http
POST /api/v1/auth/register/
```

### Request Body

```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "your_password"
}
```

### Response

```json
{
  "success": true,
  "message": "Passenger registered successfully",
  "data": {
    "user_id": "uuid"
  }
}
```

---

## Register Driver

### Endpoint

```http
POST /api/v1/auth/register/driver/
```

### Request Body

```json
{
  "full_name": "Driver Name",
  "email": "driver@example.com",
  "phone": "9876543210",
  "password": "your_password",
  "license_number": "DL123456789"
}
```

---

## Login

### Endpoint

```http
POST /api/v1/auth/login/
```

### Request Body

```json
{
  "email": "john@example.com",
  "password": "your_password"
}
```

### Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access": "jwt_access_token",
    "refresh": "jwt_refresh_token",
    "user": {
      "id": "uuid",
      "full_name": "John Doe",
      "role": "PASSENGER"
    }
  }
}
```

---

## Refresh Token

```http
POST /api/v1/auth/token/refresh/
```

---

## Logout

```http
POST /api/v1/auth/logout/
```

Authentication required.

---

# 5. User APIs

## Get Current User Profile

```http
GET /api/v1/users/me/
```

Authentication required.

---

## Update Profile

```http
PUT /api/v1/users/me/
```

### Request Body

```json
{
  "full_name": "Updated Name",
  "phone": "9876543210"
}
```

---

# 6. Driver APIs

## Get Driver Profile

```http
GET /api/v1/drivers/me/
```

Authentication required.

---

## Update Driver Profile

```http
PUT /api/v1/drivers/me/
```

---

## Set Driver Online

```http
POST /api/v1/drivers/status/
```

### Request Body

```json
{
  "is_online": true
}
```

---

## Set Driver Offline

```http
POST /api/v1/drivers/status/
```

### Request Body

```json
{
  "is_online": false
}
```

---

## Get Driver Details

```http
GET /api/v1/drivers/{driver_id}/
```

---

# 7. Vehicle APIs

## Add Vehicle

```http
POST /api/v1/vehicles/
```

### Request Body

```json
{
  "vehicle_number": "OD-07-AB-1234",
  "vehicle_model": "Swift Dzire",
  "vehicle_type": "CAR",
  "vehicle_color": "White"
}
```

---

## Get My Vehicles

```http
GET /api/v1/vehicles/me/
```

---

## Update Vehicle

```http
PUT /api/v1/vehicles/{vehicle_id}/
```

---

## Delete Vehicle

```http
DELETE /api/v1/vehicles/{vehicle_id}/
```

---

# 8. Location APIs

## Update Driver Location

```http
POST /api/v1/locations/update/
```

### Request Body

```json
{
  "latitude": 19.3149,
  "longitude": 84.7941
}
```

Authentication required.

Only authenticated drivers can update their location.

---

## Get Driver Location

```http
GET /api/v1/locations/driver/{driver_id}/
```

---

## Get Nearby Drivers

```http
GET /api/v1/drivers/nearby/?latitude=19.3149&longitude=84.7941
```

---

# 9. Ride APIs

## Create Ride Request

### Endpoint

```http
POST /api/v1/rides/
```

### Request Body

```json
{
  "pickup_address": "Pickup Location",
  "pickup_latitude": 19.3149,
  "pickup_longitude": 84.7941,
  "destination_address": "Destination Location",
  "destination_latitude": 19.0760,
  "destination_longitude": 72.8777
}
```

### Response

```json
{
  "success": true,
  "message": "Ride request created",
  "data": {
    "ride_id": "uuid",
    "status": "SEARCHING_DRIVER",
    "estimated_fare": 250
  }
}
```

---

## Get Ride Details

```http
GET /api/v1/rides/{ride_id}/
```

Only the related passenger, assigned driver, or administrator should access ride details.

---

## Get Passenger Ride History

```http
GET /api/v1/rides/my-rides/
```

---

## Get Driver Ride Requests

```http
GET /api/v1/rides/requests/
```

Only available to authenticated online drivers.

---

## Accept Ride

```http
POST /api/v1/rides/{ride_id}/accept/
```

---

## Reject Ride

```http
POST /api/v1/rides/{ride_id}/reject/
```

---

## Update Ride Status

```http
POST /api/v1/rides/{ride_id}/status/
```

### Request Body

```json
{
  "status": "DRIVER_ARRIVING"
}
```

Allowed statuses:

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

---

## Cancel Ride

```http
POST /api/v1/rides/{ride_id}/cancel/
```

### Request Body

```json
{
  "reason": "Changed my plans"
}
```

---

# 10. Fare APIs

## Get Fare Estimate

```http
POST /api/v1/fares/estimate/
```

### Request Body

```json
{
  "pickup_latitude": 19.3149,
  "pickup_longitude": 84.7941,
  "destination_latitude": 19.0760,
  "destination_longitude": 72.8777
}
```

### Response

```json
{
  "success": true,
  "data": {
    "distance_km": 10.5,
    "estimated_duration_minutes": 25,
    "estimated_fare": 250
  }
}
```

---

# 11. Rating APIs

## Rate Driver

```http
POST /api/v1/ratings/
```

### Request Body

```json
{
  "ride_id": "uuid",
  "rating": 5,
  "review": "Good ride and professional driver."
}
```

Rules:

- Rating should be between 1 and 5.
- Only completed rides can be rated.
- A passenger can rate a ride once.

---

## Get Driver Ratings

```http
GET /api/v1/drivers/{driver_id}/ratings/
```

---

# 12. Payment APIs

> Payment integration can be added in a later phase.

## Create Payment

```http
POST /api/v1/payments/
```

### Request Body

```json
{
  "ride_id": "uuid",
  "payment_method": "CASH"
}
```

Possible methods:

```text
CASH
ONLINE
WALLET
```

---

## Get Payment Details

```http
GET /api/v1/payments/{payment_id}/
```

---

# 13. Driver Earnings APIs

## Get Driver Earnings

```http
GET /api/v1/drivers/earnings/
```

Example response:

```json
{
  "success": true,
  "data": {
    "total_earnings": 5000,
    "total_rides": 25,
    "today_earnings": 750
  }
}
```

---

# 14. Admin APIs

All admin endpoints require an authenticated user with the `ADMIN` role.

## Get Dashboard Statistics

```http
GET /api/v1/admin/dashboard/
```

Example response:

```json
{
  "success": true,
  "data": {
    "total_passengers": 1000,
    "total_drivers": 250,
    "active_drivers": 75,
    "total_rides": 5000,
    "active_rides": 20
  }
}
```

---

## Get All Users

```http
GET /api/v1/admin/users/
```

---

## Get All Drivers

```http
GET /api/v1/admin/drivers/
```

---

## Approve Driver

```http
POST /api/v1/admin/drivers/{driver_id}/approve/
```

---

## Reject/Suspend Driver

```http
POST /api/v1/admin/drivers/{driver_id}/suspend/
```

---

## Get All Rides

```http
GET /api/v1/admin/rides/
```

---

# 15. API Endpoint Summary

## Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register/` | Register passenger |
| POST | `/auth/register/driver/` | Register driver |
| POST | `/auth/login/` | Login |
| POST | `/auth/token/refresh/` | Refresh JWT token |
| POST | `/auth/logout/` | Logout |

## Users

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/me/` | Get profile |
| PUT | `/users/me/` | Update profile |

## Drivers

| Method | Endpoint | Description |
|---|---|---|
| GET | `/drivers/me/` | Get driver profile |
| PUT | `/drivers/me/` | Update driver profile |
| POST | `/drivers/status/` | Online/offline status |
| GET | `/drivers/nearby/` | Find nearby drivers |

## Vehicles

| Method | Endpoint | Description |
|---|---|---|
| POST | `/vehicles/` | Add vehicle |
| GET | `/vehicles/me/` | Get my vehicles |
| PUT | `/vehicles/{id}/` | Update vehicle |
| DELETE | `/vehicles/{id}/` | Delete vehicle |

## Rides

| Method | Endpoint | Description |
|---|---|---|
| POST | `/rides/` | Create ride |
| GET | `/rides/{id}/` | Ride details |
| GET | `/rides/my-rides/` | Ride history |
| GET | `/rides/requests/` | Driver ride requests |
| POST | `/rides/{id}/accept/` | Accept ride |
| POST | `/rides/{id}/reject/` | Reject ride |
| POST | `/rides/{id}/status/` | Update status |
| POST | `/rides/{id}/cancel/` | Cancel ride |

## Locations

| Method | Endpoint | Description |
|---|---|---|
| POST | `/locations/update/` | Update driver location |
| GET | `/locations/driver/{id}/` | Get driver location |

## Ratings

| Method | Endpoint | Description |
|---|---|---|
| POST | `/ratings/` | Rate driver |
| GET | `/drivers/{id}/ratings/` | Get ratings |

## Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/dashboard/` | Dashboard statistics |
| GET | `/admin/users/` | Manage users |
| GET | `/admin/drivers/` | Manage drivers |
| POST | `/admin/drivers/{id}/approve/` | Approve driver |
| POST | `/admin/drivers/{id}/suspend/` | Suspend driver |
| GET | `/admin/rides/` | Manage rides |

---

# 16. Security Requirements

The backend should implement:

- JWT authentication
- Password hashing
- Role-based access control
- Input validation
- Permission checks
- HTTPS in production
- Environment variables for secrets
- Rate limiting for sensitive endpoints

Never expose:

- Supabase service role keys
- Django secret key
- Database passwords
- JWT signing secrets

---

# 17. API Versioning

All APIs should use versioning:

```text
/api/v1/
```

Future versions can use:

```text
/api/v2/
```

This allows destiny to improve APIs without immediately breaking older application versions.

---

# 18. Future API Features

Future versions may add:

- Push notification APIs
- SOS/Emergency APIs
- Promo code APIs
- Scheduled ride APIs
- Dynamic pricing APIs
- AI demand prediction APIs
- Referral APIs
- Driver document verification APIs

---

## Recommended Next Step

After this API design, create:

1. `SUPABASE_SCHEMA.sql`
2. Django database models
3. Django REST API implementation
4. Passenger App integration
5. Driver App integration
