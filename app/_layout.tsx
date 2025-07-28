import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { SplashScreen } from '@/components/SplashScreen';

export default function RootLayout() {
  useFrameworkReady();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return <SplashScreen />;
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}