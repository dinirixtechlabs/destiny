import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';
import { UserProfile, AuthResponse, RegisterResponse } from '../types/auth';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (
    fullName: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateUser: (user: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check stored credentials on app startup (Auto-Login)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('access_token');
        const storedUser = await AsyncStorage.getItem('user');

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);

          // Verify token is still valid with backend in background
          try {
            const res = await api.get('/users/me/');
            if (res.data.success && res.data.data) {
              setUser(res.data.data);
              await AsyncStorage.setItem('user', JSON.stringify(res.data.data));
            }
          } catch (err: any) {
            // If token is expired / unauthorized, attempt refresh or purge
            if (err.response?.status === 401) {
              const refreshToken = await AsyncStorage.getItem('refresh_token');
              if (refreshToken) {
                try {
                  const refreshRes = await api.post('/auth/token/refresh/', {
                    refresh: refreshToken,
                  });
                  if (refreshRes.data.success && refreshRes.data.data?.access) {
                    const newAccess = refreshRes.data.data.access;
                    setToken(newAccess);
                    await AsyncStorage.setItem('access_token', newAccess);
                  } else {
                    await handleForcedLogout();
                  }
                } catch {
                  await handleForcedLogout();
                }
              } else {
                await handleForcedLogout();
              }
            }
          }
        }
      } catch (e) {
        console.warn('Error reading auth state from AsyncStorage', e);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleForcedLogout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post<AuthResponse>('/auth/login/', {
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.data.success) {
        const { access, refresh, user: loggedUser } = res.data.data;

        // Store tokens & user in AsyncStorage
        await AsyncStorage.multiSet([
          ['access_token', access],
          ['refresh_token', refresh],
          ['user', JSON.stringify(loggedUser)],
        ]);

        setToken(access);
        setUser(loggedUser);
        return { success: true, message: res.data.message };
      }

      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMsg = 'Unable to log in. Please check your credentials.';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.errors?.non_field_errors) {
        errorMsg = err.response.data.errors.non_field_errors[0];
      }
      return { success: false, message: errorMsg };
    }
  };

  const register = async (
    fullName: string,
    email: string,
    phone: string,
    password: string
  ) => {
    try {
      const res = await api.post<RegisterResponse>('/auth/register/', {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
      });

      if (res.data.success) {
        // Auto-login upon successful registration
        return await login(email, password);
      }

      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (err: any) {
      console.error('Registration error:', err);
      let errorMsg = 'Failed to register account. Please check your details.';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const firstKey = Object.keys(errors)[0];
        if (firstKey && errors[firstKey]?.[0]) {
          errorMsg = `${firstKey.replace('_', ' ')}: ${errors[firstKey][0]}`;
        }
      }
      return { success: false, message: errorMsg };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken }).catch(() => {});
      }
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      await handleForcedLogout();
    }
  };

  const updateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    AsyncStorage.setItem('user', JSON.stringify(updatedUser)).catch((e) =>
      console.warn('Failed to update user in storage:', e)
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;

