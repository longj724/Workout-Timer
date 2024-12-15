// External Dependencies
import { Tabs } from 'expo-router';
import {
  CalendarDays,
  Dumbbell,
  Plus,
  Settings,
  Timer,
} from 'lucide-react-native';
import MyWorkouts from './MyWorkouts'; // Ensure this path is correct

import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Quick Start',
          tabBarIcon: ({ color }) => <Timer size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="MyWorkouts"
        options={{
          title: 'My Workouts',
          tabBarIcon: ({ color }) => <Dumbbell size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="History"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <CalendarDays size={24} color={color} />, // You can change the icon as needed
        }}
      />
      <Tabs.Screen
        name="Settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
