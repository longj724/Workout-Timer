// External Dependencies
import { View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

// Internal Dependencies
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { useCreateWorkout } from '~/hooks/useCreateWorkout';

const WorkoutComplete = () => {
  const { stats, workout } = useLocalSearchParams<{
    stats: string;
    workout: string;
  }>();
  const workoutStats = JSON.parse(stats || '{}');
  const workoutData = JSON.parse(workout || '{}');
  const createWorkoutMutation = useCreateWorkout();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSaveWorkout = () => {
    createWorkoutMutation.mutate({
      name: `${
        workoutData.name || 'Workout'
      } - ${new Date().toLocaleDateString()}`,
      intervals: workoutData.intervals,
      userId: '1',
    });
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
      }}
    >
      <View style={{ alignItems: 'center', gap: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
          Workout Complete! 🎉
        </Text>

        <View style={{ gap: 8, marginTop: 20 }}>
          <Text>Total Time: {formatTime(workoutStats.totalTime)}</Text>
          <Text>Intervals Completed: {workoutStats.totalIntervals}</Text>
          <Text>Total Repetitions: {workoutStats.totalRepetitions}</Text>
        </View>
      </View>

      <View style={{ gap: 12, marginTop: 20 }}>
        <Button
          onPress={handleSaveWorkout}
          disabled={createWorkoutMutation.isPending}
        >
          <Text>
            {createWorkoutMutation.isPending ? 'Saving...' : 'Save Workout'}
          </Text>
        </Button>

        <Button onPress={() => router.push('/')}>
          <Text>Back to Home</Text>
        </Button>
      </View>
    </View>
  );
};

export default WorkoutComplete;
