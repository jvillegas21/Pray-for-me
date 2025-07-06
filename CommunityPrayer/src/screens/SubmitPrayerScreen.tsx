import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
// @ts-expect-error: types available after installing expo-location
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';

const SubmitPrayerScreen: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) {
      Alert.alert('Prayer cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest });
      const { latitude, longitude } = loc.coords;

      const pointWKT = `SRID=4326;POINT(${longitude} ${latitude})`;

      const { error } = await supabase.from('prayers').insert({
        body: text.trim(),
        location: pointWKT,
      });
      if (error) {
        throw error;
      }
      Alert.alert('Prayer submitted!');
      setText('');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        placeholder="Type your prayer..."
        multiline
        value={text}
        onChangeText={setText}
      />
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Submit Prayer" onPress={handleSubmit} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
});

export default SubmitPrayerScreen;