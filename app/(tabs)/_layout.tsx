// External Dependencies
import { useState } from 'react';
import { Tabs } from 'expo-router';
import {
  CalendarDays,
  Dumbbell,
  Save,
  Settings,
  Timer,
} from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';

// Internal Dependencies
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { useStorageQuery } from '~/hooks/useStorage';
import { useCreateWorkout } from '~/hooks/useCreateWorkout';
import { Interval } from '~/lib/types';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const { data: intervals } = useStorageQuery('intervals', []);
  const { mutate: createWorkout } = useCreateWorkout();
  const { user } = useUser();
  const [workoutName, setWorkoutName] = useState('');
  const isDarkColorScheme = useColorScheme() === 'dark';

  const saveWorkout = () => {
    if (!intervals || intervals.length === 0) {
      alert('No intervals to save');
      return;
    }

    if (!workoutName) {
      alert('Please enter a name for your workout!');
      return;
    }

    createWorkout({
      name: workoutName,
      intervals: intervals as Interval[],
      userId: user?.id as string,
    });
  };

  const onNameChange = (text: string) => {
    setWorkoutName(text);
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF7F50',
        tabBarInactiveTintColor: isDarkColorScheme ? '#9ca3af' : '#71717a',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Quick Start',
          tabBarIcon: ({ color }) => <Timer size={24} color={color} />,
          headerRight: () =>
            user && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-transparent">
                    <Save
                      size={24}
                      color={isDarkColorScheme ? '#9ca3af' : '#71717a'}
                    />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-72">
                  <DialogHeader>
                    <DialogTitle>Save Workout</DialogTitle>
                    <DialogDescription>
                      Give Your Workout a Name
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    placeholder="Workout Name"
                    onChangeText={onNameChange}
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button onPress={saveWorkout}>
                        <Text>Save</Text>
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ),
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
