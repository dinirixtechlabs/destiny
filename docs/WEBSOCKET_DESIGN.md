# destiny WebSocket & Real-Time Design

This document describes the real-time communication architecture for the destiny platform, covering driver location tracking, ride status updates, and ride request broadcasting.

---

## 1. Overview

The following features require real-time updates:

| Feature | Description | Direction |
|---|---|---|
| **Driver Location Tracking** | Passenger sees driver moving on the map in real time | Driver → Server → Passenger |
| **Ride Status Updates** | Both passenger and driver receive instant status changes (accepted, arriving, in-progress, completed, cancelled) | Server → Passenger / Driver |
| **Ride Requests to Drivers** | Nearby online drivers receive new ride requests instantly | Server → Driver(s) |
| **Admin Live Dashboard** | Admin sees active rides and online drivers update in real time | Server → Admin |

### Primary Approach: Supabase Realtime

destiny uses **Supabase Realtime** as its primary real-time transport. Supabase Realtime provides managed WebSocket channels built on top of Phoenix Channels, eliminating the need for self-hosted WebSocket infrastructure.

### Alternative Approach: Django Channels

If the project outgrows Supabase Realtime or requires server-side WebSocket logic, **Django Channels** can be used as a drop-in replacement (see Section 5).

---

## 2. Supabase Realtime Channels Design

Supabase Realtime supports two models:

- **Broadcast** — Send arbitrary JSON messages to all subscribers of a channel (ephemeral, not persisted).
- **Postgres Changes** — Subscribe to INSERT/UPDATE/DELETE events on database tables.

destiny uses **Broadcast** for ephemeral events (location pings, ride requests) and **Postgres Changes** for persistent state transitions (ride status).

### 2.1 Channel Naming Convention

```text
destiny:<resource>:<identifier>
```

| Channel Name | Purpose | Subscribers |
|---|---|---|
| `destiny:ride:{ride_id}` | Status updates and location for a specific ride | Passenger, assigned Driver |
| `destiny:driver:{driver_id}:requests` | New ride requests pushed to a specific driver | Driver |
| `destiny:driver:{driver_id}:location` | Driver location stream | Passenger (during active ride) |
| `destiny:admin:dashboard` | Aggregate live stats for admin | Admin dashboard |

### 2.2 Events & Payload Formats

#### Driver Location Update

Sent by the driver app every 3–5 seconds during an active ride.

- **Channel:** `destiny:driver:{driver_id}:location`
- **Event:** `location_update`
- **Delivery:** Broadcast

```json
{
  "event": "location_update",
  "payload": {
    "driver_id": "uuid",
    "latitude": 19.3149,
    "longitude": 84.7941,
    "heading": 135.0,
    "speed_kmh": 42.5,
    "timestamp": "2025-06-15T10:30:00Z"
  }
}
```

#### Ride Status Update

Triggered by the backend when ride status changes in the database.

- **Channel:** `destiny:ride:{ride_id}`
- **Event:** `status_update`
- **Delivery:** Postgres Changes (on `rides` table UPDATE) or Broadcast

```json
{
  "event": "status_update",
  "payload": {
    "ride_id": "uuid",
    "previous_status": "SEARCHING_DRIVER",
    "status": "ACCEPTED",
    "driver": {
      "id": "uuid",
      "full_name": "Driver Name",
      "phone": "9876543210",
      "rating": 4.8,
      "vehicle": {
        "vehicle_number": "OD-07-AB-1234",
        "vehicle_model": "Swift Dzire",
        "vehicle_color": "White"
      }
    },
    "timestamp": "2025-06-15T10:31:00Z"
  }
}
```

#### New Ride Request (to Driver)

Sent when a nearby driver should receive a ride request.

- **Channel:** `destiny:driver:{driver_id}:requests`
- **Event:** `new_ride_request`
- **Delivery:** Broadcast

```json
{
  "event": "new_ride_request",
  "payload": {
    "ride_id": "uuid",
    "passenger": {
      "full_name": "John Doe",
      "rating": 4.5
    },
    "pickup_address": "Pickup Location",
    "pickup_latitude": 19.3149,
    "pickup_longitude": 84.7941,
    "destination_address": "Destination Location",
    "estimated_fare": 250,
    "estimated_distance_km": 10.5,
    "expires_at": "2025-06-15T10:31:30Z"
  }
}
```

#### Admin Dashboard Update

Periodic aggregate pushed to admin listeners.

- **Channel:** `destiny:admin:dashboard`
- **Event:** `stats_update`
- **Delivery:** Broadcast

