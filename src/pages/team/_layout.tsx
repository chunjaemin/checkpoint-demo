import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import AntDesign from '@expo/vector-icons/AntDesign';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Stack, Slot } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',   // ✅ 선택된 탭 텍스트 색상
        tabBarInactiveTintColor: '#8e8e93', // ✅ 선택되지 않은 탭 텍스트 색상
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '달력',
          tabBarIcon: ({ color }) => <AntDesign name="calendar" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="salary"
        options={{
          title: '급여',
          tabBarIcon: ({ color }) => (
            <SimpleLineIcons name="graph" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="board"
        options={{
          title: '팀 게시판',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="bulletin-board" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
