import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {Text, FAB, Card, IconButton} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import MapView, {Marker, Circle, PROVIDER_GOOGLE} from 'react-native-maps';
import {useLocation} from '../../context/LocationContext';
import {usePrayer} from '../../context/PrayerContext';
import {useNavigation} from '@react-navigation/native';
import {Prayer} from '../../types';
import {colors, spacing, fontSize, fontWeight, shadows, borderRadius} from '../../utils/theme';

const {width, height} = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const MapScreen = () => {
  const navigation = useNavigation();
  const {location, getCurrentLocation} = useLocation();
  const {nearbyPrayers, fetchNearbyPrayers} = usePrayer();
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [mapRadius, setMapRadius] = useState(5000); // 5km default

  useEffect(() => {
    if (!location) {
      getCurrentLocation();
    } else {
      fetchNearbyPrayers(location, mapRadius);
    }
  }, [location, mapRadius]);

  const getCategoryColor = (category: string) => {
    return colors.categories[category as keyof typeof colors.categories] || colors.gray[500];
  };

  const handleMarkerPress = (prayer: Prayer) => {
    setSelectedPrayer(prayer);
  };

  const region = location ? {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  } : {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        showsUserLocation
        showsMyLocationButton>
        
        {location && (
          <Circle
            center={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            radius={mapRadius}
            fillColor={colors.primary + '20'}
            strokeColor={colors.primary}
            strokeWidth={2}
          />
        )}

        {nearbyPrayers.map((prayer) => (
          <Marker
            key={prayer._id}
            coordinate={{
              latitude: prayer.location.coordinates[1],
              longitude: prayer.location.coordinates[0],
            }}
            onPress={() => handleMarkerPress(prayer)}>
            <View style={[styles.marker, {backgroundColor: getCategoryColor(prayer.category)}]}>
              <Text style={styles.markerText}>🙏</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {selectedPrayer && (
        <Card style={styles.selectedPrayerCard}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.cardInfo}>
                <Text style={styles.prayerTitle} numberOfLines={1}>
                  {selectedPrayer.title}
                </Text>
                <Text style={styles.prayerMeta}>
                  {typeof selectedPrayer.user === 'object' ? selectedPrayer.user.name : 'Anonymous'} • {selectedPrayer.category}
                </Text>
              </View>
              <IconButton
                icon="close"
                size={20}
                onPress={() => setSelectedPrayer(null)}
              />
            </View>
            <Text style={styles.prayerContent} numberOfLines={2}>
              {selectedPrayer.content}
            </Text>
            <View style={styles.cardActions}>
              <Text style={styles.prayerStats}>
                ❤️ {selectedPrayer.likeCount} • 🙏 {selectedPrayer.prayerCount}
              </Text>
              <IconButton
                icon="arrow-right"
                size={20}
                onPress={() => {
                  navigation.navigate('Home' as any, {
                    screen: 'PrayerDetail',
                    params: {prayerId: selectedPrayer._id},
                  });
                }}
              />
            </View>
          </Card.Content>
        </Card>
      )}

      <View style={styles.radiusControl}>
        <Card style={styles.radiusCard}>
          <Card.Content style={styles.radiusContent}>
            <Text style={styles.radiusLabel}>Search Radius: {mapRadius / 1000}km</Text>
            <View style={styles.radiusButtons}>
              <IconButton
                icon="minus"
                size={20}
                onPress={() => setMapRadius(Math.max(1000, mapRadius - 5000))}
              />
              <IconButton
                icon="plus"
                size={20}
                onPress={() => setMapRadius(Math.min(50000, mapRadius + 5000))}
              />
            </View>
          </Card.Content>
        </Card>
      </View>

      <FAB
        icon="crosshairs-gps"
        style={styles.fab}
        onPress={getCurrentLocation}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    ...shadows.md,
  },
  markerText: {
    fontSize: 20,
  },
  selectedPrayerCard: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardInfo: {
    flex: 1,
  },
  prayerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.gray[900],
  },
  prayerMeta: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    marginTop: 2,
  },
  prayerContent: {
    fontSize: fontSize.base,
    color: colors.gray[700],
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prayerStats: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
  },
  radiusControl: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.md,
    right: spacing.md,
  },
  radiusCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  radiusContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  radiusLabel: {
    fontSize: fontSize.base,
    color: colors.gray[700],
    fontWeight: fontWeight.medium,
  },
  radiusButtons: {
    flexDirection: 'row',
  },
  fab: {
    position: 'absolute',
    margin: spacing.md,
    right: 0,
    bottom: 180,
    backgroundColor: colors.primary,
  },
});

export default MapScreen;