import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    // Modern iOS-inspired primary colors
    primary: '#007AFF', // iOS Blue
    primaryLight: '#5AC8FA', // Light blue
    primaryDark: '#0051D5', // Dark blue
    primaryVariant: '#32D74B', // iOS Green

    // Sophisticated secondary palette
    secondary: '#FF3B30', // iOS Red
    secondaryLight: '#FF6B6B', // Coral
    secondaryDark: '#D70015', // Dark red

    // Accent colors for modern touches
    accent: '#FF9500', // iOS Orange
    accentLight: '#FFCC02', // Yellow
    accentPurple: '#AF52DE', // iOS Purple
    accentPink: '#FF2D92', // iOS Pink

    // Refined background system
    background: '#F2F2F7', // iOS System Background
    backgroundSecondary: '#FFFFFF', // Secondary background
    backgroundTertiary: '#F2F2F7', // Tertiary background
    backgroundGrouped: '#F2F2F7', // Grouped background
    backgroundDark: '#000000', // Pure black for dark mode

    // Advanced surface system with glassmorphism
    surface: '#FFFFFF', // Primary surface
    surfaceVariant: '#F2F2F7', // Variant surface
    surfaceContainer: '#FFFFFF', // Container surface
    surfaceGlass: 'rgba(255, 255, 255, 0.85)', // Glass effect
    surfaceGlassLight: 'rgba(255, 255, 255, 0.6)', // Light glass
    surfaceGlassStrong: 'rgba(255, 255, 255, 0.95)', // Strong glass
    surfaceDarkGlass: 'rgba(0, 0, 0, 0.3)', // Dark glass overlay

    // Modern text hierarchy
    text: '#000000', // Primary text
    textSecondary: '#3C3C43', // Secondary text with 60% opacity
    textTertiary: '#3C3C4399', // Tertiary text with 40% opacity
    textQuaternary: '#3C3C4366', // Quaternary text with 30% opacity
    textOnDark: '#FFFFFF', // Text on dark backgrounds
    textLink: '#007AFF', // Link text

    // Semantic colors with iOS system colors
    success: '#32D74B', // iOS Green
    successLight: '#30DB5B', // Light green
    warning: '#FF9500', // iOS Orange
    warningLight: '#FFAB00', // Light orange
    error: '#FF3B30', // iOS Red
    errorLight: '#FF453A', // Light red

    // Spiritual and prayer-specific colors
    spiritual: '#AF52DE', // Purple for spiritual content
    spiritualLight: '#BF5AF2', // Light purple
    peace: '#5AC8FA', // Peaceful blue
    peaceLight: '#64D2FF', // Light peaceful blue
    hope: '#32D74B', // Green for hope
    love: '#FF2D92', // Pink for love

    // Advanced glass and transparency system
    glass: 'rgba(255, 255, 255, 0.2)',
    glassStrong: 'rgba(255, 255, 255, 0.4)',
    glassUltra: 'rgba(255, 255, 255, 0.7)',
    backdrop: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.1)',

    // Interactive states
    ripple: 'rgba(0, 122, 255, 0.15)',
    pressed: 'rgba(0, 122, 255, 0.1)',
    disabled: '#8E8E93',
    placeholder: '#C7C7CC',

    // Border colors
    border: 'rgba(60, 60, 67, 0.13)',
    borderLight: 'rgba(60, 60, 67, 0.06)',
    borderStrong: 'rgba(60, 60, 67, 0.25)',

    // Fill colors for modern iOS buttons
    fillPrimary: '#007AFF',
    fillSecondary: 'rgba(120, 120, 128, 0.2)',
    fillTertiary: 'rgba(118, 118, 128, 0.12)',
    fillQuaternary: 'rgba(116, 116, 128, 0.08)',

    // Notification and status colors
    notification: '#FF3B30',
  },

  // Enhanced typography system based on iOS Human Interface Guidelines
  fonts: {
    ...DefaultTheme.fonts,
    // Large Title (iOS Style)
    largeTitle: {
      fontFamily: 'SF Pro Display',
      fontWeight: '700',
      fontSize: 34,
      lineHeight: 41,
      letterSpacing: 0.36,
    },

    // Title styles
    title1: {
      fontFamily: 'SF Pro Display',
      fontWeight: '700',
      fontSize: 28,
      lineHeight: 34,
      letterSpacing: 0.36,
    },
    title2: {
      fontFamily: 'SF Pro Display',
      fontWeight: '600',
      fontSize: 22,
      lineHeight: 28,
      letterSpacing: 0.35,
    },
    title3: {
      fontFamily: 'SF Pro Display',
      fontWeight: '600',
      fontSize: 20,
      lineHeight: 24,
      letterSpacing: 0.38,
    },

    // Headline styles
    headline: {
      fontFamily: 'SF Pro Text',
      fontWeight: '600',
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.43,
    },

    // Body styles
    body: {
      fontFamily: 'SF Pro Text',
      fontWeight: '400',
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.43,
    },
    bodyEmphasized: {
      fontFamily: 'SF Pro Text',
      fontWeight: '600',
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.43,
    },

    // Callout styles
    callout: {
      fontFamily: 'SF Pro Text',
      fontWeight: '400',
      fontSize: 16,
      lineHeight: 21,
      letterSpacing: -0.32,
    },
    calloutEmphasized: {
      fontFamily: 'SF Pro Text',
      fontWeight: '600',
      fontSize: 16,
      lineHeight: 21,
      letterSpacing: -0.32,
    },

    // Subhead styles
    subhead: {
      fontFamily: 'SF Pro Text',
      fontWeight: '400',
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.24,
    },
    subheadEmphasized: {
      fontFamily: 'SF Pro Text',
      fontWeight: '600',
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.24,
    },

    // Footnote styles
    footnote: {
      fontFamily: 'SF Pro Text',
      fontWeight: '400',
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: -0.08,
    },
    footnoteEmphasized: {
      fontFamily: 'SF Pro Text',
      fontWeight: '600',
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: -0.08,
    },

    // Caption styles
    caption1: {
      fontFamily: 'SF Pro Text',
      fontWeight: '400',
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0,
    },
    caption1Emphasized: {
      fontFamily: 'SF Pro Text',
      fontWeight: '600',
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0,
    },
    caption2: {
      fontFamily: 'SF Pro Text',
      fontWeight: '400',
      fontSize: 11,
      lineHeight: 13,
      letterSpacing: 0.07,
    },
    caption2Emphasized: {
      fontFamily: 'SF Pro Text',
      fontWeight: '600',
      fontSize: 11,
      lineHeight: 13,
      letterSpacing: 0.07,
    },
  },
};

