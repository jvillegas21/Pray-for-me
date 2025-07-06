import React from 'react';
import {View, StyleSheet, Image, Dimensions} from 'react-native';
import {Text, Button} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../navigation/AuthNavigator';
import {colors, spacing, fontSize, fontWeight} from '../../utils/theme';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

const {width} = Dimensions.get('window');

const WelcomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Prayer Connect</Text>
          <Text style={styles.subtitle}>
            Join a community of faith where prayers are shared, supported, and answered together
          </Text>
        </View>

        <View style={styles.imageContainer}>
          <Text style={styles.imageText}>🙏</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Login')}
            style={styles.button}
            labelStyle={styles.buttonLabel}>
            Sign In
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('SignUp')}
            style={[styles.button, styles.outlinedButton]}
            labelStyle={styles.outlinedButtonLabel}>
            Create Account
          </Button>
        </View>

        <Text style={styles.verse}>
          "Where two or three gather in my name, there am I with them" - Matthew 18:20
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  imageText: {
    fontSize: 120,
    marginBottom: spacing.lg,
  },
  buttonContainer: {
    marginBottom: spacing.xl,
  },
  button: {
    marginVertical: spacing.sm,
    paddingVertical: spacing.xs,
  },
  buttonLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  outlinedButton: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  outlinedButtonLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  verse: {
    fontSize: fontSize.sm,
    color: colors.gray[500],
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default WelcomeScreen;