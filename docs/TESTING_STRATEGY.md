# destiny — Testing Strategy

This document defines the testing approach for the destiny ride-booking platform across all components.

- **Backend:** Django + Django REST Framework
- **Admin Dashboard:** React + Vite
- **Passenger App:** React Native + Expo
- **Driver App:** React Native + Expo

---

## Table of Contents

- [1. Backend Testing (Django)](#1-backend-testing-django)
  - [1.1 Test Framework Setup](#11-test-framework-setup)
  - [1.2 Authentication Tests](#12-authentication-tests)
  - [1.3 User API Tests](#13-user-api-tests)
  - [1.4 Driver API Tests](#14-driver-api-tests)
  - [1.5 Vehicle API Tests](#15-vehicle-api-tests)
  - [1.6 Ride API Tests](#16-ride-api-tests)
  - [1.7 Ride Status Transition Tests](#17-ride-status-transition-tests)
  - [1.8 Fare API Tests](#18-fare-api-tests)
  - [1.9 Rating API Tests](#19-rating-api-tests)
  - [1.10 Admin API Tests](#110-admin-api-tests)
  - [1.11 Permission & Access Control Tests](#111-permission--access-control-tests)
  - [1.12 Edge Case Tests](#112-edge-case-tests)
- [2. API Testing with Postman](#2-api-testing-with-postman)
  - [2.1 Collection Structure](#21-collection-structure)
  - [2.2 Environment Variables](#22-environment-variables)
  - [2.3 Pre-request Scripts & Tests](#23-pre-request-scripts--tests)
- [3. Admin Dashboard Testing (React)](#3-admin-dashboard-testing-react)
- [4. Mobile App Testing (Expo)](#4-mobile-app-testing-expo)
- [5. Manual Testing Checklist](#5-manual-testing-checklist)
- [6. CI/CD Testing Pipeline](#6-cicd-testing-pipeline)

---

## 1. Backend Testing (Django)

### 1.1 Test Framework Setup

**Dependencies:**

```text
# requirements.txt (test dependencies)
pytest
pytest-django
pytest-cov
factory-boy
faker
```

**Configuration (`pytest.ini` or `setup.cfg`):**

```ini
[pytest]
DJANGO_SETTINGS_MODULE = destiny.settings
python_files = tests.py test_*.py *_tests.py
addopts = --verbose --cov=. --cov-report=html
```

**Test Directory Structure:**

```text
backend/
├── authentication/
│   └── tests/
│       ├── __init__.py
│       ├── test_register.py
│       ├── test_login.py
│       └── test_token.py
├── users/
│   └── tests/
│       ├── __init__.py
│       └── test_profile.py
├── drivers/
│   └── tests/
│       ├── __init__.py
│       ├── test_driver_profile.py
│       ├── test_driver_status.py
│       └── test_driver_earnings.py
├── vehicles/
│   └── tests/
│       ├── __init__.py
│       └── test_vehicles.py
├── rides/
│   └── tests/
│       ├── __init__.py
│       ├── test_create_ride.py
│       ├── test_ride_status.py
│       ├── test_ride_accept_reject.py
│       └── test_ride_history.py
├── ratings/
│   └── tests/
│       ├── __init__.py
│       └── test_ratings.py
├── locations/
│   └── tests/
│       ├── __init__.py
│       └── test_locations.py
└── payments/
    └── tests/
        ├── __init__.py
        └── test_payments.py
```

**Base Test Class:**

```python
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


class BaseAPITestCase(APITestCase):
    """Base test class with helper methods for all API tests."""

    def setUp(self):
        self.client = APIClient()

    def create_passenger(self, email="passenger@test.com", password="testpass123"):
        """Create and return a passenger user."""
        user = User.objects.create_user(
            email=email,
            password=password,
            full_name="Test Passenger",
            phone="9876543210",
            role="PASSENGER",
        )
        return user

    def create_driver(self, email="driver@test.com", password="testpass123", approved=True):
        """Create and return a driver user with driver profile."""
        user = User.objects.create_user(
            email=email,
            password=password,
            full_name="Test Driver",
            phone="9876543211",
            role="DRIVER",
        )
        from drivers.models import Driver
        Driver.objects.create(
            user=user,
            license_number="DL123456789",
            is_approved=approved,
            is_online=False,
        )
        return user

    def create_admin(self, email="admin@test.com", password="testpass123"):
        """Create and return an admin user."""
        user = User.objects.create_user(
            email=email,
            password=password,
            full_name="Test Admin",
            phone="9876543212",
            role="ADMIN",
        )
        return user

    def authenticate(self, user):
        """Authenticate the test client with the given user."""
        self.client.force_authenticate(user=user)

    def get_token(self, email, password):
        """Get JWT token pair via login endpoint."""
        response = self.client.post("/api/v1/auth/login/", {
            "email": email,
            "password": password,
        })
        return response.data.get("data", {})
```

**Running Tests:**

```bash
# Run all tests
python -m pytest

# Run specific app tests
python -m pytest authentication/tests/

# Run with coverage report
python -m pytest --cov=. --cov-report=html

# Run a single test file
python -m pytest rides/tests/test_ride_status.py

# Run tests matching a keyword
python -m pytest -k "test_login"
```

---

### 1.2 Authentication Tests

**File:** `authentication/tests/test_register.py`

| Test Case | Method | Endpoint | Expected |
|---|---|---|---|
| Register passenger with valid data | POST | `/auth/register/` | 201 Created |
| Register with missing full_name | POST | `/auth/register/` | 400 Bad Request |
| Register with invalid email format | POST | `/auth/register/` | 400 Bad Request |
| Register with duplicate email | POST | `/auth/register/` | 400 Bad Request |
| Register with short password | POST | `/auth/register/` | 400 Bad Request |
| Register with missing phone | POST | `/auth/register/` | 400 Bad Request |
| Register driver with valid data | POST | `/auth/register/driver/` | 201 Created |
| Register driver without license_number | POST | `/auth/register/driver/` | 400 Bad Request |
| Verify registered driver `is_approved` = false | POST | `/auth/register/driver/` | `is_approved: false` |

**File:** `authentication/tests/test_login.py`

| Test Case | Method | Endpoint | Expected |
|---|---|---|---|
| Login with valid credentials | POST | `/auth/login/` | 200 + tokens returned |
| Login with wrong password | POST | `/auth/login/` | 401 Unauthorized |
| Login with non-existent email | POST | `/auth/login/` | 401 Unauthorized |
| Login response contains access + refresh tokens | POST | `/auth/login/` | Both tokens present |
| Login response contains user role | POST | `/auth/login/` | `role` field present |

**File:** `authentication/tests/test_token.py`

| Test Case | Method | Endpoint | Expected |
|---|---|---|---|
| Refresh with valid refresh token | POST | `/auth/token/refresh/` | 200 + new access token |
| Refresh with invalid token | POST | `/auth/token/refresh/` | 401 Unauthorized |
| Refresh with expired token | POST | `/auth/token/refresh/` | 401 Unauthorized |
| Logout invalidates refresh token | POST | `/auth/logout/` | 200 + token blacklisted |
| Access protected endpoint without token | GET | `/users/me/` | 401 Unauthorized |
| Access protected endpoint with expired token | GET | `/users/me/` | 401 Unauthorized |

---

### 1.3 User API Tests

**File:** `users/tests/test_profile.py`

| Test Case | Method | Endpoint | Expected |
|---|---|---|---|
| Get own profile (authenticated) | GET | `/users/me/` | 200 + user data |
| Get profile without authentication | GET | `/users/me/` | 401 Unauthorized |
| Update full_name | PUT | `/users/me/` | 200 + updated name |
| Update phone number | PUT | `/users/me/` | 200 + updated phone |
| Cannot update email | PUT | `/users/me/` | Email unchanged |
| Cannot update role | PUT | `/users/me/` | Role unchanged |

---

### 1.4 Driver API Tests

**File:** `drivers/tests/test_driver_profile.py`

| Test Case | Method | Endpoint | Expected |
|---|---|---|---|
| Get driver profile (authenticated driver) | GET | `/drivers/me/` | 200 + driver data |
| Passenger cannot access driver profile endpoint | GET | `/drivers/me/` | 403 Forbidden |
| Update driver profile | PUT | `/drivers/me/` | 200 + updated data |
| Get driver details by ID | GET | `/drivers/{id}/` | 200 + driver details |

**File:** `drivers/tests/test_driver_status.py`

| Test Case | Method | Endpoint | Expected |
|---|---|---|---|
| Set driver online | POST | `/drivers/status/` | 200 + `is_online: true` |
| Set driver offline | POST | `/drivers/status/` | 200 + `is_online: false` |
| Non-approved driver cannot go online | POST | `/drivers/status/` | 403 Forbidden |
| Passenger cannot toggle driver status | POST | `/drivers/status/` | 403 Forbidden |
| Get nearby drivers | GET | `/drivers/nearby/` | 200 + driver list |
| Nearby returns only online drivers | GET | `/drivers/nearby/` | Only `is_online: true` |

**File:** `drivers/tests/test_driver_earnings.py`

| Test Case | Method | Endpoint | Expected |
|---|---|---|---|
| Get earnings (driver with rides) | GET | `/drivers/earnings/` | 200 + earnings data |
| Get earnings (driver with no rides) | GET | `/drivers/earnings/` | 200 + zeroes |
| Passenger cannot access earnings | GET | `/drivers/earnings/` | 403 Forbidden |

---

### 1.5 Vehicle API Tests

**File:** `vehicles/tests/test_vehicles.py`

| Test Case | Method | Endpoint | Expected |
|---|---|---|---|
| Add vehicle (authenticated driver) | POST | `/vehicles/` | 201 Created |
| Add vehicle with missing fields | POST | `/vehicles/` | 400 Bad Request |
| Passenger cannot add vehicle | POST | `/vehicles/` | 403 Forbidden |
| Get my vehicles | GET | `/vehicles/me/` | 200 + vehicle list |
| Update vehicle | PUT | `/vehicles/{id}/` | 200 + updated data |
| Cannot update another driver's vehicle | PUT | `/vehicles/{id}/` | 403 Forbidden |
| Delete vehicle | DELETE | `/vehicles/{id}/` | 204 No Content |
| Cannot delete another driver's vehicle | DELETE | `/vehicles/{id}/` | 403 Forbidden |

---

### 1.6 Ride API Tests

**File:** `rides/tests/test_create_ride.py`

| Test Case | Method | Endpoint | Expected |
|---|---|---|---|
| Create ride (authenticated passenger) | POST | `/rides/` | 201 + ride data |
| Create ride with missing pickup | POST | `/rides/` | 400 Bad Request |
| Create ride with missing destination | POST | `/rides/` | 400 Bad Request |
| Driver cannot create ride | POST | `/rides/` | 403 Forbidden |
| Ride initial status is SEARCHING_DRIVER | POST | `/rides/` | `status: SEARCHING_DRIVER` |
| Ride has estimated_fare | POST | `/rides/` | `estimated_fare` > 0 |

**File:** `rides/tests/test_ride_accept_reject.py`

| Test Case | Method | Endpoint | Expected |
|---|---|---|---|
| Driver accepts ride | POST | `/rides/{id}/accept/` | 200 + `status: ACCEPTED` |
| Driver rejects ride | POST | `/rides/{id}/reject/` | 200 |
| Passenger cannot accept ride | POST | `/rides/{id}/accept/` | 403 Forbidden |
| Cannot accept already accepted ride | POST | `/rides/{id}/accept/` | 400 Bad Request |
| Offline driver cannot accept ride | POST | `/rides/{id}/accept/` | 403 Forbidden |

**File:** `rides/tests/test_ride_history.py`

| Test Case | Method | Endpoint | Expected |
|---|---|---|---|
| Passenger gets own ride history | GET | `/rides/my-rides/` | 200 + ride list |
| Ride history returns only own rides | GET | `/rides/my-rides/` | Filtered to user |
| Get ride details by ID | GET | `/rides/{id}/` | 200 + ride data |
| Cannot access another passenger's ride | GET | `/rides/{id}/` | 403 Forbidden |
| Cancel ride before driver arrives | POST | `/rides/{id}/cancel/` | 200 + CANCELLED |

---

### 1.7 Ride Status Transition Tests

**File:** `rides/tests/test_ride_status.py`

These tests verify the ride status state machine works correctly.

**Valid Transitions:**

| From | To | Actor | Expected |
|---|---|---|---|
| REQUESTED | SEARCHING_DRIVER | System | ✅ Allowed |
| SEARCHING_DRIVER | ACCEPTED | Driver | ✅ Allowed |
| ACCEPTED | DRIVER_ARRIVING | Driver | ✅ Allowed |
| DRIVER_ARRIVING | ARRIVED | Driver | ✅ Allowed |
| ARRIVED | IN_PROGRESS | Driver | ✅ Allowed |
| IN_PROGRESS | COMPLETED | Driver | ✅ Allowed |
| SEARCHING_DRIVER | CANCELLED | Passenger | ✅ Allowed |
| ACCEPTED | CANCELLED | Passenger | ✅ Allowed |

**Invalid Transitions (should return 400):**

| From | To | Why Invalid |
|---|---|---|
| COMPLETED | IN_PROGRESS | Cannot go backward |
| CANCELLED | ACCEPTED | Cannot resume cancelled ride |
| IN_PROGRESS | ACCEPTED | Cannot go backward |
| SEARCHING_DRIVER | COMPLETED | Cannot skip states |
| COMPLETED | CANCELLED | Ride already finished |
| IN_PROGRESS | CANCELLED | Cannot cancel during ride |

**Example Test:**

```python
class RideStatusTransitionTest(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.passenger = self.create_passenger()
        self.driver = self.create_driver()

    def test_valid_full_ride_flow(self):
        """Test the complete happy-path ride flow."""
        # Passenger creates ride
        self.authenticate(self.passenger)
        response = self.client.post("/api/v1/rides/", {
            "pickup_address": "123 Main St",
            "pickup_latitude": 19.3149,
            "pickup_longitude": 84.7941,
            "destination_address": "456 Park Ave",
            "destination_latitude": 19.0760,
            "destination_longitude": 72.8777,
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        ride_id = response.data["data"]["ride_id"]

        # Driver accepts ride
        self.authenticate(self.driver)
        response = self.client.post(f"/api/v1/rides/{ride_id}/accept/")
        self.assertEqual(response.data["data"]["status"], "ACCEPTED")

        # Driver arriving
        response = self.client.post(f"/api/v1/rides/{ride_id}/status/", {
            "status": "DRIVER_ARRIVING"
        })
        self.assertEqual(response.data["data"]["status"], "DRIVER_ARRIVING")

        # Driver arrived
        response = self.client.post(f"/api/v1/rides/{ride_id}/status/", {
            "status": "ARRIVED"
        })
        self.assertEqual(response.data["data"]["status"], "ARRIVED")

        # Start ride
        response = self.client.post(f"/api/v1/rides/{ride_id}/status/", {
            "status": "IN_PROGRESS"
        })
        self.assertEqual(response.data["data"]["status"], "IN_PROGRESS")

        # Complete ride
        response = self.client.post(f"/api/v1/rides/{ride_id}/status/", {
            "status": "COMPLETED"
        })
        self.assertEqual(response.data["data"]["status"], "COMPLETED")

    def test_cannot_skip_status(self):
        """Test that skipping statuses is not allowed."""
        self.authenticate(self.passenger)
        response = self.client.post("/api/v1/rides/", {
            "pickup_address": "123 Main St",
            "pickup_latitude": 19.3149,
            "pickup_longitude": 84.7941,
            "destination_address": "456 Park Ave",
            "destination_latitude": 19.0760,
            "destination_longitude": 72.8777,
        })
        ride_id = response.data["data"]["ride_id"]

        # Try to jump directly to COMPLETED
        self.authenticate(self.driver)
        response = self.client.post(f"/api/v1/rides/{ride_id}/status/", {
            "status": "COMPLETED"
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_reverse_status(self):
        """Test that reversing status is not allowed."""
        # Setup: create ride and advance to IN_PROGRESS
        # ... (setup steps)

        # Try to go from IN_PROGRESS back to ACCEPTED
        response = self.client.post(f"/api/v1/rides/{ride_id}/status/", {
            "status": "ACCEPTED"
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
```

---

### 1.8 Fare API Tests

**File:** `rides/tests/test_fare.py`

| Test Case | Method | Endpoint | Expected |
|---|---|---|---|
| Get fare estimate with valid coords | POST | `/fares/estimate/` | 200 + fare data |
| Fare estimate returns distance_km | POST | `/fares/estimate/` | `distance_km` > 0 |
| Fare estimate returns estimated_fare | POST | `/fares/estimate/` | `estimated_fare` > 0 |
| Fare estimate with missing coords | POST | `/fares/estimate/` | 400 Bad Request |
| Fare estimate with same pickup and dest | POST | `/fares/estimate/` | Fare is minimal/zero |

---

### 1.9 Rating API Tests

**File:** `ratings/tests/test_ratings.py`

| Test Case | Method | Endpoint | Expected |
|---|---|---|---|
| Rate completed ride (1-5) | POST | `/ratings/` | 201 Created |
| Cannot rate incomplete ride | POST | `/ratings/` | 400 Bad Request |
| Cannot rate same ride twice | POST | `/ratings/` | 400 Bad Request |
| Rating below 1 is rejected | POST | `/ratings/` | 400 Bad Request |
| Rating above 5 is rejected | POST | `/ratings/` | 400 Bad Request |
| Driver average rating updates after new rating | POST | `/ratings/` | Driver rating recalculated |
| Get driver ratings | GET | `/drivers/{id}/ratings/` | 200 + ratings list |
| Driver cannot rate their own ride | POST | `/ratings/` | 403 Forbidden |

---

### 1.10 Admin API Tests

**File:** `admin/tests/test_admin.py` (or within each app's tests)

| Test Case | Method | Endpoint | Expected |
|---|---|---|---|
| Get dashboard stats (admin) | GET | `/admin/dashboard/` | 200 + stats data |
| Non-admin cannot access dashboard | GET | `/admin/dashboard/` | 403 Forbidden |
| List all users (admin) | GET | `/admin/users/` | 200 + user list |
| List all drivers (admin) | GET | `/admin/drivers/` | 200 + driver list |
| Approve pending driver | POST | `/admin/drivers/{id}/approve/` | 200 + `is_approved: true` |
| Suspend approved driver | POST | `/admin/drivers/{id}/suspend/` | 200 + suspended |
| List all rides (admin) | GET | `/admin/rides/` | 200 + rides list |
| Passenger cannot access admin endpoints | GET | `/admin/dashboard/` | 403 Forbidden |
| Driver cannot access admin endpoints | GET | `/admin/users/` | 403 Forbidden |

---

### 1.11 Permission & Access Control Tests

These tests ensure role-based access control is enforced across all endpoints.

| Scenario | Expected Result |
|---|---|
| Unauthenticated user → any protected endpoint | 401 Unauthorized |
| Passenger → driver-only endpoints (`/drivers/status/`, `/rides/requests/`) | 403 Forbidden |
| Driver → passenger-only endpoints (`/rides/` POST for creating rides) | 403 Forbidden |
| Passenger → admin endpoints | 403 Forbidden |
| Driver → admin endpoints | 403 Forbidden |
| Passenger A → Passenger B's ride details | 403 Forbidden |
| Driver A → Driver B's vehicle management | 403 Forbidden |
| Non-approved driver → go online | 403 Forbidden |
| Non-approved driver → accept rides | 403 Forbidden |

---

### 1.12 Edge Case Tests

| Edge Case | Test |
|---|---|
| Register with extremely long name (255+ chars) | Should fail validation |
| Register with special characters in phone | Should fail validation |
| Create ride with coordinates at (0, 0) | Should handle gracefully |
| Create ride with same pickup and destination | Should fail or return zero fare |
| Accept ride that was already cancelled | Should return 400 |
| Update status of a ride you're not assigned to | Should return 403 |
| Send empty request body to POST endpoints | Should return 400 |
| SQL injection in search/filter parameters | Should be sanitized |
| Rate with rating = 0 | Should fail validation |
| Rate with rating = 100 | Should fail validation |
| Create ride when no drivers are online | Ride stays in SEARCHING_DRIVER |
| Multiple drivers try to accept same ride | Only first should succeed |
| Concurrent status updates on same ride | Should handle race condition |

---

## 2. API Testing with Postman

### 2.1 Collection Structure

```text
destiny API Collection/
│
├── 🔐 Authentication/
│   ├── Register Passenger
│   ├── Register Driver
│   ├── Login (Passenger)
│   ├── Login (Driver)
│   ├── Login (Admin)
│   ├── Refresh Token
│   └── Logout
│
├── 👤 Users/
│   ├── Get My Profile
│   └── Update My Profile
│
├── 🚗 Drivers/
│   ├── Get Driver Profile
│   ├── Update Driver Profile
│   ├── Toggle Online/Offline
│   ├── Get Nearby Drivers
│   ├── Get Driver Details
│   ├── Get Driver Earnings
│   └── Get Driver Ratings
│
├── 🚘 Vehicles/
│   ├── Add Vehicle
│   ├── Get My Vehicles
│   ├── Update Vehicle
│   └── Delete Vehicle
│
├── 📍 Locations/
│   ├── Update Driver Location
│   └── Get Driver Location
│
├── 🛣️ Rides/
│   ├── Create Ride Request
│   ├── Get Ride Details
│   ├── Get My Ride History
│   ├── Get Ride Requests (Driver)
│   ├── Accept Ride
│   ├── Reject Ride
│   ├── Update Ride Status
│   └── Cancel Ride
│
├── 💰 Fares/
│   └── Get Fare Estimate
│
├── ⭐ Ratings/
│   └── Rate Driver
│
├── 💳 Payments/
│   ├── Create Payment
│   └── Get Payment Details
│
├── 🔧 Admin/
│   ├── Get Dashboard Stats
│   ├── Get All Users
│   ├── Get All Drivers
│   ├── Approve Driver
│   ├── Suspend Driver
│   └── Get All Rides
│
└── 🔄 Full Ride Flow (E2E)/
    ├── 1. Register Passenger
    ├── 2. Login Passenger
    ├── 3. Register Driver
    ├── 4. Login Driver
    ├── 5. Admin Approves Driver
    ├── 6. Driver Goes Online
    ├── 7. Passenger Gets Fare Estimate
    ├── 8. Passenger Creates Ride
    ├── 9. Driver Accepts Ride
    ├── 10. Driver → DRIVER_ARRIVING
    ├── 11. Driver → ARRIVED
    ├── 12. Driver → IN_PROGRESS
    ├── 13. Driver → COMPLETED
    └── 14. Passenger Rates Driver
```

### 2.2 Environment Variables

Create two Postman environments:

**Development Environment:**

| Variable | Value |
|---|---|
| `base_url` | `http://127.0.0.1:8000/api/v1` |
| `passenger_email` | `passenger@test.com` |
| `passenger_password` | `testpass123` |
| `driver_email` | `driver@test.com` |
| `driver_password` | `testpass123` |
| `admin_email` | `admin@destiny.com` |
| `admin_password` | `adminpass123` |
| `access_token` | *(auto-set by login test)* |
| `refresh_token` | *(auto-set by login test)* |
| `driver_id` | *(auto-set)* |
| `ride_id` | *(auto-set)* |
| `vehicle_id` | *(auto-set)* |

**Production Environment:**

| Variable | Value |
|---|---|
| `base_url` | `https://your-domain.com/api/v1` |
| *(same structure, different values)* | |

### 2.3 Pre-request Scripts & Tests

**Login Request — Post-response Test Script:**

```javascript
// Auto-save tokens after login
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("access_token", jsonData.data.access);
    pm.environment.set("refresh_token", jsonData.data.refresh);
    pm.environment.set("user_id", jsonData.data.user.id);
}
```

**Authenticated Requests — Pre-request Script:**

Set Authorization header in the collection:

```text
Authorization: Bearer {{access_token}}
```

**Create Ride — Post-response Test Script:**

```javascript
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    pm.environment.set("ride_id", jsonData.data.ride_id);
}

pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Ride status is SEARCHING_DRIVER", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.status).to.eql("SEARCHING_DRIVER");
});
```

**Generic Response Validation Test:**

```javascript
pm.test("Response has success field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property("success");
});

pm.test("Response has message field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property("message");
});
```

---

## 3. Admin Dashboard Testing (React)

### 3.1 Test Setup

**Dependencies:**

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "vitest": "^1.0.0",
    "jsdom": "^23.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "msw": "^2.0.0"
  }
}
```

**Vite Test Config (`vite.config.js`):**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});
```

**Test Setup File (`src/test/setup.js`):**

```javascript
import '@testing-library/jest-dom';
```

### 3.2 What to Test

**Component Tests:**

| Component | Tests |
|---|---|
| `LoginPage` | Renders form, validates input, handles login success/failure, redirects on success |
| `Dashboard` | Renders stat cards, renders charts, shows loading state, handles API errors |
| `UsersTable` | Renders user list, search filters work, pagination works |
| `DriversTable` | Renders driver list, status badges display correctly, filter by status works |
| `DriverDetail` | Renders driver info, approve/suspend buttons work, shows confirmation dialog |
| `RidesTable` | Renders ride list, status filter works, click navigates to detail |
| `RideDetail` | Renders all ride info sections (passenger, driver, route, fare, rating) |
| `Sidebar` | All navigation links render and navigate correctly |
| `ProtectedRoute` | Redirects to login when not authenticated |

**Example Test:**

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';

describe('LoginPage', () => {
  it('renders login form', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('shows error on invalid credentials', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@test.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
```

### 3.3 API Mocking with MSW

```javascript
// src/test/handlers.js
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/v1/auth/login/', async ({ request }) => {
    const body = await request.json();
    if (body.email === 'admin@test.com' && body.password === 'testpass') {
      return HttpResponse.json({
        success: true,
        data: {
          access: 'fake-access-token',
          refresh: 'fake-refresh-token',
          user: { id: '1', full_name: 'Admin', role: 'ADMIN' },
        },
      });
    }
    return HttpResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.get('/api/v1/admin/dashboard/', () => {
    return HttpResponse.json({
      success: true,
      data: {
        total_passengers: 1000,
        total_drivers: 250,
        active_drivers: 75,
        total_rides: 5000,
        active_rides: 20,
      },
    });
  }),
];
```

### 3.4 Running Tests

```bash
# Run all tests
npx vitest

# Run in watch mode
npx vitest --watch

# Run with coverage
npx vitest --coverage

# Run specific file
npx vitest src/pages/__tests__/LoginPage.test.jsx
```

---

## 4. Mobile App Testing (Expo)

### 4.1 Test Setup

Both `passenger-app/` and `driver-app/` use the same testing approach.

**Dependencies:**

```json
{
  "devDependencies": {
    "@testing-library/react-native": "^12.0.0",
    "@testing-library/jest-native": "^5.0.0",
    "jest": "^29.0.0",
    "jest-expo": "^50.0.0"
  }
}
```

**Jest Config (`package.json`):**

```json
{
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterSetup": ["@testing-library/jest-native/extend-expect"],
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)"
    ]
  }
}
```

### 4.2 What to Test

| Screen | Tests |
|---|---|
| Splash Screen | Renders logo, checks for stored token, navigates correctly |
| Login Screen | Renders form, validates input, calls login API, stores token |
| Register Screen | Renders all fields, validates input, calls register API |
| Home Screen | Renders map, shows location inputs, Book Ride button state |
| Fare Estimate | Displays fare, distance, duration after API response |
| Ride Tracking | Displays correct status, shows driver info, cancel button visibility |
| Rating Screen | Star selector works, submit sends correct data |
| Ride History | Renders ride list, shows correct status badges |
| Profile Screen | Displays user data, edit and logout buttons work |

### 4.3 Device & Emulator Testing

| Platform | Tool | Steps |
|---|---|---|
| Android Emulator | Android Studio Emulator | `npx expo start --android` |
| Physical Android | Expo Go / Dev Build | Scan QR code from `npx expo start` |
| Web (for quick checks) | Browser | `npx expo start --web` |

**Physical Device Testing Checklist:**

- [ ] GPS location permission prompt appears
- [ ] Map loads and centers on current location
- [ ] App handles location permission denial gracefully
- [ ] Network requests work on mobile data
- [ ] App handles offline state (shows error, retries)
- [ ] Keyboard doesn't overlap input fields
- [ ] Scrolling works on all screens
- [ ] Back button behaves correctly
- [ ] App survives backgrounding and foregrounding
- [ ] Push notifications work (when implemented)

### 4.4 Running Tests

```bash
# Run all tests
npx jest

# Run in watch mode
npx jest --watch

# Run with coverage
npx jest --coverage

# Run specific test file
npx jest __tests__/LoginScreen.test.js
```

---

## 5. Manual Testing Checklist

### 5.1 Authentication Flow

- [ ] **Passenger Register:** Fill all fields → successful registration → redirect to login
- [ ] **Passenger Register:** Submit with empty fields → shows validation errors
- [ ] **Passenger Register:** Duplicate email → shows "email already exists" error
- [ ] **Passenger Login:** Valid credentials → redirect to home
- [ ] **Passenger Login:** Invalid credentials → shows error message
- [ ] **Driver Register:** Fill all fields including license → successful registration
- [ ] **Driver Login:** Valid credentials → shows pending approval (if not approved)
- [ ] **Driver Login:** Approved driver → shows home screen
- [ ] **Admin Login:** Valid admin credentials → dashboard loads
- [ ] **Logout:** Token cleared, redirect to login, cannot access protected pages

### 5.2 Passenger App Flow

- [ ] **Home Screen:** Map loads, current location marker visible
- [ ] **Home Screen:** Tap "Where to?" → destination search works
- [ ] **Fare Estimate:** After destination selected, shows fare, distance, duration
- [ ] **Book Ride:** Confirm booking → ride created, navigates to tracking
- [ ] **Ride Tracking:** Status updates appear correctly
- [ ] **Ride Tracking:** Driver info card shows correct data
- [ ] **Ride Tracking:** Cancel ride works (before driver arrives)
- [ ] **Ride Tracking:** Cancel button hidden after driver arrives
- [ ] **Rating:** Stars are tappable, submit works
- [ ] **Rating:** Skip option returns to home
- [ ] **Ride History:** All past rides appear with correct info
- [ ] **Profile:** Shows current user data
- [ ] **Edit Profile:** Update name/phone → changes saved

### 5.3 Driver App Flow

- [ ] **Pending Approval:** New driver sees pending screen after login
- [ ] **Pending Approval:** "Check Status" button refreshes approval state
- [ ] **Home Screen:** Online/Offline toggle works
- [ ] **Home Screen:** Location updates sent when online
- [ ] **Ride Request:** Popup appears when request arrives
- [ ] **Ride Request:** Accept button → navigates to active ride
- [ ] **Ride Request:** Reject button → popup dismissed
- [ ] **Ride Request:** Timer expires → auto-reject
- [ ] **Active Ride:** Status buttons progress correctly (Arriving → Arrived → Start → Complete)
- [ ] **Active Ride:** Passenger info visible
- [ ] **Earnings:** Today's earnings, total earnings, ride count shown
- [ ] **Ride History:** Completed rides listed with correct data
- [ ] **Vehicle Management:** Add vehicle → appears in list
- [ ] **Vehicle Management:** Edit vehicle → changes saved
- [ ] **Vehicle Management:** Delete vehicle → removed from list (with confirmation)

### 5.4 Admin Dashboard Flow

- [ ] **Login:** Admin credentials → dashboard loads
- [ ] **Dashboard:** Stat cards show correct numbers
- [ ] **Dashboard:** Charts render with data
- [ ] **Users:** User list loads with pagination
- [ ] **Users:** Search filters work correctly
- [ ] **Drivers:** Driver list loads with status badges
- [ ] **Drivers:** Filter by approval status works
- [ ] **Driver Detail:** All driver info visible
- [ ] **Driver Detail:** Approve button → driver status changes to approved
- [ ] **Driver Detail:** Suspend button → driver status changes to suspended
- [ ] **Driver Detail:** Confirmation dialog before approve/suspend
- [ ] **Rides:** Ride list loads with status filter
- [ ] **Ride Detail:** All ride info visible (passenger, driver, route, fare, rating)
- [ ] **Navigation:** All sidebar links work
- [ ] **Responsive:** Dashboard works on tablet-width screens

### 5.5 End-to-End Full Ride Flow

Perform this complete test manually across all apps:

1. [ ] Register a passenger (Passenger App)
2. [ ] Register a driver (Driver App)
3. [ ] Login as admin (Admin Dashboard) → approve the driver
4. [ ] Login as driver (Driver App) → go online
5. [ ] Login as passenger (Passenger App) → select destination → get fare estimate
6. [ ] Passenger confirms booking → ride created
7. [ ] Driver receives ride request popup → accepts
8. [ ] Driver progresses through statuses: Arriving → Arrived → Start → Complete
9. [ ] Passenger sees status updates on tracking screen
10. [ ] Ride completes → passenger sees rating screen → submits 5-star rating
11. [ ] Driver earnings update with the completed ride
12. [ ] Both passenger and driver see the ride in history
13. [ ] Admin can see the ride with all details in the rides list

---

## 6. CI/CD Testing Pipeline

### 6.1 Recommended Pipeline (GitHub Actions)

```yaml
# .github/workflows/test.yml

name: destiny CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # ─────────────────────────────────────────
  # Backend Tests
  # ─────────────────────────────────────────
  backend-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
          POSTGRES_DB: destiny_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-django pytest-cov

      - name: Run migrations
        run: |
          cd backend
          python manage.py migrate
        env:
          DATABASE_URL: postgres://test_user:test_pass@localhost:5432/destiny_test

      - name: Run tests
        run: |
          cd backend
          python -m pytest --cov=. --cov-report=xml
        env:
          DATABASE_URL: postgres://test_user:test_pass@localhost:5432/destiny_test
          DJANGO_SETTINGS_MODULE: destiny.settings
          SECRET_KEY: test-secret-key-for-ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: backend/coverage.xml

  # ─────────────────────────────────────────
  # Admin Dashboard Tests
  # ─────────────────────────────────────────
  admin-dashboard-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: |
          cd admin-dashboard
          npm ci

      - name: Run linter
        run: |
          cd admin-dashboard
          npx eslint src/

      - name: Run tests
        run: |
          cd admin-dashboard
          npx vitest --run --coverage

  # ─────────────────────────────────────────
  # Mobile App Tests
  # ─────────────────────────────────────────
  mobile-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: [passenger-app, driver-app]

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: |
          cd ${{ matrix.app }}
          npm ci

      - name: Run tests
        run: |
          cd ${{ matrix.app }}
          npx jest --coverage --ci
```

### 6.2 Pipeline Stages Summary

```text
┌────────────────┐
│   Push / PR    │
└───────┬────────┘
        │
        ▼
┌────────────────────────────────────────────────────┐
│                 Run in Parallel                     │
│                                                     │
│  ┌──────────────┐  ┌──────────┐  ┌──────────────┐  │
│  │   Backend    │  │  Admin   │  │  Mobile Apps  │  │
│  │   Tests      │  │  Tests   │  │  Tests        │  │
│  │              │  │          │  │               │  │
│  │  pytest      │  │  vitest  │  │  jest-expo    │  │
│  │  coverage    │  │  eslint  │  │  (both apps)  │  │
│  └──────┬───────┘  └────┬─────┘  └───────┬───────┘  │
│         │               │               │           │
│         ▼               ▼               ▼           │
│  ┌──────────────────────────────────────────────┐   │
│  │         All Checks Must Pass                 │   │
│  └──────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────┐
│  Merge / Deploy│
└────────────────┘
```

### 6.3 Coverage Targets

| Component | Minimum Coverage |
|---|---|
| Backend (Django) | 80% |
| Admin Dashboard (React) | 70% |
| Passenger App (React Native) | 60% |
| Driver App (React Native) | 60% |

---

*Document Version: 1.0*
*Project: destiny Ride-Booking Platform*

