import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/shared/lib/hooks/useColorScheme';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';

export default function TeamTabsLayoutRoute() {
  useColorScheme();

  return (
    <Tabs
      initialRouteName="calendar"
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8e8e93',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="calendar"
        options={{
          title: '달력',
          tabBarIcon: ({ color }) => <AntDesign name="calendar" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="salary"
        options={{
          title: '급여',
          tabBarIcon: ({ color }) => <SimpleLineIcons name="graph" size={24} color={color} />,
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
