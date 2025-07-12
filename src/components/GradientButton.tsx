import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  Animated,
  Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme, shadows, borderRadius, spacing, gradients, animations } from '@/theme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'spiritual' | 'peace' | 'sunrise' | 'sunset';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}) => {
  const animatedValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(animatedValue, {
      toValue: 0.95,
      useNativeDriver: true,
      ...animations.spring,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
      ...animations.spring,
    }).start();
  };

  const buttonStyle = [
    styles.container,
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const buttonTextStyle = [
    styles.text,
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <Animated.View style={{ transform: [{ scale: animatedValue }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={buttonStyle}
      >
        <LinearGradient
          colors={gradients[variant]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {icon && iconPosition === 'left' && icon}
          <Text style={buttonTextStyle}>
            {loading ? 'Loading...' : title}
          </Text>
          {icon && iconPosition === 'right' && icon}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  
  // Size variants
  small: {
    height: 40,
    borderRadius: borderRadius.md,
  },
  medium: {
    height: 48,
    borderRadius: borderRadius.lg,
  },
  large: {
    height: 56,
    borderRadius: borderRadius.xl,
  },
  
  // Text styles
  text: {
    color: theme.colors.textOnDark,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  smallText: {
    fontSize: 14,
    lineHeight: 20,
  },
  mediumText: {
    fontSize: 16,
    lineHeight: 24,
  },
  largeText: {
    fontSize: 18,
    lineHeight: 28,
  },
  
  // Disabled state
  disabled: {
    opacity: 0.5,
  },
  
  disabledText: {
    color: theme.colors.textTertiary,
  },
});

export default GradientButton;