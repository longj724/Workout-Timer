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
  const deleteWorkout = useDeleteWorkout();

  const totalIntervals = workout.intervals.length;
  const totalTimers = workout.intervals.reduce(
    (acc, interval) => acc + interval.timers.length,
    0
  );

  const handleDeleteWorkout = async () => {
    try {
      await deleteWorkout.mutateAsync(workout.id);
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  return (
    <>
      <View className="bg-card rounded-lg p-4 mb-4 shadow-md shadow-foreground/10">
        <View className="flex-row justify-between items-center">
          <View className="flex-col flex-1">
            <Text className="text-lg font-semibold">{workout.name}</Text>
            <View className="flex-row mt-2 gap-4">
              <Text className="text-muted-foreground">
                {totalIntervals}{' '}
                {totalIntervals === 1 ? 'interval' : 'intervals'}
              </Text>
              <Text className="text-muted-foreground">
                {totalTimers} {totalTimers === 1 ? 'timer' : 'timers'}
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
      </View>

      <BottomSheet isVisible={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
        <View className="p-4 pb-8">
          <Pressable
            onPress={() => {
              setIsMenuOpen(false);
              // router.push({
              //   pathname: '/WorkoutDetail',
              //   params: { id: workout.id },
              // });
            }}
            className="flex-row items-center py-4 border-b border-muted"
          >
            <Ionicons name="play" size={24} color="#666" className="mr-3" />
            <Text className="text-foreground text-lg">Start Workout</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setIsMenuOpen(false);
              // router.push({
              //   pathname: '/(modals)/EditWorkout',
              //   params: { id: workout.id },
              // });
            }}
            className="flex-row items-center py-4 border-b border-muted"
          >
            <Ionicons name="pencil" size={24} color="#666" className="mr-3" />
            <Text className="text-foreground text-lg">Edit Workout</Text>
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
