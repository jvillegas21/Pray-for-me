import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  Pressable,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  theme,
  shadows,
  borderRadius,
  spacing,
  gradients,
  animations,
  opacity,
} from '@/theme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?:
    | 'primary'
    | 'secondary'
    | 'spiritual'
    | 'peace'
    | 'love'
    | 'hope'
    | 'sunrise'
    | 'sunset'
    | 'filled'
    | 'tinted'
    | 'plain'
    | 'bordered';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  borderRadius?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'rounded';
  hapticFeedback?: boolean;
  gradient?: keyof typeof gradients;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  borderRadius: borderRadiusProp = 'lg',
  hapticFeedback = true,
  gradient,
}) => {
  const animatedValue = new Animated.Value(1);

  const handlePressIn = () => {
    if (hapticFeedback) {
      // Add haptic feedback here if library is available
      // ReactNativeHapticFeedback.trigger('impactLight');
    }
    
    Animated.spring(animatedValue, {
      toValue: 0.95,
      useNativeDriver: true,
      ...animations.springGentle,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
      ...animations.springGentle,
    }).start();
  };

  const containerStyle = [
    styles.container,
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    {
      borderRadius: borderRadius[borderRadiusProp],
    },
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    styles[`${variant}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const gradientColors = gradient 
    ? gradients[gradient] 
    : gradients[variant] || gradients.primary;

  const renderContent = () => (
    <View style={styles.contentContainer}>
      {icon && iconPosition === 'left' && (
        <View style={[styles.iconContainer, styles.iconLeft]}>
          {icon}
        </View>
      )}
      <Text style={textStyles} numberOfLines={1}>
        {loading ? 'Loading...' : title}
      </Text>
      {icon && iconPosition === 'right' && (
        <View style={[styles.iconContainer, styles.iconRight]}>
          {icon}
        </View>
      )}
    </View>
  );

  const isGradientVariant = ['primary', 'secondary', 'spiritual', 'peace', 'love', 'hope', 'sunrise', 'sunset', 'filled'].includes(variant);

  return (
    <Animated.View style={{ transform: [{ scale: animatedValue }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={containerStyle}
      >
        {isGradientVariant ? (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.gradient,
              {
                borderRadius: borderRadius[borderRadiusProp],
              },
            ]}
          >
            {renderContent()}
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.solidButton,
              styles[variant],
              {
                borderRadius: borderRadius[borderRadiusProp],
              },
            ]}
          >
            {renderContent()}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'flex-start',
  },

  fullWidth: {
    alignSelf: 'stretch',
  },

  // Size variants
  xs: {
    minHeight: 28,
    paddingHorizontal: spacing.sm,
  },
  sm: {
    minHeight: 32,
    paddingHorizontal: spacing.md,
  },
  md: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  lg: {
    minHeight: 50,
    paddingHorizontal: spacing.xl,
  },
  xl: {
    minHeight: 56,
    paddingHorizontal: spacing.xxl,
  },

  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },

  solidButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },

  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconLeft: {
    marginRight: spacing.xs,
  },

  iconRight: {
    marginLeft: spacing.xs,
  },

  // Non-gradient button variants
  tinted: {
    backgroundColor: theme.colors.fillSecondary,
  },
  plain: {
    backgroundColor: 'transparent',
  },
  bordered: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },

  // Text styles by size
  xsText: {
    ...theme.fonts.caption1Emphasized,
  },
  smText: {
    ...theme.fonts.footnoteEmphasized,
  },
  mdText: {
    ...theme.fonts.headline,
  },
  lgText: {
    ...theme.fonts.title3,
  },
  xlText: {
    ...theme.fonts.title2,
  },

  // Text styles by variant
  text: {
    textAlign: 'center',
    fontWeight: '600',
  },
  primaryText: {
    color: theme.colors.textOnDark,
  },
  secondaryText: {
    color: theme.colors.textOnDark,
  },
  spiritualText: {
    color: theme.colors.textOnDark,
  },
  peaceText: {
    color: theme.colors.textOnDark,
  },
  loveText: {
    color: theme.colors.textOnDark,
  },
  hopeText: {
    color: theme.colors.textOnDark,
  },
  sunriseText: {
    color: theme.colors.textOnDark,
  },
  sunsetText: {
    color: theme.colors.textOnDark,
  },
  filledText: {
    color: theme.colors.textOnDark,
  },
  tintedText: {
    color: theme.colors.primary,
  },
  plainText: {
    color: theme.colors.primary,
  },
  borderedText: {
    color: theme.colors.primary,
  },

  disabled: {
    opacity: opacity.disabled,
  },

  disabledText: {
    opacity: opacity.disabled,
  },
});

export default GradientButton;
