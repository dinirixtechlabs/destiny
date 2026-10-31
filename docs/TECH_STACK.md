# Technology Stack

## 1. Passenger and Driver Mobile Apps
- **React Native**
- **Expo**
- JavaScript / TypeScript

## 2. Admin Dashboard
| Technology | Purpose |
|---|---|
| React | Frontend framework |
| Vite | Build tool |
| Tailwind CSS | UI styling |
| Axios | API communication |

## 3. Backend
| Technology | Purpose |
|---|---|
| Python | Programming language |
| Django | Backend framework |
| Django REST Framework | REST APIs |
| django-cors-headers | CORS support |

## 4. Database
### Supabase PostgreSQL
Used for:
- User data
- Driver data
- Vehicle information
- Ride information
- Ratings
- Payments

Additional services:
- Supabase Storage
- Supabase Realtime
- Supabase Authentication (optional)

## 5. Authentication
Recommended:
- JWT Authentication
- `djangorestframework-simplejwt`

## 6. Maps and Location
- GPS location services
- OpenStreetMap or another suitable mapping provider
- React Native compatible map library

## 7. Real-Time Communication
Recommended options:
- Supabase Realtime
- WebSockets
- Django Channels (if required)

## Final Stack
```text
Mobile Apps: React Native + Expo
Admin: React + Vite
Backend: Django + Django REST Framework
Database: Supabase PostgreSQL
Storage: Supabase Storage
Realtime: Supabase Realtime / WebSockets
Authentication: JWT
```
