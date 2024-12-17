// External Dependencies
import { TouchableOpacity, View } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { useLocalSearchParams } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

// Internal Dependencies
import { Interval, Timer } from '~/lib/types';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';

const PlayWorkout = () => {
  const { intervalInfo } = useLocalSearchParams<{ intervalInfo: string }>();

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

  const handleComplete = () => {
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
          // Some logic to handle the end of the workout
        }
      }
    }
  };

  const handleNext = useCallback(() => {
    if (currentIntervalIndex < intervals.length - 1) {
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
    return <Text>{`${minutes}:${seconds.toString().padStart(2, '0')}`}</Text>;
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
      }}
    >
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Text>
          Interval {currentIntervalIndex + 1} of {intervals.length}
        </Text>
        <Text>
          Timer {curTimerIndex + 1} of {curTimers.length}
        </Text>
        <Text>
          {curTimers[curTimerIndex]?.minutes}:
          {curTimers[curTimerIndex]?.seconds.toString().padStart(2, '0')}
        </Text>
        <Text>
          Repetition {curRepetition} of{' '}
          {intervals[currentIntervalIndex]?.repetitions}
        </Text>
      </View>

      <View style={{ alignItems: 'center', gap: 16 }}>
        <CountdownCircleTimer
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
          onComplete={handleComplete}
        >
          {({ remainingTime }) => formatTime(remainingTime)}
        </CountdownCircleTimer>

        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <TouchableOpacity onPress={handlePlayPause}>
            <AntDesign
              name={isPlaying ? 'pausecircle' : 'playcircleo'}
              size={28}
              color="#000"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNextTimer}
            disabled={curTimerIndex >= curTimers.length - 1}
            style={{ opacity: curTimerIndex >= curTimers.length - 1 ? 0.5 : 1 }}
          >
            <AntDesign name="stepforward" size={28} color="#000" />
          </TouchableOpacity>

          <Button
            onPress={handleNext}
            disabled={currentIntervalIndex === intervals.length - 1}
            style={{ paddingHorizontal: 20 }}
          >
            <Text>Next Interval</Text>
          </Button>
        </View>
      </View>
    </View>
  );
};

export default PlayWorkout;
