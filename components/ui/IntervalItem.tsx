// External Dependencies
import { View, Text, Pressable } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Internal Dependencies
import { BottomSheet } from '~/components/ui/bottom-sheet';
import { Interval, Timer } from '~/lib/types';
import { useStorageMutation, useStorageQuery } from '~/hooks/useStorage';

interface IntervalItemProps {
  id: string;
  name?: string;
  timers: Timer[];
  repetitions: number;
  order: number;
}

export function IntervalItem({
  id,
  name,
  timers,
  repetitions,
  order,
}: IntervalItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: intervals } = useStorageQuery<Interval[]>('intervals', []);
  const { mutate: setIntervals } = useStorageMutation<Interval[]>('intervals');

  const handleDeleteInterval = () => {
    if (intervals) {
      const updatedIntervals = intervals.filter(
        (interval) => interval.id !== id
      );
      setIntervals(updatedIntervals);
    }
  };

  return (
    <>
      <View className="bg-card rounded-lg p-4 mb-4 shadow-md shadow-foreground/10">
        <View className="flex-row justify-between items-center">
          <View className="flex-col gap-1">
            <View className="flex-row items-center gap-2">
              {name && (
                <Text className="text-foreground text-lg font-semibold">
                  {name} -
                </Text>
              )}
              <Text className="text-foreground text-lg">x{repetitions}</Text>
            </View>
            {timers.map(({ minutes, seconds }, index) => (
              <Text
                key={`${minutes}:${seconds}:${index}`}
                className="text-foreground/60 text-lg"
              >{`${minutes}:${seconds.toString().padStart(2, '0')}`}</Text>
            ))}
          </View>

          <Pressable
            onPress={() => setIsMenuOpen(true)}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="#666" />
          </Pressable>
        </View>
      </View>

      <BottomSheet isVisible={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
        <View className="p-4 pb-8">
          <Pressable
            onPress={() => {
              setIsMenuOpen(false);
              router.push({
                pathname: '/(modals)/EditInterval',
                params: {
                  id: id,
                  initialName: name,
                  initialTimers: JSON.stringify(timers),
                  initialRepetitions: repetitions,
                  order,
                },
              });
            }}
            className="flex-row items-center py-4 border-b border-muted"
          >
            <Ionicons name="pencil" size={24} color="#666" className="mr-3" />
            <Text className="text-foreground text-lg">Edit Interval</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              handleDeleteInterval();
              setIsMenuOpen(false);
            }}
            className="flex-row items-center py-4"
          >
            <Ionicons name="trash" size={24} color="#dc2626" className="mr-3" />
            <Text className="text-red-600 text-lg">Delete Interval</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </>
  );
}
