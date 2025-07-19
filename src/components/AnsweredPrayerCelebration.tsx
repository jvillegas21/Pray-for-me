import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';
import { theme, spacing, borderRadius } from '@/theme';

const { width, height } = Dimensions.get('window');

interface AnsweredPrayerCelebrationProps {
  visible: boolean;
  onComplete?: () => void;
}

const AnsweredPrayerCelebration: React.FC<AnsweredPrayerCelebrationProps> = ({
  visible,
  onComplete,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      checkAnim.setValue(0);

      // Start celebration sequence
      Animated.sequence([
        // Fade in background
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Scale in the main circle
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 6,
          useNativeDriver: true,
        }),
        // Animate the check mark and start confetti
        Animated.timing(checkAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Start confetti animation
        confettiRef.current?.play();
        
        // Hold for confetti duration, then fade out
        setTimeout(() => {
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }).start(() => {
            onComplete?.();
          });
        }, 2500); // Let confetti play for 2.5 seconds
      });
    }
  }, [visible, scaleAnim, opacityAnim, checkAnim, onComplete]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
      {/* Fullscreen Confetti Animation */}
      <LottieView
        ref={confettiRef}
        source={require('../assets/animations/confetti.json')}
        style={styles.confetti}
        loop={false}
        autoPlay={false}
      />
      
      <Animated.View
        style={[
          styles.celebrationContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Main celebration circle */}
        <View style={styles.celebrationCircle}>
          <Animated.View
            style={[
              styles.checkContainer,
              {
                transform: [{ scale: checkAnim }],
              },
            ]}
          >
            <Icon
              name="check-circle"
              size={80}
              color={theme.colors.success}
            />
          </Animated.View>
        </View>

        {/* Celebration text */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: checkAnim,
              transform: [
                {
                  translateY: checkAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.celebrationTitle}>Prayer Answered!</Text>
          <Text style={styles.celebrationSubtitle}>
            Thank you for sharing God's faithfulness ✨
          </Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },

  confetti: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
    zIndex: 1,
  },

  celebrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
  },

  celebrationCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.success,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },

  checkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  textContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },

  celebrationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textOnDark,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },

  celebrationSubtitle: {
    fontSize: 16,
    color: theme.colors.textOnDark,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
});

export default AnsweredPrayerCelebration;