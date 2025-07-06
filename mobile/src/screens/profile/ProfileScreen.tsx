import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Text, Avatar, Card, List, Button, Divider} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import {usePrayer} from '../../context/PrayerContext';
import {colors, spacing, fontSize, fontWeight, shadows, borderRadius} from '../../utils/theme';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const {user, signOut} = useAuth();
  const {userPrayers} = usePrayer();

  const handleSignOut = async () => {
    await signOut();
  };

  const stats = [
    {label: 'Prayers Shared', value: userPrayers.length},
    {label: 'Prayers Answered', value: userPrayers.filter(p => p.answered).length},
    {label: 'Hearts Given', value: user?.prayersLiked?.length || 0},
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Avatar.Text
            size={80}
            label={user?.name?.charAt(0).toUpperCase() || 'U'}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          {user?.city && (
            <Text style={styles.location}>📍 {user.city}, {user.country}</Text>
          )}
        </View>

        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Card style={styles.menuCard}>
          <List.Item
            title="My Prayers"
            description="View all your prayer requests"
            left={props => <List.Icon {...props} icon="hands-pray" />}
            onPress={() => {}}
            style={styles.menuItem}
          />
          <Divider />
          <List.Item
            title="Bible Studies"
            description="Continue your guided studies"
            left={props => <List.Icon {...props} icon="book-open-variant" />}
            onPress={() => navigation.navigate('BibleStudyList' as any)}
            style={styles.menuItem}
          />
          <Divider />
          <List.Item
            title="Answered Prayers"
            description="Celebrate God's faithfulness"
            left={props => <List.Icon {...props} icon="check-circle" />}
            onPress={() => {}}
            style={styles.menuItem}
          />
        </Card>

        <Card style={styles.menuCard}>
          <List.Item
            title="Settings"
            left={props => <List.Icon {...props} icon="cog" />}
            onPress={() => {}}
            style={styles.menuItem}
          />
          <Divider />
          <List.Item
            title="About"
            left={props => <List.Icon {...props} icon="information" />}
            onPress={() => {}}
            style={styles.menuItem}
          />
          <Divider />
          <List.Item
            title="Privacy Policy"
            left={props => <List.Icon {...props} icon="shield-lock" />}
            onPress={() => {}}
            style={styles.menuItem}
          />
        </Card>

        <Button
          mode="outlined"
          onPress={handleSignOut}
          style={styles.signOutButton}
          labelStyle={styles.signOutLabel}>
          Sign Out
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  avatar: {
    backgroundColor: colors.primary,
    marginBottom: spacing.md,
  },
  userName: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: fontSize.base,
    color: colors.gray[600],
  },
  location: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  menuCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  menuItem: {
    paddingVertical: spacing.sm,
  },
  signOutButton: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.lg,
    borderColor: colors.error,
  },
  signOutLabel: {
    color: colors.error,
    fontWeight: fontWeight.semibold,
  },
});

export default ProfileScreen;