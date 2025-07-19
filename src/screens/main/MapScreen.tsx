import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  FlatList,
  TextInput,
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
import MapLegend from '@/components/MapLegend';

const { width, height } = Dimensions.get('window');

// Configure Mapbox (you'll need to add your access token)
Mapbox.setAccessToken('pk.eyJ1IjoicHJheWZvcm1lYXBwIiwiYSI6ImNtNWF1bjNxdDAyYTQycnNhY202bXpsMjQifQ.xYK9uQhIy7HZz1ywb2XQAA');

interface PrayerMapPoint {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: string;
  coordinates: [number, number]; // [longitude, latitude]
  isAnonymous: boolean;
  timeAgo: string;
  distance?: number; // in kilometers
}

interface MapFilter {
  category: string | null;
  urgency: string | null;
  radius: number; // in kilometers
}

const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'apps' },
  { key: 'health', label: 'Health', icon: 'healing' },
  { key: 'family', label: 'Family', icon: 'family-restroom' },
  { key: 'work', label: 'Work', icon: 'work' },
  { key: 'spiritual', label: 'Spiritual', icon: 'church' },
  { key: 'relationship', label: 'Relationships', icon: 'favorite' },
  { key: 'financial', label: 'Financial', icon: 'monetization-on' },
];

const URGENCY_COLORS = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#FF5722',
  urgent: '#F44336',
};

