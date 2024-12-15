import { View, Text, Pressable } from 'react-native';

interface IntervalItemProps {
  id: string;
  title: string;
  duration: string;
  repetitions: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function IntervalItem({
  title,
  duration,
  repetitions,
  onIncrement,
  onDecrement,
}: IntervalItemProps) {
  return (
    <View className="bg-card rounded-lg p-4 mb-4 shadow-md shadow-foreground/10">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-foreground text-xl font-semibold">{title}</Text>
          <Text className="text-foreground/60">{duration}</Text>
        </View>

        <View className="flex-row items-center">
          <Pressable
            onPress={onDecrement}
            className="bg-muted w-8 h-8 rounded-full items-center justify-center"
          >
            <Text className="text-foreground text-lg">-</Text>
          </Pressable>

          <Text className="text-foreground text-lg mx-4">{repetitions}</Text>

          <Pressable
            onPress={onIncrement}
            className="bg-muted w-8 h-8 rounded-full items-center justify-center"
          >
            <Text className="text-foreground text-lg">+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
