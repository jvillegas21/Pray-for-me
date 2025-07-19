import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';
// Note: In a production app, you would import from '@env'
// import { MAPBOX_ACCESS_TOKEN } from '@env';

// For demo purposes, using a public token - replace with your own
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoicHJheWZvcm1lYXBwIiwiYSI6ImNtNWF1bjNxdDAyYTQycnNhY202bXpsMjQifQ.xYK9uQhIy7HZz1ywb2XQAA';
const MAPBOX_API_BASE = 'https://api.mapbox.com';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface Place {
  id: string;
  name: string;
  address: string;
  coordinates: LocationCoordinates;
  category?: string;
}

export interface RouteResult {
  distance: number; // in meters
  duration: number; // in seconds
  coordinates: LocationCoordinates[];
}

export const locationService = {
  async requestPermission(): Promise<'granted' | 'denied' | 'pending'> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'Pray For Me needs access to your location to find nearby prayer requests and communities.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return 'granted';
        } else {
          return 'denied';
        }
      } catch (error) {
        return 'denied';
      }
    }

    // For iOS, permissions are handled automatically by React Native
    return 'granted';
  },

  async getCurrentLocation(): Promise<LocationCoordinates> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  },

  async watchPosition(
    onSuccess: (position: LocationCoordinates) => void,
    onError: (error: string) => void
  ): Promise<number> {
    return Geolocation.watchPosition(
      (position) => {
        onSuccess({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        onError(`Location error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        distanceFilter: 10, // meters
      }
    );
  },

  clearWatch(watchId: number) {
    Geolocation.clearWatch(watchId);
  },

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
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
    const distance = R * c; // Distance in kilometers
    return distance;
  },

  // Mapbox Geocoding API
  async geocodeAddress(address: string): Promise<Place[]> {
    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `${MAPBOX_API_BASE}/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=5`
      );

      const data = await response.json();

      if (!data.features || data.features.length === 0) {
        return [];
      }

      return data.features.map((feature: any) => ({
        id: feature.id,
        name: feature.text,
        address: feature.place_name,
        coordinates: {
          longitude: feature.center[0],
          latitude: feature.center[1],
        },
        category: feature.properties?.category,
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  },

  // Mapbox Reverse Geocoding
  async reverseGeocode(
    coordinates: LocationCoordinates
  ): Promise<Place | null> {
    try {
      const response = await fetch(
        `${MAPBOX_API_BASE}/geocoding/v5/mapbox.places/${coordinates.longitude},${coordinates.latitude}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`
      );

      const data = await response.json();

      if (!data.features || data.features.length === 0) {
        return null;
      }

      const feature = data.features[0];
      return {
        id: feature.id,
        name: feature.text,
        address: feature.place_name,
        coordinates: {
          longitude: feature.center[0],
          latitude: feature.center[1],
        },
        category: feature.properties?.category,
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  },

  // Mapbox Directions API
  async getRoute(
    from: LocationCoordinates,
    to: LocationCoordinates,
    profile: 'driving' | 'walking' | 'cycling' = 'driving'
  ): Promise<RouteResult | null> {
    try {
      const response = await fetch(
        `${MAPBOX_API_BASE}/directions/v5/mapbox/${profile}/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?access_token=${MAPBOX_ACCESS_TOKEN}&geometries=geojson`
      );

      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        return null;
      }

      const route = data.routes[0];
      return {
        distance: route.distance,
        duration: route.duration,
        coordinates: route.geometry.coordinates.map(
          (coord: [number, number]) => ({
            longitude: coord[0],
            latitude: coord[1],
          })
        ),
      };
    } catch (error) {
      console.error('Routing error:', error);
      return null;
    }
  },

  // Search for places of worship nearby
  async searchNearbyPlacesOfWorship(
    coordinates: LocationCoordinates,
    radius: number = 5000 // meters
  ): Promise<Place[]> {
    try {
      const response = await fetch(
        `${MAPBOX_API_BASE}/geocoding/v5/mapbox.places/church.json?access_token=${MAPBOX_ACCESS_TOKEN}&proximity=${coordinates.longitude},${coordinates.latitude}&limit=10&types=poi`
      );

      const data = await response.json();

      if (!data.features || data.features.length === 0) {
        return [];
      }

      return data.features
        .filter((feature: any) => {
          const distance = this.calculateDistance(
            coordinates.latitude,
            coordinates.longitude,
            feature.center[1],
            feature.center[0]
          );
          return distance <= radius / 1000; // Convert to km
        })
        .map((feature: any) => ({
          id: feature.id,
          name: feature.text,
          address: feature.place_name,
          coordinates: {
            longitude: feature.center[0],
            latitude: feature.center[1],
          },
          category: 'place_of_worship',
        }));
    } catch (error) {
      console.error('Places search error:', error);
      return [];
    }
  },

  // Check if location services are available
  async isLocationServicesEnabled(): Promise<boolean> {
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        () => resolve(true),
        () => resolve(false),
        { timeout: 1000 }
      );
    });
  },
};
