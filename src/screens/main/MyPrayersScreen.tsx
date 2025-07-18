import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';

import { theme, spacing, gradients } from '@/theme';
import { RootState, AppDispatch } from '@/store';
import { fetchMyPrayerRequests } from '@/store/slices/prayerSlice';
import PrayerCard from '@/components/PrayerCard';
import GlassCard from '@/components/GlassCard';

const MyPrayersScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  
  const { myRequests, loading } = useSelector((state: RootState) => state.prayer);
  const filter = route.params?.filter || 'all';

  useEffect(() => {
    dispatch(fetchMyPrayerRequests());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchMyPrayerRequests());
    setRefreshing(false);
  };

  const filteredRequests = myRequests.filter(request => {
    switch (filter) {
      case 'active':
        return request.status === 'active';
      case 'answered':
        return request.status === 'answered';
      default:
        return true;
    }
  });

  const getTitle = () => {
    switch (filter) {
      case 'active':
        return 'Active Prayers';
      case 'answered':
        return 'Answered Prayers';
      default:
        return 'All Prayers';
    }
  };

  const renderPrayerItem = ({ item }: { item: any }) => (
    <PrayerCard
      id={item.id}
      title={item.title}
      description={item.description}
      category={item.category}
      urgency={item.urgency}
      timeAgo={item.createdAt}
      responseCount={item.responses?.length || 0}
      encouragementCount={item.encouragements?.length || 0}
      prayerCount={0}
      isAnonymous={item.isAnonymous}
      onPress={() => navigation.navigate('PrayerRequest' as never, { requestId: item.id })}
      onSupport={() => {}}
      onShare={() => {}}
      showEditOption={true}
      onEdit={() => navigation.navigate('EditPrayer' as never, { prayerId: item.id })}
    />
  );

  return (
    <LinearGradient
      colors={gradients.sunset}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={theme.colors.textOnDark} />
          </TouchableOpacity>
          <Text style={styles.title}>{getTitle()}</Text>
          <View style={styles.placeholder} />
        </View>

        <FlatList
          data={filteredRequests}
          renderItem={renderPrayerItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.textOnDark}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={() => (
            <GlassCard variant="elevated" style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No prayers found</Text>
              <Text style={styles.emptyText}>
                {filter === 'active' 
                  ? 'You have no active prayers' 
                  : filter === 'answered'
                  ? 'No answered prayers yet'
                  : 'You haven\'t created any prayers yet'}
              </Text>
            </GlassCard>
          )}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  backButton: {
    padding: spacing.sm,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textOnDark,
  },

  placeholder: {
    width: 40,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.massive,
  },

  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.xl,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: spacing.sm,
  },

  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default MyPrayersScreen;