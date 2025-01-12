// External Dependencies
import { TouchableOpacity, View, Alert } from 'react-native';
import { useState, useCallback, useEffect, useRef } from 'react';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { useLocalSearchParams } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

// Internal Dependencies
import { Interval, Timer } from '~/lib/types';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { useStorageQuery } from '~/hooks/useStorage';
import { Settings } from '~/lib/types';

const PlayWorkout = () => {
  const { data: settings } = useStorageQuery<Settings>('settings', {
    countdownSoundType: 'beeps',
    countdownSoundSeconds: 5,
    announceIntervalName: true,
    announceTimeAtTimerStart: true,
    selectedVoiceIdentifier: 'com.apple.ttsbundle.siri_female_en-US_compact',
  });

  const { intervalInfo, workoutId } = useLocalSearchParams<{
    intervalInfo: string;
    workoutId?: string;
  }>();

  const [key, setKey] = useState('0,0,1');
  const [intervals, setIntervals] = useState<Interval[]>(
    JSON.parse(intervalInfo as string) || {}
  );

  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [curTimers, setCurTimers] = useState<Timer[]>([]);
  const [curTimerIndex, setCurTimerIndex] = useState(0);
  const [curTimerTotalSeconds, setCurTimerTotalSeconds] = useState(0);
  const [curRepetition, setCurRepetition] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [totalRemainingSeconds, setTotalRemainingSeconds] = useState(-1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCurTimers(intervals[currentIntervalIndex].timers);
    setCurTimerTotalSeconds(
      intervals[0].timers[0].minutes * 60 + intervals[0].timers[0].seconds
    );
  }, [intervals]);

  useEffect(() => {
    // In this useEffect when moving between timers in an interval
    if (curTimers.length > 0 && curTimerIndex > 0) {
      setCurTimerTotalSeconds(
        curTimers[curTimerIndex].minutes * 60 + curTimers[curTimerIndex].seconds
      );
      setKey(`${currentIntervalIndex},${curTimerIndex},${curRepetition}`);
    }
  }, [curTimerIndex]);

  useEffect(() => {
    // In this useEffect when moving between intervals
    setCurTimers(intervals[currentIntervalIndex].timers);
    setCurTimerIndex(0);
    setCurRepetition(1);
    setCurTimerTotalSeconds(
      intervals[currentIntervalIndex].timers[0].minutes * 60 +
        intervals[currentIntervalIndex].timers[0].seconds
    );
  }, [currentIntervalIndex]);

  useEffect(() => {
    // Initialize total time
    if (totalRemainingSeconds === -1) {
      setTotalRemainingSeconds(calculateInitialTotalTime());
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setTotalRemainingSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentIntervalIndex, curRepetition]);

  useEffect(() => {
    if (settings?.announceTimeAtTimerStart && curTimerTotalSeconds !== 0) {
      const minutes = Math.floor(curTimerTotalSeconds / 60);
      const seconds = curTimerTotalSeconds % 60;

      if (minutes > 0) {
        Speech.speak(`Next round is ${minutes} minutes, ${seconds} seconds`);
      } else {
        Speech.speak(`Next round is ${seconds} seconds`);
      }
    }
  }, [curTimerTotalSeconds]);

  useEffect(() => {
    if (settings?.announceIntervalName && curTimerTotalSeconds !== 0) {
      if (intervals[currentIntervalIndex].name) {
        Speech.speak(
          `Starting interval ${intervals[currentIntervalIndex].name}`
        );
      }
    }
  }, [currentIntervalIndex]);

  const completeWorkout = () => {
    // Calculate final workout stats
    const totalTime = intervals.reduce((acc, interval) => {
      const intervalTime = interval.timers.reduce(
        (timerAcc, timer) => timerAcc + (timer.minutes * 60 + timer.seconds),
        0
      );
      return acc + intervalTime * interval.repetitions;
    }, 0);

    router.push({
      pathname: '/WorkoutComplete',
      params: {
        stats: JSON.stringify({
          // Total Time in seconds
          totalTime,
          totalIntervals: intervals.length,
          totalRepetitions: intervals.reduce(
            (acc, interval) => acc + interval.repetitions,
            0
          ),
        }),
        workoutId: workoutId || null,
        intervals: JSON.stringify(intervals),
      },
    });
  };

  const handleCompleteTimer = () => {
    // If there is another timer in the current interval
    if (curTimerIndex < curTimers.length - 1) {
      setCurTimerIndex((prev) => prev + 1);
    } else {
      // If we need to repeat the current interval again
      if (curRepetition < intervals[currentIntervalIndex].repetitions) {
        setCurRepetition((prev) => prev + 1);
        setCurTimerIndex(0);
        setCurTimerTotalSeconds(
          intervals[currentIntervalIndex].timers[0].minutes * 60 +
            intervals[currentIntervalIndex].timers[0].seconds
        );
        setKey(`${currentIntervalIndex},${0},${curRepetition + 1}`);
      } else {
        // If we are on the last repetition of the current interval
        if (currentIntervalIndex < intervals.length - 1) {
          setKey(`${currentIntervalIndex + 1},0,1`);
          setCurrentIntervalIndex((prev) => prev + 1);
        } else {
          completeWorkout();
        }
      }
    }
  };

  const handleNextInterval = useCallback(() => {
    if (currentIntervalIndex === intervals.length - 1) {
      completeWorkout();
    } else {
      setCurrentIntervalIndex((prev) => prev + 1);
      setKey(`${currentIntervalIndex + 1},0,1`);
    }
  }, [currentIntervalIndex, intervals.length]);

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleNextTimer = () => {
    if (curTimerIndex < curTimers.length - 1) {
      setCurTimerIndex((prev) => prev + 1);
      setKey(`${currentIntervalIndex},${curTimerIndex + 1},${curRepetition}`);
    }
  };

  const formatTime = (remainingTime: number) => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    setIsPlaying(false);
    Alert.alert('Quit Workout', 'Are you sure you want to quit this workout?', [
      {
        text: 'Cancel',
        style: 'cancel',
        // onPress: () => handlePlayPause(),
      },
      {
        text: 'Quit',
        onPress: () => router.back(),
        style: 'destructive',
      },
    ]);
  };

  const calculateInitialTotalTime = () => {
    return intervals.reduce((acc, interval, intervalIndex) => {
      const intervalSeconds = interval.timers.reduce(
        (timerAcc, timer) => timerAcc + timer.minutes * 60 + timer.seconds,
        0
      );

      // If we're past this interval, return acc
      if (intervalIndex < currentIntervalIndex) return acc;

      // If this is the current interval, only count remaining repetitions
      if (intervalIndex === currentIntervalIndex) {
        const remainingReps = interval.repetitions - curRepetition + 1;
        return acc + intervalSeconds * remainingReps;
      }

      // For future intervals, count all repetitions
      return acc + intervalSeconds * interval.repetitions;
    }, 0);
  };

  const formatTotalTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FF7F50', // Coral color similar to the image
        padding: 20,
      }}
    >
      <TouchableOpacity
        style={{
          right: 20,
          top: 50,
        }}
        className="z-10 absolute"
        onPress={handleClose}
      >
        <AntDesign name="close" size={28} color="#fff" />
      </TouchableOpacity>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <CountdownCircleTimer
          onUpdate={async (remainingTime) => {
            if (
              settings?.countdownSoundSeconds &&
              settings?.countdownSoundSeconds >= remainingTime &&
              settings?.countdownSoundType !== 'none' &&
              curTimerTotalSeconds !== remainingTime
            ) {
              if (settings?.countdownSoundType === 'beeps') {
                if (remainingTime === 0) {
                  const { sound } = await Audio.Sound.createAsync(
                    require('../assets/countdown-sport-timer.wav')
                  );
                  await sound.playAsync();
                } else {
                  const { sound } = await Audio.Sound.createAsync(
                    require('../assets/end-sport-timer.wav')
                  );
                  await sound.playAsync();
                }
              } else {
                Speech.speak(remainingTime.toString());
              }
            }
          }}
          key={key}
          isPlaying={isPlaying}
          duration={curTimerTotalSeconds}
          colors={['#004777', '#F7B801', '#A30000', '#A30000']}
          colorsTime={[
            curTimerTotalSeconds,
            curTimerTotalSeconds * 0.6,
            curTimerTotalSeconds * 0.3,
            0,
          ]}
          size={280}
          strokeWidth={20}
          trailColor="rgba(255,255,255,0.3)"
          onComplete={handleCompleteTimer}
        >
          {({ remainingTime }) => (
            <View className="flex items-center">
              <Text className="text-2xl text-white font-bold">
                {formatTime(remainingTime)}
              </Text>
            </View>
          )}
        </CountdownCircleTimer>

        <Card
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 20,
          }}
          className="h-32 flex flex-row justify-between items-center px-4 w-full mt-6"
        >
          <View className="w-full flex flex-row items-center justify-between">
            <View className="flex items-center">
              {/* Intervals */}
              <Text className="text-2xl text-white font-bold">
                {`${currentIntervalIndex + 1} / ${intervals.length}`}
              </Text>
              <Text className="text-md text-white font-semibold">
                INTERVALS
              </Text>
            </View>

            {/* Remaining */}
            <View className="flex items-center">
              <Text className="text-2xl text-white font-bold">
                {formatTotalTime(totalRemainingSeconds)}
              </Text>
              <Text className="text-md text-white font-semibold">
                REMAINING
              </Text>
            </View>

            {/* Rounds */}
            <View className="flex items-center">
              <Text className="text-2xl text-white font-bold">
                {`${curRepetition} / ${intervals[currentIntervalIndex].repetitions}`}
              </Text>
              <Text className="text-md text-white font-semibold">ROUNDS</Text>
            </View>
          </View>
        </Card>

        <View className="flex flex-row justify-between mt-16 px-5 items-center gap-4">
          <TouchableOpacity
            onPress={handleNextTimer}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 15,
            }}
            className="flex flex-col items-center justify-center w-28 h-28 py-2"
            disabled={
              intervals[currentIntervalIndex].timers.length - 1 ===
              curTimerIndex
            }
          >
            <AntDesign name="stepforward" size={28} color="#fff" />
            <Text className="text-md text-white font-semibold">NEXT</Text>
            <Text className="text-md text-white font-semibold">TIMER</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePlayPause}
            style={{
              borderRadius: 15,
            }}
            className="flex w-28 py-2 h-28 items-center justify-center bg-white"
          >
            <AntDesign
              name={isPlaying ? 'pause' : 'caretright'}
              size={28}
              color="#FF7F50"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNextInterval}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 15,
            }}
            className="flex flex-col items-center justify-center py-2 w-28 h-28"
          >
            <AntDesign name="forward" size={28} color="#fff" />
            <Text className="text-md text-white font-semibold">
              {currentIntervalIndex === intervals.length - 1
                ? 'FINISH'
                : 'NEXT'}
            </Text>
            <Text className="text-md text-white font-semibold">
              {currentIntervalIndex === intervals.length - 1
                ? 'WORKOUT'
                : 'INTERVAL'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PlayWorkout;
