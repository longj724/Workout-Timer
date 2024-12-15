// External Dependencies
import { View, Text, Pressable } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

// Internal Dependencies
import { IntervalItem } from '~/components/ui/IntervalItem';
import { NewIntervalDialog } from '~/components/ui/NewIntervalDialog';

interface Interval {
  id: string;
  title: string;
  duration: string;
  repetitions: number;
}

export default function Home() {
  const router = useRouter();
  const [intervals, setIntervals] = useState<Interval[]>([
    { id: '1', title: 'Warm Up', duration: '5:00', repetitions: 1 },
    { id: '2', title: 'High Intensity', duration: '0:30', repetitions: 8 },
    { id: '3', title: 'Rest', duration: '0:15', repetitions: 8 },
    { id: '4', title: 'Cool Down', duration: '5:00', repetitions: 1 },
  ]);

  const openNewIntervalModal = () => {
    router.push('/(modals)/AddInterval');
  };

  const handleRepetitionChange = (id: string, change: number) => {
    setIntervals(
      intervals.map((interval) => {
        if (interval.id === id) {
          return {
            ...interval,
            repetitions: Math.max(1, interval.repetitions + change),
          };
        }
        return interval;
      })
    );
  };

  const handleAddInterval = ({
    title,
    duration,
  }: {
    title: string;
    duration: string;
  }) => {
    const newInterval = {
      id: (intervals.length + 1).toString(),
      title,
      duration,
      repetitions: 1,
    };
    setIntervals([...intervals, newInterval]);
  };

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-foreground text-4xl font-bold mb-8">
        Workout Timer
      </Text>

      {intervals.map((interval) => (
        <IntervalItem
          key={interval.id}
          {...interval}
          onIncrement={() => handleRepetitionChange(interval.id, 1)}
          onDecrement={() => handleRepetitionChange(interval.id, -1)}
        />
      ))}

      <Pressable
        className="border-2 border-dashed border-foreground/30 rounded-lg p-4 mb-4 flex-row items-center justify-center"
        onPress={openNewIntervalModal}
      >
        <Text className="text-foreground/50 text-xl mr-2">+</Text>
        <Text className="text-foreground/50 text-xl">New Interval</Text>
      </Pressable>

      <Pressable className="bg-primary rounded-lg p-4 mt-auto">
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
