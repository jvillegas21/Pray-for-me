import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  theme,
  shadows,
  borderRadius,
  spacing,
  gradients,
  animations,
  opacity,
  layout,
} from '@/theme';

interface ModernHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  onProfilePress?: () => void;
  rightComponent?: React.ReactNode;
  animated?: boolean;
  animatedValue?: Animated.Value;
  blur?: boolean;
  gradient?: keyof typeof gradients;
  transparent?: boolean;
}

const ModernHeader: React.FC<ModernHeaderProps> = ({
  title = 'Pray For Me',
  subtitle,
  showBackButton = false,
  onBackPress,
  onProfilePress,
  rightComponent,
  animated = false,
  animatedValue,
  blur = true,
  gradient,
  transparent = false,
}) => {
  const headerStyle = [
    styles.container,
    animated && animatedValue && {
      transform: [
        {
          translateY: animatedValue.interpolate({
            inputRange: [0, 100],
            outputRange: [0, -layout.headerHeight],
            extrapolate: 'clamp',
          }),
        },
      ],
    },
  ];

  const renderContent = () => (
    <View style={styles.content}>
      {/* Left side */}
      <View style={styles.leftSection}>
        {showBackButton ? (
          <Pressable onPress={onBackPress} style={styles.iconButton}>
            <Icon name="arrow-back" size={24} color={theme.colors.text} />
          </Pressable>
        ) : (
          <View style={styles.brandSection}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        )}
      </View>

      {/* Center - only show if there's a back button */}
      {showBackButton && (
        <View style={styles.centerSection}>
          <Text style={styles.centerTitle}>{title}</Text>
          {subtitle && <Text style={styles.centerSubtitle}>{subtitle}</Text>}
        </View>
      )}

      {/* Right side */}
      <View style={styles.rightSection}>
        {rightComponent || (
          <Pressable onPress={onProfilePress} style={styles.profileButton}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={gradients.spiritual}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGradient}
              >
                <Icon
                  name="person"
                  size={20}
                  color={theme.colors.textOnDark}
                />
              </LinearGradient>
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );

  if (transparent) {
    return (
      <Animated.View style={headerStyle}>
        <SafeAreaView style={styles.transparentContainer}>
          {renderContent()}
        </SafeAreaView>
      </Animated.View>
    );
  }

  if (Platform.OS === 'ios' && blur) {
    return (
      <Animated.View style={headerStyle}>
        <BlurView
          style={styles.blurContainer}
          blurType="systemUltraThin"
          blurAmount={25}
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
          <SafeAreaView style={styles.safeArea}>
            {renderContent()}
          </SafeAreaView>
        </BlurView>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={headerStyle}>
      <View style={[styles.solidContainer, gradient && styles.gradientContainer]}>
        {gradient && (
          <LinearGradient
            colors={gradients[gradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        )}
        <SafeAreaView style={styles.safeArea}>
          {renderContent()}
        </SafeAreaView>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },

  blurContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },

  solidContainer: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },

  gradientContainer: {
    borderBottomColor: 'transparent',
  },

  transparentContainer: {
    backgroundColor: 'transparent',
  },

  safeArea: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: layout.headerHeight,
  },

  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  centerSection: {
    flex: 2,
    alignItems: 'center',
  },

  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  brandSection: {
    flexDirection: 'column',
  },

  title: {
    ...theme.fonts.title2,
    color: theme.colors.text,
    fontWeight: '700',
  },

  subtitle: {
    ...theme.fonts.footnote,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  centerTitle: {
    ...theme.fonts.headline,
    color: theme.colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },

  centerSubtitle: {
    ...theme.fonts.caption1,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.rounded,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.fillQuaternary,
  },

  profileButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.rounded,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },

  avatarGradient: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.rounded,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ModernHeader;