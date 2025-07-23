import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { theme, spacing, borderRadius, gradients, shadows } from '@/theme';
import { RootState, AppDispatch } from '@/store';
import { logout } from '@/store/slices/authSlice';
import { fetchMyPrayerRequests } from '@/store/slices/prayerSlice';
import { getCurrentLocation, requestLocationPermission } from '@/store/slices/locationSlice';
import GlassCard from '@/components/GlassCard';
import GradientButton from '@/components/GradientButton';
import { Button, Dialog, Portal, Paragraph } from 'react-native-paper';
import UserAvatar from '@/components/UserAvatar';

interface ProfileMenuItem {
  title: string;
  subtitle?: string;
  icon: string;
  onPress: () => void;
  showChevron?: boolean;
  rightComponent?: React.ReactNode;
}

interface ProfileSection {
  title: string;
  items: ProfileMenuItem[];
}

const ProfileScreen: React.FC = () => {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [anonymousPrayers, setAnonymousPrayers] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const { myRequests } = useSelector((state: RootState) => state.prayer);
  const { current: currentLocation, permission } = useSelector((state: RootState) => state.location);

  useEffect(() => {
    // Load user's prayers on mount
    dispatch(fetchMyPrayerRequests());
    
    // Check location permission status
    setLocationEnabled(permission === 'granted');
  }, [dispatch, permission]);

  const handleLogout = async () => {
    setShowLogoutDialog(false);
    try {
      await dispatch(logout()).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleLocationToggle = async (value: boolean) => {
    if (value) {
      try {
        const permissionResult = await dispatch(requestLocationPermission()).unwrap();
        if (permissionResult === 'granted') {
          await dispatch(getCurrentLocation());
          setLocationEnabled(true);
          Alert.alert('Success', 'Location services enabled. Your prayers will now include location information.');
        } else {
          Alert.alert('Permission Denied', 'Location permission is required to enable location services.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to enable location services.');
      }
    } else {
      setLocationEnabled(false);
      Alert.alert('Location Disabled', 'Your prayers will no longer include location information.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchMyPrayerRequests());
    setRefreshing(false);
  };

  const activePrayers = myRequests.filter(req => req.status === 'active').length;
  const answeredPrayers = myRequests.filter(req => req.status === 'answered').length;

  const profileSections: ProfileSection[] = [
    {
      title: 'My Prayers',
      items: [
        {
          title: 'Active Prayers',
          subtitle: `${activePrayers} prayers`,
          icon: 'favorite',
          onPress: () => navigation.navigate('MyPrayers' as never, { filter: 'active' }),
          showChevron: true,
        },
        {
          title: 'Answered Prayers',
          subtitle: `${answeredPrayers} prayers`,
          icon: 'check-circle',
          onPress: () => navigation.navigate('MyPrayers' as never, { filter: 'answered' }),
          showChevron: true,
        },
        {
          title: 'Prayer History',
          subtitle: 'View all your prayers',
          icon: 'history',
          onPress: () => navigation.navigate('MyPrayers' as never, { filter: 'all' }),
          showChevron: true,
        },
      ],
    },
    {
      title: 'Bible Studies & Verses',
      items: [
        {
          title: 'My Bible Studies',
          subtitle: 'Studies linked to your prayers',
          icon: 'menu-book',
          onPress: () => navigation.navigate('MyBibleStudies' as never),
          showChevron: true,
        },
        {
          title: 'Saved Verses',
          subtitle: 'Verses that spoke to you',
          icon: 'bookmark',
          onPress: () => navigation.navigate('SavedVerses' as never),
          showChevron: true,
        },
        {
          title: 'Daily Devotional',
          subtitle: 'Personalized spiritual content',
          icon: 'wb-sunny',
          onPress: () => navigation.navigate('DailyDevotional' as never),
          showChevron: true,
        },
      ],
    },
    {
      title: 'Location & Privacy',
      items: [
        {
          title: 'Location Services',
          subtitle: locationEnabled ? `Enabled${currentLocation ? ' • Location detected' : ''}` : 'Disabled',
          icon: 'location-on',
          onPress: () => {},
          rightComponent: (
            <Switch
              value={locationEnabled}
              onValueChange={handleLocationToggle}
              trackColor={{ false: theme.colors.backdrop, true: theme.colors.primary }}
              thumbColor={locationEnabled ? theme.colors.surface : theme.colors.textSecondary}
            />
          ),
        },
        {
          title: 'Prayer Privacy',
          subtitle: 'Set default prayer visibility',
          icon: 'visibility',
          onPress: () => navigation.navigate('PrivacySettings' as never),
          showChevron: true,
        },
        {
          title: 'Anonymous by Default',
          subtitle: 'Post prayers anonymously',
          icon: 'person-off',
          onPress: () => {},
          rightComponent: (
            <Switch
              value={anonymousPrayers}
              onValueChange={setAnonymousPrayers}
              trackColor={{ false: theme.colors.backdrop, true: theme.colors.primary }}
              thumbColor={anonymousPrayers ? theme.colors.surface : theme.colors.textSecondary}
            />
          ),
        },
        {
          title: 'Profile Visibility',
          subtitle: privateProfile ? 'Private' : 'Public',
          icon: 'lock',
          onPress: () => {},
          rightComponent: (
            <Switch
              value={privateProfile}
              onValueChange={setPrivateProfile}
              trackColor={{ false: theme.colors.backdrop, true: theme.colors.primary }}
              thumbColor={privateProfile ? theme.colors.surface : theme.colors.textSecondary}
            />
          ),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          title: 'Prayer Notifications',
          subtitle: 'Get notified about nearby prayers',
          icon: 'notifications',
          onPress: () => {},
          rightComponent: (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.colors.backdrop, true: theme.colors.primary }}
              thumbColor={notificationsEnabled ? theme.colors.surface : theme.colors.textSecondary}
            />
          ),
        },
        {
          title: 'Encouragement Alerts',
          subtitle: 'When others pray for you',
          icon: 'favorite-border',
          onPress: () => navigation.navigate('NotificationSettings' as never),
          showChevron: true,
        },
        {
          title: 'Community Updates',
          subtitle: 'News from your communities',
          icon: 'group',
          onPress: () => navigation.navigate('NotificationSettings' as never),
          showChevron: true,
        },
        {
          title: 'Daily Reminders',
          subtitle: 'Prayer and devotional reminders',
          icon: 'schedule',
          onPress: () => navigation.navigate('NotificationSettings' as never),
          showChevron: true,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          title: 'Edit Profile',
          subtitle: 'Update your information',
          icon: 'edit',
          onPress: () => navigation.navigate('EditProfile' as never),
          showChevron: true,
        },
        {
          title: 'Data & Storage',
          subtitle: 'Manage your data',
          icon: 'storage',
          onPress: () => navigation.navigate('DataSettings' as never),
          showChevron: true,
        },
        {
          title: 'Help & Support',
          subtitle: 'Get help using the app',
          icon: 'help',
          onPress: () => navigation.navigate('HelpSupport' as never),
          showChevron: true,
        },
        {
          title: 'About',
          subtitle: 'App version and info',
          icon: 'info',
          onPress: () => navigation.navigate('About' as never),
          showChevron: true,
        },
      ],
    },
  ];

  const renderProfileHeader = () => (
    <GlassCard variant="filled" style={styles.profileHeader}>
      <LinearGradient
        colors={gradients.spiritual}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileHeaderGradient}
      >
        <View style={styles.avatarContainer}>
          <UserAvatar
            name={user?.name}
            backgroundColor={user?.avatar_color}
            size="large"
          />
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{myRequests.length}</Text>
            <Text style={styles.statLabel}>Prayers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{answeredPrayers}</Text>
            <Text style={styles.statLabel}>Answered</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {currentLocation ? '📍' : '❌'}
            </Text>
            <Text style={styles.statLabel}>Location</Text>
          </View>
        </View>
      </LinearGradient>
    </GlassCard>
  );

  const renderSection = (section: ProfileSection) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <GlassCard variant="elevated" style={styles.sectionCard}>
        {section.items.map((item, index) => (
          <View key={item.title}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Icon name={item.icon} size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  {item.subtitle && (
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
              </View>
              <View style={styles.menuItemRight}>
                {item.rightComponent}
                {item.showChevron && (
                  <Icon
                    name="chevron-right"
                    size={24}
                    color={theme.colors.textSecondary}
                    style={styles.chevron}
                  />
                )}
              </View>
            </TouchableOpacity>
            {index < section.items.length - 1 && (
              <View style={styles.menuItemDivider} />
            )}
          </View>
        ))}
      </GlassCard>
    </View>
  );

  return (
    <LinearGradient
      colors={gradients.sunset}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
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
          {renderProfileHeader()}
          
          {profileSections.map(renderSection)}

          <View style={styles.logoutSection}>
            <GradientButton
              title="Sign Out"
              onPress={() => setShowLogoutDialog(true)}
              variant="sunset"
              style={styles.logoutButton}
              loading={loading}
              disabled={loading}
            />
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>

      <Portal>
        <Dialog visible={showLogoutDialog} onDismiss={() => setShowLogoutDialog(false)}>
          <Dialog.Title>Sign Out</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to sign out of your account?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLogoutDialog(false)}>Cancel</Button>
            <Button
              onPress={handleLogout}
              loading={loading}
              disabled={loading}
            >
              Sign Out
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },

  profileHeader: {
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },

  profileHeaderGradient: {
    padding: spacing.xl,
    alignItems: 'center',
  },

  avatarContainer: {
    marginBottom: spacing.lg,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },

  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.primary,
  },

  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textOnDark,
    marginBottom: spacing.xs,
  },

  userEmail: {
    fontSize: 16,
    color: theme.colors.textOnDark,
    opacity: 0.8,
    marginBottom: spacing.lg,
  },

  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.glassLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textOnDark,
    marginBottom: spacing.xs,
  },

  statLabel: {
    fontSize: 12,
    color: theme.colors.textOnDark,
    opacity: 0.8,
    fontWeight: '500',
  },

  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.textOnDark,
    opacity: 0.2,
    marginHorizontal: spacing.md,
  },

  section: {
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.textOnDark,
    marginBottom: spacing.md,
    marginLeft: spacing.sm,
  },

  sectionCard: {
    overflow: 'hidden',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    minHeight: 64,
  },

  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: theme.colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

  menuItemContent: {
    flex: 1,
  },

  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: spacing.xs,
  },

  menuItemSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },

  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  chevron: {
    marginLeft: spacing.sm,
  },

  menuItemDivider: {
    height: 1,
    backgroundColor: theme.colors.backdrop,
    marginHorizontal: spacing.lg,
  },

  logoutSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },

  logoutButton: {
    alignSelf: 'stretch',
  },

  bottomSpacing: {
    height: spacing.massive,
  },
});

export default ProfileScreen;
