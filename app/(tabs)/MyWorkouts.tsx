import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { useGetWorkouts } from '~/hooks/useGetWorkouts';

export default function MyWorkouts() {
  const { data: workouts, isLoading, error } = useGetWorkouts();

  if (isLoading) {
    return (
      <View>
        <Text>Loading workouts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <Text>Error loading workouts</Text>
      </View>
    );
  }

  return (
    <View>
      {workouts?.map((workout) => (
        <View key={workout.id}>
          <Text>{workout.name}</Text>
          {workout.description && <Text>{workout.description}</Text>}
        </View>
      ))}
    </View>
  );
}
