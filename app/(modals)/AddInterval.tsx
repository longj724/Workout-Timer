// External Dependencies
import { ScrollView, View } from 'react-native';
import { useState } from 'react';
import { z } from 'zod';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { TimerPickerModal } from 'react-native-timer-picker';
import { Trash2 } from 'lucide-react-native';
import { PlatformColor } from 'react-native';

// Internal Dependencies
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';

const intervalSchema = z.object({
  name: z.string().optional(),
  timers: z
    .array(
      z.object({
        hours: z.number().optional(),
        minutes: z.number().optional(),
        seconds: z.number().optional(),
      })
    )
    .min(1, 'At least one timer is required'),
  repetitions: z.number().min(1, 'Must have at least 1 repetition'),
});

type IntervalForm = z.infer<typeof intervalSchema>;

type ITimerPicker = {
  hours?: number;
  minutes?: number;
  seconds?: number;
};

const AddInterval = () => {
  const [name, setName] = useState('');
  const [timers, setTimers] = useState<ITimerPicker[]>([
    { minutes: 0, seconds: 0 },
  ]);
  const [repetitions, setRepetitions] = useState('1');
  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number>(0);

  const handleAddTimer = () => {
    setTimers([...timers, { minutes: 0, seconds: 0 }]);
  };

  const handleRemoveTimer = (index: number) => {
    if (timers.length > 1) {
      setTimers(timers.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    try {
      const formData: IntervalForm = {
        name,
        timers,
        repetitions: parseInt(repetitions),
      };

      const validated = intervalSchema.parse(formData);

      router.back();
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
      }
    }
  };

  const formatTime = ({
    minutes,
    seconds,
  }: {
    hours?: number;
    minutes?: number;
    seconds?: number;
  }) => {
    const timeParts = [];

    if (minutes !== undefined) {
      timeParts.push(minutes.toString().padStart(2, '0'));
    }
    if (seconds !== undefined) {
      timeParts.push(seconds.toString().padStart(2, '0'));
    }

    return timeParts.join(':');
  };

  return (
    <View className="flex-1 bg-background p-4">
      <ScrollView>
        <Text className="text-xl font-bold mb-4">Add New Interval</Text>

        <View className="mb-4">
          <Text className="font-semibold mb-2">Name (Optional)</Text>
          <Input value={name} onChangeText={setName} placeholder="Name" />
        </View>

        <View className="mb-4">
          <Text className="font-semibold mb-2">Timers</Text>
          {timers.map(({ minutes, seconds }, index) => (
            <View key={index} className="flex-row items-center mb-2">
              <Button
                variant="outline"
                className="flex-1"
                onPress={() => {
                  setCurrentEditingIndex(index);
                  setShowTimerPicker(true);
                }}
              >
                <Text>{`${minutes}:${String(seconds).padStart(2, '0')}`}</Text>
              </Button>

              <Button
                variant="destructive"
                className="ml-2"
                onPress={() => handleRemoveTimer(index)}
                disabled={timers.length === 1}
              >
                <Trash2 size={20} color="white" />
              </Button>
            </View>
          ))}

          <Button className="mt-2" onPress={handleAddTimer}>
            <Text>Add Timer</Text>
          </Button>
        </View>

        <View className="mb-4">
          <Text className="font-semibold mb-2">Repetitions</Text>
          <Input
            keyboardType="numeric"
            value={repetitions}
            onChangeText={setRepetitions}
            placeholder="Number of repetitions"
          />
        </View>

        <Button onPress={handleSubmit} className="mt-4">
          <Text>Add Interval</Text>
        </Button>
      </ScrollView>

      {showTimerPicker && (
        <TimerPickerModal
          initialValue={timers[currentEditingIndex]}
          visible={showTimerPicker}
          setIsVisible={setShowTimerPicker}
          onConfirm={(pickedDuration) => {
            const updatedTimers = [...timers];
            updatedTimers[currentEditingIndex] = pickedDuration;
            setTimers(updatedTimers);
            setShowTimerPicker(false);
          }}
          padMinutesWithZero={false}
          padSecondsWithZero={false}
          hideHours={true}
          modalTitle="Time"
          onCancel={() => setShowTimerPicker(false)}
          closeOnOverlayPress
          Audio={Audio}
          LinearGradient={LinearGradient}
          Haptics={Haptics}
          styles={{
            cancelButton: {
              backgroundColor: PlatformColor('systemRed'),
              color: 'white',
              borderColor: PlatformColor('systemRed'),
            },
            confirmButton: {
              backgroundColor: 'black',
              color: 'white',
              borderColor: 'black',
            },
          }}
        />
      )}
    </View>
  );
};

export default AddInterval;