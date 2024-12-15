import React from 'react';
import { View, Modal, Pressable, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheet({
  isVisible,
  onClose,
  children,
}: BottomSheetProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/50" onPress={onClose}>
        <Animated.View
          className="bg-background rounded-t-3xl absolute bottom-0 w-full"
          style={{
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0],
                }),
              },
            ],
          }}
        >
          {children}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
