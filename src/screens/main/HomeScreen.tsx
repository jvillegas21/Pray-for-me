import React, { useState, useEffect, useRef, useCallback } from 'react';
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

// Helper function for relative time
const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }
  if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m ago`;
  }
  if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  }
  if (diffInSeconds < 2592000) {
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }
  return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
};
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
  animations,
} from '@/theme';
import { RootState, AppDispatch } from '@/store';
import { fetchPrayerRequests } from '@/store/slices/prayerSlice';
import PrayerCard from '@/components/PrayerCard';
import AnimatedPrayerCard from '@/components/AnimatedPrayerCard';
import PrayerCardSkeleton from '@/components/PrayerCardSkeleton';
import GlassCard from '@/components/GlassCard';
import GradientButton from '@/components/GradientButton';
import { getEncouragementCount, getPrayerCount } from '@/services/prayerService';
import { useFocusEffect } from '@react-navigation/native';
import { store } from '@/store';
import { supabase } from '@/services/authService';

const { width, height } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
  route?: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<any>(null);
  const lastScrollY = useRef<number>(0);
  const scrollDirection = useRef<'up' | 'down'>('down');
  const headerHeight = 120; // Approximate header height

  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { requests, loading, lastRefresh } = useSelector(
    (state: RootState) => state.prayer
  );
  
  // Pagination state
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [displayedRequests, setDisplayedRequests] = useState<any[]>([]);
  const ITEMS_PER_PAGE = 3;

  // State for encouragement and prayer counts
  const [encouragementCounts, setEncouragementCounts] = useState<{
    [id: string]: number;
  }>({});
  const [prayerCounts, setPrayerCounts] = useState<{
    [id: string]: number;
  }>({});
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(Date.now());
  
  // Animation state for newly created cards only
  const [newlyAddedCards, setNewlyAddedCards] = useState<Set<string>>(new Set());
  const [previousRequestIds, setPreviousRequestIds] = useState<string[]>([]);


  // Load initial page of requests
  const loadInitialRequests = React.useCallback(async (forceRefresh = false) => {
    try {
      // Clear existing data if forcing refresh
      if (forceRefresh) {
        setDisplayedRequests([]);
        setEncouragementCounts({});
        setPrayerCounts({});
        setCurrentOffset(0);
        setHasMore(true);
      }

      // Fetch first page with pagination
      const result = await dispatch(fetchPrayerRequests({
        limit: ITEMS_PER_PAGE,
        offset: 0 
      })).unwrap();
      
      const latestRequests = result.data;

      if (!latestRequests || latestRequests.length === 0) {
        setDisplayedRequests([]);
        setEncouragementCounts({});
        setPrayerCounts({});
        setHasMore(false);
        setLastRefreshTime(Date.now());
        return;
      }

      // Set displayed requests to first page
      setDisplayedRequests(latestRequests);
      setCurrentOffset(latestRequests.length);
      setHasMore(latestRequests.length === ITEMS_PER_PAGE);

      // Detect newly added prayers using navigation param and array comparison
      const currentRequestIds = latestRequests.map(req => req.id);
      const newlyAdded = new Set<string>();
      
      // Check if there's a newly created prayer from navigation
      const newlyCreatedPrayerId = route?.params?.newlyCreatedPrayerId;
      
      // Method 1: Use navigation param (most reliable for newly created prayers)
      if (newlyCreatedPrayerId && currentRequestIds.includes(newlyCreatedPrayerId)) {
        newlyAdded.add(newlyCreatedPrayerId);
      }
      
      // Method 2: Compare with previous list (for other new prayers)
      if (previousRequestIds.length > 0 && !forceRefresh) {
        const newPrayerIds = currentRequestIds.filter(id => !previousRequestIds.includes(id));
        newPrayerIds.forEach(id => newlyAdded.add(id));
      }
      
      setNewlyAddedCards(newlyAdded);
      setPreviousRequestIds(currentRequestIds);

      // Clear newly added animation after a delay
      if (newlyAdded.size > 0) {
        setTimeout(() => {
          setNewlyAddedCards(new Set());
        }, 3000); // Clear after 3 seconds
      }
      
      // Clear navigation param after using it
      if (newlyCreatedPrayerId && route?.params) {
        navigation.setParams({ newlyCreatedPrayerId: undefined });
      }

      // Fetch counts for loaded requests
      await loadCountsForRequests(latestRequests);
      setLastRefreshTime(Date.now());
    } catch (error) {
      // Keep existing data if there's an error
    }
  }, [dispatch, navigation, route?.params, previousRequestIds]);

  // Helper to load counts for specific requests
  const loadCountsForRequests = async (requestsToLoad: any[]) => {
    const encouragementPromises = requestsToLoad.map(async (req) => {
      try {
        const count = await getEncouragementCount(req.id);
        return [req.id, count] as [string, number];
      } catch (error) {
        return [req.id, 0] as [string, number];
      }
    });

    const prayerPromises = requestsToLoad.map(async (req) => {
      try {
        const count = await getPrayerCount(req.id);
        return [req.id, count] as [string, number];
      } catch (error) {
        return [req.id, 0] as [string, number];
      }
    });

    const [encouragementEntries, prayerEntries] = await Promise.all([
      Promise.all(encouragementPromises),
      Promise.all(prayerPromises)
    ]);

    const newEncouragementCounts = Object.fromEntries(encouragementEntries);
    const newPrayerCounts = Object.fromEntries(prayerEntries);
    
    setEncouragementCounts(prev => ({...prev, ...newEncouragementCounts}));
    setPrayerCounts(prev => ({...prev, ...newPrayerCounts}));
  };

  // Facebook-style load more function
  const loadMoreRequests = React.useCallback(async () => {
    if (loadingMore || !hasMore) {
      return;
    }
    
    setLoadingMore(true);
    
    try {
      const result = await dispatch(fetchPrayerRequests({
        limit: ITEMS_PER_PAGE,
        offset: currentOffset
      })).unwrap();
      
      const newRequests = result.data;
      
      if (!newRequests || newRequests.length === 0) {
        setHasMore(false);
      } else {
        // Append new requests to existing list
        setDisplayedRequests(prev => [...prev, ...newRequests]);
        setCurrentOffset(prev => prev + newRequests.length);
        setHasMore(newRequests.length === ITEMS_PER_PAGE);
        
        // Load counts for new requests
        await loadCountsForRequests(newRequests);
      }
    } catch (error) {
      console.error('Error loading more requests:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, currentOffset, dispatch]);

  // Facebook-style header animation logic
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
        const currentScrollY = contentOffset.y;
        const diff = currentScrollY - lastScrollY.current;
        
        // Determine scroll direction for header animation
        if (diff > 0 && currentScrollY > 50) {
          // Scrolling down/up (content moving up) - hide header
          if (scrollDirection.current !== 'up') {
            scrollDirection.current = 'up';
            Animated.timing(headerTranslateY, {
              toValue: -headerHeight,
              duration: 300,
              useNativeDriver: true,
            }).start();
          }
        } else if (diff < -5) {
          // Scrolling up (content moving down) or swipe down - show header
          if (scrollDirection.current !== 'down') {
            scrollDirection.current = 'down';
            Animated.timing(headerTranslateY, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start();
          }
        }
        
        // Always show header when at top
        if (currentScrollY <= 0) {
          Animated.timing(headerTranslateY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
        
        // Facebook-style infinite scroll detection
        const paddingToBottom = 300;
        const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
        
        if (isNearBottom && hasMore && !loadingMore) {
          loadMoreRequests();
        }
        
        lastScrollY.current = currentScrollY;
      },
    }
  );


  // Direct refresh function that bypasses Redux caching
  const forceRefreshCounts = async () => {
    try {
      // Get current requests from Redux
      const currentRequests = store.getState().prayer.requests;

      if (!currentRequests || currentRequests.length === 0) {
        return;
      }

      // Fetch counts directly without any caching
      const encouragementPromises = currentRequests.map(async (req) => {
        try {
          const count = await getEncouragementCount(req.id);
          return [req.id, count] as [string, number];
        } catch (error) {
          return [req.id, 0] as [string, number];
        }
      });

      const prayerPromises = currentRequests.map(async (req) => {
        try {
          const count = await getPrayerCount(req.id);
          return [req.id, count] as [string, number];
        } catch (error) {
          return [req.id, 0] as [string, number];
        }
      });

      const [encouragementEntries, prayerEntries] = await Promise.all([
        Promise.all(encouragementPromises),
        Promise.all(prayerPromises)
      ]);

      const newEncouragementCounts = Object.fromEntries(encouragementEntries);
      const newPrayerCounts = Object.fromEntries(prayerEntries);

      setEncouragementCounts(newEncouragementCounts);
      setPrayerCounts(newPrayerCounts);

      // Verify the state was updated
      setTimeout(() => {}, 100);
    } catch (error) {
      // Handle error silently
    }
  };

  
  // Use useFocusEffect to always fetch fresh data (but avoid over-fetching)
  useFocusEffect(
    React.useCallback(() => {
      // Only load if we don't have data or if enough time has passed
      // Also prevent interference with endless scroll loading
      const timeSinceLastRefresh = Date.now() - lastRefreshTime;
      if (displayedRequests.length === 0 || (timeSinceLastRefresh > 5000 && !loadingMore)) {
        loadInitialRequests();
      }
    }, [loadInitialRequests, displayedRequests.length, lastRefreshTime, loadingMore])
  );

  // Additional navigation listener as backup
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Check if there's a newly created prayer to animate
      const newlyCreatedPrayerId = route?.params?.newlyCreatedPrayerId;
      
      if (newlyCreatedPrayerId) {
        // Force a refresh to get the latest data and trigger animation
        setTimeout(() => {
          loadInitialRequests();
        }, 100);
      } else {
        // Just refresh counts without full reload
        setTimeout(() => {
          forceRefreshCounts();
        }, 300);
      }
    });

    return unsubscribe;
  }, [navigation, route?.params?.newlyCreatedPrayerId, loadInitialRequests]);

  // Listen for Redux refresh triggers
  useEffect(() => {
    if (lastRefresh > 0) {
      // Only trigger if lastRefresh is valid
      forceRefreshCounts(); // Use direct refresh for more reliability
    }
  }, [lastRefresh]);

  // Periodic refresh as backup for when real-time fails
  useEffect(() => {
    // Disabled periodic refresh to prevent auto refresh tick errors
    // const interval = setInterval(() => {
    //   // Only refresh if we haven't refreshed in the last 30 seconds
    //   const timeSinceLastRefresh = Date.now() - lastRefreshTime;
    //   if (timeSinceLastRefresh > 30000) { // 30 seconds
    //     forceRefreshCounts();
    //   }
    // }, 30000); // Check every 30 seconds
    // return () => clearInterval(interval);
  }, [lastRefreshTime]);

  // Simplified real-time subscription (disabled for now due to CHANNEL_ERROR)
  useEffect(() => {
    // Real-time is disabled due to CHANNEL_ERROR issues
    // Relying on navigation focus and periodic refresh instead
  }, []);

  // Update onRefresh to use the same logic
  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialRequests(true);
    setRefreshing(false);
  };

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
      onPress: () => navigation.navigate('CommunitiesTab'),
    },
    {
      icon: 'map',
      title: 'Nearby',
      subtitle: 'Local prayers',
      gradient: gradients.sunrise,
      onPress: () => navigation.navigate('MapTab'),
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
          {/* Facebook-style Animated Header */}
          <Animated.View style={[styles.header, { 
            transform: [{ translateY: headerTranslateY }],
          }]}>
            <View style={styles.headerContent}>
              <Text style={styles.appName}>AMENITY</Text>
              <Pressable 
                style={styles.profileButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <Icon
                  name="account-circle"
                  size={32}
                  color={theme.colors.textOnDark}
                />
              </Pressable>
            </View>
          </Animated.View>

          {/* Scrollable Content */}
          <Animated.ScrollView
            ref={scrollViewRef}
            style={[styles.scrollView, { paddingTop: headerHeight }]}
            contentContainerStyle={styles.scrollContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.textOnDark}
                colors={[theme.colors.primary]}
                progressViewOffset={headerHeight}
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
                    <GlassCard
                      variant="filled"
                      style={styles.quickActionContent}
                    >
                      <LinearGradient
                        colors={action.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.quickActionIcon}
                      >
                        <Icon
                          name={action.icon}
                          size={24}
                          color={theme.colors.textOnDark}
                        />
                      </LinearGradient>
                      <Text style={styles.quickActionTitle}>
                        {action.title}
                      </Text>
                      <Text style={styles.quickActionSubtitle}>
                        {action.subtitle}
                      </Text>
                    </GlassCard>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Prayer Requests Section */}
            <View style={styles.prayerRequestsContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Prayer Requests</Text>
              </View>


              {displayedRequests.length > 0 ? (
                <>
                  {displayedRequests.map((request, index) => {
                    const isNewlyAdded = newlyAddedCards.has(request.id);
                    const hasNewCardAbove = displayedRequests.slice(0, index).some(req => newlyAddedCards.has(req.id));
                    
                    return (
                      <AnimatedPrayerCard
                        key={`prayer-${request.id}`}
                        index={index}
                        isNew={false}
                        isNewlyAdded={isNewlyAdded}
                        isPushedDown={hasNewCardAbove}
                        id={request.id}
                        title={request.title}
                        description={request.description}
                        category={request.category}
                        urgency={request.urgency}
                        status={request.status}
                        timeAgo={
                          request.createdAt
                            ? getRelativeTime(request.createdAt)
                            : 'Just now'
                        }
                        responseCount={request.responses?.length || 0}
                        encouragementCount={encouragementCounts[request.id] ?? 0}
                        prayerCount={prayerCounts[request.id] ?? 0}
                        isAnonymous={request.isAnonymous}
                        userName={request.user?.name}
                        userAvatarColor={request.user?.avatar_color}
                        onPress={() =>
                          navigation.navigate('PrayerRequest', {
                            requestId: request.id,
                          })
                        }
                        onSupport={() => {}}
                        onShare={() => {}}
                        onPrayerCountChange={(newCount: number) => {
                          setPrayerCounts(prev => ({
                            ...prev,
                            [request.id]: newCount
                          }));
                        }}
                      />
                    );
                  })}
                  
                  {/* Loading indicator for infinite scroll */}
                  {loadingMore && (
                    <View style={styles.loadMoreTrigger}>
                      <PrayerCardSkeleton />
                      <PrayerCardSkeleton />
                    </View>
                  )}
                </>
              ) : loading ? (
                // Show skeletons during initial load
                <>
                  <PrayerCardSkeleton />
                  <PrayerCardSkeleton />
                  <PrayerCardSkeleton />
                </>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    No prayer requests yet
                  </Text>
                  <Text style={styles.emptyStateSubtext}>
                    Be the first to share a prayer request
                  </Text>
                </View>
                            )}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: 120,
    backgroundColor: '#9D4EDD',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    justifyContent: 'flex-end',
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textOnDark,
    flex: 1,
    textAlign: 'left',
  },

  profileButton: {
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
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



  bottomSpacing: {
    height: spacing.massive,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginHorizontal: spacing.lg,
  },

  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textOnDark,
    marginBottom: spacing.xs,
  },

  emptyStateSubtext: {
    fontSize: 14,
    color: theme.colors.textOnDark,
    opacity: 0.7,
    textAlign: 'center',
  },

  // Load more styles
  loadMoreTrigger: {
    paddingVertical: spacing.md,
  },
});

export default HomeScreen;
