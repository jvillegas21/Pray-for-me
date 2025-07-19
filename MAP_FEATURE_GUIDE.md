# Prayer Map Feature Guide

## Overview

The enhanced Prayer Map feature allows users to visualize and discover prayer requests from their local community on an interactive map. Users can filter prayers by category, urgency, and search radius to find relevant prayer opportunities nearby.

## Key Features

### 🗺️ Interactive Map
- **Real-time prayer visualization**: View prayer requests as markers on the map
- **User location**: Shows your current location with a person pin
- **Smooth animations**: Fly-to animations when selecting prayers
- **Touch interactions**: Tap markers to view prayer details

### 🔍 Advanced Filtering & Search
- **Category filters**: Filter by health, family, work, spiritual, relationships, financial
- **Urgency levels**: Visual color coding (urgent=red, high=orange, medium=yellow, low=green)
- **Text search**: Search prayers by title, description, or category
- **Radius control**: Adjust search distance (5km, 10km, 25km, 50km)

### 📊 Real-time Statistics
- **Prayer count**: Total prayers in current view
- **Urgent prayers**: Count of high-priority requests
- **Nearest prayer**: Distance to closest prayer request

### 🎯 Smart Markers
- **Color-coded urgency**: Border colors indicate prayer priority
- **Category icons**: Different icons for each prayer category
- **Clustering**: Groups nearby prayers for better performance
- **Interactive details**: Tap to see full prayer information

### 📱 User Experience
- **Location permission**: Smooth prompts for location access
- **Glass morphism UI**: Beautiful, modern interface design
- **Responsive filters**: Real-time filtering without lag
- **Legend**: Helpful guide to understand map symbols

## Technical Implementation

### Dependencies
- `@rnmapbox/maps`: Mapbox React Native integration
- `@react-native-community/geolocation`: Device location access
- React Native location permissions

### Key Components

#### MapScreen.tsx
Main map interface with:
- Mapbox MapView integration
- Prayer marker rendering
- Filter and search functionality
- Location permission handling

#### MapLegend.tsx
Toggleable legend showing:
- Priority level color codes
- Category icons
- Special marker meanings

#### MapCluster.tsx
Smart clustering component for:
- Grouping nearby prayers
- Dynamic sizing based on count
- Urgency-based coloring

### Data Flow
1. **Location Request**: Ask for user permission
2. **Prayer Fetch**: Load prayers within radius
3. **Filter Application**: Apply category/search filters
4. **Map Rendering**: Display filtered prayers as markers
5. **Interaction**: Handle marker taps and detail views

## Setup Instructions

### 1. Mapbox Configuration
1. Create account at [mapbox.com](https://www.mapbox.com)
2. Get your access token from the dashboard
3. Add to environment variables:
```env
MAPBOX_ACCESS_TOKEN=pk.your_mapbox_access_token_here
```

### 2. Platform Setup

#### Android
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

#### iOS
Add to `ios/YourApp/Info.plist`:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to show nearby prayers.</string>
```

### 3. Environment Setup
```bash
# Install dependencies (already done)
npm install @rnmapbox/maps @react-native-community/geolocation

# For React Native 0.60+, run pod install for iOS
cd ios && pod install
```

## Usage Guide

### For Users

#### 1. Enable Location
- Tap "Enable Location" when prompted
- Grant location permission in device settings
- Map will center on your current location

#### 2. Browse Prayers
- Prayer markers appear as colored circles
- Colors indicate urgency (red=urgent, green=low)
- Icons show prayer categories

#### 3. Filter & Search
- Tap filter icon (tune) to show category filters
- Tap search icon to search by keywords
- Adjust radius to expand/narrow search area

#### 4. View Prayer Details
- Tap any prayer marker
- Details card appears at bottom
- Tap "Pray Now" to view full prayer request

#### 5. Use Legend
- Tap info icon (ⓘ) to show legend
- Learn about marker colors and icons
- Understand special symbols

### For Developers

#### Adding New Prayer Categories
```typescript
const CATEGORIES = [
  { key: 'new_category', label: 'New Category', icon: 'icon-name' },
  // ... existing categories
];
```

#### Customizing Map Styles
```typescript
// In MapScreen.tsx
<Mapbox.MapView
  styleURL={Mapbox.StyleURL.Street} // Change to other styles
  // Mapbox.StyleURL.Satellite
  // Mapbox.StyleURL.Dark
  // Custom URL for custom styles
/>
```

#### Adjusting Default Settings
```typescript
const [filters, setFilters] = useState<MapFilter>({
  category: null,
  urgency: null,
  radius: 10, // Change default radius
});
```

## Performance Considerations

### Optimization Features
- **Marker clustering**: Prevents overcrowding with many prayers
- **Lazy loading**: Only loads prayers in current viewport
- **Efficient filtering**: Client-side filtering for smooth UX
- **Debounced search**: Prevents excessive API calls

### Memory Management
- Markers are efficiently rendered using Mapbox native components
- Unused map tiles are automatically cleaned up
- Component state is optimized for performance

## Privacy & Security

### Location Privacy
- Location data is only used for finding nearby prayers
- No location tracking or storage
- Users can deny location permission and still use other features

### Prayer Privacy
- Only non-anonymous prayers appear on map
- Personal information is protected
- Exact locations are never stored, only general areas

## Troubleshooting

### Common Issues

#### Map Not Loading
1. Check Mapbox access token is valid
2. Verify internet connection
3. Check console for API errors

#### Location Not Working
1. Ensure location permissions are granted
2. Check device location services are enabled
3. Try restarting the app

#### Prayers Not Appearing
1. Check if location permission is granted
2. Verify prayers exist in selected radius
3. Check filter settings

#### Performance Issues
1. Reduce search radius if too many prayers
2. Close other apps to free memory
3. Restart app if markers don't respond

## Future Enhancements

### Planned Features
- **Real-time updates**: Live prayer status changes
- **Prayer heatmaps**: Density visualization
- **Community boundaries**: Show church/community areas
- **Offline support**: Cached prayers for offline viewing
- **Navigation**: Directions to prayer locations

### API Enhancements
- **Geospatial database**: PostGIS for efficient location queries
- **Push notifications**: Alert users to nearby urgent prayers
- **Prayer clustering**: Server-side clustering for better performance

## Support

For technical issues or feature requests, please:
1. Check this guide first
2. Review the codebase documentation
3. Create an issue with detailed description
4. Include device/platform information

---

*The Prayer Map feature brings communities together through the power of location-aware prayer sharing, making it easy to find and support those in need around you.*