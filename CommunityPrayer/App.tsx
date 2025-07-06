import React from 'react';
// @ts-expect-error: navigation types will resolve once deps installed
import { NavigationContainer } from '@react-navigation/native';
// @ts-expect-error: navigation types will resolve once deps installed
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SubmitPrayerScreen from './src/screens/SubmitPrayerScreen';
import PrayersFeedScreen from './src/screens/PrayersFeedScreen';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator>
        <Stack.Screen name="Feed" component={PrayersFeedScreen} options={{ title: 'Prayers Nearby' }} />
        <Stack.Screen name="Submit" component={SubmitPrayerScreen} options={{ title: 'Submit Prayer' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
