import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigationProps } from '@/types';
import { theme, spacing, borderRadius, shadows } from '@/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Encouragement } from '@/types';
import LottieView from 'lottie-react-native';
import {
  getRequestById,
  getEncouragements,
  getEncouragementCount,
  submitEncouragement,
  addPrayerAction,
  getPrayerCount,
  hasUserPrayed,
  prayerService,
} from '@/services/prayerService';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { triggerRefresh } from '@/store/slices/prayerSlice';
import AnsweredPrayerCelebration from '@/components/AnsweredPrayerCelebration';

type PrayerRequestScreenNavigationProp = NativeStackNavigationProp<
  NavigationProps,
  'PrayerRequest'
>;

const { width } = Dimensions.get('window');

// Helper function to format numbers (1k, 1.1k, etc.)
const formatNumber = (num: number): string => {
  if (num >= 1000) {
    const k = num / 1000;
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`;
  }
  return num.toString();
};

const PrayerRequestScreen: React.FC = () => {
  const navigation = useNavigation<PrayerRequestScreenNavigationProp>();
  const route = useRoute<RouteProp<NavigationProps, 'PrayerRequest'>>();
  const { requestId } = route.params || {};
  const heartAnimationRef = useRef<LottieView>(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  // State for real data
  const [prayerRequest, setPrayerRequest] = useState<any>(null);
  const [encouragements, setEncouragements] = useState<Encouragement[]>([]);
  const [newEncouragement, setNewEncouragement] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [prevEncouragementCount, setPrevEncouragementCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [prayerCount, setPrayerCount] = useState(0);
  const [hasPrayed, setHasPrayed] = useState(false);
  const [markingAnswered, setMarkingAnswered] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  // Play heart animation when encouragement count increases
  useEffect(() => {
    if (
      prayerRequest &&
      prayerRequest.encouragementCount > prevEncouragementCount &&
      heartAnimationRef.current
    ) {
      heartAnimationRef.current.play();
    }
    setPrevEncouragementCount(prayerRequest?.encouragementCount || 0);
  }, [prayerRequest?.encouragementCount, prevEncouragementCount, prayerRequest]);

  // Fetch real data on mount
  useEffect(() => {
    if (!requestId) {
      setLoading(false);
      setPrayerRequest(null);
      return;
    }
    const fetchData = async () => {
      try {
        const [req, encs, encCount, prayCount, userPrayed] = await Promise.all([
          getRequestById(requestId).catch((error) => {
            return null;
          }),
          getEncouragements(requestId, sortNewestFirst).catch((error) => {
            return [];
          }),
          getEncouragementCount(requestId).catch((error) => {
            return 0;
          }),
          getPrayerCount(requestId).catch((error) => {
            return 0;
          }),
          hasUserPrayed(requestId).catch((error) => {
            return false;
          }),
        ]);

        if (req) {
          setPrayerRequest({ ...req, encouragementCount: encCount });
        } else {
          setPrayerRequest(null);
        }
        setEncouragements(encs);
        setPrayerCount(prayCount);
        setHasPrayed(userPrayed);
      } catch (error) {
        setPrayerRequest(null);
        setEncouragements([]);
        setPrayerCount(0);
        setHasPrayed(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [requestId, sortNewestFirst]);

  // Real-time subscription disabled due to CHANNEL_ERROR issues
  // Using Redux refresh triggers and navigation-based refresh instead

  // Replace handleEncouragementSubmit with real backend logic
  const handleEncouragementSubmit = async () => {
    if (!newEncouragement.trim() || !prayerRequest) {
      return;
    }

    setSubmitting(true);
    heartAnimationRef.current?.play();

    try {
      await submitEncouragement({
        prayerRequestId: prayerRequest.id,
        message: newEncouragement,
      });

      // Re-fetch encouragements and count to ensure consistency
      const [encs, count] = await Promise.all([
        getEncouragements(prayerRequest.id, sortNewestFirst).catch((error) => {
          console.error('❌ Error re-fetching encouragements:', error);
          return encouragements; // Keep existing encouragements on error
        }),
        getEncouragementCount(prayerRequest.id).catch((error) => {
          console.error('❌ Error re-fetching encouragement count:', error);
          return prayerRequest.encouragementCount || 0; // Keep existing count on error
        }),
      ]);

      setEncouragements(encs);
      setPrayerRequest((prev: any) => ({ ...prev, encouragementCount: count }));
      setNewEncouragement('');

      // Trigger multiple refresh mechanisms to ensure HomeScreen updates
      dispatch(triggerRefresh()); // Redux refresh

      // Also trigger a direct refresh after a delay to ensure database consistency
      setTimeout(() => {
        dispatch(triggerRefresh());
      }, 1000);
    } catch (error) {
      // Error submitting encouragement
    } finally {
      setSubmitting(false);
    }
  };

  const handlePray = async () => {
    if (hasPrayed || !prayerRequest) {
      return;
    }

    try {
      await addPrayerAction(prayerRequest.id);
      
      // Update local state
      setHasPrayed(true);
      setPrayerCount(prev => prev + 1);

      // Trigger refresh to update HomeScreen
      dispatch(triggerRefresh());
    } catch (error) {
      // Error adding prayer action
    }
  };

  const handleMarkAsAnswered = async () => {
    if (!prayerRequest || markingAnswered) {
      return;
    }

    setMarkingAnswered(true);
    
    try {
      await prayerService.markAsAnswered(prayerRequest.id);
      
      // Update local state
      setPrayerRequest(prev => ({
        ...prev,
        status: 'answered'
      }));
      
      // Trigger refresh to update other screens
      dispatch(triggerRefresh());
      
      // Show celebration animation
      setShowCelebration(true);
      
    } catch (error) {
      console.error('Error marking prayer as answered:', error);
      // Could show an error alert here
    } finally {
      setMarkingAnswered(false);
    }
  };

  const handleReport = (id: string) => {
    // TODO: Call backend API to report encouragement
    console.log('Reported encouragement with ID:', id);
    // You can replace this with a proper toast notification or modal
  };

  const getUrgencyColor = () => {
    const urgency = prayerRequest.urgency as string;
    switch (urgency) {
      case 'urgent':
        return theme.colors.error;
      case 'high':
        return theme.colors.warning;
      case 'medium':
        return theme.colors.accent;
      case 'low':
        return theme.colors.success;
      default:
        return theme.colors.success;
    }
  };

  const getCategoryIcon = () => {
    const iconMap: Record<string, string> = {
      health: 'local-hospital',
      family: 'family-restroom',
      work: 'work',
      relationships: 'favorite',
      spiritual: 'auto-awesome',
      financial: 'attach-money',
      grief: 'sentiment-very-dissatisfied',
      guidance: 'explore',
      gratitude: 'emoji-emotions',
      other: 'more-horiz',
    };
    return iconMap[prayerRequest.category] || 'more-horiz';
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        edges={['top', 'left', 'right']}
      >
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (!prayerRequest) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        edges={['top', 'left', 'right']}
      >
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text>Prayer request not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={['top', 'left', 'right']}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Prayer Request</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Icon name="share" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Prayer Content */}
        <View style={[styles.card, shadows.medium]}>
          <View style={styles.prayerHeader}>
            <View style={styles.categoryContainer}>
              <View
                style={[
                  styles.categoryPill,
                  { backgroundColor: getUrgencyColor() },
                ]}
              >
                <Icon
                  name={getCategoryIcon()}
                  size={16}
                  color={theme.colors.textOnDark}
                />
                <Text style={styles.categoryText}>
                  {prayerRequest.category}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>
              {prayerRequest.title}
            </Text>
            <View style={styles.timeAndUserRow}>
              <Icon
                name={prayerRequest.isAnonymous ? 'visibility-off' : 'person'}
                size={13}
                color={theme.colors.textSecondary}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.userInlineText}>
                {prayerRequest.isAnonymous ? 'Anonymous' : 'User'}
              </Text>
              <Text style={styles.bullet}> • </Text>
              <Text style={styles.timeAgoInline}>{prayerRequest.timeAgo}</Text>
            </View>
            <Text style={styles.description}>{prayerRequest.description}</Text>
          </View>
          {/* Answered Status Banner */}
          {prayerRequest.status === 'answered' && (
            <View style={styles.answeredBanner}>
              <Icon
                name="check-circle"
                size={20}
                color={theme.colors.success}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.answeredText}>This prayer has been answered! ✨</Text>
            </View>
          )}

          <View style={styles.fbFooter}>
            <View style={styles.fbFooterAction} pointerEvents="none">
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <LottieView
                  ref={heartAnimationRef as any}
                  source={require('../../../assets/encouragementHeart.json')}
                  style={{ width: 24, height: 24, marginRight: 2 }}
                  loop={false}
                  autoPlay={false}
                />
                <Text style={styles.fbFooterEncouragements}>
                  {formatNumber(prayerRequest.encouragementCount)}
                </Text>
              </View>
            </View>
            <View style={styles.fbFooterAction} pointerEvents="none">
              <Icon
                name="people"
                size={18}
                color={theme.colors.primary}
                style={{ marginRight: 2 }}
              />
              <Text style={styles.fbFooterPrayers}>
                {formatNumber(prayerCount)}
              </Text>
            </View>
            <Pressable
              onPress={handlePray}
              style={styles.fbFooterAction}
              accessibilityRole="button"
              disabled={hasPrayed}
            >
              <Icon
                name="volunteer-activism"
                size={18}
                color={
                  hasPrayed ? theme.colors.disabled : theme.colors.textSecondary
                }
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.fbFooterText,
                  hasPrayed && { color: theme.colors.disabled },
                ]}
              >
                Pray
              </Text>
            </Pressable>
          </View>

          {/* Mark as Answered Button - Only show for prayer creator and if not already answered */}
          {user && String(prayerRequest.userId) === String(user.id) && prayerRequest.status !== 'answered' && (
            <View style={styles.markAnsweredContainer}>
              <TouchableOpacity
                style={[styles.markAnsweredButton, markingAnswered && styles.markAnsweredButtonDisabled]}
                onPress={handleMarkAsAnswered}
                disabled={markingAnswered}
              >
                <Icon
                  name="check-circle-outline"
                  size={20}
                  color={markingAnswered ? theme.colors.disabled : theme.colors.success}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.markAnsweredButtonText, markingAnswered && styles.markAnsweredButtonTextDisabled]}>
                  {markingAnswered ? 'Marking as Answered...' : 'Mark as Answered'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Community Encouragements */}
        <View style={[styles.card, shadows.medium]}>
          <View style={styles.encouragementsHeader}>
            <Text style={styles.cardTitle}>Community Encouragements</Text>
            <TouchableOpacity
              style={styles.sortToggle}
              onPress={() => setSortNewestFirst(!sortNewestFirst)}
            >
              <Icon
                name={sortNewestFirst ? "arrow-downward" : "arrow-upward"}
                size={16}
                color={theme.colors.textSecondary}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.sortText}>
                {sortNewestFirst ? "Newest" : "Oldest"}
              </Text>
            </TouchableOpacity>
          </View>
          {encouragements.length === 0 ? (
            <Text style={styles.emptyText}>
              No encouragements yet. Be the first to encourage!
            </Text>
          ) : (
            encouragements.map((enc) => (
              <View key={enc.id} style={styles.encouragementItem}>
                <Text style={styles.encouragementMessage}>{enc.message}</Text>
                <View style={styles.encouragementMeta}>
                  <Text style={styles.encouragementAuthor}>
                    {enc.isAnonymous ? 'Anonymous' : enc.userId} •{' '}
                    {(() => {
                      const dateStr = enc.createdAt;
                      const date = dateStr ? new Date(dateStr) : null;
                      
                      if (!date || isNaN(date.getTime())) {
                        return 'Unknown date';
                      }
                      
                      const now = new Date();
                      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
                      
                      if (diffInMinutes < 1) {
                        return 'Just now';
                      } else if (diffInMinutes < 60) {
                        return `${diffInMinutes}m ago`;
                      } else if (diffInMinutes < 1440) { // Less than 24 hours
                        const hours = Math.floor(diffInMinutes / 60);
                        return `${hours}h ago`;
                      } else if (diffInMinutes < 10080) { // Less than 7 days
                        const days = Math.floor(diffInMinutes / 1440);
                        return `${days}d ago`;
                      } else {
                        return date.toLocaleDateString();
                      }
                    })()}
                  </Text>
                  <TouchableOpacity onPress={() => handleReport(enc.id)}>
                    <Text style={styles.reportText}>Report</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          {/* Encouragement Form */}
          <View style={styles.encouragementForm}>
            <Text style={styles.formTitle}>Send Encouragement</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Share words of encouragement, prayer, or support..."
              placeholderTextColor={theme.colors.textTertiary}
              value={newEncouragement}
              onChangeText={setNewEncouragement}
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
            />
            <View style={styles.formFooter}>
              <Text style={styles.charCount}>
                {newEncouragement.length}/500 characters
              </Text>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  { opacity: submitting || !newEncouragement.trim() ? 0.5 : 1 },
                ]}
                onPress={handleEncouragementSubmit}
                disabled={submitting || !newEncouragement.trim()}
              >
                <Text style={styles.sendButtonText}>Send Encouragement</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
      
      {/* Celebration Animation */}
      <AnsweredPrayerCelebration
        visible={showCelebration}
        onComplete={() => {
          setShowCelebration(false);
          // Navigate back after celebration
          setTimeout(() => {
            navigation.goBack();
          }, 500);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  shareButton: {
    padding: spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.rounded,
    marginRight: spacing.sm,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textOnDark,
    marginLeft: spacing.xs,
    textTransform: 'capitalize',
  },
  anonymousBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  anonymousText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginLeft: spacing.xs,
  },
  timeAgo: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  responseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  responseText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '500',
    marginLeft: 2,
  },
  encouragementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartIcon: {
    width: 32,
    height: 32,
    marginRight: 1,
  },
  encouragementText: {
    fontSize: 16,
    color: '#E53E3E',
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: spacing.md,
  },
  encouragementItem: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceVariant,
  },
  encouragementMessage: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  encouragementMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  encouragementAuthor: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  reportText: {
    fontSize: 12,
    color: theme.colors.error,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  encouragementForm: {
    marginTop: spacing.lg,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: spacing.sm,
  },
  textArea: {
    borderWidth: 1,
    borderColor: theme.colors.surfaceVariant,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    minHeight: 80,
    marginBottom: spacing.sm,
    textAlignVertical: 'top',
  },
  formFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  charCount: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  sendButtonText: {
    color: theme.colors.surface,
    fontWeight: '600',
    fontSize: 14,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
  content: {
    marginBottom: spacing.md,
  },
  timeAndUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  userInlineText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  bullet: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  timeAgoInline: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  fbFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceVariant,
  },
  fbFooterAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fbFooterEncouragements: {
    fontSize: 14,
    color: '#E53E3E',
    fontWeight: '500',
    marginLeft: 4,
  },
  fbFooterPrayers: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  fbFooterText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },

  // Answered Status Styles
  answeredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },

  answeredText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.success,
    flex: 1,
  },

  // Mark as Answered Button Styles
  markAnsweredContainer: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },

  markAnsweredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E8',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.success,
  },

  markAnsweredButtonDisabled: {
    backgroundColor: theme.colors.surfaceVariant,
    borderColor: theme.colors.disabled,
  },

  markAnsweredButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.success,
  },

  markAnsweredButtonTextDisabled: {
    color: theme.colors.disabled,
  },

  // New styles for sort toggle
  encouragementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sortToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  sortText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
});

export default PrayerRequestScreen;
