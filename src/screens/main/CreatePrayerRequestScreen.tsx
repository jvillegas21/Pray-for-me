import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { theme, spacing } from '@/theme';

const CreatePrayerRequestScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Prayer Request</Text>
      <Text style={styles.subtitle}>Share your prayer needs with the community</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
  },
});

export default CreatePrayerRequestScreen; 