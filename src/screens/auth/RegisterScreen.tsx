import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  TextInput,
  Button,
  Title,
  Paragraph,
  Snackbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '@/store/slices/authSlice';
import { RootState, AppDispatch } from '@/store';
import { theme, spacing } from '@/theme';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setSnackbarMessage('Please fill in all fields');
      return false;
    }

    if (password !== confirmPassword) {
      setSnackbarMessage('Passwords do not match');
      return false;
    }

    if (password.length < 6) {
      setSnackbarMessage('Password must be at least 6 characters');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      setShowSnackbar(true);
      return;
    }

    try {
      await dispatch(register({ name, email, password })).unwrap();
      // Navigation will be handled by AppNavigator based on auth state
    } catch (registerError) {
      const errorMessage = registerError as string;
      if (errorMessage.includes('confirm your account')) {
        setSnackbarMessage(
          'Registration successful! Please check your email and confirm your account before signing in.'
        );
      } else {
        setSnackbarMessage(errorMessage);
      }
      setShowSnackbar(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Title style={styles.title}>Create Account</Title>
              <Paragraph style={styles.subtitle}>
                Join our faith community and start your spiritual journey
              </Paragraph>
            </View>

            <View style={styles.form}>
              <TextInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
                autoCapitalize="words"
                autoComplete="name"
                testID="name-input"
              />

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                testID="email-input"
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry={true}
                autoCapitalize="none"
                autoComplete="new-password"
                testID="password-input"
              />

              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry={true}
                autoCapitalize="none"
                autoComplete="new-password"
                testID="confirm-password-input"
              />

              <Button
                mode="contained"
                onPress={handleRegister}
                style={styles.registerButton}
                contentStyle={styles.buttonContent}
                loading={loading}
                disabled={loading}
              >
                Create Account
              </Button>

              <View style={styles.footer}>
                <Paragraph style={styles.footerText}>
                  Already have an account?{' '}
                  <Paragraph
                    style={styles.linkText}
                    onPress={() => navigation.navigate('Login')}
                  >
                    Sign In
                  </Paragraph>
                </Paragraph>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setShowSnackbar(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: spacing.md,
  },
  registerButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  linkText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
