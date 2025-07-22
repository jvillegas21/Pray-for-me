import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import { theme, shadows, borderRadius, spacing, gradients, opacity } from '@/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  blurType?: 'xlight' | 'light' | 'dark' | 'regular' | 'prominent' | 'systemUltraThin' | 'systemThin' | 'systemMaterial';
  blurAmount?: number;
  intensity?: number;
  variant?: 'elevated' | 'outlined' | 'filled' | 'glass' | 'glassStrong' | 'minimal';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  borderRadius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'rounded';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'glass' | 'glassStrong' | 'coloredGlass';
  gradient?: keyof typeof gradients;
  borderWidth?: number;
  borderColor?: string;
  backgroundColor?: string;
  overflow?: 'visible' | 'hidden';
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  blurType = 'systemMaterial',
  blurAmount = 25,
  intensity = 100,
  variant = 'glass',
  size = 'md',
  borderRadius: borderRadiusProp = 'lg',
  shadow = 'glass',
  gradient,
  borderWidth,
  borderColor,
  backgroundColor,
  overflow = 'hidden',
}) => {
  const containerStyle = [
    styles.container,
    styles[size],
    styles[variant],
    shadow !== 'none' && shadows[shadow],
    {
      borderRadius: borderRadius[borderRadiusProp],
      overflow,
    },
    borderWidth && { borderWidth },
    borderColor && { borderColor },
    backgroundColor && { backgroundColor },
    style,
  ];

  const contentStyle = [
    styles.content,
    {
      borderRadius: borderRadius[borderRadiusProp],
    },
  ];

  // iOS Blur Effect
  if (Platform.OS === 'ios' && (variant === 'glass' || variant === 'glassStrong')) {
    return (
      <BlurView
        style={containerStyle}
        blurType={blurType}
        blurAmount={blurAmount}
        reducedTransparencyFallbackColor={theme.colors.surface}
      >
        {gradient && (
          <LinearGradient
            colors={gradients[gradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFillObject, { opacity: 0.1 }]}
          />
        )}
        <View style={contentStyle}>{children}</View>
      </BlurView>
    );
  }

  // Standard card with optional gradient
  return (
    <View style={containerStyle}>
      {gradient && (
        <LinearGradient
          colors={gradients[gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            StyleSheet.absoluteFillObject,
            { opacity: variant === 'filled' ? 1 : 0.1 },
            { borderRadius: borderRadius[borderRadiusProp] },
          ]}
        />
      )}
      <View style={contentStyle}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },

  // Size variants
  xs: {
    padding: spacing.xs,
  },
  sm: {
    padding: spacing.sm,
  },
  md: {
    padding: spacing.md,
  },
  lg: {
    padding: spacing.lg,
  },
  xl: {
    padding: spacing.xl,
  },

  // Style variants
  elevated: {
    backgroundColor: theme.colors.surface,
  },
  outlined: {
    borderColor: theme.colors.border,
    borderWidth: 1,
    backgroundColor: theme.colors.surface,
  },
  filled: {
    backgroundColor: theme.colors.surface,
  },
  glass: {
    backgroundColor: theme.colors.surfaceGlass,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  glassStrong: {
    backgroundColor: theme.colors.surfaceGlassStrong,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  minimal: {
    backgroundColor: 'transparent',
  },

  content: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
});

export default GlassCard;
