// External Dependencies
import { View, Text, Pressable, PlatformColor } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TimerPickerModal } from 'react-native-timer-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

// Internal Dependencies
import { BottomSheet } from '~/components/ui/bottom-sheet';
import { Timer } from '~/lib/types';

interface IntervalItemProps {
  id: string;
  title: string;
  timers: Timer[];
  repetitions: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function IntervalItem({
  id,
  title,
  timers,
  repetitions,
  onEdit,
  onDelete,
}: IntervalItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTimerPickerOpen, setIsTimerPickerOpen] = useState(false);

  return (
    <>
      <View className="bg-card rounded-lg p-4 mb-4 shadow-md shadow-foreground/10">
        <View className="flex-row justify-between items-center">
          <View className="flex-col">
            <View className="flex-row items-center gap-2">
              <Text className="text-foreground text-lg font-semibold">
                {title}
              </Text>
              <Pressable
                className="bg-muted px-4 py-2 rounded-md"
                onPress={() => setIsTimerPickerOpen(true)}
              >
                <Text className="text-foreground text-md">x{repetitions}</Text>
              </Pressable>
            </View>
            {timers.map(({ minutes, seconds }, index) => (
              <Text
                key={`${minutes}:${seconds}:${index}`}
                className="text-foreground/60 text-lg"
              >{`${minutes}:${seconds.toString().padStart(2, '0')}`}</Text>
            ))}
          </View>

          <Pressable
            onPress={() => setIsMenuOpen(true)}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="#666" />
          </Pressable>
        </View>
      </View>

      {isTimerPickerOpen && (
        <TimerPickerModal
          // Have to conform to timer props
          initialValue={{ seconds: repetitions }}
          visible={isTimerPickerOpen}
          setIsVisible={setIsTimerPickerOpen}
          onConfirm={(selectedRepetitions) => {
            console.log(selectedRepetitions);
          }}
          confirmButtonText="Save"
          secondLabel="x"
          padMinutesWithZero={false}
          padSecondsWithZero={false}
          hideHours={true}
          hideMinutes={true}
          modalTitle="Repetitions"
          onCancel={() => setIsTimerPickerOpen(false)}
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

      <BottomSheet isVisible={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
        <View className="p-4 pb-8">
          <Pressable
            onPress={() => {
              setIsMenuOpen(false);
              router.push({
                pathname: '/(modals)/EditInterval',
                params: {
                  id: id,
                  initialName: title,
                  initialTimers: JSON.stringify(timers),
                  initialRepetitions: repetitions.toString(),
                },
              });
            }}
            className="flex-row items-center py-4 border-b border-muted"
          >
            <Ionicons name="pencil" size={24} color="#666" className="mr-3" />
            <Text className="text-foreground text-lg">Edit Interval</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              onDelete();
              setIsMenuOpen(false);
            }}
            className="flex-row items-center py-4"
          >
            <Ionicons name="trash" size={24} color="#dc2626" className="mr-3" />
            <Text className="text-red-600 text-lg">Delete Interval</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </>
  );
}
