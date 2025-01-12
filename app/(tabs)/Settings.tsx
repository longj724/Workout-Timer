// External Dependencies
import { useEffect, useState } from 'react';
import {
  Image,
  PlatformColor,
  Pressable,
  SafeAreaView,
  ScrollView,
  Switch,
  TouchableOpacity,
  View,
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
// import { Switch } from '~/components/ui/switch';
import { useStorageMutation, useStorageQuery } from '~/hooks/useStorage';
import { useColorScheme } from '~/lib/useColorScheme';
import { Settings, SoundType } from '~/lib/types';

type SettingsView = 'main' | 'audio' | 'voice' | 'profile';

// Add consistent spacing and styling
const SECTION_SPACING = 'mx-4 mb-4';
const SECTION_STYLE = 'bg-white dark:bg-gray-700 rounded-lg shadow';
const ITEM_PADDING = 'p-4';
const ICON_CONTAINER = 'h-10 w-10 rounded-xl items-center justify-center';
const SECTION_HEADER = 'text-xl ml-4 text-gray-500 dark:text-gray-400 mb-2';

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
        <ArrowLeft size={24} color={isDarkColorScheme ? '#fff' : '#000'} />
        <Text className="text-xl ml-2 dark:text-white">Back</Text>
      </TouchableOpacity>
    </View>
  );

  const isAudioDisabled = settings?.countdownSoundType === 'none';

  if (currentView === 'audio') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        {renderHeader()}
      </SafeAreaView>
    );
  }

  if (currentView === 'voice') {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        {renderHeader()}
        <Text className={SECTION_HEADER}>Voice Selection</Text>
        <ScrollView>
          <View className="mx-2 bg-white dark:bg-gray-700 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
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
                  <Text className="text-lg dark:text-white">{voice.name}</Text>
                  {settings?.selectedVoiceIdentifier === voice.identifier && (
                    <Check size={24} color="#16a34a" />
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
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        {renderHeader()}
        <ScrollView>
          <View className="mx-4 bg-white dark:bg-gray-700 rounded-lg shadow mb-4">
            <View className="p-6 items-center border-b border-gray-200 dark:border-gray-700">
              <View className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center overflow-hidden mb-4">
                {user?.imageUrl ? (
                  <Image
                    source={{ uri: user.imageUrl }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <User
                    size={40}
                    color={isDarkColorScheme ? '#fff' : '#9CA3AF'}
                  />
                )}
              </View>
              <Text className="text-xl font-medium dark:text-white">
                {user?.fullName || user?.firstName || 'User'}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 mt-1">
                {user?.emailAddresses[0].emailAddress}
              </Text>
            </View>

            <View className="divide-y divide-gray-200 dark:divide-gray-700">
              <View className="p-4">
                <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Created
                </Text>
                <Text className="text-base dark:text-white">
                  {new Date(user?.createdAt || '').toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          <View className="mx-4 bg-white dark:bg-gray-700 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
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
              <View className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900 items-center justify-center">
                <LogOut size={24} color="#DC2626" />
              </View>
              <Text className="flex-1 ml-4 text-lg text-red-600 dark:text-red-400">
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main Settings View
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1 pt-4">
        {/* User Profile Section */}
        {user && (
          <View className={`${SECTION_SPACING} ${SECTION_STYLE}`}>
            <TouchableOpacity
              className={`${ITEM_PADDING} flex-row items-center`}
              onPress={() => setCurrentView('profile')}
            >
              <View className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center overflow-hidden">
                {user.imageUrl ? (
                  <Image
                    source={{ uri: user.imageUrl }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <User
                    size={24}
                    color={isDarkColorScheme ? '#fff' : '#9CA3AF'}
                  />
                )}
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-base font-medium dark:text-white">
                  {user.fullName || user.firstName || 'User'}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {user.emailAddresses[0].emailAddress}
                </Text>
              </View>
              <ChevronRight
                size={20}
                color={isDarkColorScheme ? '#9ca3af' : '#71717a'}
              />
            </TouchableOpacity>
          </View>
        )}

        <View
          className={`${SECTION_SPACING} ${SECTION_STYLE} ${
            isAudioDisabled ? 'opacity-50' : ''
          }`}
        >
          <View
            className={`${ITEM_PADDING} flex-row items-center justify-between border-b border-gray-100 dark:border-gray-700`}
          >
            <View className="flex-1">
              <Text className="text-base dark:text-white">Dark Mode</Text>
            </View>
            <Switch
              trackColor={{
                true: '#FF7F50',
                false: isDarkColorScheme ? '#4B5563' : '#9CA3AF',
              }}
              value={isDarkColorScheme}
              onValueChange={(checked: boolean) => {
                setColorScheme(checked ? 'dark' : 'light');
              }}
            />
          </View>
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
              className={`${ITEM_PADDING} flex-row items-center justify-between border-b border-gray-100 dark:border-gray-700 last:border-b-0`}
              onPress={() =>
                setSettings({
                  ...(settings as Settings),
                  countdownSoundType: option.value.toLowerCase() as SoundType,
                })
              }
            >
              <Text className="text-base dark:text-white">{option.label}</Text>
              {settings?.countdownSoundType === option.value.toLowerCase() && (
                <Check size={24} color="#16a34a" />
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
            className={`${ITEM_PADDING} flex-row items-center justify-between border-b border-gray-100 dark:border-gray-700`}
          >
            <View className="flex-1">
              <Text className="text-base dark:text-white">
                Seconds Remaining
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Select seconds remaining to start countdown
              </Text>
            </View>
            <Pressable
              className="bg-gray-100 dark:bg-gray-600 px-4 rounded-md flex items-center justify-center h-9"
              onPress={() => setshowSecondsRemainedPicker(true)}
              disabled={isAudioDisabled}
            >
              <Text
                className={
                  isAudioDisabled
                    ? 'text-gray-400'
                    : 'text-green-600 dark:text-green-400'
                }
              >
                {settings?.countdownSoundSeconds} sec
              </Text>
            </Pressable>
          </View>

          <View
            className={`${ITEM_PADDING} flex-row items-center justify-between border-b border-gray-100 dark:border-gray-700`}
          >
            <View className="flex-1">
              <Text className="text-base dark:text-white">
                Announce interval name at start
              </Text>
            </View>
            <Switch
              trackColor={{
                true: '#FF7F50',
                false: '#9CA3AF',
              }}
              value={settings?.announceIntervalName ?? true}
              onValueChange={(checked: boolean) => {
                setSettings({
                  ...(settings as Settings),
                  announceIntervalName: checked,
                });
              }}
              disabled={isAudioDisabled}
            />
          </View>

          <View
            className={`${ITEM_PADDING} flex-row items-center justify-between border-b border-gray-100 dark:border-gray-700`}
          >
            <View className="flex-1">
              <Text className="text-base dark:text-white">
                Announce time at start of timer
              </Text>
            </View>
            <Switch
              trackColor={{
                true: '#FF7F50',
                false: '#9CA3AF',
              }}
              value={settings?.announceTimeAtTimerStart ?? true}
              onValueChange={(checked: boolean) => {
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
