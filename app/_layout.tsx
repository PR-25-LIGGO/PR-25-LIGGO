import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import SplashScreen from '@/components/splashScreen';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const [isAppReady, setIsAppReady] = useState(false);
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      setTimeout(() => setIsAppReady(true), 3000); // Mostrar splash por 2 segundos
    }
  }, [loaded]);

  if (!loaded || !isAppReady) {
    return <SplashScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="auth/login-landing" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth/login-landing" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="auth/forgot" />
        <Stack.Screen name="auth/new-password" />
        <Stack.Screen name="auth/verify-code" />
        <Stack.Screen name="auth/error-account" />
        <Stack.Screen name="auth/name" />
        <Stack.Screen name="auth/birthday" />
        <Stack.Screen name="auth/gender" />

        
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
