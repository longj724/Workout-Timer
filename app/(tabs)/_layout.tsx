// External Dependencies
import { Tabs } from 'expo-router';
import { CalendarDays, Dumbbell, Settings, Timer } from 'lucide-react-native';

// Internal Dependencies

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
          tabBarIcon: ({ color }) => <CalendarDays size={24} color={color} />,
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
