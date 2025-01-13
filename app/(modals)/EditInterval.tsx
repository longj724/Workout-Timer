// External Dependencies
import { PlatformColor, ScrollView, View } from 'react-native';
import { useState } from 'react';
import { z } from 'zod';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { TimerPickerModal } from 'react-native-timer-picker';
import { Trash2 } from 'lucide-react-native';

// Internal Dependencies
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Text } from '~/components/ui/text';
import { Interval, Timer } from '~/lib/types';
import { useStorageMutation, useStorageQuery } from '~/hooks/useStorage';
import { useEditInterval } from '~/hooks/useEditInterval';
import { EditIntervalInput, editIntervalSchema } from '~/lib/types';
import { useColorScheme } from '~/lib/useColorScheme';

const EditInterval = () => {
  const { isDarkColorScheme } = useColorScheme();
  const { data: localIntervals } = useStorageQuery<Interval[]>('intervals', []);
  const { mutate: setIntervals } = useStorageMutation<Interval[]>('intervals');
  const { mutate: editInterval } = useEditInterval();
  const params = useLocalSearchParams();
  const {
    id,
    initialName,
    initialTimers,
    initialRepetitions,
    editingSavedInterval,
    order,
  } = params;

  const [name, setName] = useState((initialName as string) || '');
  const [timers, setTimers] = useState<Timer[]>(
    JSON.parse(initialTimers as string) || [{ minutes: 0, seconds: 0 }]
  );
  const [repetitions, setRepetitions] = useState(
    (initialRepetitions as string) || '1'
  );
  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const [currentEditingIndex, setCurrentEditingIndex] = useState<number>(0);

  const handleAddTimer = () => {
    setTimers([...timers, { minutes: 0, seconds: 0, order: timers.length }]);
  };

  const handleRemoveTimer = (index: number) => {
    if (timers.length > 1) {
      setTimers(timers.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    if (
      editingSavedInterval &&
      JSON.parse(editingSavedInterval as string) === true
    ) {
      const formData: EditIntervalInput = {
        id: id as string,
        name,
        timers,
        order: parseInt(order as string),
        repetitions: parseInt(repetitions),
      };

      const validatedInterval = editIntervalSchema.parse(formData) as Interval;

      editInterval(validatedInterval);

      router.back();
    } else {
      try {
        const formData: EditIntervalInput = {
          id: id as string,
          name,
          timers,
          repetitions: parseInt(repetitions),
          order: parseInt(order as string),
        };

        const validated = editIntervalSchema.parse(formData);

        const updatedIntervals = localIntervals?.map((interval) => {
          if (interval.id === id) {
            return { ...interval, ...validated };
          }
          return interval;
        });

        if (updatedIntervals) {
          setIntervals(updatedIntervals);
        }

        router.back();
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error('Validation error:', error.errors);
        }
      }
    }
  };

  return (
    <View className="flex-1 p-4">
      <ScrollView>
        <Text className="text-xl font-bold mb-4">Edit Interval</Text>

        <View className="mb-4">
          <Text className="font-semibold mb-2">Name (Optional)</Text>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Name"
            className="dark:text-white"
          />
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
                <Text className="text-black dark:text-white">{`${minutes}:${String(
                  seconds
                ).padStart(2, '0')}`}</Text>
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

          <Button className="mt-2 dark:bg-gray-700" onPress={handleAddTimer}>
            <Text className="dark:text-white">Add Timer</Text>
          </Button>
        </View>

        <View className="mb-4">
          <Text className="font-semibold mb-2">Repetitions</Text>
          <Input
            keyboardType="numeric"
            value={repetitions}
            onChangeText={setRepetitions}
            placeholder="Number of repetitions"
            className="dark:text-white"
          />
        </View>

        <Button onPress={handleSubmit} className="mt-4 dark:bg-gray-700">
          <Text className="dark:text-white">Save Changes</Text>
        </Button>
      </ScrollView>

      {showTimerPicker && (
        <TimerPickerModal
          initialValue={timers[currentEditingIndex]}
          visible={showTimerPicker}
          setIsVisible={setShowTimerPicker}
          onConfirm={(pickedDuration) => {
            const updatedTimers = [...timers];
            updatedTimers[currentEditingIndex] = {
              ...pickedDuration,
              order: timers.length,
            };
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

export default EditInterval;
