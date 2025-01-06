// External Dependencies
import { View, Pressable } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Internal Dependencies
import { Text } from '~/components/ui/text';
import { BottomSheet } from '~/components/ui/bottom-sheet';
import { WorkoutWithRelations } from '~/lib/types';
import { useDeleteWorkout } from '~/hooks/useDeleteWorkout';

interface WorkoutItemProps {
  workout: WorkoutWithRelations;
}

export function WorkoutItem({ workout }: WorkoutItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const deleteWorkout = useDeleteWorkout();

  const { intervals } = workout;

  const handleDeleteWorkout = async () => {
    try {
      await deleteWorkout.mutateAsync(workout.id);
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  const calculateTotalTime = () => {
    if (!intervals) return '0m 0s';

    let totalSeconds = intervals.reduce((acc, { timers, repetitions }) => {
      const intervalSeconds = timers.reduce(
        (timerAcc, { minutes, seconds }) => timerAcc + minutes * 60 + seconds,
        0
      );
      return acc + intervalSeconds * repetitions;
    }, 0);

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}m ${seconds}s`;
  };

  const renderIntervals = () => {
    return intervals.map(({ name, repetitions, timers, order, id }) => (
      <View
        className="flex-row justify-between items-center"
        key={`${name}-${repetitions}-${timers.length}`}
      >
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
          onPress={() =>
            router.push({
              pathname: '/(modals)/EditInterval',
              params: {
                id,
                initialName: name,
                initialTimers: JSON.stringify(timers),
                initialRepetitions: repetitions.toString(),
                editingSavedInterval: JSON.stringify(true),
                order,
              },
            })
          }
          className="w-10 h-10 items-center justify-center"
        >
          <Ionicons name="pencil" size={18} color="#666" />
        </Pressable>
      </View>
    ));
  };

  return (
    <>
      <View className="bg-card rounded-lg px-4 pt-4 mb-4 shadow-md shadow-foreground/10">
        <View className="flex-row justify-between items-center">
          <View className="flex-col flex-1">
            <Text className="text-lg font-semibold">{workout.name}</Text>
            <View className="flex-row mt-2 gap-4">
              <Text className="text-muted-foreground">
                Total Time: {calculateTotalTime()}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => setIsMenuOpen(true)}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="#666" />
          </Pressable>
        </View>

        <Pressable
          onPress={() => setIsExpanded(!isExpanded)}
          className="flex-row items-center justify-center mt-2 border-t border-muted py-2"
        >
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#666"
          />
        </Pressable>

        {isExpanded && (
          <View className="mt-2 flex-col gap-2 pb-2">{renderIntervals()}</View>
        )}
      </View>

      <BottomSheet isVisible={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
        <View className="p-4 pb-8">
          <Pressable
            onPress={() => {
              setIsMenuOpen(false);
              router.push({
                pathname: '/PlayWorkout',
                params: { intervalInfo: JSON.stringify(intervals) },
              });
            }}
            className="flex-row items-center py-4 border-b border-muted"
          >
            <Ionicons name="play" size={24} color="#666" className="mr-3" />
            <Text className="text-foreground text-lg">Start Workout</Text>
          </Pressable>

          <Pressable
            onPress={handleDeleteWorkout}
            className="flex-row items-center py-4"
          >
            <Ionicons name="trash" size={24} color="#dc2626" className="mr-3" />
            <Text className="text-red-600 text-lg">Delete Workout</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </>
  );
}
