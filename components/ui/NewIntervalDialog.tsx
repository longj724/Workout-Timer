// External Dependencies
import { useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { TimerPickerModal } from 'react-native-timer-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

interface NewIntervalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (interval: { title: string; duration: string }) => void;
}

export function NewIntervalDialog({
  isOpen,
  onClose,
  onAdd,
}: NewIntervalDialogProps) {
  const [title, setTitle] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleAdd = () => {
    if (title && selectedTime) {
      onAdd({ title, duration: selectedTime });
      setTitle('');
      setSelectedTime(null);
      onClose();
    }
  };

  const formatTime = ({
    hours,
    minutes,
    seconds,
  }: {
    hours?: number;
    minutes?: number;
    seconds?: number;
  }) => {
    const timeParts = [];

    if (hours !== undefined && hours > 0) {
      timeParts.push(hours.toString().padStart(2, '0'));
    }
    if (minutes !== undefined) {
      timeParts.push(minutes.toString().padStart(2, '0'));
    }
    if (seconds !== undefined) {
      timeParts.push(seconds.toString().padStart(2, '0'));
    }

    return timeParts.join(':');
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isOpen}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-card m-4 p-4 rounded-lg w-[300px]">
          <Text className="text-foreground text-xl font-bold mb-4">
            Add New Interval
          </Text>

          <View className="mb-4">
            <Text className="text-foreground mb-2">Title</Text>
            <TextInput
              className="border border-foreground/20 rounded p-2 text-foreground"
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Warm Up"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>

          <View className="mb-4">
            <Text className="text-foreground mb-2">Duration</Text>
            <Pressable
              className="border border-foreground/20 rounded p-2"
              onPress={() => setShowPicker(true)}
            >
              <Text className="text-foreground">
                {selectedTime || 'Set time'}
              </Text>
            </Pressable>
          </View>

          <TimerPickerModal
            visible={showPicker}
            setIsVisible={setShowPicker}
            onConfirm={(pickedDuration) => {
              setSelectedTime(formatTime(pickedDuration));
              setShowPicker(false);
            }}
            hideHours={true}
            modalTitle="Time"
            onCancel={() => setShowPicker(false)}
            closeOnOverlayPress
            Audio={Audio}
            LinearGradient={LinearGradient}
            Haptics={Haptics}
            styles={{
              theme: 'dark',
            }}
          />

          <View className="flex-row justify-end gap-2">
            <Pressable className="px-4 py-2 rounded" onPress={onClose}>
              <Text className="text-foreground">Cancel</Text>
            </Pressable>
            <Pressable
              className="bg-primary px-4 py-2 rounded"
              onPress={handleAdd}
            >
              <Text className="text-primary-foreground">Add</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
