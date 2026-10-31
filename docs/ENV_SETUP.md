# destiny Environment Variables Setup

This document describes every environment variable required to run the destiny platform across all four applications: the Django backend, the React admin dashboard, the React Native passenger app, and the React Native driver app.

---

## 1. Backend (Django + DRF)

Create a `.env` file in the root of the Django project directory.

### Required Variables

| Variable | Description | Example |
|---|---|---|
| `SECRET_KEY` | Django secret key for cryptographic signing | `django-insecure-abc123xyz...` |
| `DEBUG` | Enable debug mode (`True` for dev, `False` for production) | `True` |
| `DATABASE_URL` | Supabase PostgreSQL connection string | `postgresql://postgres.<ref>:<password>@aws-0-ap-south-1.pooler.supabase.com:6543/postgres` |
| `SUPABASE_URL` | Supabase project URL | `https://xyzabcdef.supabase.co` |
| `SUPABASE_KEY` | Supabase anon/public key | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | `eyJhbGciOiJIUzI1NiIs...` |
| `ALLOWED_HOSTS` | Comma-separated list of allowed hostnames | `localhost,127.0.0.1,your-domain.com` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | `http://localhost:5173,https://admin.your-domain.com` |

### JWT Settings

| Variable | Description | Example |
|---|---|---|
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | Access token expiry in minutes | `60` |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS` | Refresh token expiry in days | `7` |
| `JWT_SIGNING_KEY` | Custom JWT signing key (defaults to `SECRET_KEY` if not set) | `your-jwt-signing-key` |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |

### Optional Variables

| Variable | Description | Example |
|---|---|---|
| `DJANGO_SETTINGS_MODULE` | Django settings module path | `destiny.settings` |
| `DJANGO_LOG_LEVEL` | Logging level | `DEBUG` |
| `RATE_LIMIT_PER_MINUTE` | API rate limit per minute per user | `60` |

### Backend `.env.example`

```env
# ==============================================
# destiny Backend Environment Variables
# ==============================================

# Django Core
SECRET_KEY=django-insecure-change-this-to-a-real-secret-key
DEBUG=True
DJANGO_SETTINGS_MODULE=destiny.settings
DJANGO_LOG_LEVEL=DEBUG

# Allowed Hosts & CORS
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

# Supabase
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# JWT Authentication
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7
JWT_SIGNING_KEY=
JWT_ALGORITHM=HS256

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
```

---

## 2. Admin Dashboard (React + Vite)

Create a `.env` file in the root of the admin dashboard project directory.

> **Note:** Vite requires environment variables to be prefixed with `VITE_` to be exposed to client-side code.

### Required Variables

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api/v1` |

### Optional Variables

| Variable | Description | Example |
|---|---|---|
| `VITE_APP_NAME` | Application display name | `destiny Admin` |
| `VITE_APP_ENV` | Current environment | `development` |

### Admin Dashboard `.env.example`

```env
# ==============================================
# destiny Admin Dashboard Environment Variables
# ==============================================

# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1

# App Settings
VITE_APP_NAME=destiny Admin
VITE_APP_ENV=development
```

---

## 3. Passenger App (React Native + Expo)

Create a `.env` file in the root of the passenger app directory. Use a library such as `react-native-dotenv` or Expo's built-in `app.config.js` to load variables.

### Required Variables

| Variable | Description | Example |
|---|---|---|
| `API_BASE_URL` | Backend API base URL | `http://192.168.1.100:8000/api/v1` |
| `MAPS_API_KEY` | Maps provider API key (e.g., Google Maps or Mapbox) | `AIzaSyD...` |

### Optional Variables

| Variable | Description | Example |
|---|---|---|
| `SUPABASE_URL` | Supabase project URL (if using Realtime directly) | `https://xyzabcdef.supabase.co` |
| `SUPABASE_KEY` | Supabase anon key (if using Realtime directly) | `eyJhbGciOiJIUzI1NiIs...` |
| `APP_ENV` | Current environment | `development` |
| `SENTRY_DSN` | Sentry error tracking DSN | `https://abc@sentry.io/123` |

### Passenger App `.env.example`

