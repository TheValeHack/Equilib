import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import {Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope'
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppProvider } from '../context/AppContext';

// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Manrope_400Regular, 
    Manrope_500Medium, 
    Manrope_600SemiBold, 
    Manrope_700Bold, 
    Manrope_800ExtraBold
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AppProvider>
      <SafeAreaView className='flex-1 relative h-full px-4 pt-3 bg-white'>
      <Stack screenOptions={
        {
          headerShown: false
        }
      }>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </SafeAreaView>
    </AppProvider>
  );
}
