import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme, spacing, borderRadius } from '@/theme';
import GlassCard from './GlassCard';

interface MapLegendProps {
  isVisible: boolean;
  onToggle: () => void;
}

const URGENCY_ITEMS = [
  { key: 'urgent', color: '#F44336', label: 'Urgent' },
  { key: 'high', color: '#FF5722', label: 'High Priority' },
  { key: 'medium', color: '#FF9800', label: 'Medium Priority' },
  { key: 'low', color: '#4CAF50', label: 'Low Priority' },
];

const CATEGORY_ITEMS = [
  { key: 'health', icon: 'healing', label: 'Health' },
  { key: 'family', icon: 'family-restroom', label: 'Family' },
  { key: 'work', icon: 'work', label: 'Work' },
  { key: 'spiritual', icon: 'church', label: 'Spiritual' },
  { key: 'relationship', icon: 'favorite', label: 'Relationships' },
  { key: 'financial', icon: 'monetization-on', label: 'Financial' },
];

const MapLegend: React.FC<MapLegendProps> = ({ isVisible, onToggle }) => {
  if (!isVisible) {
    return (
      <TouchableOpacity style={styles.legendToggle} onPress={onToggle}>
        <GlassCard variant="filled" style={styles.toggleCard}>
          <Icon name="info" size={20} color={theme.colors.primary} />
        </GlassCard>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.legendContainer}>
      <GlassCard variant="elevated" style={styles.legendCard}>
        <View style={styles.legendHeader}>
          <Text style={styles.legendTitle}>Map Legend</Text>
          <TouchableOpacity onPress={onToggle}>
            <Icon name="close" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Urgency Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority Levels</Text>
          {URGENCY_ITEMS.map((item) => (
            <View key={item.key} style={styles.legendItem}>
              <View style={[styles.urgencyIndicator, { backgroundColor: item.color }]} />
              <Text style={styles.legendItemText}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prayer Categories</Text>
          {CATEGORY_ITEMS.map((item) => (
            <View key={item.key} style={styles.legendItem}>
              <View style={styles.categoryIcon}>
                <Icon name={item.icon} size={16} color={theme.colors.primary} />
              </View>
              <Text style={styles.legendItemText}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Special Markers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Markers</Text>
          <View style={styles.legendItem}>
            <Icon name="person-pin" size={20} color={theme.colors.primary} />
            <Text style={styles.legendItemText}>Your Location</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.clusterExample}>
              <Text style={styles.clusterExampleText}>5</Text>
            </View>
            <Text style={styles.legendItemText}>Prayer Cluster</Text>
          </View>
        </View>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  legendToggle: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 2,
  },

  toggleCard: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
  },

  legendContainer: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    maxWidth: 250,
    zIndex: 2,
  },

  legendCard: {
    padding: spacing.lg,
  },

  legendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  legendTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },

  section: {
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: spacing.sm,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },

  legendItemText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },

  urgencyIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },

  categoryIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  clusterExample: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
  },

  clusterExampleText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.white,
  },
});

export default MapLegend;