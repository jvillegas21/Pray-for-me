import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationProps } from '@/types';
import { theme } from '@/theme';

import HomeScreen from '@/screens/main/HomeScreen';
import CommunitiesScreen from '@/screens/main/CommunitiesScreen';
import ProfileScreen from '@/screens/main/ProfileScreen';
import MapScreen from '@/screens/main/MapScreen';
import CreatePrayerRequestScreen from '@/screens/main/CreatePrayerRequestScreen';
import PrayerRequestScreen from '@/screens/main/PrayerRequestScreen';
import { PrayerRequestTransitionScreen } from '@/screens/main/PrayerRequestTransitionScreen';
import { PrayerRequestResultsScreen } from '@/screens/main/PrayerRequestResultsScreen';
import CommunityDetailScreen from '@/screens/main/CommunityDetailScreen';
import SettingsScreen from '@/screens/main/SettingsScreen';
import MyPrayersScreen from '@/screens/main/MyPrayersScreen';

const Tab = createBottomTabNavigator<NavigationProps>();
const Stack = createNativeStackNavigator<NavigationProps>();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="PrayerRequest" component={PrayerRequestScreen} />
    <Stack.Screen
      name="CreatePrayerRequest"
      component={CreatePrayerRequestScreen}
    />
    <Stack.Screen
      name="PrayerRequestTransition"
      component={PrayerRequestTransitionScreen}
    />
    <Stack.Screen
      name="PrayerRequestResults"
      component={PrayerRequestResultsScreen}
    />
  </Stack.Navigator>
);

const CommunitiesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Communities" component={CommunitiesScreen} />
    <Stack.Screen name="CommunityDetail" component={CommunityDetailScreen} />
  </Stack.Navigator>
);

const MapStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Map" component={MapScreen} />
    <Stack.Screen name="PrayerRequest" component={PrayerRequestScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="MyPrayers" component={MyPrayersScreen} />
  </Stack.Navigator>
);

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.backdrop,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarBadge: undefined,
          tabBarIcon: ({ focused, color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CommunitiesTab"
        component={CommunitiesStack}
        options={{
          tabBarLabel: 'Communities',
          tabBarIcon: ({ focused, color, size }) => (
            <Icon name="group" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapStack}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({ focused, color, size }) => (
            <Icon name="map" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color, size }) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
