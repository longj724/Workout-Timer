// External Dependencies
import { View, Text, Pressable } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

// Internal Dependencies
import { IntervalItem } from '~/components/ui/IntervalItem';
import { Interval } from '~/lib/types';

export default function Home() {
  const router = useRouter();
  const [intervals, setIntervals] = useState<Interval[]>([
    {
      id: '1',
      name: 'Warm Up',
      timers: [{ minutes: 0, seconds: 2, order: 0 }],
      repetitions: 1,
      order: 0,
    },
    {
      id: '2',
      order: 1,
      name: 'High Intensity',
      timers: [
        { minutes: 0, seconds: 5, order: 0 },
        { minutes: 0, seconds: 2, order: 1 },
      ],
      repetitions: 1,
    },
    {
      id: '3',
      order: 2,
      name: 'Rest',
      timers: [{ minutes: 0, seconds: 5, order: 0 }],
      repetitions: 1,
    },
  ]);

  const openNewIntervalModal = () => {
    router.push('/(modals)/AddInterval');
  };

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-foreground text-2xl font-bold mb-4">Workout</Text>

      {intervals.map((interval) => (
        <IntervalItem
          key={interval.id}
          {...interval}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      ))}

      <Pressable
        className="border-2 border-dashed border-foreground/30 rounded-lg p-4 mb-4 flex-row items-center justify-center"
        onPress={openNewIntervalModal}
      >
        <Text className="text-foreground/50 text-xl mr-2">+</Text>
        <Text className="text-foreground/50 text-xl">New Interval</Text>
      </Pressable>

      <Pressable
        className="bg-primary rounded-lg p-4 mt-auto"
        onPress={() =>
          router.push({
            pathname: '/PlayWorkout',
            params: { intervalInfo: JSON.stringify(intervals) },
          })
        }
      >
        <View className="flex-row items-center justify-center">
          <Text className="text-primary-foreground text-xl mr-2">▶</Text>
          <Text className="text-primary-foreground text-xl font-semibold">
            Start
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
