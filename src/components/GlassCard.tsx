import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { theme, shadows, borderRadius, spacing } from '@/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  blurType?: 'light' | 'dark' | 'regular';
  blurAmount?: number;
  intensity?: number;
  variant?: 'elevated' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  blurType = 'light',
  blurAmount = 10,
  intensity = 50,
  variant = 'elevated',
  size = 'medium',
}) => {
  const cardStyle = [styles.container, styles[size], styles[variant], style];

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        style={cardStyle}
        blurType={blurType}
        blurAmount={blurAmount}
        reducedTransparencyFallbackColor={theme.colors.surface}
      >
        <View style={styles.content}>{children}</View>
      </BlurView>
    );
  }

  // Android fallback with custom glass effect
  return (
    <View style={[cardStyle, styles.androidGlass]}>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.glass,
  },

  // Size variants
  small: {
    padding: spacing.md,
  },
  medium: {
    padding: spacing.lg,
  },
  large: {
    padding: spacing.xl,
  },

  // Style variants
  elevated: {
    ...shadows.glass,
    backgroundColor: theme.colors.surfaceGlass,
  },
  outlined: {
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
    backgroundColor: theme.colors.glass,
  },
  filled: {
    backgroundColor: theme.colors.glassStrong,
    ...shadows.medium,
  },

  // Android glass fallback
  androidGlass: {
    backgroundColor: theme.colors.surfaceGlass,
    backdropFilter: 'blur(10px)',
  },

  content: {
    flex: 1,
  },
});

export default GlassCard;
