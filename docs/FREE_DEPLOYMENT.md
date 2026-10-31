# Free Deployment Strategy

## Important Note
Free tiers are suitable for an MVP, college project, prototype, or small demonstration. Free-tier availability and limits can change.

## 1. Passenger App
### Technology
- React Native
- Expo

Deployment flow:
```text
Develop App
    ↓
Test on Android Device
    ↓
Create Release Build
    ↓
Test Release
    ↓
Submit to Amazon Appstore
```

## 2. Driver App
The driver application is a separate React Native + Expo application.

```text
RideX Passenger App
RideX Driver App
```

Both applications can be packaged and submitted separately to the Amazon Appstore.

## 3. Admin Dashboard
Recommended stack:
- React
- Vite

Possible free hosting:
- Vercel
- Netlify

Deployment:
```text
GitHub Repository
       ↓
Vercel / Netlify
       ↓
Live Admin Dashboard
```

## 4. Django Backend
The Django REST API can be deployed on a hosting provider that offers a suitable free tier.

```text
GitHub
   ↓
Hosting Platform
   ↓
Django REST API
```

Consider:
- Free services may sleep during inactivity.
- WebSocket support may be limited.
- Resource limits may affect real-time tracking.

## 5. Database
### Supabase
Use:
- Supabase PostgreSQL
- Supabase Storage
- Supabase Realtime

## Final Deployment Architecture
```text
Amazon Appstore
      │
      ├── RideX Passenger App
      └── RideX Driver App
               │
               ▼
        Django REST API
               │
               ▼
     Supabase PostgreSQL
        │        │
        ▼        ▼
     Storage   Realtime

Admin Dashboard
      │
      ▼
Vercel / Netlify
      │
      ▼
Django REST API
```

## Cost Strategy
### MVP / College Project
Use free tiers where available.

### Production Application
Eventually consider paid infrastructure for:
- Always-on backend services
- Reliable real-time GPS tracking
- Push notifications
- Maps and routing
- Security and monitoring
- Higher database capacity
