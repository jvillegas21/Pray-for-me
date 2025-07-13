import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configureStore } from '@reduxjs/toolkit';

import authReducer from './store/slices/authSlice';
import communityReducer from './store/slices/communitySlice';
import locationReducer from './store/slices/locationSlice';
import prayerReducer from './store/slices/prayerSlice';

// Create a test store
export const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      community: communityReducer,
      location: locationReducer,
      prayer: prayerReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
      }),
  });
};

// Custom render function that includes providers
export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <Provider store={store}>
        <PaperProvider theme={MD3LightTheme}>
          <SafeAreaProvider>
            <NavigationContainer>
              {children}
            </NavigationContainer>
          </SafeAreaProvider>
        </PaperProvider>
      </Provider>
    );
  };

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// Mock navigation
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getParent: jest.fn(),
  getState: jest.fn(),
  dispatch: jest.fn(),
};

// Mock route
export const mockRoute = {
  key: 'test-route',
  name: 'TestScreen',
  params: {},
};

// Test data
export const testUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  avatar_url: null,
  created_at: '2024-01-01T00:00:00Z',
};

export const testPrayerRequest = {
  id: 'test-prayer-id',
  title: 'Test Prayer Request',
  description: 'This is a test prayer request',
  user_id: 'test-user-id',
  community_id: 'test-community-id',
  is_anonymous: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const testCommunity = {
  id: 'test-community-id',
  name: 'Test Community',
  description: 'A test community',
  location: {
    latitude: 40.7128,
    longitude: -74.0060,
  },
  radius: 1000,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}; 