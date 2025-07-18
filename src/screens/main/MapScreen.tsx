import React, { useState, useEffect, useRef } from 'react';
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
import Mapbox from '@rnmapbox/maps';

import { theme, spacing, gradients, borderRadius } from '@/theme';
import { RootState, AppDispatch } from '@/store';
import { fetchPrayerRequests } from '@/store/slices/prayerSlice';
import { getCurrentLocation, requestLocationPermission } from '@/store/slices/locationSlice';
import GlassCard from '@/components/GlassCard';
import GradientButton from '@/components/GradientButton';

// Set your Mapbox access token
Mapbox.setAccessToken('pk.eyJ1IjoicHJheWVyYXBwIiwiYSI6ImNtNXkxMzF5aTA5bzMybG9kNzJ0MGI2dzQifQ.example'); // Replace with your actual token

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
  const [mapReady, setMapReady] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [prayerPoints, setPrayerPoints] = useState<PrayerMapPoint[]>([]);
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerMapPoint | null>(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v11');
  
  const mapRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  
  const { current: currentLocation, permission } = useSelector((state: RootState) => state.location);
  const { requests } = useSelector((state: RootState) => state.prayer);

  useEffect(() => {
    initializeMap();
  }, []);

  useEffect(() => {
    if (currentLocation && requests.length > 0) {
      loadNearbyPrayers();
    }
  }, [currentLocation, requests]);

  const initializeMap = async () => {
    if (permission !== 'granted') {
      setShowLocationPrompt(true);
      return;
    }

    try {
      await dispatch(getCurrentLocation()).unwrap();
      await loadNearbyPrayers();
    } catch (error) {
      Alert.alert('Location Error', 'Unable to get your current location.');
    }
  };

  const handleLocationPermission = async () => {
    try {
      const result = await dispatch(requestLocationPermission()).unwrap();
      if (result === 'granted') {
        await dispatch(getCurrentLocation()).unwrap();
        setShowLocationPrompt(false);
        await loadNearbyPrayers();
      } else {
        Alert.alert(
          'Location Required',
          'Location permission is required to show nearby prayers on the map.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request location permission.');
    }
  };

  const loadNearbyPrayers = async () => {
    if (!currentLocation) return;

    try {
      // Fetch prayers with location filter
      await dispatch(fetchPrayerRequests({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        radius: 10, // 10km radius
        limit: 50
      })).unwrap();

      // Convert prayer requests to map points
      const points: PrayerMapPoint[] = requests
        .filter(prayer => prayer.location)
        .map(prayer => ({
          id: prayer.id,
          title: prayer.title,
          description: prayer.description,
          category: prayer.category,
          urgency: prayer.urgency,
          coordinates: [prayer.location!.longitude, prayer.location!.latitude],
          isAnonymous: prayer.isAnonymous,
          timeAgo: prayer.createdAt,
        }));

      setPrayerPoints(points);
    } catch (error) {
      console.error('Error loading nearby prayers:', error);
    }
  };

  const centerOnUserLocation = () => {
    if (currentLocation && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [currentLocation.longitude, currentLocation.latitude],
        zoomLevel: 14,
        animationDuration: 1000,
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      health: '#e74c3c',
      family: '#f39c12',
      work: '#3498db',
      relationships: '#e91e63',
      spiritual: '#9b59b6',
      financial: '#27ae60',
      grief: '#34495e',
      guidance: '#16a085',
      gratitude: '#f1c40f',
      other: '#95a5a6',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getUrgencySize = (urgency: string) => {
    const sizes = {
      low: 8,
      medium: 12,
      high: 16,
      urgent: 20,
    };
    return sizes[urgency as keyof typeof sizes] || sizes.medium;
  };

  const renderLocationPrompt = () => (
    <View style={styles.promptContainer}>
      <GlassCard variant="elevated" style={styles.promptCard}>
        <Icon name="location-on" size={48} color={theme.colors.primary} style={styles.promptIcon} />
        <Text style={styles.promptTitle}>Location Access Required</Text>
        <Text style={styles.promptText}>
          To show nearby prayers on the map, we need access to your location.
        </Text>
        <GradientButton
          title="Enable Location"
          onPress={handleLocationPermission}
          variant="spiritual"
          style={styles.promptButton}
        />
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </GlassCard>
    </View>
  );

  const renderPrayerCallout = () => {
    if (!selectedPrayer) return null;

    return (
      <View style={styles.calloutContainer}>
        <GlassCard variant="elevated" style={styles.callout}>
          <View style={styles.calloutHeader}>
            <View style={[styles.categoryIndicator, { backgroundColor: getCategoryColor(selectedPrayer.category) }]} />
            <Text style={styles.calloutTitle} numberOfLines={1}>
              {selectedPrayer.isAnonymous ? 'Anonymous Prayer' : selectedPrayer.title}
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedPrayer(null)}
              style={styles.closeButton}
            >
              <Icon name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.calloutDescription} numberOfLines={2}>
            {selectedPrayer.description}
          </Text>
          <View style={styles.calloutFooter}>
            <Text style={styles.calloutTime}>{selectedPrayer.timeAgo}</Text>
            <TouchableOpacity
              style={styles.prayButton}
              onPress={() => {
                navigation.navigate('PrayerRequest' as never, { requestId: selectedPrayer.id });
                setSelectedPrayer(null);
              }}
            >
              <Icon name="favorite" size={16} color={theme.colors.primary} />
              <Text style={styles.prayButtonText}>Pray</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </View>
    );
  };

  if (showLocationPrompt) {
    return (
      <LinearGradient
        colors={gradients.sunset}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          {renderLocationPrompt()}
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={theme.colors.textOnDark} />
          </TouchableOpacity>
          <Text style={styles.title}>Prayer Map</Text>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={centerOnUserLocation}
          >
            <Icon name="my-location" size={24} color={theme.colors.textOnDark} />
          </TouchableOpacity>
        </View>

        <View style={styles.mapContainer}>
          {currentLocation ? (
            <Mapbox.MapView
              ref={mapRef}
              style={styles.map}
              styleURL={mapStyle}
              onDidFinishLoadingMap={() => setMapReady(true)}
            >
              <Mapbox.Camera
                ref={cameraRef}
                centerCoordinate={[currentLocation.longitude, currentLocation.latitude]}
                zoomLevel={12}
              />

              {/* User location marker */}
              <Mapbox.PointAnnotation
                id="user-location"
                coordinate={[currentLocation.longitude, currentLocation.latitude]}
              >
                <View style={styles.userLocationMarker}>
                  <View style={styles.userLocationInner} />
                </View>
              </Mapbox.PointAnnotation>

              {/* Prayer markers */}
              {prayerPoints.map((prayer) => (
                <Mapbox.PointAnnotation
                  key={prayer.id}
                  id={prayer.id}
                  coordinate={prayer.coordinates}
                  onSelected={() => setSelectedPrayer(prayer)}
                >
                  <View style={[
                    styles.prayerMarker,
                    {
                      backgroundColor: getCategoryColor(prayer.category),
                      width: getUrgencySize(prayer.urgency),
                      height: getUrgencySize(prayer.urgency),
                      borderRadius: getUrgencySize(prayer.urgency) / 2,
                    }
                  ]}>
                    <Icon 
                      name="favorite" 
                      size={getUrgencySize(prayer.urgency) * 0.6} 
                      color="white" 
                    />
                  </View>
                </Mapbox.PointAnnotation>
              ))}
            </Mapbox.MapView>
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading map...</Text>
            </View>
          )}
        </View>

        {/* Map style toggle */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.styleButton}
            onPress={() => setMapStyle(
              mapStyle === 'mapbox://styles/mapbox/streets-v11'
                ? 'mapbox://styles/mapbox/satellite-streets-v11'
                : 'mapbox://styles/mapbox/streets-v11'
            )}
          >
            <Icon 
              name={mapStyle.includes('satellite') ? 'map' : 'satellite'} 
              size={20} 
              color={theme.colors.textOnDark} 
            />
          </TouchableOpacity>
        </View>

        {/* Prayer count indicator */}
        <View style={styles.prayerCount}>
          <GlassCard variant="filled" style={styles.prayerCountCard}>
            <Text style={styles.prayerCountText}>
              {prayerPoints.length} prayers nearby
            </Text>
          </GlassCard>
        </View>

        {renderPrayerCallout()}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  safeArea: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },

  backButton: {
    padding: spacing.sm,
    backgroundColor: theme.colors.glassLight,
    borderRadius: borderRadius.md,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textOnDark,
  },

  locationButton: {
    padding: spacing.sm,
    backgroundColor: theme.colors.glassLight,
    borderRadius: borderRadius.md,
  },

  mapContainer: {
    flex: 1,
  },

  map: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },

  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },

  userLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    borderWidth: 3,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },

  userLocationInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },

  prayerMarker: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  mapControls: {
    position: 'absolute',
    top: 100,
    right: spacing.lg,
    zIndex: 5,
  },

  styleButton: {
    padding: spacing.md,
    backgroundColor: theme.colors.glassStrong,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },

  prayerCount: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 5,
  },

  prayerCountCard: {
    padding: spacing.md,
    alignItems: 'center',
  },

  prayerCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textOnDark,
  },

  calloutContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 10,
  },

  callout: {
    padding: spacing.lg,
  },

  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  categoryIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },

  calloutTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },

  closeButton: {
    padding: spacing.xs,
  },

  calloutDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },

  calloutFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  calloutTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },

  prayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryContainer,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },

  prayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: spacing.xs,
  },

  promptContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },

  promptCard: {
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
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
    marginBottom: spacing.xl,
    lineHeight: 24,
  },

  promptButton: {
    alignSelf: 'stretch',
    marginBottom: spacing.lg,
  },

  skipText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default MapScreen;