```env
# ==============================================
# destiny Passenger App Environment Variables
# ==============================================

# API Configuration
# Use your machine's local IP (not localhost) for physical device testing
API_BASE_URL=http://192.168.1.100:8000/api/v1

# Maps
MAPS_API_KEY=your-maps-api-key

# Supabase Realtime (optional — for direct client subscriptions)
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# App Settings
APP_ENV=development
```

> **Tip:** When testing on a physical device or emulator, use your development machine's LAN IP address (e.g., `192.168.1.100`) instead of `localhost` for `API_BASE_URL`.

---

## 4. Driver App (React Native + Expo)

Create a `.env` file in the root of the driver app directory.

### Required Variables

| Variable | Description | Example |
|---|---|---|
| `API_BASE_URL` | Backend API base URL | `http://192.168.1.100:8000/api/v1` |
| `MAPS_API_KEY` | Maps provider API key (e.g., Google Maps or Mapbox) | `AIzaSyD...` |

### Optional Variables

| Variable | Description | Example |
|---|---|---|
| `SUPABASE_URL` | Supabase project URL (if using Realtime directly) | `https://xyzabcdef.supabase.co` |
| `SUPABASE_KEY` | Supabase anon key (if using Realtime directly) | `eyJhbGciOiJIUzI1NiIs...` |
| `LOCATION_UPDATE_INTERVAL_MS` | GPS location push interval in milliseconds | `5000` |
| `APP_ENV` | Current environment | `development` |
| `SENTRY_DSN` | Sentry error tracking DSN | `https://abc@sentry.io/123` |

### Driver App `.env.example`

```env
# ==============================================
# destiny Driver App Environment Variables
# ==============================================

# API Configuration
# Use your machine's local IP (not localhost) for physical device testing
API_BASE_URL=http://192.168.1.100:8000/api/v1

# Maps
MAPS_API_KEY=your-maps-api-key

# Supabase Realtime (optional — for direct client subscriptions)
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# Driver-Specific
LOCATION_UPDATE_INTERVAL_MS=5000

# App Settings
APP_ENV=development
```

---

## 5. Security Best Practices

### Never Commit `.env` Files

Add the following entries to every `.gitignore` in the project:

```gitignore
# Environment variables
.env
.env.local
.env.*.local
```

### What to Commit

- ✅ `.env.example` — Template with placeholder values (no real secrets)
- ❌ `.env` — **Never commit** actual environment files

### Secret Management Rules

| Rule | Details |
|---|---|
| **Never hardcode secrets** | Always read from environment variables at runtime |
| **Rotate keys regularly** | Especially `SECRET_KEY`, `JWT_SIGNING_KEY`, and Supabase keys |
| **Use different keys per environment** | Development, staging, and production must each have unique secrets |
| **Restrict `SUPABASE_SERVICE_ROLE_KEY`** | Only the backend should have access; never expose to any client app |
| **Set `DEBUG=False` in production** | Debug mode leaks sensitive information in error pages |
| **Limit `ALLOWED_HOSTS`** | Only include actual production domains |
| **Limit `CORS_ALLOWED_ORIGINS`** | Only include the actual admin dashboard and app origins |

### Production Recommendations

1. **Use a secrets manager** — Store production secrets in a service like Google Secret Manager, AWS Secrets Manager, or HashiCorp Vault instead of `.env` files on disk.
2. **Set environment variables at the platform level** — Use your hosting provider's environment variable configuration (Railway, Render, Vercel, etc.) rather than deploying `.env` files.
3. **Audit access** — Limit who can view or modify production environment variables.
4. **Enable HTTPS** — Always serve the production API over HTTPS. Set `CORS_ALLOWED_ORIGINS` to `https://` URLs only.

---

## 6. Quick Reference

```text
destiny/
├── backend/
│   ├── .env              ← Django secrets (DO NOT COMMIT)
│   └── .env.example      ← Template (safe to commit)
├── admin-dashboard/
│   ├── .env              ← Vite env vars (DO NOT COMMIT)
│   └── .env.example      ← Template (safe to commit)
├── passenger-app/
│   ├── .env              ← Expo env vars (DO NOT COMMIT)
│   └── .env.example      ← Template (safe to commit)
└── driver-app/
    ├── .env              ← Expo env vars (DO NOT COMMIT)
    └── .env.example      ← Template (safe to commit)
```
