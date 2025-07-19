import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, borderRadius } from '@/theme';

interface MapClusterProps {
  pointCount: number;
  coordinates: [number, number];
  maxUrgency: 'low' | 'medium' | 'high' | 'urgent';
}

const URGENCY_COLORS = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#FF5722',
  urgent: '#F44336',
};

const MapCluster: React.FC<MapClusterProps> = ({ 
  pointCount, 
  coordinates, 
  maxUrgency 
}) => {
  const getClusterSize = (count: number) => {
    if (count < 10) return 32;
    if (count < 25) return 40;
    if (count < 50) return 48;
    return 56;
  };

  const clusterSize = getClusterSize(pointCount);

  return (
    <View style={[
      styles.cluster,
      {
        width: clusterSize,
        height: clusterSize,
        borderRadius: clusterSize / 2,
        backgroundColor: URGENCY_COLORS[maxUrgency],
      }
    ]}>
      <Text style={[
        styles.clusterText,
        { fontSize: clusterSize > 40 ? 14 : 12 }
      ]}>
        {pointCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cluster: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  clusterText: {
    fontWeight: '700',
    color: theme.colors.white,
  },
});

export default MapCluster;