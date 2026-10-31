# Database Design

## 1. Users Table

### `users`
| Field | Type |
|---|---|
| id | UUID |
| full_name | VARCHAR |
| email | VARCHAR |
| phone | VARCHAR |
| password | VARCHAR |
| role | VARCHAR |
| created_at | TIMESTAMP |

### Roles
- PASSENGER
- DRIVER
- ADMIN

## 2. Drivers Table

### `drivers`
| Field | Type |
|---|---|
| id | UUID |
| user_id | UUID |
| license_number | VARCHAR |
| is_approved | BOOLEAN |
| is_online | BOOLEAN |
| rating | DECIMAL |
| created_at | TIMESTAMP |

Relationship:
```text
User (1) ───── (1) Driver
```

## 3. Vehicles Table

### `vehicles`
| Field | Type |
|---|---|
| id | UUID |
| driver_id | UUID |
| vehicle_number | VARCHAR |
| vehicle_model | VARCHAR |
| vehicle_type | VARCHAR |
| vehicle_color | VARCHAR |
| created_at | TIMESTAMP |

## 4. Rides Table

### `rides`
| Field | Type |
|---|---|
| id | UUID |
| passenger_id | UUID |
| driver_id | UUID |
| pickup_address | TEXT |
| pickup_latitude | DECIMAL |
| pickup_longitude | DECIMAL |
| destination_address | TEXT |
| destination_latitude | DECIMAL |
| destination_longitude | DECIMAL |
| estimated_fare | DECIMAL |
| final_fare | DECIMAL |
| status | VARCHAR |
| requested_at | TIMESTAMP |
| completed_at | TIMESTAMP |

## 5. Driver Locations Table

### `driver_locations`
| Field | Type |
|---|---|
| id | UUID |
| driver_id | UUID |
| latitude | DECIMAL |
| longitude | DECIMAL |
| updated_at | TIMESTAMP |

## 6. Ratings Table

### `ratings`
| Field | Type |
|---|---|
| id | UUID |
| ride_id | UUID |
| passenger_id | UUID |
| driver_id | UUID |
| rating | INTEGER |
| review | TEXT |
| created_at | TIMESTAMP |

## 7. Suggested Payments Table

### `payments`
| Field | Type |
|---|---|
| id | UUID |
| ride_id | UUID |
| amount | DECIMAL |
| payment_method | VARCHAR |
| payment_status | VARCHAR |
| created_at | TIMESTAMP |

## Database Relationships
```text
Users
 │
 ├── Passenger
 │
 └── Driver ──── Vehicles

Passenger ──────┐
                ▼
              Rides
                ▲
Driver ─────────┘

Ride ─── Ratings
Ride ─── Payments
Driver ─── Driver Locations
```
