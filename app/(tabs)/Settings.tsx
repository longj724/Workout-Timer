// External Dependencies
import { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  PlatformColor,
  Pressable,
  Image,
} from 'react-native';
import {
  ChevronRight,
  Star,
  Volume2,
  ArrowLeft,
  Check,
  User,
  LogOut,
  Play,
} from 'lucide-react-native';
import { TimerPickerModal } from 'react-native-timer-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useClerk, useUser } from '@clerk/clerk-expo';
import * as Speech from 'expo-speech';

// Internal Dependencies
import { Text } from '~/components/ui/text';
import { Switch } from '~/components/ui/switch';
import { useStorageMutation, useStorageQuery } from '~/hooks/useStorage';
import { useColorScheme } from '~/lib/useColorScheme';
import { Settings, SoundType } from '~/lib/types';

type SettingsView = 'main' | 'audio' | 'voice' | 'profile';

// Add consistent spacing and styling
const SECTION_SPACING = 'mx-4 mb-4';
const SECTION_STYLE = 'bg-white rounded-lg shadow';
const ITEM_PADDING = 'p-4';
const ICON_CONTAINER = 'h-10 w-10 rounded-xl items-center justify-center';
const SECTION_HEADER = 'text-xl ml-4 text-gray-500 mb-2';

