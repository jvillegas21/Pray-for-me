import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContextData, User, Location} from '../types';
import api from '../services/api';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('@PrayerApp:token');
      const storedUser = await AsyncStorage.getItem('@PrayerApp:user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', {email, password});
      const {token: authToken, user: userData} = response.data;

      await AsyncStorage.setItem('@PrayerApp:token', authToken);
      await AsyncStorage.setItem('@PrayerApp:user', JSON.stringify(userData));

      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      setToken(authToken);
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to sign in');
    }
  };

  const signUp = async (name: string, email: string, password: string, location?: Location) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        location: location ? {
          longitude: location.longitude,
          latitude: location.latitude,
          city: location.city,
          country: location.country,
        } : undefined,
      });

      const {token: authToken, user: userData} = response.data;

      await AsyncStorage.setItem('@PrayerApp:token', authToken);
      await AsyncStorage.setItem('@PrayerApp:user', JSON.stringify(userData));

      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      setToken(authToken);
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to sign up');
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.multiRemove(['@PrayerApp:token', '@PrayerApp:user']);
      delete api.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateLocation = async (location: Location) => {
    try {
      const response = await api.put('/auth/location', {
        latitude: location.latitude,
        longitude: location.longitude,
        city: location.city,
        country: location.country,
      });

      setUser(response.data);
      await AsyncStorage.setItem('@PrayerApp:user', JSON.stringify(response.data));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update location');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateLocation,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};