import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { supabase } from '../lib/supabase';
// @ts-expect-error: navigation types will resolve once deps installed
import { useNavigation } from '@react-navigation/native';
// @ts-expect-error: expo-location types once installed
import * as Location from 'expo-location';

interface Prayer {
  id: string;
  body: string;
  created_at: string;
}

const PrayersFeedScreen: React.FC = () => {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const navigation = useNavigation();

  const fetchPrayers = async () => {
    setLoading(true);
    let locationFilterApplied = false;
    let query = supabase.from<Prayer>('prayers').select('*');

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest });
        const { latitude, longitude } = loc.coords;
        const radiusMeters = 10000; // 10 km radius – tweak as needed
        const point = `POINT(${longitude} ${latitude})`;
        // Apply PostGIS st_dwithin filter via PostgREST operator
        query = query.filter('location', 'st_dwithin', `${point},${radiusMeters}`);
        locationFilterApplied = true;
      }
    } catch (err) {
      console.log('Location permission denied or error fetching location; showing global feed');
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(50);
    if (error) {
      console.error('Error fetching prayers:', error.message);
    } else {
      setPrayers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPrayers();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPrayers();
    setRefreshing(false);
  }, []);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button title="Add" onPress={() => navigation.navigate('Submit' as never)} />
      ),
    });
  }, [navigation]);

  if (loading && prayers.length === 0) {
    return (
      <View style={styles.center}> 
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlatList
      data={prayers}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={prayers.length === 0 ? styles.center : undefined}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
        </View>
      )}
      ListEmptyComponent={<Text>No prayers yet. Be the first to submit one!</Text>}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  body: {
    fontSize: 16,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
});

export default PrayersFeedScreen;