// External Dependencies
import { Platform, Text, TouchableOpacity } from 'react-native';
import { SplashScreen, Stack, useRouter } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';

// Internal Dependencies
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import { tokenCache } from '~/lib/cache';
import { ThemeToggle } from '~/components/ThemeToggle';
import '~/global.css';

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export { ErrorBoundary } from 'expo-router';

// Prevent the splash screen from auto-hiding before getting the color scheme.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const theme = await AsyncStorage.getItem('theme');
      if (Platform.OS === 'web') {
        // Adds the background color to the html element to prevent white background on overscroll.
        document.documentElement.classList.add('bg-background');
      }
      if (!theme) {
        AsyncStorage.setItem('theme', colorScheme);
        setIsColorSchemeLoaded(true);
        return;
      }
      const colorTheme = theme === 'dark' ? 'dark' : 'light';
      if (colorTheme !== colorScheme) {
        setColorScheme(colorTheme);
        setAndroidNavigationBar(colorTheme);
        setIsColorSchemeLoaded(true);
        return;
      }
      setAndroidNavigationBar(colorTheme);
      setIsColorSchemeLoaded(true);
    })().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
          <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
          <RootLayoutNav />
          <PortalHost />
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function RootLayoutNav() {
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="(modals)/AddInterval"
        options={{
          gestureEnabled: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="dark:text-white">Cancel</Text>
            </TouchableOpacity>
          ),
          presentation: 'modal',
          title: 'Add Interval',
        }}
      />
      <Stack.Screen
        name="(modals)/EditInterval"
        options={{
          headerStyle: {
            backgroundColor: isDarkColorScheme ? '#374151' : 'white',
          },
          gestureEnabled: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text>Cancel</Text>
            </TouchableOpacity>
          ),
          presentation: 'modal',
          title: 'Edit Interval',
        }}
      />
      <Stack.Screen
        name="PlayWorkout"
        options={{
          title: 'Play Workout',
          headerShown: false,
          // headerLeft: () => (
          //   <TouchableOpacity onPress={() => router.back()}>
          //     <Text>Cancel</Text>
          //   </TouchableOpacity>
          // ),
        }}
      />
      <Stack.Screen
        name="WorkoutComplete"
        options={{
          title: 'Workout Complete',

          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text>Complete</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
