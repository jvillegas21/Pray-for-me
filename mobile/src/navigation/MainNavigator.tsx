import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../utils/theme';

// Import screens
import HomeScreen from '../screens/home/HomeScreen';
import MapScreen from '../screens/map/MapScreen';
import CreatePrayerScreen from '../screens/prayer/CreatePrayerScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import PrayerDetailScreen from '../screens/prayer/PrayerDetailScreen';
import BibleStudyScreen from '../screens/bible/BibleStudyScreen';
import BibleStudyListScreen from '../screens/bible/BibleStudyListScreen';

export type MainTabParamList = {
  Home: undefined;
  Map: undefined;
  CreatePrayer: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  PrayerDetail: {prayerId: string};
  BibleStudy: {studyId: string};
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  BibleStudyList: undefined;
  PrayerDetail: {prayerId: string};
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen 
        name="HomeScreen" 
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <HomeStack.Screen 
        name="PrayerDetail" 
        component={PrayerDetailScreen}
        options={{title: 'Prayer'}}
      />
      <HomeStack.Screen 
        name="BibleStudy" 
        component={BibleStudyScreen}
        options={{title: 'Bible Study'}}
      />
    </HomeStack.Navigator>
  );
};

const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen 
        name="ProfileScreen" 
        component={ProfileScreen}
        options={{headerShown: false}}
      />
      <ProfileStack.Screen 
        name="BibleStudyList" 
        component={BibleStudyListScreen}
        options={{title: 'My Bible Studies'}}
      />
      <ProfileStack.Screen 
        name="PrayerDetail" 
        component={PrayerDetailScreen}
        options={{title: 'Prayer'}}
      />
    </ProfileStack.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName = 'home';

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Map':
              iconName = focused ? 'map' : 'map-outline';
              break;
            case 'CreatePrayer':
              iconName = focused ? 'hands-pray' : 'hands-pray';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[400],
        headerShown: false,
      })}>
      <Tab.Screen 
        name="Home" 
        component={HomeStackNavigator}
        options={{title: 'Home'}}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{title: 'Nearby'}}
      />
      <Tab.Screen 
        name="CreatePrayer" 
        component={CreatePrayerScreen}
        options={{title: 'Pray'}}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackNavigator}
        options={{title: 'Profile'}}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;