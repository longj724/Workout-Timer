import { View, Text } from 'react-native';
import { ThemeToggle } from '~/components/ThemeToggle';
import { Card } from '~/components/ui/card';
import { Switch } from '~/components/ui/switch';
import { ChevronRight } from 'lucide-react-native';

export default function Settings() {
  return (
    <View className="flex-1 bg-background p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-foreground text-lg">Dark Mode</Text>
        <ThemeToggle />
      </View>
    </View>
  );
}
