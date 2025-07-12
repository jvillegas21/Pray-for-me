import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4A90E2',      // Peaceful blue
    secondary: '#8B4A8B',    // Spiritual purple
    accent: '#F5A623',       // Warm gold
    background: '#FAFAFA',   // Light gray
    surface: '#FFFFFF',      // White
    text: '#333333',         // Dark gray
    placeholder: '#999999',  // Medium gray
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#FF6B6B', // Soft red for alerts
    success: '#4CAF50',      // Green for success
    warning: '#FF9800',      // Orange for warnings
    error: '#F44336',        // Red for errors
  },
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
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};