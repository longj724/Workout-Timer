import { View, Text } from 'react-native';

export default function MyWorkouts() {
  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-foreground text-lg">My Workouts</Text>
      {/* You can add a list of workouts or any other content here */}
    </View>
  );
}
