import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigationProps } from '../../types';
import { theme, spacing, borderRadius, shadows } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { triggerRefresh } from '../../store/slices/prayerSlice';

type ResultsScreenNavigationProp = NativeStackNavigationProp<
  NavigationProps,
  'PrayerRequestResults'
>;

const { width } = Dimensions.get('window');

interface AIResults {
  sentiment: 'positive' | 'negative' | 'neutral' | 'unknown';
  bibleVerse: {
    reference: string;
    text: string;
  };
  bibleStudy: {
    title: string;
    content: string;
    verses: string[];
  };
  resources: Array<{
    title: string;
    type: string;
    description: string;
  }>;
  raw?: string;
}

interface PrayerRequestData {
  id: string;
  title: string;
  content: string;
  category: string;
  isAnonymous: boolean;
  allowSocialSharing: boolean;
  includeBibleStudy: boolean;
  includeResources: boolean;
  location: string;
  createdAt: string;
}

export const PrayerRequestResultsScreen: React.FC = () => {
  const navigation = useNavigation<ResultsScreenNavigationProp>();
  const route = useRoute<RouteProp<NavigationProps, 'PrayerRequestResults'>>();
  const { aiResults } = route.params as { aiResults: any };
  const dispatch = useDispatch();

  // Support both top-level and nested (prayerResponse) AI results
  const response = aiResults?.prayerResponse || aiResults;

  // Sentiment
  const sentiment =
    response?.sentimentAnalysis?.primaryEmotion ||
    response?.sentiments?.primaryEmotion ||
    response?.sentiment ||
    response?.sentimentSummary ||
    'No summary available.';

  const secondaryEmotions =
    response?.sentimentAnalysis?.secondaryEmotions ||
    response?.sentiments?.secondaryEmotions ||
    [];

  // Bible Verses
  const verses =
    response?.biblicalFoundation?.primaryVerses ||
    response?.biblicalFoundation?.verses ||
    response?.bibleVerses ||
    [];

  // Bible Study
  const bibleStudy = response?.bibleStudy || null;

  // Local Resources
  const localResources =
    response?.localResources ||
    (response?.supportEcosystem?.professionalSupportCategories
      ? response.supportEcosystem.professionalSupportCategories
      : []);

  // Thematic Connection
  const thematicConnection = response?.biblicalFoundation?.thematicConnection;

  // Cross References
  const crossReferences = response?.biblicalFoundation?.crossReferences;

  // Function to handle navigation back to home with refresh
  const handleNavigateHome = () => {
    dispatch(triggerRefresh());
    navigation.navigate('Home', {
      newlyCreatedPrayerId: (route.params as any)?.savedPrayerId
    });
  };


  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={['top', 'left', 'right']}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Prayer Analysis Complete</Text>
          <Text style={styles.headerSubtitle}>
            Here's what we found for your prayer request
          </Text>
        </View>

        {/* Remove Sentiment Summary section from the UI */}

        {/* Bible Verses */}
        <View style={[styles.card, shadows.medium]}>
          <Text style={styles.cardTitle}>Relevant Bible Verses</Text>
          {Array.isArray(verses) && verses.length > 0 ? (
            verses.map((verse, idx) => (
              <View key={idx} style={{ marginBottom: spacing.md }}>
                <Text style={styles.bibleReference}>
                  {verse.verse || verse.reference}
                </Text>
                <Text style={styles.bibleText}>"{verse.text}"</Text>
                {verse.context && (
                  <Text style={styles.verseWhy}>{verse.context}</Text>
                )}
                {verse.explanation && (
                  <Text style={styles.verseWhy}>{verse.explanation}</Text>
                )}
              </View>
            ))
          ) : (
            <Text>No verses found.</Text>
          )}
        </View>

        {/* Bible Study */}
        {bibleStudy && (
          <View style={[styles.card, shadows.medium]}>
            <Text style={styles.cardTitle}>Bible Study</Text>
            <Text style={styles.studyTitle}>
              {bibleStudy.title || 'No study title'}
            </Text>
            <Text style={styles.studyContent}>
              {bibleStudy.devotional ||
                (bibleStudy.content
                  ? bibleStudy.content
                  : 'No devotional content')}
            </Text>
            {/* Show the verses to study (main verses or cross-references) */}
            {Array.isArray(verses) && verses.length > 0 && (
              <View style={styles.versesContainer}>
                <Text style={styles.versesTitle}>Verses to Study:</Text>
                {verses.map((verse, idx) => (
                  <Text key={idx} style={styles.verseItem}>
                    • {verse.verse || verse.reference}
                  </Text>
                ))}
              </View>
            )}
            {/* Optionally, show cross-references for deeper study */}
            {crossReferences &&
              Array.isArray(crossReferences) &&
              crossReferences.length > 0 && (
                <View style={styles.versesContainer}>
                  <Text style={styles.versesTitle}>
                    Cross-References for Deeper Study:
                  </Text>
                  {crossReferences.map((ref: any, idx: number) => (
                    <Text key={idx} style={styles.verseItem}>
                      • {typeof ref === 'string' ? ref : ref.verse}
                    </Text>
                  ))}
                </View>
              )}
            <View style={styles.versesContainer}>
              <Text style={styles.versesTitle}>Reflection Questions:</Text>
              {(bibleStudy.reflectionQuestions || bibleStudy.verses || [])
                .length > 0 ? (
                (bibleStudy.reflectionQuestions || bibleStudy.verses).map(
                  (q: string, index: number) => (
                    <Text key={index} style={styles.verseItem}>
                      • {q}
                    </Text>
                  )
                )
              ) : (
                <Text style={styles.verseItem}>No reflection questions</Text>
              )}
            </View>
          </View>
        )}

        {/* Thematic Connection */}
        {thematicConnection && (
          <View style={[styles.card, shadows.medium]}>
            <Text style={styles.cardTitle}>Biblical Theme</Text>
            <Text>{thematicConnection}</Text>
          </View>
        )}

        {/* Cross References */}
        {crossReferences && (
          <View style={[styles.card, shadows.medium]}>
            <Text style={styles.cardTitle}>Cross References</Text>
            {Array.isArray(crossReferences) &&
              crossReferences.map((ref: any, idx: number) => (
                <Text key={idx} style={styles.verseItem}>
                  {typeof ref === 'string' ? ref : `${ref.verse}: ${ref.text}`}
                </Text>
              ))}
          </View>
        )}

        {/* Support Ecosystem */}
        {response?.supportEcosystem && (
          <View style={[styles.card, shadows.medium]}>
            <Text style={styles.cardTitle}>Support Ecosystem</Text>
            {response.supportEcosystem.professionalSupport && (
              <>
                <Text style={styles.versesTitle}>Professional Support:</Text>
                {response.supportEcosystem.professionalSupport.map(
                  (item: string, idx: number) => (
                    <Text key={idx} style={styles.verseItem}>
                      • {item}
                    </Text>
                  )
                )}
              </>
            )}
            {response.supportEcosystem.professionalSupportCategories && (
              <>
                <Text style={styles.versesTitle}>
                  Professional Support Categories:
                </Text>
                {response.supportEcosystem.professionalSupportCategories.map(
                  (item: string, idx: number) => (
                    <Text key={idx} style={styles.verseItem}>
                      • {item}
                    </Text>
                  )
                )}
              </>
            )}
            {response.supportEcosystem.churchBasedSupport && (
              <>
                <Text style={styles.versesTitle}>Church-Based Support:</Text>
                {response.supportEcosystem.churchBasedSupport.map(
                  (item: string, idx: number) => (
                    <Text key={idx} style={styles.verseItem}>
                      • {item}
                    </Text>
                  )
                )}
              </>
            )}
            {response.supportEcosystem.onlineCommunities && (
              <>
                <Text style={styles.versesTitle}>Online Communities:</Text>
                {response.supportEcosystem.onlineCommunities.map(
                  (item: string, idx: number) => (
                    <Text key={idx} style={styles.verseItem}>
                      • {item}
                    </Text>
                  )
                )}
              </>
            )}
          </View>
        )}

        {/* Personalized Prayer Ministry */}
        {response?.personalizedPrayerMinistry && (
          <View style={[styles.card, shadows.medium]}>
            <Text style={styles.cardTitle}>Personalized Prayer Ministry</Text>
            {response.personalizedPrayerMinistry.suggestedPrayerPartners && (
              <Text style={styles.verseItem}>
                Prayer Partners:{' '}
                {response.personalizedPrayerMinistry.suggestedPrayerPartners}
              </Text>
            )}
            {response.personalizedPrayerMinistry.corporatePrayer && (
              <Text style={styles.verseItem}>
                Corporate Prayer:{' '}
                {response.personalizedPrayerMinistry.corporatePrayer}
              </Text>
            )}
            {response.personalizedPrayerMinistry.fastingGuidance && (
              <Text style={styles.verseItem}>
                Fasting Guidance:{' '}
                {response.personalizedPrayerMinistry.fastingGuidance}
              </Text>
            )}
            {response.personalizedPrayerMinistry.worshipRecommendations && (
              <Text style={styles.verseItem}>
                Worship:{' '}
                {Array.isArray(
                  response.personalizedPrayerMinistry.worshipRecommendations
                )
                  ? response.personalizedPrayerMinistry.worshipRecommendations.join(
                      ', '
                    )
                  : response.personalizedPrayerMinistry.worshipRecommendations}
              </Text>
            )}
          </View>
        )}

        {/* Follow-Up Framework */}
        {response?.followUpFramework && (
          <View style={[styles.card, shadows.medium]}>
            <Text style={styles.cardTitle}>Follow-Up & Encouragement</Text>
            {response.followUpFramework.checkInTimeline && (
              <Text style={styles.verseItem}>
                We’d love to check in with you at{' '}
                {response.followUpFramework.checkInTimeline} to see how you’re
                doing and continue supporting you in prayer.
              </Text>
            )}
            {response.followUpFramework.progressIndicators && (
              <Text style={styles.verseItem}>
                Look for moments of increased peace, comfort, or trust in
                God—even small steps are worth celebrating!
              </Text>
            )}
            {response.followUpFramework.redFlags && (
              <Text style={styles.verseItem}>
                If you ever feel overwhelmed or your struggles get worse, please
                reach out for help. You’re not alone.
              </Text>
            )}
            {response.followUpFramework.celebrationMarkers && (
              <Text style={styles.verseItem}>
                Celebrate every answered prayer and moment of peace as a sign of
                God’s faithfulness!
              </Text>
            )}
          </View>
        )}

        {/* Words of Encouragement (AI) */}
        {response?.wordsOfEncouragement &&
          Array.isArray(response.wordsOfEncouragement) &&
          response.wordsOfEncouragement.length > 0 && (
            <View style={[styles.card, shadows.medium]}>
              <Text style={styles.cardTitle}>Words of Encouragement</Text>
              {response.wordsOfEncouragement.map((msg: string, idx: number) => (
                <Text key={idx} style={styles.verseItem}>
                  "{msg}"
                </Text>
              ))}
            </View>
          )}

        {/* Follow-Up Framework (AI) */}
        {response?.followUpFramework && (
          <View style={[styles.card, shadows.medium]}>
            <Text style={styles.cardTitle}>Follow-Up</Text>
            <Text style={styles.verseItem}>
              {typeof response.followUpFramework === 'string'
                ? response.followUpFramework
                : JSON.stringify(response.followUpFramework)}
            </Text>
          </View>
        )}


        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleNavigateHome}
          >
            <Text style={styles.buttonText}>Save to Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleNavigateHome}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Share Prayer
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.fonts.headlineLarge.fontSize,
    fontWeight: theme.fonts.headlineLarge.fontWeight as any,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: theme.fonts.bodyMedium.fontSize,
    fontWeight: theme.fonts.bodyMedium.fontWeight as any,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: theme.fonts.headlineSmall.fontSize,
    fontWeight: theme.fonts.headlineSmall.fontWeight as any,
    color: theme.colors.text,
    marginBottom: spacing.sm,
  },
  sentimentIcon: {
    fontSize: 24,
  },
  sentimentContainer: {
    alignItems: 'center',
  },
  sentimentBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.rounded,
  },
  sentimentText: {
    color: theme.colors.surface,
    fontSize: theme.fonts.labelLarge.fontSize,
    fontWeight: theme.fonts.labelLarge.fontWeight as any,
  },
  bibleVerseContainer: {
    alignItems: 'center',
  },
  bibleReference: {
    fontSize: theme.fonts.labelLarge.fontSize,
    fontWeight: theme.fonts.labelLarge.fontWeight as any,
    color: theme.colors.primary,
    marginBottom: spacing.sm,
  },
  bibleText: {
    fontSize: theme.fonts.bodyLarge.fontSize,
    fontWeight: theme.fonts.bodyLarge.fontWeight as any,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  studyTitle: {
    fontSize: theme.fonts.headlineSmall.fontSize,
    fontWeight: theme.fonts.headlineSmall.fontWeight as any,
    color: theme.colors.text,
    marginBottom: spacing.sm,
  },
  studyContent: {
    fontSize: theme.fonts.bodyMedium.fontSize,
    fontWeight: theme.fonts.bodyMedium.fontWeight as any,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  versesContainer: {
    marginTop: spacing.md,
  },
  versesTitle: {
    fontSize: theme.fonts.labelLarge.fontSize,
    fontWeight: theme.fonts.labelLarge.fontWeight as any,
    color: theme.colors.text,
    marginBottom: spacing.sm,
  },
  verseItem: {
    fontSize: theme.fonts.bodyMedium.fontSize,
    fontWeight: theme.fonts.bodyMedium.fontWeight as any,
    color: theme.colors.textSecondary,
    marginBottom: spacing.xs,
  },
  resourceItem: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceVariant,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  resourceTitle: {
    fontSize: theme.fonts.bodyLarge.fontSize,
    fontWeight: theme.fonts.bodyLarge.fontWeight as any,
    color: theme.colors.text,
    flex: 1,
  },
  resourceType: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  resourceTypeText: {
    color: theme.colors.surface,
    fontSize: theme.fonts.labelSmall.fontSize,
    fontWeight: theme.fonts.labelSmall.fontWeight as any,
  },
  resourceDescription: {
    fontSize: theme.fonts.bodyMedium.fontSize,
    fontWeight: theme.fonts.bodyMedium.fontWeight as any,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  actionsContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  buttonText: {
    fontSize: theme.fonts.labelLarge.fontSize,
    fontWeight: theme.fonts.labelLarge.fontWeight as any,
    color: theme.colors.surface,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
  verseWhy: {
    fontSize: theme.fonts.bodySmall.fontSize,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
    marginBottom: spacing.sm,
  },
});
