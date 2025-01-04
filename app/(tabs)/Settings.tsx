// External Dependencies
import { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  PlatformColor,
  Pressable,
} from 'react-native';
import {
  ChevronRight,
  Palette,
  Ruler,
  Star,
  Store,
  Volume2,
  Mic,
  Vibrate,
  ArrowLeft,
  Clock,
  Check,
} from 'lucide-react-native';
import { TimerPickerModal } from 'react-native-timer-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

// Internal Dependencies
import { Text } from '~/components/ui/text';
import { Switch } from '~/components/ui/switch';

type SettingsView = 'main' | 'audio' | 'voice';
type SoundType = 'none' | 'voice' | 'beeps';

export default function SettingsScreen() {
  const [currentView, setCurrentView] = useState<SettingsView>('main');

  // Audio Settings State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [countdownSound, setCountdownSound] = useState(true);
  const [showSecondRemainedPicker, setShowSecondRemainedPicker] =
    useState(false);
  const [soundType, setSoundType] = useState<SoundType>('beeps');

  // Voice Settings State
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [timeAnnouncements, setTimeAnnouncements] = useState(true);

  const renderHeader = (title: string, subtitle?: string) => (
    <View className="p-4 flex-col">
      <TouchableOpacity
        onPress={() => setCurrentView('main')}
        className="mr-3 flex flex-row items-center"
      >
        <ArrowLeft size={24} color="#000" />
        <Text className="text-xl ml-2">Back</Text>
      </TouchableOpacity>
    </View>
  );

  const isAudioDisabled = soundType === 'none';

  if (currentView === 'audio') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        {renderHeader('Audio Alerts', 'Customize your workout sounds')}
        <Text className="text-xl ml-4 text-gray-500">Alert Type</Text>
        <View className="mx-2 bg-white rounded-lg shadow divide-y divide-gray-200 mt-2">
          {[
            { value: 'None', label: 'None' },
            { value: 'Voice', label: 'Voice' },
            { value: 'Beeps', label: 'Beeps' },
          ].map((option) => (
            <Pressable
              key={option.value}
              className="py-4 px-6 flex-row items-center justify-between"
              onPress={() =>
                setSoundType(option.value.toLowerCase() as SoundType)
              }
            >
              <Text className="text-lg">{option.label}</Text>

              {soundType === option.value.toLowerCase() && (
                <Check size={24} color="#22c55e" />
              )}
            </Pressable>
          ))}
        </View>

        <Text className="text-xl ml-4 text-gray-500 mt-4">Audio Alerts</Text>
        <View
          className={`mx-2 bg-white rounded-lg shadow divide-y divide-gray-200 mt-2 ${
            isAudioDisabled ? 'opacity-50' : ''
          }`}
        >
          <View className="py-4 px-6 flex-row items-center">
            <View className="w-4/5">
              <Text className="text-lg">Seconds Remaining</Text>
              <Text className="text-gray-500">
                Select seconds remaining to start countdown
              </Text>
            </View>

            <Pressable
              className="bg-muted px-4 rounded-md flex items-center justify-center h-10"
              onPress={() => setShowSecondRemainedPicker(true)}
              disabled={isAudioDisabled}
            >
              <Text
                className={`text-md ${
                  isAudioDisabled ? 'text-gray-400' : 'text-green-500'
                }`}
              >
                5 sec
              </Text>
            </Pressable>

            {/* Timer Picker */}
            <TimerPickerModal
              initialValue={{ minutes: 0 }}
              visible={showSecondRemainedPicker}
              setIsVisible={setShowSecondRemainedPicker}
              onConfirm={(pickedDuration) => {}}
              padMinutesWithZero={false}
              padSecondsWithZero={false}
              hideHours={true}
              hideMinutes={true}
              modalTitle="Seconds"
              onCancel={() => setShowSecondRemainedPicker(false)}
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
          </View>

          <View className="py-4 px-6 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-4/5">
                <Text className="text-lg">
                  Announce Interval name at start of the interval
                </Text>
              </View>
            </View>
            <Switch
              checked={countdownSound}
              onCheckedChange={setCountdownSound}
              disabled={isAudioDisabled}
            />
          </View>

          <View className="py-4 px-6 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-4/5">
                <Text className="text-lg">Announce time at start of timer</Text>
              </View>
            </View>
            <Switch
              checked={countdownSound}
              onCheckedChange={setCountdownSound}
              disabled={isAudioDisabled}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (currentView === 'voice') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        {renderHeader('Voice Assistant', 'Configure voice guidance')}
        <ScrollView>
          <View className="mx-4 bg-white rounded-lg shadow divide-y divide-gray-200">
            <View className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="h-10 w-10 rounded-xl bg-blue-100 items-center justify-center">
                  <Mic size={24} color="#2563EB" />
                </View>
                <View className="ml-4">
                  <Text className="text-lg">Enable Voice</Text>
                  <Text className="text-gray-500">Master voice control</Text>
                </View>
              </View>
              <Switch
                checked={voiceEnabled}
                onCheckedChange={setVoiceEnabled}
              />
            </View>

            <View className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="h-10 w-10 rounded-xl bg-amber-100 items-center justify-center">
                  <Clock size={24} color="#D97706" />
                </View>
                <View className="ml-4">
                  <Text className="text-lg">Time Announcements</Text>
                  <Text className="text-gray-500">Announce remaining time</Text>
                </View>
              </View>
              <Switch
                checked={timeAnnouncements}
                onCheckedChange={setTimeAnnouncements}
                disabled={!voiceEnabled}
              />
            </View>

            {/* Other voice settings... */}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main Settings View
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Review & Membership */}
        <View className="mx-4 mb-4 bg-white rounded-lg shadow divide-y divide-gray-200 mt-4">
          <TouchableOpacity className="flex flex-row items-center p-4">
            <View className="h-10 w-10 rounded-xl bg-amber-400 items-center justify-center">
              <Star size={24} color="white" />
            </View>
            <Text className="flex-1 ml-4 text-lg">Write Review</Text>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex flex-row items-center p-4">
            <View className="h-10 w-10 rounded-xl bg-blue-500 items-center justify-center">
              <Store size={24} color="white" />
            </View>
            <Text className="flex-1 ml-4 text-lg">Membership</Text>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Settings Groups */}
        <View className="mx-4 mb-4 bg-white rounded-lg shadow divide-y divide-gray-200">
          {[
            {
              icon: Volume2,
              title: 'Audio Alerts',
              onPress: () => setCurrentView('audio'),
            },
            {
              icon: Ruler,
              title: 'Voice Assistance',
              onPress: () => setCurrentView('voice'),
            },
            {
              icon: Palette,
              title: 'Appearance',
              colors: true,
            },
          ].map((item, index) => (
            <TouchableOpacity
              key={item.title}
              className="flex flex-row items-center p-4"
              onPress={item.onPress}
            >
              <View className="h-10 w-10 rounded-xl bg-gray-100 items-center justify-center">
                <item.icon size={24} />
              </View>
              <Text className="flex-1 ml-4 text-lg">{item.title}</Text>
              {item.colors && (
                <View className="flex flex-row gap-1 mr-2">
                  {['red', 'orange', 'green', 'emerald'].map((color) => (
                    <View
                      key={color}
                      className={`h-3 w-3 rounded-full bg-${color}-500`}
                    />
                  ))}
                </View>
              )}
              {/* {item.status && (
                <Text className="text-emerald-500 mr-2">{item.status}</Text>
              )} */}
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
