# Coding Standards

> This document defines the coding conventions and style rules for the Destiny project. Following these standards keeps the codebase clean, consistent, and easy to maintain.

---

## 1. General Rules (All Code)

- Use **English** for all variable names, function names, comments, and messages
- Keep functions **small and focused** — one function should do one thing
- Write **meaningful names** — avoid `x`, `temp`, `data1`, `foo`
- Add **comments** for complex logic — not for obvious things
- Never leave **dead code** — delete unused variables and functions
- Never **hardcode secrets** — use `.env` files
- Always handle **errors** — never ignore exceptions or errors

---

## 2. Django (Backend) Standards

### 2.1 — File & Folder Naming

| What | Convention | Example |
|---|---|---|
| App folders | lowercase, underscores | `authentication/`, `driver_locations/` |
| Python files | lowercase, underscores | `models.py`, `serializers.py` |
| Classes | PascalCase | `RideSerializer`, `DriverModel` |
| Functions | lowercase, underscores | `get_nearby_drivers()`, `calculate_fare()` |
| Variables | lowercase, underscores | `ride_id`, `driver_status` |
| Constants | UPPERCASE, underscores | `MAX_RIDE_DISTANCE`, `DEFAULT_FARE_PER_KM` |
| URL names | lowercase, hyphens | `register-driver`, `update-location` |

---

### 2.2 — Models

```python
# ✅ Good
class Ride(models.Model):
    REQUESTED = 'REQUESTED'
    SEARCHING_DRIVER = 'SEARCHING_DRIVER'
    ACCEPTED = 'ACCEPTED'
    IN_PROGRESS = 'IN_PROGRESS'
    COMPLETED = 'COMPLETED'
    CANCELLED = 'CANCELLED'

    STATUS_CHOICES = [
        (REQUESTED, 'Requested'),
        (SEARCHING_DRIVER, 'Searching Driver'),
        (ACCEPTED, 'Accepted'),
        (IN_PROGRESS, 'In Progress'),
        (COMPLETED, 'Completed'),
        (CANCELLED, 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    passenger = models.ForeignKey(User, on_delete=models.CASCADE, related_name='passenger_rides')
    driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=REQUESTED)
    requested_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-requested_at']

    def __str__(self):
        return f"Ride {self.id} - {self.status}"
```

- Always define `__str__` method
- Use `UUIDField` for primary keys
- Use `Meta` class for ordering
- Use `choices` for field enums
- Use descriptive `related_name`

---

### 2.3 — Serializers

```python
# ✅ Good
class RideCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ride
        fields = [
            'pickup_address',
            'pickup_latitude',
            'pickup_longitude',
            'destination_address',
            'destination_latitude',
            'destination_longitude',
        ]

    def validate_pickup_latitude(self, value):
        if not (-90 <= value <= 90):
            raise serializers.ValidationError("Invalid latitude value.")
        return value
```

- Always validate inputs in serializers
- Use separate serializers for create, update, and read
- Never expose password fields in response serializers

---

### 2.4 — Views

```python
# ✅ Good
class RideCreateView(generics.CreateAPIView):
    serializer_class = RideCreateSerializer
    permission_classes = [IsAuthenticated, IsPassenger]

    def perform_create(self, serializer):
        serializer.save(passenger=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            "success": True,
            "message": "Ride request created",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
```

- Use class-based views (CBV)
- Always define `permission_classes`
- Always return standard response format: `{ success, message, data }`
- Handle exceptions properly

---

### 2.5 — API Response Format

Always follow this format:

```python
# Success
return Response({
    "success": True,
    "message": "Descriptive success message",
    "data": serializer.data
}, status=status.HTTP_200_OK)

# Error
return Response({
    "success": False,
    "message": "Descriptive error message",
    "errors": serializer.errors
}, status=status.HTTP_400_BAD_REQUEST)
```

---

### 2.6 — URLs

```python
# ✅ Good — urls.py
urlpatterns = [
    path('rides/', RideListCreateView.as_view(), name='ride-list-create'),
    path('rides/<uuid:pk>/', RideDetailView.as_view(), name='ride-detail'),
    path('rides/<uuid:pk>/accept/', AcceptRideView.as_view(), name='ride-accept'),
    path('rides/<uuid:pk>/cancel/', CancelRideView.as_view(), name='ride-cancel'),
]
```

- Use kebab-case (hyphens) for URL paths
- Use `<uuid:pk>` for UUID primary keys
- Always set meaningful `name` for each URL

---

### 2.7 — Environment Variables

```python
# ✅ Good — settings.py using python-decouple
from decouple import config

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT', default='5432'),
    }
}
```

---

## 3. React (Admin Dashboard) Standards

### 3.1 — File & Folder Naming

