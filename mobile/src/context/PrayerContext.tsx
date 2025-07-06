import React, {createContext, useContext, useState, ReactNode} from 'react';
import {PrayerContextData, Prayer, CreatePrayerData, Location} from '../types';
import api from '../services/api';

const PrayerContext = createContext<PrayerContextData>({} as PrayerContextData);

interface PrayerProviderProps {
  children: ReactNode;
}

export const PrayerProvider: React.FC<PrayerProviderProps> = ({children}) => {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [nearbyPrayers, setNearbyPrayers] = useState<Prayer[]>([]);
  const [trendingPrayers, setTrendingPrayers] = useState<Prayer[]>([]);
  const [userPrayers, setUserPrayers] = useState<Prayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPrayer = async (prayerData: CreatePrayerData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post('/prayers', prayerData);
      const newPrayer = response.data;
      
      setPrayers(prev => [newPrayer, ...prev]);
      setUserPrayers(prev => [newPrayer, ...prev]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create prayer');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNearbyPrayers = async (location: Location, maxDistance: number = 50000) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/prayers/nearby', {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          maxDistance,
        },
      });
      
      setNearbyPrayers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch nearby prayers');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrendingPrayers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/prayers/trending');
      setTrendingPrayers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch trending prayers');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserPrayers = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get(`/prayers/user/${userId}`);
      setUserPrayers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch user prayers');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const likePrayer = async (prayerId: string) => {
    try {
      const response = await api.put(`/prayers/${prayerId}/like`);
      const {likeCount, liked} = response.data;
      
      // Update prayer in all lists
      const updatePrayer = (prayerList: Prayer[]) => 
        prayerList.map(prayer => 
          prayer._id === prayerId 
            ? {...prayer, likeCount, likes: liked ? [...prayer.likes, 'currentUser'] : prayer.likes.filter(id => id !== 'currentUser')}
            : prayer
        );
      
      setPrayers(updatePrayer);
      setNearbyPrayers(updatePrayer);
      setTrendingPrayers(updatePrayer);
      setUserPrayers(updatePrayer);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to like prayer');
      throw err;
    }
  };

  const incrementPrayerCount = async (prayerId: string) => {
    try {
      const response = await api.put(`/prayers/${prayerId}/pray`);
      const {prayerCount} = response.data;
      
      // Update prayer count in all lists
      const updatePrayer = (prayerList: Prayer[]) => 
        prayerList.map(prayer => 
          prayer._id === prayerId 
            ? {...prayer, prayerCount}
            : prayer
        );
      
      setPrayers(updatePrayer);
      setNearbyPrayers(updatePrayer);
      setTrendingPrayers(updatePrayer);
      setUserPrayers(updatePrayer);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to increment prayer count');
      throw err;
    }
  };

  const markAsAnswered = async (prayerId: string) => {
    try {
      const response = await api.put(`/prayers/${prayerId}/answered`);
      const updatedPrayer = response.data;
      
      // Update prayer in all lists
      const updatePrayer = (prayerList: Prayer[]) => 
        prayerList.map(prayer => 
          prayer._id === prayerId 
            ? {...prayer, answered: true, answeredDate: updatedPrayer.answeredDate}
            : prayer
        );
      
      setPrayers(updatePrayer);
      setNearbyPrayers(updatePrayer);
      setTrendingPrayers(updatePrayer);
      setUserPrayers(updatePrayer);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark prayer as answered');
      throw err;
    }
  };

  return (
    <PrayerContext.Provider
      value={{
        prayers,
        nearbyPrayers,
        trendingPrayers,
        userPrayers,
        isLoading,
        error,
        createPrayer,
        fetchNearbyPrayers,
        fetchTrendingPrayers,
        fetchUserPrayers,
        likePrayer,
        incrementPrayerCount,
        markAsAnswered,
      }}>
      {children}
    </PrayerContext.Provider>
  );
};

export const usePrayer = () => {
  const context = useContext(PrayerContext);
  if (!context) {
    throw new Error('usePrayer must be used within a PrayerProvider');
  }
  return context;
};