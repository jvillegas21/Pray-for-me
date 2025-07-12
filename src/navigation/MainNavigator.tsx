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
import CommunityDetailScreen from '@/screens/main/CommunityDetailScreen';
import SettingsScreen from '@/screens/main/SettingsScreen';

const Tab = createBottomTabNavigator<NavigationProps>();
const Stack = createNativeStackNavigator<NavigationProps>();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="PrayerRequest" component={PrayerRequestScreen} />
    <Stack.Screen name="CreatePrayerRequest" component={CreatePrayerRequestScreen} />
  </Stack.Navigator>
);

const CommunitiesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Communities" component={CommunitiesScreen} />
    <Stack.Screen name="CommunityDetail" component={CommunityDetailScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'HomeTab':
              iconName = 'home';
              break;
            case 'CommunitiesTab':
              iconName = 'group';
              break;
            case 'MapTab':
              iconName = 'map';
              break;
            case 'ProfileTab':
              iconName = 'person';
              break;
            default:
              iconName = 'home';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.placeholder,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.backdrop,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack}
        options={{ 
          tabBarLabel: 'Home',
          tabBarBadge: undefined,
        }}
      />
      <Tab.Screen 
        name="CommunitiesTab" 
        component={CommunitiesStack}
        options={{ 
          tabBarLabel: 'Communities',
        }}
      />
      <Tab.Screen 
        name="MapTab" 
        component={MapScreen}
        options={{ 
          tabBarLabel: 'Map',
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStack}
        options={{ 
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;