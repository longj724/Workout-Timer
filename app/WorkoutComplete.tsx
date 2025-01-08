// External Dependencies
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Timer, BarChart, PartyPopper } from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';

// Internal Dependencies
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardFooter } from '~/components/ui/card';
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
      <View className="flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 px-6">
            <View>
              <View className="flex flex-row items-center justify-center gap-2 text-3xl font-bold">
                <Text>Workout Complete!</Text>
                <PartyPopper className="w-8 h-8 text-primary animate-bounce" />
              </View>

              <View className="grid gap-6 py-6">
                <View className="flex flex-row items-center justify-center gap-4 p-4 rounded-lg bg-muted">
                  <Timer className="w-6 h-6 text-primary" />
                  <Text>Total Time</Text>
                  <Text className="text-2xl font-semibold">
                    {formatTime(workoutStats.totalTime)}
                  </Text>
                </View>

                <View className="flex flex-row items-center justify-center gap-4 p-4 rounded-lg bg-muted">
                  <BarChart className="w-6 h-6 text-primary" />
                  <Text>Intervals Completed</Text>
                  <Text className="text-2xl font-semibold">
                    {workoutStats.totalIntervals}
                  </Text>
                </View>
              </View>
            </View>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 p-6">
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onPress={handleFinishWorkout}
            >
              <Text>Done</Text>
            </Button>
          </CardFooter>
        </Card>
      </View>
    </>
  );
};

export default WorkoutComplete;
