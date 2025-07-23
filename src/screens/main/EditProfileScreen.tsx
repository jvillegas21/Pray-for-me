import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { theme, spacing, borderRadius, gradients, shadows } from '@/theme';
import { RootState, AppDispatch } from '@/store';
import GlassCard from '@/components/GlassCard';
import GradientButton from '@/components/GradientButton';
import UserAvatar from '@/components/UserAvatar';
import { supabase } from '@/services/authService';
import { updateProfile } from '@/store/slices/authSlice';
import { fetchPrayerRequests } from '@/store/slices/prayerSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [selectedAvatarColor, setSelectedAvatarColor] = useState(user?.avatar_color || theme.colors.primary);
  const [saving, setSaving] = useState(false);

  // Available avatar colors
  const avatarColors = [
    theme.colors.primary,
    theme.colors.secondary,
    theme.colors.spiritual,
    theme.colors.peace,
    theme.colors.success,
    theme.colors.warning,
    theme.colors.accent,
    theme.colors.error,
    '#FF6B6B', // Coral
    '#4ECDC4', // Turquoise
    '#45B7D1', // Sky Blue
    '#96CEB4', // Mint
    '#FFEAA7', // Light Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Seafoam
    '#F7DC6F', // Butter
  ];

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setSaving(true);
    try {
      // Use Redux thunk to update profile
      const resultAction = await dispatch(
        updateProfile({
          name: name.trim(),
          avatar_color: selectedAvatarColor,
        })
      );

      if (updateProfile.fulfilled.match(resultAction)) {
        // Optionally update AsyncStorage if you cache user data
        if (resultAction.payload) {
          await AsyncStorage.setItem('user', JSON.stringify(resultAction.payload));
        }

        // Refresh prayer requests
        dispatch(fetchPrayerRequests({}));

        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error(resultAction.payload || 'Failed to update profile');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient
      colors={gradients.sunset}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={theme.colors.textOnDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Preview */}
          <GlassCard variant="filled" style={styles.profilePreview}>
            <View style={styles.previewContent}>
              <UserAvatar
                name={name}
                backgroundColor={selectedAvatarColor}
                size="large"
              />
              <Text style={styles.previewName}>{name || 'Your Name'}</Text>
              <Text style={styles.previewEmail}>{user?.email}</Text>
            </View>
          </GlassCard>

          {/* Name Input */}
          <GlassCard variant="elevated" style={styles.section}>
            <Text style={styles.sectionTitle}>Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={theme.colors.textTertiary}
              maxLength={50}
            />
          </GlassCard>

          {/* Avatar Color Selection */}
          <GlassCard variant="elevated" style={styles.section}>
            <Text style={styles.sectionTitle}>Avatar Color</Text>
            <Text style={styles.sectionSubtitle}>
              Choose a color for your avatar background
            </Text>
            <View style={styles.colorGrid}>
              {avatarColors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedAvatarColor === color && styles.selectedColor,
                  ]}
                  onPress={() => setSelectedAvatarColor(color)}
                  activeOpacity={0.7}
                >
                  {selectedAvatarColor === color && (
                    <Icon
                      name="check"
                      size={20}
                      color={theme.colors.textOnDark}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>

          {/* Save Button */}
          <View style={styles.saveSection}>
            <GradientButton
              title="Save Changes"
              onPress={handleSave}
              variant="primary"
              loading={saving}
              disabled={saving}
            />
          </View>
        </ScrollView>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textOnDark,
  },
  headerRight: {
    width: 40, // Match back button width for centering
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.massive,
  },
  profilePreview: {
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  previewContent: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  previewName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  previewEmail: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: spacing.md,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.divider,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    ...shadows.small,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: theme.colors.textOnDark,
    transform: [{ scale: 1.1 }],
    ...shadows.medium,
  },
  saveSection: {
    marginTop: spacing.lg,
  },
});

export default EditProfileScreen;