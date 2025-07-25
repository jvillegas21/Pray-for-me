import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';
import {
  theme,
  shadows,
  borderRadius,
  spacing,
  gradients,
  animations,
} from '@/theme';
import { PrayerCategory } from '@/types';
import GlassCard from './GlassCard';
import UserAvatar from './UserAvatar';
import {
  addPrayerAction,
  getEncouragementCount,
  getPrayerCount,
  hasUserPrayed,
} from '@/services/prayerService';

// Add number formatting helper:
const formatNumber = (num: number): string => {
  if (num >= 1000) {
    const k = num / 1000;
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`;
  }
  return num.toString();
};

// Helper to get first name from full name
const getFirstName = (fullName?: string): string => {
  if (!fullName) return 'User';
  return fullName.trim().split(' ')[0];
};

interface PrayerCardProps {
  id: string; // Prayer request ID
  title: string;
  description: string;
  category: PrayerCategory;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  timeAgo: string;
  responseCount: number;
  encouragementCount?: number;
  prayerCount?: number;
  isAnonymous: boolean;
  status?: 'active' | 'answered' | 'closed';
  userName?: string;
  userAvatarColor?: string;
  onPress: () => void;
  onSupport: () => void;
  onShare: () => void;
  onPrayerCountChange?: (newCount: number) => void;
}

const { width } = Dimensions.get('window');

const PrayerCard: React.FC<PrayerCardProps> = ({
  id,
  title,
  description,
  category,
  urgency,
  timeAgo,
  responseCount,
  encouragementCount = 0,
  prayerCount = 0,
  isAnonymous,
  status = 'active',
  userName,
  userAvatarColor,
  onPress,
  onSupport,
  onShare,
  onPrayerCountChange,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const animatedValue = new Animated.Value(1);
  const heartAnimation = new Animated.Value(1);
  const heartAnimationRef = useRef<LottieView>(null);

  // Real-time state for prayers and encouragements
  const [prayed, setPrayed] = useState(false);
  const [currentPrayerCount, setCurrentPrayerCount] = useState(prayerCount);
  const [prevEncouragementCount, setPrevEncouragementCount] =
    useState(encouragementCount);
  const prayersAnim = useState(new Animated.Value(1))[0];

  // Update current prayer count when prop changes
  useEffect(() => {
    setCurrentPrayerCount(prayerCount);
  }, [prayerCount]);

  // Load real-time data on mount
  useEffect(() => {
    const loadRealTimeData = async () => {
      try {
        // Check if user has prayed
        const hasPrayed = await hasUserPrayed(id);
        setPrayed(hasPrayed);
      } catch (error) {
        // Error loading real-time data
      }
    };

    loadRealTimeData();
  }, [id]);

  // Play heart animation when encouragement count increases
  useEffect(() => {
    if (
      encouragementCount > prevEncouragementCount &&
      heartAnimationRef.current
    ) {
      heartAnimationRef.current.play();
    }
    setPrevEncouragementCount(encouragementCount);
  }, [encouragementCount, id, prevEncouragementCount]);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(animatedValue, {
      toValue: 0.98,
      useNativeDriver: true,
      ...animations.spring,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
      ...animations.spring,
    }).start();
  };

  const handleSupportPress = () => {
    // Heart animation
    Animated.sequence([
      Animated.spring(heartAnimation, {
        toValue: 1.3,
        useNativeDriver: true,
        ...animations.spring,
      }),
      Animated.spring(heartAnimation, {
        toValue: 1,
        useNativeDriver: true,
        ...animations.spring,
      }),
    ]).start();

    onSupport();
  };

  const handlePray = async () => {
    if (prayed) {
      return;
    }

    try {
      // Add prayer action to database
      await addPrayerAction(id);

      // Update local state
      setPrayed(true);
      const newCount = currentPrayerCount + 1;
      setCurrentPrayerCount(newCount);

      // Notify parent component
      if (onPrayerCountChange) {
        onPrayerCountChange(newCount);
      }

      // Animation
      Animated.sequence([
        Animated.spring(prayersAnim, {
          toValue: 1.3,
          useNativeDriver: true,
        }),
        Animated.spring(prayersAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();

      onSupport();
    } catch (error) {
      // Error adding prayer action
    }
  };

  const getUrgencyColor = () => {
    switch (urgency) {
      case 'urgent':
        return theme.colors.error;
      case 'high':
        return theme.colors.warning;
      case 'medium':
        return theme.colors.accent;
      default:
        return theme.colors.success;
    }
  };

  const getCategoryIcon = () => {
    const iconMap: Record<PrayerCategory, string> = {
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
    return iconMap[category] || 'more-horiz';
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: animatedValue }] }]}
    >
      <GlassCard variant="elevated" style={styles.card}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.cardContent}
        >
          {/* Header - Social Media Style */}
          <View style={styles.socialHeader}>
            <UserAvatar
              name={userName}
              isAnonymous={isAnonymous}
              backgroundColor={userAvatarColor}
              size="medium"
            />
            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>
                  {isAnonymous ? 'Anonymous' : getFirstName(userName)}
                </Text>
                {status === 'answered' && (
                  <View style={styles.answeredBadge}>
                    <Icon
                      name="check-circle"
                      size={14}
                      color={theme.colors.success}
                      style={{ marginRight: 2 }}
                    />
                    <Text style={styles.answeredBadgeText}>Answered</Text>
                  </View>
                )}
              </View>
              <Text style={styles.timeAgo}>{timeAgo}</Text>
            </View>
            <View style={styles.categoryPillSmall}>
              <View
                style={[
                  styles.categoryPill,
                  { backgroundColor: getUrgencyColor() },
                ]}
              >
                <Icon
                  name={getCategoryIcon()}
                  size={12}
                  color={theme.colors.textOnDark}
                />
                <Text style={styles.categoryTextSmall}>{category}</Text>
              </View>
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.description} numberOfLines={4}>
              {description}
            </Text>
          </View>

          {/* Footer Row (Facebook style, reordered) */}
          <View style={styles.fbFooter}>
            <View style={styles.fbFooterAction} pointerEvents="none">
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <LottieView
                  ref={heartAnimationRef as any}
                  source={require('../../assets/encouragementHeart.json')}
                  style={{ width: 40, height: 40, marginRight: 2 }}
                  loop={false}
                  autoPlay={false}
                />
                <Text style={styles.fbFooterEncouragements}>
                  {formatNumber(encouragementCount)}
                </Text>
              </View>
            </View>
            <Animated.View
              style={[
                styles.fbFooterAction,
                { transform: [{ scale: prayersAnim }] },
              ]}
              pointerEvents="none"
            >
              <Icon
                name="people"
                size={24}
                color={theme.colors.primary}
                style={{ marginRight: 2 }}
              />
              <Text style={styles.fbFooterPrayers}>
                {formatNumber(currentPrayerCount)}
              </Text>
            </Animated.View>
            <Pressable
              onPress={handlePray}
              style={styles.fbFooterAction}
              accessibilityRole="button"
              disabled={prayed}
            >
              <Icon
                name="volunteer-activism"
                size={24}
                color={
                  prayed ? theme.colors.disabled : theme.colors.textSecondary
                }
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.fbFooterText,
                  prayed && { color: theme.colors.disabled },
                ]}
              >
                Pray
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },

  card: {
    backgroundColor: theme.colors.surface,
    padding: spacing.sm,
  },

  cardContent: {
    padding: spacing.lg,
  },

  // Social media style header
  socialHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },

  userInfo: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },

  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },

  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: spacing.sm,
  },

  timeAgo: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '400',
  },

  categoryPillSmall: {
    alignSelf: 'flex-start',
  },

  header: {
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

  categoryTextSmall: {
    fontSize: 10,
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

  // Answered Status Badge Styles
  answeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },

  answeredBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.success,
  },

  timeAgo: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    fontWeight: '500',
  },

  content: {
    marginBottom: spacing.md,
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: 2,
  },

  description: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  responseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  responseText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },

  supportButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    ...shadows.small,
  },

  supportGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },

  supportText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textOnDark,
    marginLeft: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  encouragementsFeed: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  encouragementsText: {
    fontSize: 13,
    color: '#E53E3E',
    fontWeight: '500',
  },
  fbFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: -spacing.sm,
  },
  fbFooterAction: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginBottom: 0,
  },
  fbFooterText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  fbFooterEncouragements: {
    fontSize: 15,
    color: '#E53E3E',
    fontWeight: '500',
  },
  timeAgoBelowTitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '400',
    marginTop: 2,
  },
  timeAndUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: 2,
  },
  bullet: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '400',
    marginHorizontal: 2,
  },
  anonymousTextBelowTitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '400',
  },
  userNameTextBelowTitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '400',
  },
  userInlineText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '400',
    marginRight: 4,
  },
  timeAgoInline: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '400',
  },
  fbFooterPrayers: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default PrayerCard;