// Modern iOS spacing system
export const spacing = {
  xxxs: 2,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  massive: 64,
  giant: 80,
};

// iOS-inspired border radius system
export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  xxl: 16,
  xxxl: 20,
  huge: 24,
  rounded: 999,
};

// Enhanced shadow system for depth and glassmorphism
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glass: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  glassStrong: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  coloredGlass: {
    shadowColor: '#AF52DE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Modern gradient system with iOS-inspired colors
export const gradients = {
  primary: ['#007AFF', '#5AC8FA'],
  secondary: ['#FF3B30', '#FF6B6B'],
  spiritual: ['#AF52DE', '#BF5AF2'],
  peace: ['#5AC8FA', '#64D2FF'],
  love: ['#FF2D92', '#FF6B6B'],
  hope: ['#32D74B', '#30DB5B'],
  sunrise: ['#FF9500', '#FFCC02'],
  sunset: ['#FF6B6B', '#AF52DE'],
  ocean: ['#5AC8FA', '#007AFF'],
  forest: ['#32D74B', '#30DB5B'],
  glass: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.3)'],
  glassStrong: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.6)'],
  darkGlass: ['rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.2)'],
  backgroundGradient: ['#F2F2F7', '#FFFFFF'],
  cardGradient: ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)'],
};

// Advanced animation system
export const animations = {
  fastest: 100,
  fast: 200,
  normal: 300,
  slow: 400,
  slowest: 500,
  spring: {
    damping: 20,
    stiffness: 200,
    mass: 1,
  },
  springBouncy: {
    damping: 10,
    stiffness: 100,
    mass: 1,
  },
  springGentle: {
    damping: 25,
    stiffness: 250,
    mass: 1,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
  },
};

// Layout constants
export const layout = {
  headerHeight: 44,
  tabBarHeight: 83,
  safeAreaTop: 47,
  safeAreaBottom: 34,
  screenPadding: spacing.md,
  cardSpacing: spacing.sm,
  sectionSpacing: spacing.lg,
};

// Modern opacity system
export const opacity = {
  disabled: 0.3,
  overlay: 0.5,
  subtle: 0.6,
  medium: 0.8,
  strong: 0.9,
  opaque: 1.0,
};
