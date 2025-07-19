import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { theme, spacing, gradients, borderRadius } from '@/theme';
import { RootState, AppDispatch } from '@/store';
import { fetchPrayerRequests } from '@/store/slices/prayerSlice';
import { getCurrentLocation, requestLocationPermission } from '@/store/slices/locationSlice';
import GlassCard from '@/components/GlassCard';
import GradientButton from '@/components/GradientButton';

const { width, height } = Dimensions.get('window');

interface PrayerMapPoint {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: string;
  coordinates: [number, number]; // [longitude, latitude]
  isAnonymous: boolean;
  timeAgo: string;
}

const MapScreen: React.FC = () => {
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [prayerPoints, setPrayerPoints] = useState<PrayerMapPoint[]>([]);
  
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { location, loading: locationLoading } = useSelector((state: RootState) => state.location);
  const { requests, loading: prayersLoading } = useSelector((state: RootState) => state.prayer);

  const handleLocationPermission = async () => {
    try {
      await dispatch(requestLocationPermission()).unwrap();
      await dispatch(getCurrentLocation()).unwrap();
      setShowLocationPrompt(false);
    } catch (error) {
      Alert.alert(
        'Location Access',
        'Please enable location access in your device settings to see nearby prayers.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleFindNearbyPrayers = async () => {
    if (!location) {
      setShowLocationPrompt(true);
      return;
    }

    try {
      // Fetch prayers with location filter
      await dispatch(fetchPrayerRequests({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 10000, // 10km radius
      })).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch nearby prayers');
    }
  };

  useEffect(() => {
    // Convert prayer requests to map points
    const points: PrayerMapPoint[] = requests
      .filter(request => request.location && !request.isAnonymous)
      .map(request => ({
        id: request.id,
        title: request.title,
        description: request.description,
        category: request.category,
        urgency: request.urgency,
        coordinates: [request.location.longitude, request.location.latitude],
        isAnonymous: request.isAnonymous,
        timeAgo: new Date(request.createdAt).toLocaleDateString(),
      }));

    setPrayerPoints(points);
  }, [requests]);

  return (
    <LinearGradient
      colors={gradients.sunset}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Prayer Map</Text>
          <Text style={styles.headerSubtitle}>
            Find prayers near you
          </Text>
        </View>

        {/* Map Placeholder */}
        <View style={styles.mapContainer}>
          <GlassCard variant="elevated" style={styles.mapPlaceholder}>
            <Icon 
              name="map" 
              size={64} 
              color={theme.colors.primary} 
              style={styles.mapIcon}
            />
            <Text style={styles.mapPlaceholderTitle}>
              Map Coming Soon
            </Text>
            <Text style={styles.mapPlaceholderText}>
              Interactive prayer map will be available in a future update
            </Text>
            
            {/* Location Actions */}
            <View style={styles.actionsContainer}>
              <GradientButton
                title={location ? "Find Nearby Prayers" : "Enable Location"}
                onPress={location ? handleFindNearbyPrayers : handleLocationPermission}
                variant="spiritual"
                loading={locationLoading || prayersLoading}
                style={styles.actionButton}
              />
            </View>
          </GlassCard>
        </View>

        {/* Prayer Count */}
        {prayerPoints.length > 0 && (
          <View style={styles.statsContainer}>
            <GlassCard variant="filled" style={styles.statsCard}>
              <Text style={styles.statsNumber}>{prayerPoints.length}</Text>
              <Text style={styles.statsLabel}>
                {prayerPoints.length === 1 ? 'Prayer' : 'Prayers'} Near You
              </Text>
            </GlassCard>
          </View>
        )}

        {/* Location Prompt Modal */}
        {showLocationPrompt && (
          <View style={styles.modalOverlay}>
            <GlassCard variant="elevated" style={styles.promptCard}>
              <Icon 
                name="location-on" 
                size={48} 
                color={theme.colors.primary}
                style={styles.promptIcon}
              />
              <Text style={styles.promptTitle}>
                Enable Location Access
              </Text>
              <Text style={styles.promptText}>
                Allow location access to find prayers near you and connect with your local community.
              </Text>
              <View style={styles.promptActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowLocationPrompt(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <GradientButton
                  title="Allow Location"
                  onPress={handleLocationPermission}
                  variant="spiritual"
                  size="small"
                  style={styles.allowButton}
                />
              </View>
            </GlassCard>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textOnDark,
    marginBottom: spacing.xs,
  },

  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.textOnDark,
    opacity: 0.8,
  },

  // Map Container
  mapContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },

  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },

  mapIcon: {
    marginBottom: spacing.lg,
    opacity: 0.7,
  },

  mapPlaceholderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },

  mapPlaceholderText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },

  actionsContainer: {
    width: '100%',
  },

  actionButton: {
    width: '100%',
  },

  // Stats
  statsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },

  statsCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },

  statsNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: spacing.xs,
  },

  statsLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },

  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },

  promptCard: {
    width: '100%',
    maxWidth: 320,
    padding: spacing.xl,
    alignItems: 'center',
  },

  promptIcon: {
    marginBottom: spacing.lg,
  },

  promptTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },

  promptText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },

  promptActions: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: theme.colors.surface,
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },

  allowButton: {
    flex: 1,
  },
});

export default MapScreen;