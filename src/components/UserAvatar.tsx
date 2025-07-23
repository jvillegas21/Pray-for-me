import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme, borderRadius, spacing } from '@/theme';

interface UserAvatarProps {
  name?: string;
  isAnonymous?: boolean;
  backgroundColor?: string;
  size?: 'small' | 'medium' | 'large';
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  isAnonymous = false,
  backgroundColor,
  size = 'medium',
}) => {
  const getInitials = (fullName: string): string => {
    const names = fullName.trim().split(' ');
    // Always use just the first letter of the first name
    return names[0][0].toUpperCase();
  };

  const getDefaultBackgroundColor = (initials: string): string => {
    // Generate a consistent color based on initials
    const colors = [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.spiritual,
      theme.colors.peace,
      theme.colors.success,
      theme.colors.warning,
      theme.colors.accent,
    ];
    
    const charSum = initials.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { width: 32, height: 32 },
          text: { fontSize: 14 },
          icon: 16,
        };
      case 'large':
        return {
          container: { width: 56, height: 56 },
          text: { fontSize: 22 },
          icon: 28,
        };
      default: // medium
        return {
          container: { width: 40, height: 40 },
          text: { fontSize: 16 },
          icon: 20,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  if (isAnonymous) {
    return (
      <View
        style={[
          styles.container,
          sizeStyles.container,
          {
            backgroundColor: theme.colors.textTertiary,
          },
        ]}
      >
        <Icon
          name="person"
          size={sizeStyles.icon}
          color={theme.colors.textOnDark}
        />
      </View>
    );
  }

  if (!name) {
    return (
      <View
        style={[
          styles.container,
          sizeStyles.container,
          {
            backgroundColor: theme.colors.textTertiary,
          },
        ]}
      >
        <Icon
          name="person"
          size={sizeStyles.icon}
          color={theme.colors.textOnDark}
        />
      </View>
    );
  }

  const initials = getInitials(name);
  const bgColor = backgroundColor || getDefaultBackgroundColor(initials);

  return (
    <View
      style={[
        styles.container,
        sizeStyles.container,
        {
          backgroundColor: bgColor,
        },
      ]}
    >
      <Text style={[styles.initials, sizeStyles.text]}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.rounded,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },
  initials: {
    color: theme.colors.textOnDark,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default UserAvatar;