const MapScreen: React.FC = () => {
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [prayerPoints, setPrayerPoints] = useState<PrayerMapPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<PrayerMapPoint | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filters, setFilters] = useState<MapFilter>({
    category: null,
    urgency: null,
    radius: 10, // 10km default
  });
  
  const mapRef = useRef<Mapbox.MapView>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);
  
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
        radius: filters.radius * 1000, // Convert km to meters
      })).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch nearby prayers');
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const applyFilters = useCallback((points: PrayerMapPoint[]): PrayerMapPoint[] => {
    return points.filter(point => {
      // Category filter
      if (filters.category && filters.category !== 'all' && point.category !== filters.category) {
        return false;
      }
      
      // Urgency filter
      if (filters.urgency && point.urgency !== filters.urgency) {
        return false;
      }
      
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return (
          point.title.toLowerCase().includes(query) ||
          point.description.toLowerCase().includes(query) ||
          point.category.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [filters, searchQuery]);

  const flyToLocation = (coordinates: [number, number]) => {
    cameraRef.current?.flyTo(coordinates, 2000);
  };

  const handleMapPress = (feature: any) => {
    if (feature?.properties?.id) {
      const point = prayerPoints.find(p => p.id === feature.properties.id);
      if (point) {
        setSelectedPoint(point);
        flyToLocation(point.coordinates);
      }
    }
  };

  const renderPrayerMarker = (point: PrayerMapPoint) => (
    <Mapbox.PointAnnotation
      key={point.id}
      id={point.id}
      coordinate={point.coordinates}
      onSelected={() => setSelectedPoint(point)}
    >
      <View style={[
        styles.markerContainer,
        { borderColor: URGENCY_COLORS[point.urgency as keyof typeof URGENCY_COLORS] }
      ]}>
        <Icon
          name={getCategoryIcon(point.category)}
          size={16}
          color={theme.colors.white}
        />
      </View>
    </Mapbox.PointAnnotation>
  );

  const getCategoryIcon = (category: string): string => {
    const iconMap: Record<string, string> = {
      health: 'healing',
      family: 'family-restroom',
      work: 'work',
      spiritual: 'church',
      relationship: 'favorite',
      financial: 'monetization-on',
    };
    return iconMap[category] || 'more-horiz';
  };

  const renderFilterChip = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        filters.category === item.key && styles.filterChipActive
      ]}
      onPress={() => setFilters(prev => ({
        ...prev,
        category: prev.category === item.key ? null : item.key
      }))}
    >
      <Icon
        name={item.icon}
        size={16}
        color={filters.category === item.key ? theme.colors.white : theme.colors.primary}
      />
      <Text style={[
        styles.filterChipText,
        filters.category === item.key && styles.filterChipTextActive
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    // Convert prayer requests to map points
    const points: PrayerMapPoint[] = requests
      .filter(request => request.location && !request.isAnonymous)
      .map(request => {
        const distance = location ? calculateDistance(
          location.latitude,
          location.longitude,
          request.location!.latitude,
          request.location!.longitude
        ) : 0;

        return {
          id: request.id,
          title: request.title,
          description: request.description,
          category: request.category,
          urgency: request.urgency,
          coordinates: [request.location!.longitude, request.location!.latitude],
          isAnonymous: request.isAnonymous,
          timeAgo: new Date(request.createdAt).toLocaleDateString(),
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal
        };
      });

    const filteredPoints = applyFilters(points);
    setPrayerPoints(filteredPoints);
  }, [requests, filters, applyFilters, location]);

  // Load nearby prayers when location or radius changes
  useEffect(() => {
    if (location && !prayersLoading) {
      handleFindNearbyPrayers();
    }
  }, [location, filters.radius]);

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
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Prayer Map</Text>
            <Text style={styles.headerSubtitle}>
              {prayerPoints.length} prayers near you
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowSearch(!showSearch)}
            >
              <Icon name="search" size={24} color={theme.colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Icon name="tune" size={24} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <View style={styles.searchContainer}>
            <GlassCard variant="filled" style={styles.searchCard}>
              <Icon name="search" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search prayers by title, description, or category..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon name="clear" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </GlassCard>
          </View>
        )}

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <FlatList
              data={CATEGORIES}
              renderItem={renderFilterChip}
              keyExtractor={(item) => item.key}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersList}
            />
            
            {/* Radius Filter */}
            <View style={styles.radiusContainer}>
              <GlassCard variant="filled" style={styles.radiusCard}>
                <View style={styles.radiusHeader}>
                  <Icon name="location-on" size={16} color={theme.colors.primary} />
                  <Text style={styles.radiusLabel}>Search Radius: {filters.radius}km</Text>
                </View>
                <View style={styles.radiusButtons}>
                  {[5, 10, 25, 50].map((radius) => (
                    <TouchableOpacity
                      key={radius}
                      style={[
                        styles.radiusButton,
                        filters.radius === radius && styles.radiusButtonActive
                      ]}
                      onPress={() => setFilters(prev => ({ ...prev, radius }))}
                    >
                      <Text style={[
                        styles.radiusButtonText,
                        filters.radius === radius && styles.radiusButtonTextActive
                      ]}>
                        {radius}km
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </GlassCard>
            </View>
          </View>
        )}

        {/* Map Container */}
        <View style={styles.mapContainer}>
          {location ? (
            <Mapbox.MapView
              ref={mapRef}
              style={styles.map}
              styleURL={Mapbox.StyleURL.Street}
              onPress={handleMapPress}
            >
              <Mapbox.Camera
                ref={cameraRef}
                centerCoordinate={[location.longitude, location.latitude]}
                zoomLevel={12}
                animationMode="flyTo"
                animationDuration={2000}
              />

              {/* User location */}
              <Mapbox.PointAnnotation
                id="user-location"
                coordinate={[location.longitude, location.latitude]}
              >
                <View style={styles.userMarker}>
                  <Icon name="person-pin" size={24} color={theme.colors.primary} />
                </View>
              </Mapbox.PointAnnotation>

              {/* Prayer markers */}
              {prayerPoints.map(renderPrayerMarker)}
            </Mapbox.MapView>
          ) : (
            <GlassCard variant="elevated" style={styles.mapPlaceholder}>
              <Icon 
                name="location-off" 
                size={64} 
                color={theme.colors.primary} 
                style={styles.mapIcon}
              />
              <Text style={styles.mapPlaceholderTitle}>
                Location Required
              </Text>
              <Text style={styles.mapPlaceholderText}>
                Enable location access to see prayers around you
              </Text>
              
              <GradientButton
                title="Enable Location"
                onPress={handleLocationPermission}
                variant="spiritual"
                loading={locationLoading}
                style={styles.actionButton}
              />
            </GlassCard>
          )}
        </View>

        {/* Map Legend */}
        <MapLegend 
          isVisible={showLegend}
          onToggle={() => setShowLegend(!showLegend)}
        />

        {/* Quick Stats */}
        {prayerPoints.length > 0 && !selectedPoint && (
          <View style={styles.statsFloating}>
            <GlassCard variant="filled" style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{prayerPoints.length}</Text>
                  <Text style={styles.statLabel}>Prayers</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {prayerPoints.filter(p => p.urgency === 'urgent' || p.urgency === 'high').length}
                  </Text>
                  <Text style={styles.statLabel}>Urgent</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {prayerPoints.length > 0 
                      ? Math.min(...prayerPoints.map(p => p.distance || 0)).toFixed(1) + 'km'
                      : '0km'
                    }
                  </Text>
                  <Text style={styles.statLabel}>Nearest</Text>
                </View>
              </View>
            </GlassCard>
          </View>
        )}

        {/* Prayer Details Card */}
        {selectedPoint && (
          <View style={styles.detailsContainer}>
            <GlassCard variant="elevated" style={styles.detailsCard}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedPoint(null)}
              >
                <Icon name="close" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              
              <View style={styles.detailsHeader}>
                <View style={[
                  styles.urgencyBadge,
                  { backgroundColor: URGENCY_COLORS[selectedPoint.urgency as keyof typeof URGENCY_COLORS] }
                ]}>
                  <Text style={styles.urgencyText}>{selectedPoint.urgency.toUpperCase()}</Text>
                </View>
                <Text style={styles.distanceText}>
                  {selectedPoint.distance}km away
                </Text>
              </View>

              <Text style={styles.detailsTitle} numberOfLines={2}>
                {selectedPoint.title}
              </Text>
              <Text style={styles.detailsDescription} numberOfLines={3}>
                {selectedPoint.description}
              </Text>

              <View style={styles.detailsActions}>
                <GradientButton
                  title="Pray Now"
                  onPress={() => {
                    setSelectedPoint(null);
                    navigation.navigate('PrayerRequest', { requestId: selectedPoint.id });
                  }}
                  variant="spiritual"
                  size="small"
                  style={styles.prayButton}
                />
              </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  headerContent: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textOnDark,
    marginBottom: spacing.xs,
  },

  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textOnDark,
    opacity: 0.8,
  },

  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  actionButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Search
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },

  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
  },

  // Filters
  filtersContainer: {
    paddingBottom: spacing.md,
  },

  filtersList: {
    paddingHorizontal: spacing.lg,
  },

  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },

  filterChipActive: {
    backgroundColor: theme.colors.primary,
  },

  filterChipText: {
    marginLeft: spacing.xs,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  filterChipTextActive: {
    color: theme.colors.white,
  },

  // Radius Filter
  radiusContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },

  radiusCard: {
    padding: spacing.md,
  },

  radiusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  radiusLabel: {
    marginLeft: spacing.xs,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },

  radiusButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  radiusButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  radiusButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },

  radiusButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },

  radiusButtonTextActive: {
    color: theme.colors.white,
  },

  // Map Container
  mapContainer: {
    flex: 1,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },

  map: {
    flex: 1,
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

  actionButton: {
    width: '100%',
  },

  // Markers
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
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

  userMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Details Card
  detailsContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },

  detailsCard: {
    padding: spacing.lg,
  },

  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
  },

  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  urgencyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },

  urgencyText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.white,
  },

  distanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },

  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: spacing.sm,
  },

  detailsDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },

  detailsActions: {
    alignItems: 'center',
  },

  prayButton: {
    width: '100%',
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

  // Floating Stats
  statsFloating: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 1,
  },

  statsCard: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: spacing.xs,
  },

  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },

  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: theme.colors.border,
    opacity: 0.5,
  },
});

export default MapScreen;