import React, { useEffect, useState } from 'react';
import LottieView from 'lottie-react-native';
import { View, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { NavigationProps } from '../../types';
import { theme, spacing } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  aiService,
  PrayerAnalysisRequest,
  AIAnalysisResults,
} from '../../services/aiService';
import { supabase } from '../../services/authService';
import { prayerService } from '../../services/prayerService';
import bookPageFlip from '@/assets/animations/book-page-flip.json';

type TransitionScreenNavigationProp = NativeStackNavigationProp<
  NavigationProps,
  'PrayerRequestTransition'
>;
type TransitionScreenRouteProp = RouteProp<
  NavigationProps,
  'PrayerRequestTransition'
>;

const { width, height } = Dimensions.get('window');

export const PrayerRequestTransitionScreen: React.FC = () => {
  const navigation = useNavigation<TransitionScreenNavigationProp>();
  const route = useRoute<TransitionScreenRouteProp>();
  const [isProcessing, setIsProcessing] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const processPrayerRequest = async () => {
      try {
        const { prayerData } = route.params;
        setProgress(10);
        
        // Step 1: Save prayer to database
        const createPrayerRequestData = {
          title: prayerData.prayerText.substring(0, 100), // Use first 100 chars as title
          description: prayerData.prayerText,
          category: prayerData.category.toLowerCase(),
          isAnonymous: prayerData.isAnonymous,
          privacyLevel: 'public' as const,
          urgencyLevel: 'medium' as const,
          location: prayerData.location?.city && prayerData.location?.state 
            ? { 
                // For now, we'll store as text. In future, add geocoding
                latitude: 0, 
                longitude: 0 
              }
            : undefined,
        };
        
        const savedPrayer = await prayerService.createRequest(createPrayerRequestData);
        setProgress(30);
        
        // Step 2: Call the AI service
        const response = await aiService.analyzePrayer(prayerData);
        setProgress(100);
        
        if (response.success && response.aiResults) {
          navigation.replace('PrayerRequestResults', {
            aiResults: response.aiResults,
            savedPrayerId: savedPrayer.id,
          });
        } else {
          throw new Error(response.message || 'AI analysis failed');
        }
      } catch (error: any) {
        Alert.alert(
          'Processing Error',
          error.message ||
            'Failed to process your prayer request. Please try again.',
          [
            {
              text: 'Go Back',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } finally {
        setIsProcessing(false);
      }
    };
    processPrayerRequest();
  }, [navigation, route.params]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.container}>
        <View style={styles.animationContainer}>
          <LottieView
            source={bookPageFlip}
            autoPlay
            loop
            style={styles.animation}
          />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>Analyzing Your Prayer</Text>
          <Text style={styles.subtitle}>
            Finding relevant Bible verses and resources for you...
          </Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {isProcessing ? 'Processing...' : 'Complete!'}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  animationContainer: {
    width: width * 0.6,
    height: width * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    fontSize: theme.fonts.headlineLarge.fontSize,
    fontWeight: theme.fonts.headlineLarge.fontWeight as any,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: theme.fonts.bodyLarge.fontSize,
    fontWeight: theme.fonts.bodyLarge.fontWeight as any,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
    width: '60%', // Will be overridden dynamically
  },
  progressText: {
    fontSize: theme.fonts.labelMedium.fontSize,
    fontWeight: theme.fonts.labelMedium.fontWeight as any,
    color: theme.colors.textSecondary,
  },
});
