import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In Expo SDK 49+, EXPO_PUBLIC_* variables are inlined at build time.
// Default fallback to 127.0.0.1:8000/api/v1
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach JWT access token from AsyncStorage
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to retrieve access token from AsyncStorage', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
      } catch (e) {
        console.warn('Failed to clear tokens on 401 response', e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

