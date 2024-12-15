import { View, Text } from 'react-native';
import React from 'react';

const NewWorkout = () => {
  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-foreground text-lg">My Workouts</Text>
      {/* You can add a list of workouts or any other content here */}
    </View>
  );
};

export default NewWorkout;
