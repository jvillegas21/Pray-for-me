import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { Button, Title, Paragraph } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, spacing } from '@/theme';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  navigation: any;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={require('@/assets/images/welcome-illustration.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.textContainer}>
          <Title style={styles.title}>Welcome to Pray For Me</Title>
          <Paragraph style={styles.subtitle}>
            Connect with your faith community and find spiritual support when you need it most.
          </Paragraph>
          
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Title style={styles.featureTitle}>🙏 Share Prayer Requests</Title>
              <Paragraph style={styles.featureText}>
                Request prayers from your local community with complete privacy control.
              </Paragraph>
            </View>
            
            <View style={styles.feature}>
              <Title style={styles.featureTitle}>🤝 Support Others</Title>
              <Paragraph style={styles.featureText}>
                Offer spiritual support and prayers to community members in need.
              </Paragraph>
            </View>
            
            <View style={styles.feature}>
              <Title style={styles.featureTitle}>📍 Find Local Communities</Title>
              <Paragraph style={styles.featureText}>
                Discover and join faith communities near you for deeper connections.
              </Paragraph>
            </View>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Register')}
            style={[styles.button, styles.primaryButton]}
            contentStyle={styles.buttonContent}
          >
            Get Started
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Login')}
            style={[styles.button, styles.secondaryButton]}
            contentStyle={styles.buttonContent}
          >
            I Already Have an Account
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  imageContainer: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  illustration: {
    width: width * 0.6,
    height: height * 0.2,
  },
  textContainer: {
    flex: 0.5,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: theme.colors.primary,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.text,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  featuresContainer: {
    marginTop: spacing.lg,
  },
  feature: {
    marginBottom: spacing.lg,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: spacing.sm,
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  buttonContainer: {
    flex: 0.2,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl,
  },
  button: {
    marginBottom: spacing.md,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    borderColor: theme.colors.primary,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
});

export default WelcomeScreen;