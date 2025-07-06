import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4C63D2',
    secondary: '#6B73FF',
    tertiary: '#9C88FF',
    background: '#F8F9FF',
    surface: '#FFFFFF',
    text: '#2D3748',
    onSurface: '#4A5568',
    accent: '#FF6B9D',
    error: '#E53E3E',
    success: '#38A169',
    warning: '#D69E2E',
    info: '#3182CE',
    
    // Custom colors for the prayer app
    prayer: {
      healing: '#38A169',
      family: '#D69E2E',
      work: '#3182CE',
      relationships: '#FF6B9D',
      financial: '#38A169',
      spiritual: '#805AD5',
      guidance: '#3182CE',
      thanksgiving: '#D69E2E',
      forgiveness: '#38A169',
      protection: '#4C63D2',
      strength: '#E53E3E',
      peace: '#6B73FF',
      other: '#718096',
    },
    
    // Gradient colors
    gradients: {
      primary: ['#4C63D2', '#6B73FF'],
      secondary: ['#6B73FF', '#9C88FF'],
      success: ['#38A169', '#68D391'],
      prayer: ['#805AD5', '#9C88FF'],
    },
    
    // UI colors
    border: '#E2E8F0',
    divider: '#E2E8F0',
    placeholder: '#A0AEC0',
    disabled: '#CBD5E0',
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // Status colors
    online: '#38A169',
    offline: '#718096',
    away: '#D69E2E',
  },
  
  // Typography
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: 'bold',
    },
    heading: {
      fontFamily: 'System',
      fontWeight: 'bold',
      fontSize: 24,
    },
    subheading: {
      fontFamily: 'System',
      fontWeight: '600',
      fontSize: 18,
    },
    body: {
      fontFamily: 'System',
      fontWeight: 'normal',
      fontSize: 16,
    },
    caption: {
      fontFamily: 'System',
      fontWeight: 'normal',
      fontSize: 12,
    },
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
  },
  
  // Shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  // Component-specific styles
  components: {
    button: {
      primary: {
        backgroundColor: '#4C63D2',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
      },
      secondary: {
        backgroundColor: 'transparent',
        borderColor: '#4C63D2',
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
      },
    },
    card: {
      default: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
    },
    input: {
      default: {
        backgroundColor: '#F7FAFC',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 16,
      },
      focused: {
        borderColor: '#4C63D2',
        borderWidth: 2,
      },
    },
  },
  
  // Animation durations
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};