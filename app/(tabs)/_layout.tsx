import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { BookOpen, ClipboardList, UserCircle, Home } from 'lucide-react-native';
import { useI18n } from '@/contexts/I18nContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#facc15',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 70 + insets.bottom : 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: t('nav.notes'),
          tabBarIcon: ({ size, color }) => (
            <BookOpen size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tests"
        options={{
          title: t('nav.exams'),
          tabBarIcon: ({ size, color }) => (
            <ClipboardList size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <UserCircle size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
