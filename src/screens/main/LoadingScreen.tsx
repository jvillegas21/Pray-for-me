import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';

export default function LoadingScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={['top', 'left', 'right']}
    >
      {/* The main content of the LoadingScreen was not provided in the original file,
           so this placeholder is left as is. */}
    </SafeAreaView>
  );
}
