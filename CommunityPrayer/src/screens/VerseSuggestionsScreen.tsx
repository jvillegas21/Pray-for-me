import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Button, Alert } from 'react-native';
// @ts-expect-error navigation types will resolve
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

type Verse = {
  reference: string;
  text: string;
  why: string;
};

type Study = {
  title: string;
  steps: string[];
};

type RouteParams = {
  prayerId: string;
};

const VerseSuggestionsScreen: React.FC = () => {
  const route = useRoute();
  const { prayerId } = (route.params || {}) as RouteParams;
  const navigation = useNavigation();
  const [verses, setVerses] = useState<Verse[]>([]);
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchVerses = async () => {
      const { data, error } = await supabase.functions.invoke('generate_verses', {
        body: { prayer_id: prayerId },
      });
      if (error) {
        Alert.alert('Error generating verses', error.message);
      } else if (data) {
        setVerses(data.verses || []);
        setStudy(data.study || null);
      }
      setLoading(false);
    };

    fetchVerses();
  }, [prayerId]);

  if (loading) {
    return (
      <View style={styles.center}> <ActivityIndicator size="large" /> </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={verses}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.reference}>{item.reference}</Text>
            <Text style={styles.verseText}>{item.text}</Text>
            <Text style={styles.why}>{item.why}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No verse suggestions.</Text>}
      />
      {study && (
        <Button title="Start Bible Study" onPress={() => navigation.navigate('Study' as never, { study } as never)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginBottom: 12, padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
  reference: { fontWeight: 'bold', marginBottom: 4 },
  verseText: { marginBottom: 4 },
  why: { fontStyle: 'italic', color: '#555' },
});

export default VerseSuggestionsScreen;