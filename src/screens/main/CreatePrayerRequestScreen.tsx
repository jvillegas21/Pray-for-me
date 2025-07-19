import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  Text,
  Switch,
  TouchableOpacity,
  Platform,
  TextStyle,
  Alert,
} from 'react-native';
import { Button } from 'react-native-paper';
import { theme, spacing, borderRadius } from '@/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NavigationProps } from '@/types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { aiService, PrayerAnalysisRequest } from '@/services/aiService';

const CATEGORIES = [
  'Health',
  'Family',
  'Gratitude',
  'Grief',
  'Addiction',
  'Work',
  'Relationships',
  'Spiritual',
  'Financial',
  'Guidance',
  'Other',
];

function CustomCheckbox({
  checked,
  onPress,
  color,
}: {
  checked: boolean;
  onPress: () => void;
  color: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ marginRight: spacing.sm }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <Icon
        name={checked ? 'check-box' : 'check-box-outline-blank'}
        size={24}
        color={color}
      />
    </TouchableOpacity>
  );
}

export default function CreatePrayerRequestScreen() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<NavigationProps, 'CreatePrayerRequest'>
    >();
  const [prayerText, setPrayerText] = useState('');
  const [category, setCategory] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [firstNameOnly, setFirstNameOnly] = useState(false);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [shareFacebook, setShareFacebook] = useState(false);
  const [shareX, setShareX] = useState(false);
  const [shareInstagram, setShareInstagram] = useState(false);
  const [bibleStudy, setBibleStudy] = useState(false);
  const [resourceRec, setResourceRec] = useState(false);

  // TODO: Implement geolocation autofill

  const handleSubmit = async () => {
    if (!prayerText.trim()) {
      Alert.alert('Error', 'Please enter your prayer request');
      return;
    }

    try {
      const prayerData = {
        prayerText: prayerText.trim(),
        category: category || 'Other',
        isAnonymous: anonymous,
        location: { city, state, country },
        wantsBibleStudy: bibleStudy,
        wantsResources: resourceRec,
      };
      navigation.navigate('PrayerRequestTransition', { prayerData });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit prayer request');
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={['top', 'left', 'right']}
    >
      <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
        <Text
          style={[
            theme.fonts.displayMedium as TextStyle,
            { color: theme.colors.primary, marginBottom: spacing.lg },
          ]}
        >
          Submit a Prayer Request
        </Text>
        <Text
          style={[
            theme.fonts.bodyLarge as TextStyle,
            { color: theme.colors.text, marginBottom: spacing.md },
          ]}
        >
          What would you like others to pray for?
        </Text>
        <TextInput
          style={{
            minHeight: 100,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: borderRadius.md,
            padding: spacing.md,
            color: theme.colors.text,
            marginBottom: spacing.lg,
          }}
          multiline
          placeholder="Type your prayer here..."
          placeholderTextColor={theme.colors.textTertiary}
          value={prayerText}
          onChangeText={setPrayerText}
          accessibilityLabel="Prayer request text area"
        />
        <Text
          style={[
            theme.fonts.bodyLarge as TextStyle,
            { color: theme.colors.text, marginBottom: spacing.sm },
          ]}
        >
          Category
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: spacing.lg }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={{
                backgroundColor:
                  category === cat
                    ? theme.colors.primary
                    : theme.colors.surfaceVariant,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.lg,
                borderRadius: borderRadius.lg,
                marginRight: spacing.sm,
                borderWidth: category === cat ? 2 : 0,
                borderColor: theme.colors.primaryDark,
              }}
              onPress={() => setCategory(cat)}
              accessibilityRole="button"
              accessibilityLabel={`Select category ${cat}`}
            >
              <Text
                style={{
                  color:
                    category === cat
                      ? theme.colors.textOnDark
                      : theme.colors.text,
                }}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text
          style={[
            theme.fonts.bodyLarge as TextStyle,
            { color: theme.colors.text, marginBottom: spacing.sm },
          ]}
        >
          Identity Preference
        </Text>
        <View style={{ marginBottom: spacing.lg }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: spacing.sm,
            }}
          >
            <CustomCheckbox
              checked={anonymous}
              onPress={() => {
                setAnonymous(!anonymous);
                if (!anonymous) {
                  setFirstNameOnly(false);
                }
              }}
              color={theme.colors.primary}
            />
            <Text
              style={[
                theme.fonts.bodyMedium as TextStyle,
                { color: theme.colors.text },
              ]}
            >
              Submit as Anonymous
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CustomCheckbox
              checked={firstNameOnly}
              onPress={() => {
                setFirstNameOnly(!firstNameOnly);
                if (!firstNameOnly) {
                  setAnonymous(false);
                }
              }}
              color={theme.colors.primary}
            />
            <Text
              style={[
                theme.fonts.bodyMedium as TextStyle,
                { color: theme.colors.text },
              ]}
            >
              Append my first name only
            </Text>
          </View>
        </View>
        <Text
          style={[
            theme.fonts.bodyLarge as TextStyle,
            { color: theme.colors.text, marginBottom: spacing.sm },
          ]}
        >
          Location
        </Text>
        <View style={{ flexDirection: 'row', marginBottom: spacing.lg }}>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: theme.colors.surfaceVariant,
              borderRadius: borderRadius.sm,
              padding: spacing.sm,
              color: theme.colors.text,
              marginRight: spacing.sm,
            }}
            placeholder="City"
            placeholderTextColor={theme.colors.textTertiary}
            value={city}
            onChangeText={setCity}
          />
          <TextInput
            style={{
              flex: 1,
              backgroundColor: theme.colors.surfaceVariant,
              borderRadius: borderRadius.sm,
              padding: spacing.sm,
              color: theme.colors.text,
              marginRight: spacing.sm,
            }}
            placeholder="State"
            placeholderTextColor={theme.colors.textTertiary}
            value={state}
            onChangeText={setState}
          />
          <TextInput
            style={{
              flex: 1,
              backgroundColor: theme.colors.surfaceVariant,
              borderRadius: borderRadius.sm,
              padding: spacing.sm,
              color: theme.colors.text,
            }}
            placeholder="Country"
            placeholderTextColor={theme.colors.textTertiary}
            value={country}
            onChangeText={setCountry}
          />
        </View>
        <Text
          style={[
            theme.fonts.bodyLarge as TextStyle,
            { color: theme.colors.text, marginBottom: spacing.sm },
          ]}
        >
          Share on Social Media
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.lg,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: spacing.lg,
            }}
          >
            <Switch
              value={shareFacebook}
              onValueChange={setShareFacebook}
              thumbColor={
                shareFacebook ? theme.colors.primary : theme.colors.disabled
              }
            />
            <Text
              style={[
                theme.fonts.bodyMedium as TextStyle,
                { color: theme.colors.text, marginLeft: spacing.sm },
              ]}
            >
              Facebook
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: spacing.lg,
            }}
          >
            <Switch
              value={shareX}
              onValueChange={setShareX}
              thumbColor={shareX ? theme.colors.primary : theme.colors.disabled}
            />
            <Text
              style={[
                theme.fonts.bodyMedium as TextStyle,
                { color: theme.colors.text, marginLeft: spacing.sm },
              ]}
            >
              X
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Switch
              value={shareInstagram}
              onValueChange={setShareInstagram}
              thumbColor={
                shareInstagram ? theme.colors.primary : theme.colors.disabled
              }
            />
            <Text
              style={[
                theme.fonts.bodyMedium as TextStyle,
                { color: theme.colors.text, marginLeft: spacing.sm },
              ]}
            >
              Instagram
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.lg,
          }}
        >
          <CustomCheckbox
            checked={bibleStudy}
            onPress={() => setBibleStudy(!bibleStudy)}
            color={theme.colors.secondary}
          />
          <Text
            style={[
              theme.fonts.bodyMedium as TextStyle,
              { color: theme.colors.text, marginRight: spacing.xl },
            ]}
          >
            I would like a Bible Study related to my prayer
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.xxl,
          }}
        >
          <CustomCheckbox
            checked={resourceRec}
            onPress={() => setResourceRec(!resourceRec)}
            color={theme.colors.accent}
          />
          <Text
            style={[
              theme.fonts.bodyMedium as TextStyle,
              { color: theme.colors.text },
            ]}
          >
            I want recommended resources for support
          </Text>
        </View>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: borderRadius.lg,
            paddingVertical: spacing.md,
          }}
          labelStyle={{
            fontFamily: theme.fonts.bodyLarge.fontFamily,
            fontWeight: '600',
            fontSize: theme.fonts.bodyLarge.fontSize,
            lineHeight: theme.fonts.bodyLarge.lineHeight,
            color: theme.colors.textOnDark,
          }}
          accessibilityLabel="Submit prayer request"
        >
          Submit Prayer Request
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
