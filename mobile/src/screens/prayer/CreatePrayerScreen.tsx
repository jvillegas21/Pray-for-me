import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert} from 'react-native';
import {Text, TextInput, Button, SegmentedButtons, RadioButton, Card} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useForm, Controller} from 'react-hook-form';
import {usePrayer} from '../../context/PrayerContext';
import {useLocation} from '../../context/LocationContext';
import {CreatePrayerData} from '../../types';
import {colors, spacing, fontSize, fontWeight, borderRadius, shadows} from '../../utils/theme';

interface PrayerFormData {
  title: string;
  content: string;
  category: CreatePrayerData['category'];
  visibility: CreatePrayerData['visibility'];
}

const categories = [
  {value: 'healing', label: 'Healing', icon: 'heart-pulse'},
  {value: 'guidance', label: 'Guidance', icon: 'compass'},
  {value: 'thanksgiving', label: 'Thanks', icon: 'hands-pray'},
  {value: 'protection', label: 'Protection', icon: 'shield-check'},
  {value: 'family', label: 'Family', icon: 'account-group'},
  {value: 'financial', label: 'Financial', icon: 'currency-usd'},
  {value: 'spiritual', label: 'Spiritual', icon: 'white-balance-sunny'},
  {value: 'other', label: 'Other', icon: 'dots-horizontal'},
];

const CreatePrayerScreen = () => {
  const navigation = useNavigation();
  const {createPrayer} = usePrayer();
  const {location, getCurrentLocation} = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: {errors},
    watch,
  } = useForm<PrayerFormData>({
    defaultValues: {
      title: '',
      content: '',
      category: 'other',
      visibility: 'public',
    },
  });

  useEffect(() => {
    if (!location) {
      getCurrentLocation();
    }
  }, []);

  const onSubmit = async (data: PrayerFormData) => {
    if (!location) {
      Alert.alert('Location Required', 'Please enable location services to submit a prayer.');
      return;
    }

    try {
      setIsLoading(true);
      await createPrayer({
        ...data,
        location,
      });
      Alert.alert(
        'Prayer Submitted',
        'Your prayer has been shared with the community. We\'ve also provided relevant Bible verses for encouragement.',
        [{text: 'OK', onPress: () => navigation.goBack()}]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit prayer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategory = watch('category');
  const selectedVisibility = watch('visibility');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Share Your Prayer</Text>
            <Text style={styles.subtitle}>
              Let the community join you in prayer and receive encouraging Bible verses
            </Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="title"
              rules={{
                required: 'Please provide a title for your prayer',
                maxLength: {
                  value: 100,
                  message: 'Title must be less than 100 characters',
                },
              }}
              render={({field: {onChange, onBlur, value}}) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Prayer Title"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="What would you like prayer for?"
                    error={!!errors.title}
                    style={styles.input}
                  />
                  {errors.title && (
                    <Text style={styles.errorText}>{errors.title.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="content"
              rules={{
                required: 'Please share your prayer request',
                maxLength: {
                  value: 1000,
                  message: 'Prayer content must be less than 1000 characters',
                },
              }}
              render={({field: {onChange, onBlur, value}}) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Prayer Details"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Share your heart..."
                    multiline
                    numberOfLines={6}
                    error={!!errors.content}
                    style={[styles.input, styles.textArea]}
                  />
                  <Text style={styles.charCount}>
                    {value.length}/1000 characters
                  </Text>
                  {errors.content && (
                    <Text style={styles.errorText}>{errors.content.message}</Text>
                  )}
                </View>
              )}
            />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <Controller
                control={control}
                name="category"
                render={({field: {onChange, value}}) => (
                  <View style={styles.categoryGrid}>
                    {categories.map((cat) => (
                      <Card
                        key={cat.value}
                        style={[
                          styles.categoryCard,
                          value === cat.value && styles.selectedCategory,
                        ]}
                        onPress={() => onChange(cat.value)}>
                        <Card.Content style={styles.categoryContent}>
                          <Text
                            style={[
                              styles.categoryLabel,
                              value === cat.value && styles.selectedCategoryText,
                            ]}>
                            {cat.label}
                          </Text>
                        </Card.Content>
                      </Card>
                    ))}
                  </View>
                )}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Visibility</Text>
              <Controller
                control={control}
                name="visibility"
                render={({field: {onChange, value}}) => (
                  <RadioButton.Group onValueChange={onChange} value={value}>
                    <View style={styles.radioOption}>
                      <RadioButton value="public" />
                      <View style={styles.radioContent}>
                        <Text style={styles.radioLabel}>Public</Text>
                        <Text style={styles.radioDescription}>
                          Anyone can see and pray for this request
                        </Text>
                      </View>
                    </View>
                    <View style={styles.radioOption}>
                      <RadioButton value="local" />
                      <View style={styles.radioContent}>
                        <Text style={styles.radioLabel}>Local Only</Text>
                        <Text style={styles.radioDescription}>
                          Only people nearby can see this prayer
                        </Text>
                      </View>
                    </View>
                    <View style={styles.radioOption}>
                      <RadioButton value="private" />
                      <View style={styles.radioContent}>
                        <Text style={styles.radioLabel}>Private</Text>
                        <Text style={styles.radioDescription}>
                          Only you can see this prayer
                        </Text>
                      </View>
                    </View>
                  </RadioButton.Group>
                )}
              />
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading || !location}
              style={styles.submitButton}
              labelStyle={styles.submitButtonLabel}>
              Submit Prayer
            </Button>

            {!location && (
              <Text style={styles.locationWarning}>
                Location services are required to submit prayers
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.gray[600],
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.white,
  },
  textArea: {
    minHeight: 120,
  },
  charCount: {
    fontSize: fontSize.xs,
    color: colors.gray[500],
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryCard: {
    width: '30%',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray[200],
  },
  selectedCategory: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  categoryContent: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: fontSize.sm,
    color: colors.gray[700],
  },
  selectedCategoryText: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  radioContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  radioLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.gray[900],
  },
  radioDescription: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    marginTop: 2,
  },
  submitButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.xs,
  },
  submitButtonLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  locationWarning: {
    fontSize: fontSize.sm,
    color: colors.warning,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

export default CreatePrayerScreen;