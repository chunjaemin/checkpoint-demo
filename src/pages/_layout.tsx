import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/shared/lib/hooks/useColorScheme';

import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import { useCallback } from 'react';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../shared/assets/fonts/SpaceMono-Regular.ttf'),
  });

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        return true; // 👉 true 반환 시 뒤로가기 무시됨
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        // BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [])
  );

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{
            gestureEnabled: false, // ✅ 모든 스크린에서 스와이프 제스처 비활성화
          }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="personal" options={{ headerShown: false }} />
            <Stack.Screen name="team" options={{ headerShown: false }} />
            <Stack.Screen name="handover" options={{ headerShown: false }} />
            <Stack.Screen name="memo" options={{ headerShown: false }} />
            <Stack.Screen
              name="settings"
              options={{
                title: '설정',
                headerStyle: { backgroundColor: colorScheme === 'dark' ? DarkTheme.colors.card : DefaultTheme.colors.card },
                headerTintColor: colorScheme === 'dark' ? DarkTheme.colors.text : DefaultTheme.colors.text
              }} />
            {/* legacy route (redirects to /settings) */}
            <Stack.Screen name="appSettings" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="addWorkPlace" options={{ headerShown: false }} />
            <Stack.Screen name="addTeamSpace" options={{ headerShown: false }} />
            <Stack.Screen name="addTeamSpaceMap" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
