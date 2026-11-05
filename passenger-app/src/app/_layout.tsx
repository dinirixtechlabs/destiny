import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../context/AuthContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    // Hide native splash screen once the JS layout mounts
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="profile/edit" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ride/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ride/rate" options={{ animation: 'slide_from_bottom' }} />
      </Stack>
    </AuthProvider>
  );
}
