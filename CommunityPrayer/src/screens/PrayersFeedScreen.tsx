import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, ActivityIndicator, Button, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
// @ts-expect-error: navigation types will resolve once deps installed
import { useNavigation } from '@react-navigation/native';
// @ts-expect-error: expo-location types once installed
import * as Location from 'expo-location';

interface Prayer {
  id: string;
  body: string;
  created_at: string;
  prayer_likes: { count: number }[]; // aggregate field
}

interface PrayerListItem {
  id: string;
  body: string;
  created_at: string;
  likesCount: number;
  likedByMe: boolean;
}

const PrayersFeedScreen: React.FC = () => {
  const [prayers, setPrayers] = useState<PrayerListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const navigation = useNavigation();

  const fetchPrayers = async () => {
    setLoading(true);
    let locationFilterApplied = false;
    let query = supabase
      .from<Prayer>('prayers')
      .select('id, body, created_at, prayer_likes(count)');

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
      const { data: myLikes } = await supabase
        .from('prayer_likes')
        .select('prayer_id');

      const likedSet = new Set<string>((myLikes || []).map((l: any) => l.prayer_id));

      const mapped: PrayerListItem[] = (data || []).map((p: Prayer) => ({
        id: p.id,
        body: p.body,
        created_at: p.created_at,
        likesCount: p.prayer_likes?.[0]?.count ?? 0,
        likedByMe: likedSet.has(p.id),
      }));

      setPrayers(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPrayers();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('public:prayer_likes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prayer_likes' },
        (payload: any) => {
          setPrayers((prev) => {
            return prev.map((p) => {
              if (p.id !== payload.new?.prayer_id && p.id !== payload.old?.prayer_id) return p;
              const delta = payload.eventType === 'INSERT' ? 1 : -1;
              const likedByMeChange = payload.new?.user_id === supabase.auth.getUser().data?.user?.id;
              return {
                ...p,
                likesCount: p.likesCount + delta,
                likedByMe: likedByMeChange ? payload.eventType === 'INSERT' : p.likedByMe,
              };
            });
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleLike = async (prayerId: string, liked: boolean) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      Alert.alert('You must be signed in to like prayers');
      return;
    }

    if (liked) {
      await supabase.from('prayer_likes').delete().match({ prayer_id: prayerId, user_id: user.id });
    } else {
      const { error } = await supabase.from('prayer_likes').insert({ prayer_id: prayerId, user_id: user.id });
      if (error && error.code !== '23505') {
        console.error('Error liking prayer:', error.message);
      }
    }
  };

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
          <View style={styles.footerRow}>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
            <Button
              title={`🙏 ${item.likesCount}`}
              color={item.likedByMe ? '#d9534f' : undefined}
              onPress={() => toggleLike(item.id, item.likedByMe)}
            />
          </View>
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default PrayersFeedScreen;