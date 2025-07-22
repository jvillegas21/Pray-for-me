import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  ViewStyle,
} from 'react-native';
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
  opacity,
} from '@/theme';
import { PrayerCategory } from '@/types';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';
import {
  addPrayerAction,
  getEncouragementCount,
  getPrayerCount,
  hasUserPrayed,
} from '@/services/prayerService';

interface ModernPrayerCardProps {
  id: string;
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
  onPress: () => void;
  onSupport: () => void;
  onShare: () => void;
  onPrayerCountChange?: (newCount: number) => void;
  style?: ViewStyle;
}

const { width } = Dimensions.get('window');

const ModernPrayerCard: React.FC<ModernPrayerCardProps> = ({
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
  onPress,
  onSupport,
  onShare,
  onPrayerCountChange,
  style,
}) => {
  // Animation values
  const scaleValue = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const prayerScale = useRef(new Animated.Value(1)).current;
  const heartAnimationRef = useRef<LottieView>(null);

  // State
  const [prayed, setPrayed] = useState(false);
  const [currentPrayerCount, setCurrentPrayerCount] = useState(prayerCount);
  const [currentEncouragementCount, setCurrentEncouragementCount] = useState(encouragementCount);

  // Load user prayer status
  useEffect(() => {
    const loadUserPrayerStatus = async () => {
      try {
        const hasPrayed = await hasUserPrayed(id);
        setPrayed(hasPrayed);
      } catch (error) {
        console.error('Error loading prayer status:', error);
      }
    };

    loadUserPrayerStatus();
  }, [id]);

  // Update counts when props change
  useEffect(() => {
    setCurrentPrayerCount(prayerCount);
  }, [prayerCount]);

  useEffect(() => {
    setCurrentEncouragementCount(encouragementCount);
  }, [encouragementCount]);

  // Helper functions
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      const k = num / 1000;
      return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`;
    }
    return num.toString();
  };

  const getCategoryIcon = (): string => {
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

  const getCategoryGradient = (): keyof typeof gradients => {
    const gradientMap: Record<PrayerCategory, keyof typeof gradients> = {
      health: 'love',
      family: 'hope',
      work: 'primary',
      relationships: 'love',
      spiritual: 'spiritual',
      financial: 'sunrise',
      grief: 'peace',
      guidance: 'primary',
      gratitude: 'hope',
      other: 'secondary',
    };
    return gradientMap[category] || 'primary';
  };

  const getUrgencyColor = (): string => {
    const colorMap = {
      low: theme.colors.success,
      medium: theme.colors.warning,
      high: theme.colors.secondary,
      urgent: theme.colors.error,
    };
    return colorMap[urgency];
  };

  const getUrgencyText = (): string => {
    const textMap = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
    };
    return textMap[urgency];
  };

  // Interaction handlers
  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
      ...animations.springGentle,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      ...animations.springGentle,
    }).start();
  };

  const handlePrayerPress = async () => {
    if (prayed) return;

    // Animate prayer button
    Animated.sequence([
      Animated.spring(prayerScale, {
        toValue: 0.9,
        useNativeDriver: true,
        ...animations.springBouncy,
      }),
      Animated.spring(prayerScale, {
        toValue: 1,
        useNativeDriver: true,
        ...animations.springBouncy,
      }),
    ]).start();

    try {
      await addPrayerAction(id);
      setPrayed(true);
      const newCount = currentPrayerCount + 1;
      setCurrentPrayerCount(newCount);
      onPrayerCountChange?.(newCount);
    } catch (error) {
      console.error('Error adding prayer:', error);
    }
  };

  const handleEncouragementPress = () => {
    // Animate heart
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.2,
        useNativeDriver: true,
        ...animations.springBouncy,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        useNativeDriver: true,
        ...animations.springBouncy,
      }),
    ]).start();

    // Play heart animation
    heartAnimationRef.current?.play();
    onSupport();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: scaleValue }] },
        style,
      ]}
    >
      <GlassCard
        variant="glass"
        size="lg"
        borderRadius="xxl"
        shadow="glass"
        style={styles.card}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.content}
        >
          {/* Header with category and status */}
          <View style={styles.header}>
            <View style={styles.categoryRow}>
              <LinearGradient
                colors={gradients[getCategoryGradient()]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.categoryIcon}
              >
                <Icon
                  name={getCategoryIcon()}
                  size={18}
                  color={theme.colors.textOnDark}
                />
              </LinearGradient>
              <Text style={styles.categoryText}>{category}</Text>
              
              {/* Urgency indicator */}
              <View
                style={[
                  styles.urgencyBadge,
                  { backgroundColor: getUrgencyColor() },
                ]}
              >
                <Text style={styles.urgencyText}>{getUrgencyText()}</Text>
              </View>
            </View>

            {/* Status indicator */}
            {status === 'answered' && (
              <View style={styles.statusBadge}>
                <Icon
                  name="check-circle"
                  size={16}
                  color={theme.colors.success}
                />
                <Text style={styles.statusText}>Answered</Text>
              </View>
            )}
          </View>

          {/* Main content */}
          <View style={styles.mainContent}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.description} numberOfLines={3}>
              {description}
            </Text>
          </View>

          {/* Meta information */}
          <View style={styles.metaRow}>
            <View style={styles.authorInfo}>
              <Icon
                name={isAnonymous ? 'visibility-off' : 'person'}
                size={14}
                color={theme.colors.textTertiary}
              />
              <Text style={styles.authorText}>
                {isAnonymous ? 'Anonymous' : 'User'}
              </Text>
            </View>
            <Text style={styles.timeText}>{timeAgo}</Text>
          </View>

          {/* Action bar */}
          <View style={styles.actionBar}>
            {/* Prayer button */}
            <Animated.View style={{ transform: [{ scale: prayerScale }] }}>
              <Pressable
                onPress={handlePrayerPress}
                disabled={prayed}
                style={[
                  styles.actionButton,
                  prayed && styles.actionButtonPrayed,
                ]}
              >
                <Icon
                  name={prayed ? 'favorite' : 'favorite-border'}
                  size={20}
                  color={prayed ? theme.colors.love : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.actionText,
                    prayed && styles.actionTextPrayed,
                  ]}
                >
                  {prayed ? 'Prayed' : 'Pray'}
                </Text>
                {currentPrayerCount > 0 && (
                  <Text style={styles.countText}>
                    {formatNumber(currentPrayerCount)}
                  </Text>
                )}
              </Pressable>
            </Animated.View>

            {/* Encouragement button */}
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Pressable
                onPress={handleEncouragementPress}
                style={styles.actionButton}
              >
                <LottieView
                  ref={heartAnimationRef}
                  source={require('../../heartLottie.json')}
                  style={styles.heartAnimation}
                  loop={false}
                  autoPlay={false}
                />
                <Text style={styles.actionText}>Encourage</Text>
                {currentEncouragementCount > 0 && (
                  <Text style={styles.countText}>
                    {formatNumber(currentEncouragementCount)}
                  </Text>
                )}
              </Pressable>
            </Animated.View>

            {/* Share button */}
            <Pressable onPress={onShare} style={styles.actionButton}>
              <Icon
                name="share"
                size={20}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.actionText}>Share</Text>
            </Pressable>

            {/* Response count */}
            {responseCount > 0 && (
              <View style={styles.responseCount}>
                <Icon
                  name="chat-bubble-outline"
                  size={16}
                  color={theme.colors.textTertiary}
                />
                <Text style={styles.countText}>
                  {formatNumber(responseCount)}
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },

  card: {
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },

  content: {
    padding: spacing.lg,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },

  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },

  categoryText: {
    ...theme.fonts.subheadEmphasized,
    color: theme.colors.text,
    textTransform: 'capitalize',
    marginRight: spacing.sm,
  },

  urgencyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },

  urgencyText: {
    ...theme.fonts.caption1Emphasized,
    color: theme.colors.textOnDark,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.fillTertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },

  statusText: {
    ...theme.fonts.caption1Emphasized,
    color: theme.colors.success,
    marginLeft: spacing.xxs,
  },

  mainContent: {
    marginBottom: spacing.md,
  },

  title: {
    ...theme.fonts.headline,
    color: theme.colors.text,
    marginBottom: spacing.sm,
    lineHeight: 24,
  },

  description: {
    ...theme.fonts.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },

  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  authorText: {
    ...theme.fonts.footnote,
    color: theme.colors.textTertiary,
    marginLeft: spacing.xxs,
  },

  timeText: {
    ...theme.fonts.footnote,
    color: theme.colors.textTertiary,
  },

  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: theme.colors.fillQuaternary,
    minWidth: 70,
    justifyContent: 'center',
  },

  actionButtonPrayed: {
    backgroundColor: theme.colors.fillSecondary,
  },

  actionText: {
    ...theme.fonts.footnoteEmphasized,
    color: theme.colors.textSecondary,
    marginLeft: spacing.xxs,
  },

  actionTextPrayed: {
    color: theme.colors.love,
  },

  countText: {
    ...theme.fonts.caption2Emphasized,
    color: theme.colors.textTertiary,
    marginLeft: spacing.xxs,
  },

  responseCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  heartAnimation: {
    width: 24,
    height: 24,
  },
});

export default ModernPrayerCard;