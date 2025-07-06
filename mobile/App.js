import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

// Context Providers
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { LocationProvider } from './src/contexts/LocationContext';
import { PrayerProvider } from './src/contexts/PrayerContext';

// Screens
import SplashScreenComponent from './src/screens/SplashScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/home/HomeScreen';
import PrayersScreen from './src/screens/prayers/PrayersScreen';
import PrayerDetailScreen from './src/screens/prayers/PrayerDetailScreen';
import CreatePrayerScreen from './src/screens/prayers/CreatePrayerScreen';
import StudyScreen from './src/screens/study/StudyScreen';
import StudyDetailScreen from './src/screens/study/StudyDetailScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import MapScreen from './src/screens/map/MapScreen';
import BibleScreen from './src/screens/bible/BibleScreen';
import SettingsScreen from './src/screens/settings/SettingsScreen';

// Theme
import { theme } from './src/styles/theme';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator Component
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Prayers') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Study') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E1E5E9',
          paddingTop: 8,
          paddingBottom: 8,
          height: 65,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Prayers" 
        component={PrayersScreen}
        options={{ title: 'Prayers' }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{ title: 'Map' }}
      />
      <Tab.Screen 
        name="Study" 
        component={StudyScreen}
        options={{ title: 'Study' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// Main Stack Navigator
function MainNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreenComponent />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'white' },
      }}
    >
      {user ? (
        // Authenticated Stack
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen 
            name="PrayerDetail" 
            component={PrayerDetailScreen}
            options={{ 
              headerShown: true,
              title: 'Prayer Details',
              headerStyle: { backgroundColor: theme.colors.primary },
              headerTintColor: 'white',
            }}
          />
          <Stack.Screen 
            name="CreatePrayer" 
            component={CreatePrayerScreen}
            options={{ 
              headerShown: true,
              title: 'New Prayer',
              headerStyle: { backgroundColor: theme.colors.primary },
              headerTintColor: 'white',
              presentation: 'modal',
            }}
          />
          <Stack.Screen 
            name="StudyDetail" 
            component={StudyDetailScreen}
            options={{ 
              headerShown: true,
              title: 'Bible Study',
              headerStyle: { backgroundColor: theme.colors.primary },
              headerTintColor: 'white',
            }}
          />
          <Stack.Screen 
            name="Bible" 
            component={BibleScreen}
            options={{ 
              headerShown: true,
              title: 'Bible',
              headerStyle: { backgroundColor: theme.colors.primary },
              headerTintColor: 'white',
            }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ 
              headerShown: true,
              title: 'Settings',
              headerStyle: { backgroundColor: theme.colors.primary },
              headerTintColor: 'white',
            }}
          />
        </>
      ) : (
        // Authentication Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync({
          ...Ionicons.font,
        });
        
        // Artificially delay for demo purposes
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = React.useCallback(async () => {
    if (appIsReady) {
      // Hide the splash screen once the app is ready
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <LocationProvider>
            <PrayerProvider>
              <NavigationContainer>
                <StatusBar style="light" backgroundColor={theme.colors.primary} />
                <MainNavigator />
                <Toast />
              </NavigationContainer>
            </PrayerProvider>
          </LocationProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}