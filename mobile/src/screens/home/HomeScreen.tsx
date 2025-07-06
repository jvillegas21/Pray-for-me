import React, {useEffect, useState} from 'react';
import {View, StyleSheet, FlatList, RefreshControl} from 'react-native';
import {Text, FAB, Chip, Card, IconButton, Avatar} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../../navigation/MainNavigator';
import {usePrayer} from '../../context/PrayerContext';
import {useAuth} from '../../context/AuthContext';
import {useLocation} from '../../context/LocationContext';
import {Prayer} from '../../types';
import {colors, spacing, fontSize, fontWeight, shadows, borderRadius} from '../../utils/theme';
import {formatDistanceToNow} from 'date-fns';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeScreen'>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {user} = useAuth();
  const {location} = useLocation();
  const {
    nearbyPrayers,
    trendingPrayers,
    fetchNearbyPrayers,
    fetchTrendingPrayers,
    likePrayer,
    incrementPrayerCount,
    isLoading,
  } = usePrayer();

  const [selectedTab, setSelectedTab] = useState<'nearby' | 'trending'>('nearby');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPrayers();
  }, [location]);

  const loadPrayers = async () => {
    if (location) {
      await fetchNearbyPrayers(location);
    }
    await fetchTrendingPrayers();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPrayers();
    setRefreshing(false);
  };

  const handleLike = async (prayerId: string) => {
    try {
      await likePrayer(prayerId);
    } catch (error) {
      // Handle error
    }
  };

  const handlePray = async (prayerId: string) => {
    try {
      await incrementPrayerCount(prayerId);
    } catch (error) {
      // Handle error
    }
  };

  const renderPrayerCard = ({item}: {item: Prayer}) => {
    const isLiked = item.likes.includes(user?.id || '');
    const userName = typeof item.user === 'object' ? item.user.name : 'Anonymous';
    const categoryColor = colors.categories[item.category] || colors.gray[500];

    return (
      <Card
        style={styles.prayerCard}
        onPress={() => navigation.navigate('PrayerDetail', {prayerId: item._id})}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.userInfo}>
              <Avatar.Text
                size={36}
                label={userName.charAt(0).toUpperCase()}
                style={{backgroundColor: categoryColor}}
              />
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.timeAgo}>
                  {formatDistanceToNow(new Date(item.createdAt), {addSuffix: true})}
                </Text>
              </View>
            </View>
            <Chip
              mode="flat"
              textStyle={styles.categoryChipText}
              style={[styles.categoryChip, {backgroundColor: categoryColor + '20'}]}>
              {item.category}
            </Chip>
          </View>

          <Text style={styles.prayerTitle}>{item.title}</Text>
          <Text style={styles.prayerContent} numberOfLines={3}>
            {item.content}
          </Text>

          {item.bibleVerses.length > 0 && (
            <View style={styles.verseContainer}>
              <Text style={styles.verseReference}>{item.bibleVerses[0].reference}</Text>
            </View>
          )}

          <View style={styles.cardActions}>
            <View style={styles.actionButton}>
              <IconButton
                icon={isLiked ? 'heart' : 'heart-outline'}
                iconColor={isLiked ? colors.error : colors.gray[600]}
                size={20}
                onPress={() => handleLike(item._id)}
              />
              <Text style={styles.actionCount}>{item.likeCount}</Text>
            </View>

            <View style={styles.actionButton}>
              <IconButton
                icon="hands-pray"
                iconColor={colors.primary}
                size={20}
                onPress={() => handlePray(item._id)}
              />
              <Text style={styles.actionCount}>{item.prayerCount}</Text>
            </View>

            {item.city && (
              <View style={styles.locationTag}>
                <Text style={styles.locationText}>
                  📍 {item.city}, {item.country}
                </Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const prayers = selectedTab === 'nearby' ? nearbyPrayers : trendingPrayers;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Prayer Connect</Text>
        <View style={styles.tabContainer}>
          <Chip
            mode={selectedTab === 'nearby' ? 'flat' : 'outlined'}
            onPress={() => setSelectedTab('nearby')}
            style={[styles.tab, selectedTab === 'nearby' && styles.activeTab]}
            textStyle={[styles.tabText, selectedTab === 'nearby' && styles.activeTabText]}>
            Nearby
          </Chip>
          <Chip
            mode={selectedTab === 'trending' ? 'flat' : 'outlined'}
            onPress={() => setSelectedTab('trending')}
            style={[styles.tab, selectedTab === 'trending' && styles.activeTab]}
            textStyle={[styles.tabText, selectedTab === 'trending' && styles.activeTabText]}>
            Trending
          </Chip>
        </View>
      </View>

      <FlatList
        data={prayers}
        keyExtractor={(item) => item._id}
        renderItem={renderPrayerCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {selectedTab === 'nearby' 
                ? 'No prayers found nearby. Be the first to share!' 
                : 'No trending prayers at the moment.'}
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.getParent()?.navigate('CreatePrayer')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    ...shadows.sm,
  },
  headerTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tab: {
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.gray[600],
  },
  activeTabText: {
    color: colors.white,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  prayerCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: spacing.sm,
  },
  userName: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.gray[900],
  },
  timeAgo: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
  },
  categoryChip: {
    height: 28,
  },
  categoryChipText: {
    fontSize: fontSize.xs,
    textTransform: 'capitalize',
  },
  prayerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  prayerContent: {
    fontSize: fontSize.base,
    color: colors.gray[700],
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  verseContainer: {
    backgroundColor: colors.primary + '10',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  verseReference: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  actionCount: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    marginLeft: -8,
  },
  locationTag: {
    marginLeft: 'auto',
  },
  locationText: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.gray[500],
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: spacing.md,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});

export default HomeScreen;