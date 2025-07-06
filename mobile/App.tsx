import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {PaperProvider} from 'react-native-paper';
import {AuthProvider} from './src/context/AuthContext';
import {LocationProvider} from './src/context/LocationContext';
import {PrayerProvider} from './src/context/PrayerContext';
import RootNavigator from './src/navigation/RootNavigator';
import {theme} from './src/utils/theme';

function App(): JSX.Element {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <AuthProvider>
            <LocationProvider>
              <PrayerProvider>
                <RootNavigator />
              </PrayerProvider>
            </LocationProvider>
          </AuthProvider>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;