import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  Dimensions,
  StatusBar,
  Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { 
  theme, 
  spacing, 
  borderRadius, 
  gradients, 
  shadows, 
  animations 
} from '@/theme';
import { RootState, AppDispatch } from '@/store';
import { fetchPrayerRequests } from '@/store/slices/prayerSlice';
import PrayerCard from '@/components/PrayerCard';
import GlassCard from '@/components/GlassCard';
import GradientButton from '@/components/GradientButton';

const { width, height } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { requests, loading } = useSelector((state: RootState) => state.prayer);

  useEffect(() => {
    setGreetingMessage();
    loadPrayerRequests();
  }, []);

  const setGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 17) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  };

  const loadPrayerRequests = async () => {
    try {
      await dispatch(fetchPrayerRequests({})).unwrap();
    } catch (error) {
      console.error('Failed to load prayer requests:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPrayerRequests();
    setRefreshing(false);
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const opacity = Math.max(0, Math.min(1, 1 - offsetY / 100));
        headerOpacity.setValue(opacity);
      }
    }
  );

  const quickActions = [
    {
      icon: 'add-circle',
      title: 'New Request',
      subtitle: 'Share your prayer',
      gradient: gradients.spiritual,
      onPress: () => navigation.navigate('CreatePrayerRequest'),
    },
    {
      icon: 'explore',
      title: 'Explore',
      subtitle: 'Find communities',
      gradient: gradients.peace,
      onPress: () => navigation.navigate('Communities'),
    },
    {
      icon: 'map',
      title: 'Nearby',
      subtitle: 'Local prayers',
      gradient: gradients.sunrise,
      onPress: () => navigation.navigate('Map'),
    },
  ];

  const mockPrayerRequests = [
    {
      id: '1',
      title: 'Prayers for my mother\'s surgery',
      description: 'My mother is having a major surgery tomorrow morning. Please pray for the doctors\' wisdom and her quick recovery.',
      category: 'health',
      urgency: 'high' as const,
      timeAgo: '2 hours ago',
      responseCount: 23,
      isAnonymous: false,
    },
    {
      id: '2',
      title: 'Job interview anxiety',
      description: 'I have an important job interview next week and I\'m feeling very anxious. Please pray for peace and confidence.',
      category: 'work',
      urgency: 'medium' as const,
      timeAgo: '5 hours ago',
      responseCount: 12,
      isAnonymous: true,
    },
    {
      id: '3',
      title: 'Grateful for answered prayers',
      description: 'Thank you all for praying for my family during our difficult time. We received wonderful news today!',
      category: 'gratitude',
      urgency: 'low' as const,
      timeAgo: '1 day ago',
      responseCount: 45,
      isAnonymous: false,
    },
  ];

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={gradients.sunset}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Animated Header */}
          <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Text style={styles.greeting}>{greeting},</Text>
                <Text style={styles.userName}>{user?.name || 'Friend'}</Text>
              </View>
              <Pressable style={styles.profileButton}>
                <Icon name="account-circle" size={32} color={theme.colors.textOnDark} />
              </Pressable>
            </View>
          </Animated.View>

          {/* Scrollable Content */}
          <Animated.ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.textOnDark}
                colors={[theme.colors.primary]}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {/* Quick Actions */}
            <View style={styles.quickActionsContainer}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickActions}
              >
                {quickActions.map((action, index) => (
                  <Pressable
                    key={index}
                    onPress={action.onPress}
                    style={styles.quickActionCard}
                  >
                    <GlassCard variant="filled" style={styles.quickActionContent}>
                      <LinearGradient
                        colors={action.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.quickActionIcon}
                      >
                        <Icon name={action.icon} size={24} color={theme.colors.textOnDark} />
                      </LinearGradient>
                      <Text style={styles.quickActionTitle}>{action.title}</Text>
                      <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                    </GlassCard>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Prayer Requests Section */}
            <View style={styles.prayerRequestsContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Prayer Requests</Text>
                <Pressable style={styles.seeAllButton}>
                  <Text style={styles.seeAllText}>See All</Text>
                  <Icon name="arrow-forward" size={16} color={theme.colors.textOnDark} />
                </Pressable>
              </View>

              {mockPrayerRequests.map((request) => (
                <PrayerCard
                  key={request.id}
                  title={request.title}
                  description={request.description}
                  category={request.category}
                  urgency={request.urgency}
                  timeAgo={request.timeAgo}
                  responseCount={request.responseCount}
                  isAnonymous={request.isAnonymous}
                  onPress={() => navigation.navigate('PrayerRequest', { requestId: request.id })}
                  onSupport={() => console.log('Support prayer:', request.id)}
                  onShare={() => console.log('Share prayer:', request.id)}
                />
              ))}
            </View>

            {/* Community Suggestions */}
            <View style={styles.communityContainer}>
              <Text style={styles.sectionTitle}>Suggested Communities</Text>
              <GlassCard variant="elevated" style={styles.communityCard}>
                <LinearGradient
                  colors={gradients.peace}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.communityBanner}
                >
                  <Icon name="groups" size={32} color={theme.colors.textOnDark} />
                </LinearGradient>
                <View style={styles.communityContent}>
                  <Text style={styles.communityTitle}>Local Faith Community</Text>
                  <Text style={styles.communityDescription}>
                    Join 127 members in your area for prayer and support
                  </Text>
                  <GradientButton
                    title="Join Community"
                    onPress={() => navigation.navigate('Communities')}
                    variant="peace"
                    size="small"
                    style={styles.joinButton}
                  />
                </View>
              </GlassCard>
            </View>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
          </Animated.ScrollView>
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
  
  // Header
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  headerLeft: {
    flex: 1,
  },
  
  greeting: {
    fontSize: 16,
    color: theme.colors.textOnDark,
    opacity: 0.8,
    fontWeight: '500',
  },
  
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textOnDark,
    marginTop: spacing.xs,
  },
  
  profileButton: {
    padding: spacing.sm,
  },
  
  // Scroll Content
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingBottom: spacing.massive,
  },
  
  // Quick Actions
  quickActionsContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textOnDark,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  
  quickActions: {
    paddingHorizontal: spacing.lg,
  },
  
  quickActionCard: {
    marginRight: spacing.md,
  },
  
  quickActionContent: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.glassStrong,
  },
  
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textOnDark,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  
  quickActionSubtitle: {
    fontSize: 12,
    color: theme.colors.textOnDark,
    opacity: 0.7,
    textAlign: 'center',
  },
  
  // Prayer Requests
  prayerRequestsContainer: {
    marginBottom: spacing.xl,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  seeAllText: {
    fontSize: 14,
    color: theme.colors.textOnDark,
    fontWeight: '500',
    marginRight: spacing.xs,
  },
  
  // Community
  communityContainer: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  
  communityCard: {
    backgroundColor: theme.colors.glassStrong,
  },
  
  communityBanner: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  
  communityContent: {
    padding: spacing.lg,
  },
  
  communityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textOnDark,
    marginBottom: spacing.sm,
  },
  
  communityDescription: {
    fontSize: 14,
    color: theme.colors.textOnDark,
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  
  joinButton: {
    alignSelf: 'flex-start',
  },
  
  bottomSpacing: {
    height: spacing.massive,
  },
});

export default HomeScreen;