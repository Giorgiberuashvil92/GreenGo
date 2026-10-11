import { useState, useMemo } from "react";
import { Animated } from "react-native";
import { useWindowDimensions } from "react-native";

export const useDrawer = () => {
  const { width } = useWindowDimensions();
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggle = () => {
    const toValue = isOpen ? 0 : 1;
    setIsOpen(!isOpen);

    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const close = () => {
    setIsOpen(false);
    Animated.spring(animation, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const translateX = useMemo(
    () =>
      animation.interpolate({
        inputRange: [0, 1],
        outputRange: [-width * 0.85, 0],
      }),
    [animation, width]
  );

  const overlayOpacity = useMemo(
    () =>
      animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
      }),
    [animation]
  );

  return {
    isOpen,
    translateX,
    overlayOpacity,
    toggle,
    close,
  };
};

