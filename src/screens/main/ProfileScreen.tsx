import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { theme, spacing } from '@/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Dialog, Portal, Paragraph } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { RootState, AppDispatch } from '@/store';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen: React.FC = () => {
  const [showDialog, setShowDialog] = React.useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { loading } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    setShowDialog(false);
    try {
      await dispatch(logout()).unwrap();
      navigation.navigate('Login' as never);
    } catch (error) {
      // Optionally show error
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Your prayer profile and settings</Text>
        <View style={{ flex: 1 }} />
        <Button
          mode="contained"
          onPress={() => setShowDialog(true)}
          style={styles.logoutButton}
          loading={loading}
          disabled={loading}
        >
          Logout
        </Button>
        <Portal>
          <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
            <Dialog.Title>Confirm Logout</Dialog.Title>
            <Dialog.Content>
              <Paragraph>Are you sure you want to log out?</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowDialog(false)}>Cancel</Button>
              <Button
                onPress={handleLogout}
                loading={loading}
                disabled={loading}
              >
                Logout
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    alignSelf: 'stretch',
  },
});

export default ProfileScreen;
