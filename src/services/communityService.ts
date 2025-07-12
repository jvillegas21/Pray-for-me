import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Community } from '@/types';

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

export const communityService = {
  async fetchCommunities(filters: { latitude?: number; longitude?: number; radius?: number }) {
    try {
      const response = await api.get('/communities', { params: filters });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch communities');
    }
  },

  async fetchMyCommunities() {
    try {
      const response = await api.get('/communities/my-communities');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch your communities');
    }
  },

  async createCommunity(communityData: Omit<Community, 'id' | 'memberCount' | 'createdAt' | 'updatedAt'>) {
    try {
      const response = await api.post('/communities', communityData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create community');
    }
  },

  async joinCommunity(communityId: string) {
    try {
      const response = await api.post(`/communities/${communityId}/join`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to join community');
    }
  },

  async leaveCommunity(communityId: string) {
    try {
      await api.post(`/communities/${communityId}/leave`);
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to leave community');
    }
  },

  async getCommunityById(id: string) {
    try {
      const response = await api.get(`/communities/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch community');
    }
  },

  async updateCommunity(id: string, updates: Partial<Community>) {
    try {
      const response = await api.put(`/communities/${id}`, updates);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update community');
    }
  },

  async deleteCommunity(id: string) {
    try {
      await api.delete(`/communities/${id}`);
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete community');
    }
  },

  async getCommunityMembers(id: string) {
    try {
      const response = await api.get(`/communities/${id}/members`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch community members');
    }
  },
};