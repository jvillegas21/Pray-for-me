import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme, shadows, borderRadius, spacing, gradients, animations } from '@/theme';
import { PrayerCategory } from '@/types';
import GlassCard from './GlassCard';

interface PrayerCardProps {
  title: string;
  description: string;
  category: PrayerCategory;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  timeAgo: string;
  responseCount: number;
  isAnonymous: boolean;
  onPress: () => void;
  onSupport: () => void;
  onShare: () => void;
}

const { width } = Dimensions.get('window');

const PrayerCard: React.FC<PrayerCardProps> = ({
  title,
  description,
  category,
  urgency,
  timeAgo,
  responseCount,
  isAnonymous,
  onPress,
  onSupport,
  onShare,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const animatedValue = new Animated.Value(1);
  const heartAnimation = new Animated.Value(1);

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
    <Animated.View style={[
      styles.container,
      { transform: [{ scale: animatedValue }] }
    ]}>
      <GlassCard variant="elevated" style={styles.card}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.cardContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.categoryContainer}>
              <View style={[styles.categoryPill, { backgroundColor: getUrgencyColor() }]}>
                <Icon name={getCategoryIcon()} size={16} color={theme.colors.textOnDark} />
                <Text style={styles.categoryText}>{category}</Text>
              </View>
              {isAnonymous && (
                <View style={styles.anonymousBadge}>
                  <Icon name="visibility-off" size={12} color={theme.colors.textSecondary} />
                  <Text style={styles.anonymousText}>Anonymous</Text>
                </View>
              )}
            </View>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.description} numberOfLines={3}>
              {description}
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.responseContainer}>
              <Icon name="people" size={16} color={theme.colors.primary} />
              <Text style={styles.responseText}>
                {responseCount} {responseCount === 1 ? 'prayer' : 'prayers'}
              </Text>
            </View>

            <View style={styles.actions}>
              <Pressable onPress={onShare} style={styles.actionButton}>
                <Icon name="share" size={20} color={theme.colors.textSecondary} />
              </Pressable>
              
              <Animated.View style={{ transform: [{ scale: heartAnimation }] }}>
                <Pressable onPress={handleSupportPress} style={styles.supportButton}>
                  <LinearGradient
                    colors={gradients.spiritual}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.supportGradient}
                  >
                    <Icon name="volunteer-activism" size={18} color={theme.colors.textOnDark} />
                    <Text style={styles.supportText}>Pray</Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </View>
          </View>
        </Pressable>
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  
  card: {
    backgroundColor: theme.colors.surface,
  },
  
  cardContent: {
    padding: spacing.lg,
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
  
  content: {
    marginBottom: spacing.lg,
  },
  
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
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
});

export default PrayerCard;