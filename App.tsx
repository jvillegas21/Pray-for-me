import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider, MD3Theme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store';
import AppNavigator from '@/navigation/AppNavigator';
import { theme } from '@/theme';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
import { supabase } from '@/services/authService';
import { Linking } from 'react-native';

// Polyfill for structuredClone
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj: any) => JSON.parse(JSON.stringify(obj));
}

// Debug environment variables on app startup
console.log('🚀 App starting...');
console.log('🔍 Environment Variables Check:');
console.log('SUPABASE_URL:', SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

const App: React.FC = () => {
  useEffect(() => {
    // Handle deep links for email confirmation
    const handleDeepLink = (url: string) => {
      console.log('🔗 Handling deep link:', url);
      if (url.includes('access_token=')) {
        console.log('✅ Email confirmation detected, processing...');
        // Supabase will automatically handle the session from the URL
        // when detectSessionInUrl is true
      }
    };

    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for incoming links when app is already running
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider theme={theme as unknown as MD3Theme}>
          <SafeAreaProvider>
            <NavigationContainer>
              <StatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent
              />
              <AppNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
