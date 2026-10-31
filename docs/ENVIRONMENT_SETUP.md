# Environment Setup Guide

> This guide walks you through setting up your development environment before writing any code for the Destiny project.

---

## 1. Required Software

Install the following tools on your machine:

### 1.1 — Git
- Download: https://git-scm.com/downloads
- Verify: `git --version`

### 1.2 — Python (3.11 or higher)
- Download: https://www.python.org/downloads/
- During install: ✅ Check "Add Python to PATH"
- Verify: `python --version`

### 1.3 — Node.js (LTS version)
- Download: https://nodejs.org/
- Includes npm automatically
- Verify:
  ```bash
  node --version
  npm --version
  ```

### 1.4 — Visual Studio Code
- Download: https://code.visualstudio.com/
- Recommended Extensions:
  - Python
  - Pylance
  - Django
  - ESLint
  - Prettier
  - React Native Tools
  - Tailwind CSS IntelliSense
  - GitLens

### 1.5 — Postman
- Download: https://www.postman.com/downloads/
- Used for testing Django REST APIs

### 1.6 — Expo Go (Mobile App)
- Install **Expo Go** on your Android phone from the Play Store
- Used to test React Native apps on a real device

---

## 2. Backend (Django) Setup

### Step 1 — Create backend folder
```bash
cd destiny
mkdir backend
cd backend
```

### Step 2 — Create Python Virtual Environment
```bash
python -m venv venv
```

### Step 3 — Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

> You should see `(venv)` in your terminal — this means the environment is active.

### Step 4 — Install Python Packages
```bash
pip install django
pip install djangorestframework
pip install djangorestframework-simplejwt
pip install django-cors-headers
pip install psycopg2-binary
pip install python-decouple
```

### Step 5 — Save Dependencies
```bash
pip freeze > requirements.txt
```

### Step 6 — Initialize Django Project
```bash
django-admin startproject destiny .
```

### Step 7 — Create .env File
Create a `.env` file inside `backend/`:
```env
SECRET_KEY=your-django-secret-key
DEBUG=True
DB_NAME=your-supabase-db-name
DB_USER=your-supabase-db-user
DB_PASSWORD=your-supabase-db-password
DB_HOST=your-supabase-db-host
DB_PORT=5432
```

> Never commit `.env` to Git. Add it to `.gitignore`.

### Step 8 — Test Django Setup
```bash
python manage.py runserver
```
Open: http://127.0.0.1:8000 — You should see the Django welcome page.

---

## 3. Admin Dashboard Setup

### Step 1 — Create admin-dashboard folder
```bash
cd destiny
mkdir admin-dashboard
cd admin-dashboard
```

### Step 2 — Initialize Vite + React Project
```bash
npm create vite@latest . -- --template react
```

### Step 3 — Install Dependencies
```bash
npm install
npm install axios
npm install react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 4 — Configure Tailwind CSS
In `tailwind.config.js`:
```js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

In `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 5 — Create .env File
Create `.env` inside `admin-dashboard/`:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

### Step 6 — Run Admin Dashboard
```bash
npm run dev
```
Open: http://localhost:5173

---

## 4. Passenger App Setup

### Step 1 — Install Expo CLI
```bash
npm install -g expo-cli
```

### Step 2 — Create passenger-app folder
```bash
cd destiny
npx create-expo-app passenger-app
cd passenger-app
```

### Step 3 — Install Dependencies
```bash
npm install axios
npm install @react-native-async-storage/async-storage
npm install expo-location
npm install react-native-maps
npx expo install expo-router
```

### Step 4 — Create .env File
Create `.env` inside `passenger-app/`:
```env
EXPO_PUBLIC_API_BASE_URL=http://YOUR_LOCAL_IP:8000/api/v1
```

> Use your PC's local IP (e.g. `192.168.1.5`) — NOT `localhost` — so your phone can reach the backend.

### Step 5 — Run Passenger App
```bash
npx expo start
```
Scan the QR code with **Expo Go** on your Android phone.

---

## 5. Driver App Setup

### Step 1 — Create driver-app folder
```bash
cd destiny
npx create-expo-app driver-app
cd driver-app
```

### Step 2 — Install Dependencies
```bash
npm install axios
npm install @react-native-async-storage/async-storage
npm install expo-location
npm install react-native-maps
npx expo install expo-router
```

### Step 3 — Create .env File
```env
EXPO_PUBLIC_API_BASE_URL=http://YOUR_LOCAL_IP:8000/api/v1
```

### Step 4 — Run Driver App
```bash
npx expo start
```

---

## 6. Supabase Setup

### Step 1 — Create Supabase Account
- Go to: https://supabase.com/
- Sign up with GitHub or email

### Step 2 — Create New Project
- Click "New Project"
- Enter project name: `destiny`
- Set a strong database password
- Choose a region close to you

### Step 3 — Get Database Credentials
- Go to: Project Settings → Database
- Copy:
  - Host
  - Database name
  - Username
  - Password
  - Port (5432)

### Step 4 — Add to Django .env
```env
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-supabase-password
DB_HOST=db.your-project-ref.supabase.co
DB_PORT=5432
```

---

## 7. Running All Services Together

Open **4 separate terminals** and run:

```bash
# Terminal 1 — Django Backend
cd destiny/backend
venv\Scripts\activate
python manage.py runserver

# Terminal 2 — Admin Dashboard
cd destiny/admin-dashboard
npm run dev

# Terminal 3 — Passenger App
cd destiny/passenger-app
npx expo start

# Terminal 4 — Driver App
cd destiny/driver-app
npx expo start
```

---

## 8. .gitignore Setup

Create a `.gitignore` in the root `destiny/` folder:

```gitignore
# Python
backend/venv/
backend/__pycache__/
backend/*.pyc
backend/.env

# Node
admin-dashboard/node_modules/
passenger-app/node_modules/
driver-app/node_modules/
admin-dashboard/.env
passenger-app/.env
driver-app/.env

# Expo
passenger-app/.expo/
driver-app/.expo/

# OS
.DS_Store
Thumbs.db
```

---

## 9. Verify Everything Works

| Service | URL / Command | Expected Result |
|---|---|---|
| Django Backend | http://127.0.0.1:8000 | Django welcome page |
| Admin Dashboard | http://localhost:5173 | React app loads |
| Passenger App | Expo QR scan | App loads on phone |
| Driver App | Expo QR scan | App loads on phone |
| Supabase | Dashboard online | DB connected |

---

*Document Version: 1.0*
*Project: Destiny Ride-Booking Platform*

