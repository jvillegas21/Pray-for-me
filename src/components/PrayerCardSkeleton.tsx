import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { theme, spacing, borderRadius } from '@/theme';
import GlassCard from './GlassCard';

const PrayerCardSkeleton: React.FC = () => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };
    shimmer();
  }, [shimmerAnimation]);

  const shimmerOpacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      <GlassCard variant="elevated" style={styles.card}>
        <View style={styles.cardContent}>
          {/* Header skeleton */}
          <View style={styles.header}>
            <Animated.View 
              style={[
                styles.categoryPill, 
                { opacity: shimmerOpacity }
              ]} 
            />
          </View>

          {/* Content skeleton */}
          <View style={styles.content}>
            <Animated.View 
              style={[
                styles.titleLine,
                { opacity: shimmerOpacity }
              ]} 
            />
            <Animated.View 
              style={[
                styles.titleLineShort,
                { opacity: shimmerOpacity }
              ]} 
            />
            <View style={styles.timeAndUserRow}>
              <Animated.View 
                style={[
                  styles.userInfo,
                  { opacity: shimmerOpacity }
                ]} 
              />
            </View>
            <Animated.View 
              style={[
                styles.descriptionLine,
                { opacity: shimmerOpacity }
              ]} 
            />
            <Animated.View 
              style={[
                styles.descriptionLineShort,
                { opacity: shimmerOpacity }
              ]} 
            />
          </View>

          {/* Footer skeleton */}
          <View style={styles.footer}>
            <Animated.View 
              style={[
                styles.actionItem,
                { opacity: shimmerOpacity }
              ]} 
            />
            <Animated.View 
              style={[
                styles.actionItem,
                { opacity: shimmerOpacity }
              ]} 
            />
            <Animated.View 
              style={[
                styles.actionItem,
                { opacity: shimmerOpacity }
              ]} 
            />
          </View>
        </View>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: spacing.sm,
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
  categoryPill: {
    width: 80,
    height: 24,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: borderRadius.rounded,
  },
  content: {
    marginBottom: spacing.lg,
  },
  titleLine: {
    width: '85%',
    height: 18,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  titleLineShort: {
    width: '60%',
    height: 18,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  timeAndUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userInfo: {
    width: 120,
    height: 12,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 4,
  },
  descriptionLine: {
    width: '100%',
    height: 14,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  descriptionLineShort: {
    width: '75%',
    height: 14,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceVariant,
    paddingTop: spacing.lg,
  },
  actionItem: {
    width: 60,
    height: 20,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 4,
  },
});

export default PrayerCardSkeleton;