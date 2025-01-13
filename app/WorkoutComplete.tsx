// External Dependencies
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Timer, BarChart, PartyPopper, CheckIcon } from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';

// Internal Dependencies
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { useCompleteWorkout } from '~/hooks/useCompleteWorkout';

export type TotalTime = {
  hours: number;
  minutes: number;
  seconds: number;
};

const WorkoutComplete = () => {
  const { user } = useUser();
  const { stats, workoutId } = useLocalSearchParams<{
    stats: string;
    workoutId: string;
  }>();
  const workoutStats = useMemo(() => JSON.parse(stats || '{}'), [stats]);
  const completeWorkoutMutation = useCompleteWorkout();

  const [totalTime, setTotalTime] = useState<TotalTime>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleFinishWorkout = () => {
    if (user) {
      completeWorkoutMutation.mutate({
        workoutId,
        userId: user.id,
        dateCompleted: new Date(),
        duration_hours: totalTime.hours,
        duration_minutes: totalTime.minutes,
        duration_seconds: totalTime.seconds,
      });
    }
    router.push('/');
  };

  useEffect(() => {
    const hours = Math.floor(workoutStats.totalTime / 3600);
    const minutes = Math.floor((workoutStats.totalTime % 3600) / 60);
    const seconds = workoutStats.totalTime % 60;
    setTotalTime({ hours, minutes, seconds });
  }, [workoutStats]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1">
        {/* Top half */}
        <View className="h-1/2 w-full bg-[#FF7F50] dark:bg-gray-700 flex items-center justify-center">
          <View className="items-center justify-center">
            <Text className="text-white text-4xl font-bold mb-4">
              Workout Complete!
            </Text>
            <View className="bg-white p-6 rounded-full">
              <CheckIcon
                className="w-32 h-32 text-white animate-bounce"
                color="#E96F45"
              />
            </View>
          </View>
        </View>

        {/* Bottom half */}
        <View className="flex-1 p-6">
          {/* Stats row */}
          <View className="flex-row justify-between mb-6">
            {/* Time card */}
            <View className="flex-1 mr-2 p-4 rounded-lg bg-muted items-center">
              <Timer className="w-6 h-6 text-primary mb-2" color="#FF7F50" />
              <Text className="text-sm">Total Time</Text>
              <Text className="text-xl font-semibold">
                {formatTime(workoutStats.totalTime)}
              </Text>
            </View>

            {/* Intervals card */}
            <View className="flex-1 ml-2 p-4 rounded-lg bg-muted items-center">
              <BarChart className="w-6 h-6 text-primary mb-2" color="#FF7F50" />
              <Text className="text-sm">Intervals</Text>
              <Text className="text-xl font-semibold">
                {workoutStats.totalIntervals}
              </Text>
            </View>
          </View>

          <Button
            className="w-full bg-[#FF7F50]"
            size="lg"
            onPress={handleFinishWorkout}
          >
            <Text>Done</Text>
          </Button>
        </View>
      </View>
    </>
  );
};

export default WorkoutComplete;
