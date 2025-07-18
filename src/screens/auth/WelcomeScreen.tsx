import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Animated,
  Text,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import {
  theme,
  spacing,
  borderRadius,
  gradients,
  shadows,
  animations,
} from '@/theme';
import GradientButton from '@/components/GradientButton';
import GlassCard from '@/components/GlassCard';
import prayerHands from '@/assets/animations/prayer-hands.json';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  navigation: any;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, slideAnim]);

  const features = [
    {
      icon: '🙏',
      title: 'Share Prayer Requests',
      description:
        'Request prayers from your local community with complete privacy control.',
      gradient: gradients.spiritual,
    },
    {
      icon: '🤝',
      title: 'Support Others',
      description:
        'Offer spiritual support and prayers to community members in need.',
      gradient: gradients.peace,
    },
    {
      icon: '📍',
      title: 'Find Local Communities',
      description:
        'Discover and join faith communities near you for deeper connections.',
      gradient: gradients.sunrise,
    },
  ];

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <LinearGradient
        colors={gradients.sunset}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero Section */}
            <Animated.View
              style={[
                styles.heroSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                },
              ]}
            >
              <View style={styles.logoContainer}>
                <LottieView
                  source={prayerHands}
                  autoPlay
                  loop
                  style={styles.logoAnimation}
                />
              </View>

              <Text style={styles.appName}>Pray For Me</Text>
              <Text style={styles.tagline}>
                Where hearts connect through prayer
              </Text>
            </Animated.View>

            {/* Features Section */}
            <Animated.View
              style={[styles.featuresSection, { opacity: fadeAnim }]}
            >
              <Text style={styles.featuresTitle}>
                Your spiritual journey starts here
              </Text>

              {features.map((feature, index) => (
                <Animated.View
                  key={index}
                  style={[
                    { opacity: fadeAnim },
                    {
                      transform: [
                        {
                          translateY: Animated.add(
                            slideAnim,
                            new Animated.Value(index * 10)
                          ),
                        },
                      ],
                    },
                  ]}
                >
                  <GlassCard style={styles.featureCard} variant="filled">
                    <LinearGradient
                      colors={feature.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.featureIconContainer}
                    >
                      <Text style={styles.featureIcon}>{feature.icon}</Text>
                    </LinearGradient>

                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>
                        {feature.description}
                      </Text>
                    </View>
                  </GlassCard>
                </Animated.View>
              ))}
            </Animated.View>

            {/* CTA Section */}
            <Animated.View style={[styles.ctaSection, { opacity: fadeAnim }]}>
              <Text style={styles.ctaText}>
                Join thousands finding peace and support
              </Text>

              <GradientButton
                title="Begin Your Journey"
                onPress={() => navigation.navigate('Register')}
                variant="spiritual"
                size="large"
                style={styles.primaryButton}
              />

              <GradientButton
                title="I Already Have an Account"
                onPress={() => navigation.navigate('Login')}
                variant="peace"
                size="medium"
                style={styles.secondaryButton}
              />

              <Text style={styles.footerText}>
                Free forever • Privacy first • Community driven
              </Text>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.massive,
    paddingBottom: spacing.huge,
  },

  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: theme.colors.glassStrong,
    borderRadius: borderRadius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...shadows.glass,
  },

  logoAnimation: {
    width: 80,
    height: 80,
  },

  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.textOnDark,
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  tagline: {
    fontSize: 18,
    color: theme.colors.textOnDark,
    textAlign: 'center',
    opacity: 0.9,
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  // Features Section
  featuresSection: {
    paddingBottom: spacing.huge,
  },

  featuresTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textOnDark,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
    opacity: 0.95,
  },

  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    backgroundColor: theme.colors.glassStrong,
    borderRadius: borderRadius.xl,
    ...shadows.medium,
  },

  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },

  featureIcon: {
    fontSize: 28,
  },

  featureContent: {
    flex: 1,
    paddingRight: spacing.md,
  },

  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textOnDark,
    marginBottom: spacing.xs,
  },

  featureDescription: {
    fontSize: 14,
    color: theme.colors.textOnDark,
    opacity: 0.8,
    lineHeight: 20,
  },

  // CTA Section
  ctaSection: {
    alignItems: 'center',
    paddingBottom: spacing.massive,
  },

  ctaText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.textOnDark,
    textAlign: 'center',
    marginBottom: spacing.xxxl,
    opacity: 0.9,
  },

  primaryButton: {
    width: width - spacing.lg * 2,
    marginBottom: spacing.lg,
  },

  secondaryButton: {
    width: width - spacing.lg * 2,
    marginBottom: spacing.xl,
  },

  footerText: {
    fontSize: 12,
    color: theme.colors.textOnDark,
    opacity: 0.7,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default WelcomeScreen;
