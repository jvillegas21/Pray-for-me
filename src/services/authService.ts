import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';

const API_BASE_URL = 'https://api.prayfor.me'; // Replace with actual API URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      // Redirect to login screen
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials: { email: string; password: string }) {
    try {
      const response = await api.post('/auth/login', credentials);
      const { user, token } = response.data;
      
      await AsyncStorage.setItem('authToken', token);
      return { user, token };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  async register(userData: { email: string; password: string; name: string }) {
    try {
      const response = await api.post('/auth/register', userData);
      const { user, token } = response.data;
      
      await AsyncStorage.setItem('authToken', token);
      return { user, token };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      await AsyncStorage.removeItem('authToken');
    }
  },

  async updateProfile(userData: Partial<User>) {
    try {
      const response = await api.put('/auth/profile', userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  },

  async forgotPassword(email: string) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  },

  async resetPassword(token: string, newPassword: string) {
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  },
};