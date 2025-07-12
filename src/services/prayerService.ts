import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrayerRequest, PrayerResponse } from '@/types';

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

export const prayerService = {
  async fetchRequests(filters: { latitude?: number; longitude?: number; radius?: number }) {
    try {
      const response = await api.get('/prayer-requests', { params: filters });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch prayer requests');
    }
  },

  async fetchMyRequests() {
    try {
      const response = await api.get('/prayer-requests/my-requests');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch your prayer requests');
    }
  },

  async createRequest(requestData: Omit<PrayerRequest, 'id' | 'responses' | 'createdAt' | 'updatedAt'>) {
    try {
      const response = await api.post('/prayer-requests', requestData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create prayer request');
    }
  },

  async updateRequest(id: string, updates: Partial<PrayerRequest>) {
    try {
      const response = await api.put(`/prayer-requests/${id}`, updates);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update prayer request');
    }
  },

  async deleteRequest(id: string) {
    try {
      await api.delete(`/prayer-requests/${id}`);
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete prayer request');
    }
  },

  async respondToRequest(responseData: Omit<PrayerResponse, 'id' | 'createdAt'>) {
    try {
      const response = await api.post(`/prayer-requests/${responseData.prayerRequestId}/respond`, responseData);
      return {
        requestId: responseData.prayerRequestId,
        response: response.data,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to respond to prayer request');
    }
  },

  async getRequestById(id: string) {
    try {
      const response = await api.get(`/prayer-requests/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch prayer request');
    }
  },

  async reportRequest(id: string, reason: string) {
    try {
      await api.post(`/prayer-requests/${id}/report`, { reason });
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to report prayer request');
    }
  },
};