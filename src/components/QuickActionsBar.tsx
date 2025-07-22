import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  theme,
  shadows,
  borderRadius,
  spacing,
  gradients,
  animations,
} from '@/theme';
import GlassCard from './GlassCard';

interface QuickAction {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  gradient: keyof typeof gradients;
  onPress: () => void;
}

interface QuickActionsBarProps {
  actions: QuickAction[];
  style?: any;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - spacing.md * 3) / 2; // Two cards per row with margins

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ actions, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={cardWidth + spacing.sm}
        decelerationRate="fast"
      >
        {actions.map((action, index) => (
          <QuickActionCard key={action.id} action={action} index={index} />
        ))}
      </ScrollView>
    </View>
  );
};

interface QuickActionCardProps {
  action: QuickAction;
  index: number;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ action, index }) => {
  return (
    <GlassCard
      variant="glass"
      size="md"
      borderRadius="xxl"
      shadow="glass"
      style={[styles.card, { marginLeft: index === 0 ? 0 : spacing.sm }]}
    >
      <Pressable onPress={action.onPress} style={styles.cardContent}>
        {/* Background gradient overlay */}
        <LinearGradient
          colors={[...gradients[action.gradient], 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFillObject, { opacity: 0.1 }]}
        />
        
        {/* Icon container */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={gradients[action.gradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Icon
              name={action.icon}
              size={24}
              color={theme.colors.textOnDark}
            />
          </LinearGradient>
        </View>

        {/* Content */}
        <View style={styles.textContent}>
          <Text style={styles.cardTitle}>{action.title}</Text>
          {action.subtitle && (
            <Text style={styles.cardSubtitle}>{action.subtitle}</Text>
          )}
        </View>

        {/* Arrow indicator */}
        <View style={styles.arrowContainer}>
          <Icon
            name="arrow-forward-ios"
            size={16}
            color={theme.colors.textTertiary}
          />
        </View>
      </Pressable>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.lg,
  },

  sectionTitle: {
    ...theme.fonts.title3,
    color: theme.colors.text,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
  },

  scrollContent: {
    paddingHorizontal: spacing.md,
  },

  card: {
    width: cardWidth * 1.2, // Slightly wider for better visual balance
    minHeight: 100,
  },

  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    position: 'relative',
  },

  iconContainer: {
    marginRight: spacing.md,
  },

  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },

  textContent: {
    flex: 1,
  },

  cardTitle: {
    ...theme.fonts.subheadEmphasized,
    color: theme.colors.text,
    marginBottom: 2,
  },

  cardSubtitle: {
    ...theme.fonts.caption1,
    color: theme.colors.textSecondary,
  },

  arrowContainer: {
    marginLeft: spacing.sm,
  },
});

export default QuickActionsBar;