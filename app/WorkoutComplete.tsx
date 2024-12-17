import { View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';

const WorkoutComplete = () => {
  const { stats } = useLocalSearchParams<{ stats: string }>();
  const workoutStats = JSON.parse(stats || '{}');

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

      <Button onPress={() => router.push('/')} style={{ marginTop: 20 }}>
        <Text>Back to Home</Text>
      </Button>
    </View>
  );
};

export default WorkoutComplete;
