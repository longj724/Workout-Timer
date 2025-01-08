// External Dependencies
import { ActivityIndicator, Dimensions, ScrollView, View } from 'react-native';
import React, { useState } from 'react';
import { useOAuth } from '@clerk/clerk-expo';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { BarChart } from 'react-native-chart-kit';

// Internal Dependencies
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { useUser } from '@clerk/clerk-expo';
import { useGetCompletedWorkouts } from '~/hooks/useGetCompletedWorkouts';
import { Ionicons } from '@expo/vector-icons';

const calculateTotalMinutes = (
  hours: number | null,
  minutes: number | null,
  seconds: number | null
) => {
  return (hours || 0) * 60 + (minutes || 0) + Math.round((seconds || 0) / 60);
};

const History = () => {
  const { user } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const { data: completedWorkouts, isLoading } = useGetCompletedWorkouts({
    userId: user?.id || '',
    startDate: weekStart,
    endDate: weekEnd,
  });

  const navigateWeek = (direction: 'next' | 'prev') => {
    setCurrentDate((current) =>
      direction === 'next' ? addWeeks(current, 1) : subWeeks(current, 1)
    );
  };

  const { startOAuthFlow: startGoogleFlow } = useOAuth({
    strategy: 'oauth_google',
  });
  const { startOAuthFlow: startAppleFlow } = useOAuth({
    strategy: 'oauth_apple',
  });

  const onSignInWithGoogle = async () => {
    try {
      const { createdSessionId, setActive } = await startGoogleFlow();
      if (createdSessionId && setActive) {
        setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  };

  const onSignInWithApple = async () => {
    try {
      const { createdSessionId, setActive } = await startAppleFlow();
      if (createdSessionId && setActive) {
        setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  };

  const prepareChartData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyTotals = new Array(7).fill(0);

    completedWorkouts?.forEach((workout) => {
      const date = new Date(workout.dateCompleted);
      const dayIndex = (date.getDay() + 6) % 7; // Adjusting to make Monday index 0
      const totalMinutes = calculateTotalMinutes(
        workout.duration_hours,
        workout.duration_minutes,
        workout.duration_seconds
      );
      dailyTotals[dayIndex] += totalMinutes;
    });

    return {
      labels: days,
      datasets: [
        {
          data: dailyTotals,
        },
      ],
    };
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 0,
  };

  if (!user) {
    return (
      <View className="flex-1 bg-background p-4 items-center justify-center">
        <Text className="text-2xl font-bold text-center mb-4">
          Track Your Fitness Journey
        </Text>
        <Text className="text-muted-foreground text-center mb-6">
          Sign in to view your workout history and track your progress
        </Text>
        <View className="flex-col gap-4 w-full max-w-xs">
          <Button
            variant="default"
            onPress={onSignInWithGoogle}
            className="flex-row items-center justify-center gap-2"
          >
            <Text>Continue with Google</Text>
          </Button>
          <Button
            variant="default"
            onPress={onSignInWithApple}
            className="flex-row items-center justify-center gap-2"
          >
            <Text>Continue with Apple</Text>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold mb-4">My Workouts</Text>

      <View className="flex-row items-center justify-between mb-4 w-full">
        <Button variant="outline" onPress={() => navigateWeek('prev')}>
          <Ionicons name="arrow-back" size={16} />
        </Button>

        <Text className="text-lg">
          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </Text>

        <Button variant="outline" onPress={() => navigateWeek('next')}>
          <Ionicons name="arrow-forward" size={16} />
        </Button>
      </View>

      {/* Workouts List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="gray" />
        </View>
      ) : completedWorkouts?.length ? (
        <ScrollView>
          <View className="mb-6">
            <BarChart
              data={prepareChartData()}
              width={Dimensions.get('window').width - 32}
              height={220}
              yAxisLabel=""
              yAxisSuffix="m"
              chartConfig={chartConfig}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>

          {completedWorkouts.map((workout) => (
            <View
              key={workout.id}
              className="bg-card p-4 rounded-lg mb-3 border border-border"
            >
              <Text className="text-muted-foreground">
                {format(
                  new Date(workout.dateCompleted),
                  'MMM d, yyyy - h:mm a'
                )}
              </Text>
              <Text className="mt-2">
                Duration:{' '}
                {workout.duration_hours ? `${workout.duration_hours}h ` : ''}
                {workout.duration_minutes}m {workout.duration_seconds}s
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">
            No workouts completed this week
          </Text>
        </View>
      )}
    </View>
  );
};

export default History;