| What | Convention | Example |
|---|---|---|
| Component files | PascalCase | `LoginPage.jsx`, `DriverTable.jsx` |
| Hook files | camelCase with `use` prefix | `useAuth.js`, `useDrivers.js` |
| Utility files | camelCase | `apiClient.js`, `formatDate.js` |
| CSS / style files | camelCase | `loginPage.module.css` |
| Folders | camelCase | `components/`, `pages/`, `hooks/` |

---

### 3.2 — Folder Structure

```
src/
├── api/              ← Axios API functions
│   ├── auth.js
│   ├── drivers.js
│   └── rides.js
├── components/       ← Reusable UI components
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   └── StatCard.jsx
├── pages/            ← Full pages
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── DriversPage.jsx
│   └── RidesPage.jsx
├── hooks/            ← Custom React hooks
│   └── useAuth.js
├── utils/            ← Helper functions
│   └── formatDate.js
├── App.jsx
└── main.jsx
```

---

### 3.3 — Component Rules

```jsx
// ✅ Good
const StatCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default StatCard;
```

- Use **functional components** only (no class components)
- Use **arrow functions**
- Always add `export default` at the bottom
- Keep components **small and reusable**
- Use **props** for passing data, not global variables

---

### 3.4 — API Calls

```js
// ✅ Good — src/api/drivers.js
import apiClient from './apiClient';

export const getAllDrivers = () => apiClient.get('/admin/drivers/');
export const approveDriver = (driverId) => apiClient.post(`/admin/drivers/${driverId}/approve/`);
export const suspendDriver = (driverId) => apiClient.post(`/admin/drivers/${driverId}/suspend/`);
```

```js
// ✅ Good — src/api/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

- Keep all API functions in `/api/` folder
- Never write `axios.get(...)` directly inside components
- Always use Axios interceptors to attach JWT token

---

## 4. React Native (Mobile Apps) Standards

### 4.1 — File & Folder Naming

| What | Convention | Example |
|---|---|---|
| Screen files | PascalCase | `LoginScreen.jsx`, `HomeScreen.jsx` |
| Component files | PascalCase | `RideCard.jsx`, `StatusBadge.jsx` |
| Hook files | camelCase with `use` | `useLocation.js`, `useAuth.js` |
| Utility files | camelCase | `storage.js`, `formatFare.js` |

---

### 4.2 — Folder Structure (Expo Router)

```
app/
├── (auth)/
│   ├── login.jsx
│   └── register.jsx
├── (tabs)/
│   ├── index.jsx       ← Home
│   ├── history.jsx
│   └── profile.jsx
├── ride/
│   ├── searching.jsx
│   ├── tracking.jsx
│   └── rating.jsx
└── _layout.jsx

components/
├── RideCard.jsx
├── DriverInfo.jsx
└── FareDisplay.jsx

api/
├── apiClient.js
├── auth.js
└── rides.js

utils/
├── storage.js
└── formatFare.js
```

---

### 4.3 — Screen Rules

```jsx
// ✅ Good
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // API call here
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* UI here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
});

export default LoginScreen;
```

- Always use `StyleSheet.create()` — never inline styles
- Always handle loading and error states
- Use `Alert.alert()` for error messages
- Always use `try / catch / finally` for API calls

---

### 4.4 — Token Storage

```js
// ✅ Good — utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveTokens = async (access, refresh) => {
  await AsyncStorage.setItem('access_token', access);
  await AsyncStorage.setItem('refresh_token', refresh);
};

export const getAccessToken = async () => {
  return await AsyncStorage.getItem('access_token');
};

export const clearTokens = async () => {
  await AsyncStorage.removeItem('access_token');
  await AsyncStorage.removeItem('refresh_token');
};
```

- Always use `AsyncStorage` for storing tokens
- Never store tokens in component state
- Create a `storage.js` utility file — don't scatter AsyncStorage calls

---

## 5. General Code Quality Rules

### Do's ✅
- Write clean, readable code
- Use meaningful variable and function names
- Handle all errors and edge cases
- Keep files small — split large files into smaller ones
- Add comments for complex logic
- Test your code before committing
- Follow the standard API response format

### Don'ts ❌
- Don't use `console.log` in production code
- Don't write `any` or skip TypeScript types (if using TypeScript)
- Don't commit `.env` files
- Don't hardcode URLs, passwords, or API keys
- Don't use magic numbers — use named constants
- Don't write all code in one file — keep it modular
- Don't skip error handling

---

## 6. Code Review Checklist

Before committing any code, verify:

- [ ] Code follows naming conventions
- [ ] No hardcoded secrets or passwords
- [ ] All API calls have error handling
- [ ] Loading states are handled in UI
- [ ] Inputs are validated
- [ ] Unnecessary `console.log` removed
- [ ] File is in the correct folder
- [ ] Commit message follows the convention

---

*Document Version: 1.0*
*Project: Destiny Ride-Booking Platform*

