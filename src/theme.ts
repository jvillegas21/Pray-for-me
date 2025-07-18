import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    // Primary gradients inspired by top iOS apps
    primary: '#6366F1', // Modern indigo
    primaryLight: '#8B7CF6', // Light indigo
    primaryDark: '#4F46E5', // Dark indigo

    // Secondary spiritual colors
    secondary: '#EC4899', // Vibrant pink
    secondaryLight: '#F472B6', // Light pink

    // Accent colors for highlights
    accent: '#DC2626', // Warm amber
    accentLight: '#fca5a5', // Light amber

    // Modern background system
    background: '#FAFBFF', // Very light blue-white
    backgroundDark: '#0F0F23', // Deep dark blue

    // Surface colors with glassmorphism support
    surface: '#FFFFFF', // Pure white
    surfaceVariant: '#F1F5F9', // Light gray-blue
    surfaceGlass: 'rgba(255, 255, 255, 0.8)', // Glassmorphism
    surfaceDarkGlass: 'rgba(15, 15, 35, 0.8)', // Dark glassmorphism

    // Text hierarchy
    text: '#1E293B', // Rich dark
    textSecondary: '#64748B', // Medium gray
    textTertiary: '#94A3B8', // Light gray
    textOnDark: '#F8FAFC', // Almost white

    // Semantic colors
    success: '#10B981', // Modern green
    successLight: '#6EE7B7', // Light green
    warning: '#F59E0B', // Amber
    error: '#EF4444', // Modern red
    errorLight: '#FCA5A5', // Light red

    // Special spiritual colors
    spiritual: '#7C3AED', // Deep purple
    spiritualLight: '#A78BFA', // Light purple
    peace: '#06B6D4', // Peaceful cyan
    hope: '#84CC16', // Hopeful green

    // Glass and transparency
    glass: 'rgba(255, 255, 255, 0.25)',
    glassStrong: 'rgba(255, 255, 255, 0.4)',
    backdrop: 'rgba(0, 0, 0, 0.4)',
    overlay: 'rgba(15, 15, 35, 0.6)',

    // Interactive states
    ripple: 'rgba(99, 102, 241, 0.2)',
    pressed: 'rgba(99, 102, 241, 0.1)',
    disabled: '#E2E8F0',

    // Notification colors
    notification: '#EC4899',
  },

  // Enhanced typography system
  fonts: {
    ...DefaultTheme.fonts,
    // Display fonts for headings
    displayLarge: {
      fontFamily: 'SF Pro Display',
      fontWeight: '700',
      fontSize: 32,
      lineHeight: 40,
    },
    displayMedium: {
      fontFamily: 'SF Pro Display',
      fontWeight: '600',
      fontSize: 28,
      lineHeight: 36,
    },
    displaySmall: {
      fontFamily: 'SF Pro Display',
      fontWeight: '600',
      fontSize: 24,
      lineHeight: 32,
    },

    // Headline fonts
    headlineLarge: {
      fontFamily: 'SF Pro Text',
      fontWeight: '600',
      fontSize: 22,
      lineHeight: 28,
    },
    headlineMedium: {
      fontFamily: 'SF Pro Text',
      fontWeight: '600',
      fontSize: 20,
      lineHeight: 26,
    },
    headlineSmall: {
      fontFamily: 'SF Pro Text',
      fontWeight: '600',
      fontSize: 18,
      lineHeight: 24,
    },

    // Body fonts
    bodyLarge: {
      fontFamily: 'SF Pro Text',
      fontWeight: 'normal',
      fontSize: 16,
      lineHeight: 24,
    },
    bodyMedium: {
      fontFamily: 'SF Pro Text',
      fontWeight: 'normal',
      fontSize: 14,
      lineHeight: 20,
    },
    bodySmall: {
      fontFamily: 'SF Pro Text',
      fontWeight: 'normal',
      fontSize: 12,
      lineHeight: 16,
    },

    // Label fonts
    labelLarge: {
      fontFamily: 'SF Pro Text',
      fontWeight: '500',
      fontSize: 14,
      lineHeight: 20,
    },
    labelMedium: {
      fontFamily: 'SF Pro Text',
      fontWeight: '500',
      fontSize: 12,
      lineHeight: 16,
    },
    labelSmall: {
      fontFamily: 'SF Pro Text',
      fontWeight: '500',
      fontSize: 10,
      lineHeight: 14,
    },
  },
};

// Enhanced spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
};

// Modern border radius system
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  rounded: 999,
};

// Shadow system for depth
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glass: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
};

// Gradient definitions
export const gradients = {
  primary: ['#6366F1', '#8B7CF6'],
  secondary: ['#EC4899', '#F472B6'],
  spiritual: ['#7C3AED', '#A78BFA'],
  peace: ['#06B6D4', '#67E8F9'],
  sunrise: ['#F59E0B', '#FCD34D'],
  sunset: ['#EC4899', '#7C3AED'],
  glass: ['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.1)'],
  darkGlass: ['rgba(15, 15, 35, 0.8)', 'rgba(15, 15, 35, 0.4)'],
};

// Animation timings
export const animations = {
  fast: 150,
  normal: 250,
  slow: 350,
  spring: {
    damping: 15,
    stiffness: 150,
  },
};