```json
{
  "event": "stats_update",
  "payload": {
    "active_rides": 20,
    "online_drivers": 75,
    "total_passengers_today": 340,
    "timestamp": "2025-06-15T10:32:00Z"
  }
}
```

---

## 3. Postgres Changes (Database-Driven Events)

Supabase Realtime can listen directly to Postgres row changes. This is useful for ride status transitions because the source of truth is the database.

### Enable Realtime on Tables

In the Supabase dashboard, enable Realtime for the following tables:

- `rides` — Listen for `UPDATE` events on the `status` column.

### Subscription Filter

Clients subscribe with a filter so they only receive events for their own ride:

```text
Table: rides
Event: UPDATE
Filter: id=eq.{ride_id}
```

### Example: Ride Status via Postgres Changes

When the backend updates a ride's status:

```sql
UPDATE rides SET status = 'ACCEPTED', driver_id = '...' WHERE id = '...';
```

Supabase Realtime automatically pushes the change to all subscribers of the `rides` table filtered by that `id`.

---

## 4. Client-Side Subscription Patterns (React Native)

### 4.1 Supabase Client Setup

```javascript
// lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
```

### 4.2 Subscribe to Ride Status Updates

```javascript
import { useEffect } from "react";
import { supabase } from "../lib/supabase";

function useRideStatusSubscription(rideId, onStatusChange) {
  useEffect(() => {
    if (!rideId) return;

    const channel = supabase
      .channel(`destiny:ride:${rideId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rides",
          filter: `id=eq.${rideId}`,
        },
        (payload) => {
          onStatusChange(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [rideId]);
}
```

### 4.3 Subscribe to Driver Location (Broadcast)

```javascript
function useDriverLocationSubscription(driverId, onLocationUpdate) {
  useEffect(() => {
    if (!driverId) return;

    const channel = supabase
      .channel(`destiny:driver:${driverId}:location`)
      .on("broadcast", { event: "location_update" }, (message) => {
        onLocationUpdate(message.payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverId]);
}
```

### 4.4 Send Driver Location (Broadcast)

```javascript
async function sendDriverLocation(driverId, location) {
  const channel = supabase.channel(`destiny:driver:${driverId}:location`);

  await channel.subscribe();

  channel.send({
    type: "broadcast",
    event: "location_update",
    payload: {
      driver_id: driverId,
      latitude: location.latitude,
      longitude: location.longitude,
      heading: location.heading,
      speed_kmh: location.speed,
      timestamp: new Date().toISOString(),
    },
  });
}
```

### 4.5 Subscribe to New Ride Requests (Driver App)

```javascript
function useRideRequestSubscription(driverId, onNewRequest) {
  useEffect(() => {
    if (!driverId) return;

    const channel = supabase
      .channel(`destiny:driver:${driverId}:requests`)
      .on("broadcast", { event: "new_ride_request" }, (message) => {
        onNewRequest(message.payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverId]);
}
```

---

## 5. Alternative: Django Channels (WebSocket Server)

If destiny needs server-side WebSocket logic — for example, to enforce authentication or business rules on the WebSocket layer — Django Channels can replace or supplement Supabase Realtime.

### 5.1 Architecture

```text
Client (React Native)
    │
    ▼  WebSocket (wss://)
ASGI Server (Daphne / Uvicorn)
    │
    ▼
Django Channels
    │
    ├── Channel Layer (Redis)
    │
    └── Consumers (WebSocket handlers)
```

### 5.2 Dependencies

```text
channels
channels-redis
daphne
```

### 5.3 Routing

```python
# routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/ride/(?P<ride_id>[0-9a-f-]+)/$", consumers.RideConsumer.as_asgi()),
    re_path(r"ws/driver/(?P<driver_id>[0-9a-f-]+)/location/$", consumers.DriverLocationConsumer.as_asgi()),
    re_path(r"ws/driver/(?P<driver_id>[0-9a-f-]+)/requests/$", consumers.RideRequestConsumer.as_asgi()),
]
```

### 5.4 Example Consumer

```python
# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class RideConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.ride_id = self.scope["url_route"]["kwargs"]["ride_id"]
        self.group_name = f"ride_{self.ride_id}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def ride_status_update(self, event):
        await self.send(text_data=json.dumps(event["data"]))
```

### 5.5 Sending from Django Views

```python
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def notify_ride_status(ride_id, data):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"ride_{ride_id}",
        {
            "type": "ride_status_update",
            "data": data,
        },
    )
```

### 5.6 When to Choose Django Channels Over Supabase Realtime

| Consideration | Supabase Realtime | Django Channels |
|---|---|---|
| **Setup complexity** | Minimal (managed) | Requires Redis + ASGI server |
| **Auth enforcement** | Client-side only | Server-side JWT validation in consumer |
| **Custom business logic** | Limited | Full Python logic in consumers |
| **Scaling** | Managed by Supabase | Self-managed (Redis pub/sub) |
| **Cost** | Included in Supabase plan | Additional infrastructure |
| **Postgres-driven events** | Native support | Requires manual triggers |

**Recommendation:** Start with Supabase Realtime. Migrate to Django Channels if the project requires server-enforced WebSocket authentication or complex real-time business logic.

---

## 6. Fallback Strategy (Polling)

If WebSocket connections are unavailable (network restrictions, proxy issues, or client compatibility), the apps must fall back to HTTP polling.

### 6.1 Polling Intervals

| Feature | Polling Endpoint | Interval | Notes |
|---|---|---|---|
| Ride status | `GET /api/v1/rides/{ride_id}/` | 5 seconds | During active ride only |
| Driver location | `GET /api/v1/locations/driver/{driver_id}/` | 3 seconds | During active ride only |
| Ride requests (driver) | `GET /api/v1/rides/requests/` | 5 seconds | While driver is online |
| Admin dashboard | `GET /api/v1/admin/dashboard/` | 15 seconds | While dashboard is open |

### 6.2 Fallback Detection

```javascript
// hooks/useRealtimeWithFallback.js
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

function useRealtimeWithFallback(channelName, config, fetchFallback, intervalMs) {
  const [connected, setConnected] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const channel = supabase
      .channel(channelName)
      .on(config.type, config.options, config.callback)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnected(true);
          // Stop polling when WebSocket connects
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      });

    // Start polling as immediate fallback
    intervalRef.current = setInterval(fetchFallback, intervalMs);
    fetchFallback(); // Initial fetch

    return () => {
      supabase.removeChannel(channel);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [channelName]);

  return connected;
}
```

### 6.3 Exponential Back-Off

If polling requests fail repeatedly, apply exponential back-off:

```text
Attempt 1: wait 3s
Attempt 2: wait 6s
Attempt 3: wait 12s
Attempt 4: wait 24s
Max:       wait 60s
```

This prevents overwhelming the backend during outages.

---

## 7. Data Flow Diagrams

### 7.1 Ride Lifecycle (Real-Time Events)

```text
Passenger                  Backend                    Driver
   │                         │                          │
   ├── POST /rides/ ────────►│                          │
   │                         ├── broadcast ────────────►│  new_ride_request
   │                         │                          │
   │                         │◄── POST /rides/{id}/accept/
   │  status_update ◄────────┤                          │
   │  (ACCEPTED)             │                          │
   │                         │                          │
   │  location_update ◄──────┼──── broadcast ───────────┤  (GPS every 3-5s)
   │                         │                          │
   │  status_update ◄────────┤──── POST /rides/{id}/status/
   │  (DRIVER_ARRIVING)      │                          │
   │                         │                          │
   │  status_update ◄────────┤──── POST /rides/{id}/status/
   │  (ARRIVED)              │                          │
   │                         │                          │
   │  status_update ◄────────┤──── POST /rides/{id}/status/
   │  (IN_PROGRESS)          │                          │
   │                         │                          │
   │  status_update ◄────────┤──── POST /rides/{id}/status/
   │  (COMPLETED)            │                          │
```

### 7.2 Driver Location Tracking Flow

```text
Driver App
    │
    ├── Read GPS (every 3-5s)
    │
    ├── POST /api/v1/locations/update/  ──► Backend (persist to DB)
    │
    └── Broadcast to channel            ──► Supabase Realtime
          destiny:driver:{id}:location        │
                                              ▼
                                        Passenger App
                                        (map update)
```

---

## 8. Implementation Checklist

- [ ] Enable Supabase Realtime on the `rides` table in the Supabase dashboard
- [ ] Install `@supabase/supabase-js` in the passenger and driver apps
- [ ] Implement `useRideStatusSubscription` hook in the passenger app
- [ ] Implement `useDriverLocationSubscription` hook in the passenger app
- [ ] Implement `sendDriverLocation` utility in the driver app
- [ ] Implement `useRideRequestSubscription` hook in the driver app
- [ ] Add broadcast trigger in the backend when ride requests are created
- [ ] Add broadcast trigger in the backend when ride status changes
- [ ] Implement polling fallback hooks for all real-time features
- [ ] Test WebSocket disconnect/reconnect behavior
- [ ] Test fallback polling under network restrictions