export default function SettingsScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { isDarkColorScheme, setColorScheme } = useColorScheme();
  const { data: settings } = useStorageQuery<Settings>('settings', {
    countdownSoundType: 'beeps',
    countdownSoundSeconds: 5,
    announceIntervalName: true,
    announceTimeAtTimerStart: true,
    selectedVoiceIdentifier: 'com.apple.ttsbundle.siri_female_en-US_compact',
  });
  const { mutate: setSettings } = useStorageMutation<Settings>('settings');

  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [showSecondsRemainedPicker, setshowSecondsRemainedPicker] =
    useState(false);
  const [voices, setVoices] = useState<Speech.Voice[]>([]);

  useEffect(() => {
    Speech.getAvailableVoicesAsync().then((voices) => {
      setVoices(voices);
    });
  }, []);

  const renderHeader = () => (
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

  const isAudioDisabled = settings?.countdownSoundType === 'none';

  if (currentView === 'audio') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        {renderHeader()}
      </SafeAreaView>
    );
  }

  if (currentView === 'voice') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        {renderHeader()}
        <Text className="text-xl ml-4 text-gray-500 mb-2">Voice Selection</Text>
        <ScrollView>
          <View className="mx-2 bg-white rounded-lg shadow divide-y divide-gray-200">
            {voices
              .filter((voice) => voice.language.includes('en'))
              .map((voice) => (
                <Pressable
                  key={voice.identifier}
                  className="py-4 px-6 flex-row items-center justify-between"
                  onPress={() => {
                    setSettings({
                      ...(settings as Settings),
                      selectedVoiceIdentifier: voice.identifier,
                    });
                  }}
                >
                  <Text className="text-lg">{voice.name}</Text>
                  {/* Button to play the voice */}
                  {/* <Pressable
                    onPress={() => {
                      Speech.speak('Hello, world!', {
                        voice: voice.identifier,
                      });
                    }}
                  >
                    <Play size={24} color="#22c55e" />
                  </Pressable> */}

                  {settings?.selectedVoiceIdentifier === voice.identifier && (
                    <Check size={24} color="#22c55e" />
                  )}
                </Pressable>
              ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentView === 'profile') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        {renderHeader()}
        <ScrollView>
          {/* Profile Info */}
          <View className="mx-4 bg-white rounded-lg shadow mb-4">
            <View className="p-6 items-center border-b border-gray-200">
              <View className="h-24 w-24 rounded-full bg-gray-200 items-center justify-center overflow-hidden mb-4">
                {user?.imageUrl ? (
                  <Image
                    source={{ uri: user.imageUrl }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <User size={40} color="#9CA3AF" />
                )}
              </View>
              <Text className="text-xl font-medium">
                {user?.fullName || user?.firstName || 'User'}
              </Text>
              <Text className="text-gray-500 mt-1">
                {user?.emailAddresses[0].emailAddress}
              </Text>
            </View>

            {/* Account Details */}
            <View className="divide-y divide-gray-200">
              <View className="p-4">
                <Text className="text-sm text-gray-500 mb-1">Created</Text>
                <Text className="text-base">
                  {new Date(user?.createdAt || '').toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Account Actions */}
          <View className="mx-4 bg-white rounded-lg shadow divide-y divide-gray-200">
            <TouchableOpacity
              className="p-4 flex-row items-center"
              onPress={async () => {
                try {
                  signOut();
                  setCurrentView('main');
                } catch (error) {
                  console.error('Error signing out:', error);
                }
              }}
            >
              <View className="h-10 w-10 rounded-xl bg-red-100 items-center justify-center">
                <LogOut size={24} color="#DC2626" />
              </View>
              <Text className="flex-1 ml-4 text-lg text-red-600">Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main Settings View
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 pt-4">
        {/* User Profile Section */}
        {user && (
          <View className={`${SECTION_SPACING} ${SECTION_STYLE}`}>
            <TouchableOpacity
              className={`${ITEM_PADDING} flex-row items-center`}
              onPress={() => setCurrentView('profile')}
            >
              <View className="h-12 w-12 rounded-full bg-gray-200 items-center justify-center overflow-hidden">
                {user.imageUrl ? (
                  <Image
                    source={{ uri: user.imageUrl }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <User size={24} color="#9CA3AF" />
                )}
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-base font-medium">
                  {user.fullName || user.firstName || 'User'}
                </Text>
                <Text className="text-sm text-gray-500">
                  {user.emailAddresses[0].emailAddress}
                </Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Review Section */}
        <View className={`${SECTION_SPACING} ${SECTION_STYLE}`}>
          <TouchableOpacity className={`${ITEM_PADDING} flex-row items-center`}>
            <View className={`${ICON_CONTAINER} bg-amber-400`}>
              <Star size={24} color="white" />
            </View>
            <Text className="flex-1 ml-4 text-base">Write Review</Text>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Alert Type Section */}
        <Text className={SECTION_HEADER}>Alert Type</Text>
        <View className={`${SECTION_SPACING} ${SECTION_STYLE}`}>
          {[
            { value: 'None', label: 'None' },
            { value: 'Voice', label: 'Voice' },
            { value: 'Beeps', label: 'Beeps' },
          ].map((option) => (
            <Pressable
              key={option.value}
              className={`${ITEM_PADDING} flex-row items-center justify-between border-b border-gray-100 last:border-b-0`}
              onPress={() =>
                setSettings({
                  ...(settings as Settings),
                  countdownSoundType: option.value.toLowerCase() as SoundType,
                })
              }
            >
              <Text className="text-base">{option.label}</Text>
              {settings?.countdownSoundType === option.value.toLowerCase() && (
                <Check size={24} color="#22c55e" />
              )}
            </Pressable>
          ))}
        </View>

        {/* Audio Alerts Section */}
        <Text className={SECTION_HEADER}>Audio Alerts</Text>
        <View
          className={`${SECTION_SPACING} ${SECTION_STYLE} ${
            isAudioDisabled ? 'opacity-50' : ''
          }`}
        >
          <View
            className={`${ITEM_PADDING} flex-row items-center justify-between border-b border-gray-100`}
          >
            <View className="flex-1">
              <Text className="text-base">Seconds Remaining</Text>
              <Text className="text-sm text-gray-500">
                Select seconds remaining to start countdown
              </Text>
            </View>
            <Pressable
              className="bg-gray-100 px-4 rounded-md flex items-center justify-center h-9"
              onPress={() => setshowSecondsRemainedPicker(true)}
              disabled={isAudioDisabled}
            >
              <Text
                className={isAudioDisabled ? 'text-gray-400' : 'text-green-500'}
              >
                {settings?.countdownSoundSeconds} sec
              </Text>
            </Pressable>
          </View>

          <View
            className={`${ITEM_PADDING} flex-row items-center justify-between border-b border-gray-100`}
          >
            <View className="flex-1">
              <Text className="text-base">Announce interval name at start</Text>
            </View>
            <Switch
              checked={settings?.announceIntervalName ?? true}
              onCheckedChange={(checked: boolean) => {
                setSettings({
                  ...(settings as Settings),
                  announceIntervalName: checked,
                });
              }}
              disabled={isAudioDisabled}
            />
          </View>

          <View
            className={`${ITEM_PADDING} flex-row items-center justify-between`}
          >
            <View className="flex-1">
              <Text className="text-base">Announce time at start of timer</Text>
            </View>
            <Switch
              checked={settings?.announceTimeAtTimerStart ?? true}
              onCheckedChange={(checked: boolean) => {
                setSettings({
                  ...(settings as Settings),
                  announceTimeAtTimerStart: checked,
                });
              }}
              disabled={isAudioDisabled}
            />
          </View>
        </View>

        {/* Timer Picker Modal */}
        <TimerPickerModal
          initialValue={{ minutes: 0 }}
          visible={showSecondsRemainedPicker}
          setIsVisible={setshowSecondsRemainedPicker}
          onConfirm={(pickedDuration) => {
            setSettings({
              ...(settings as Settings),
              countdownSoundSeconds: pickedDuration.seconds,
            });
            setshowSecondsRemainedPicker(false);
          }}
          padMinutesWithZero={false}
          padSecondsWithZero={false}
          hideHours={true}
          hideMinutes={true}
          modalTitle="Seconds"
          onCancel={() => setshowSecondsRemainedPicker(false)}
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
      </ScrollView>
    </SafeAreaView>
  );
}
