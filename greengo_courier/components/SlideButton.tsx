import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import { Animated, PanResponder, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Status } from "../types";
import { AnimatedText } from "./AnimatedText";

interface SlideButtonProps {
  status: Status;
  onToggle: () => void;
  slideWidth: number;
  buttonWidth: number;
  maxTranslateX: number;
}

export const SlideButton: React.FC<SlideButtonProps> = ({
  status,
  onToggle,
  slideWidth,
  buttonWidth,
  maxTranslateX,
}) => {
  const [slideValue] = React.useState(new Animated.Value(0));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        slideValue.setOffset((slideValue as any)._value);
        slideValue.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        const currentValue = (slideValue as any)._offset + gestureState.dx;
        const clampedValue = Math.max(0, Math.min(maxTranslateX, currentValue));
        slideValue.setValue(clampedValue - (slideValue as any)._offset);
      },
      onPanResponderRelease: (_, gestureState) => {
        slideValue.flattenOffset();
        const currentValue =
          (slideValue as any)._value + (slideValue as any)._offset;

        if (gestureState.dx > 50 || currentValue > maxTranslateX / 2) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Animated.spring(slideValue, {
            toValue: maxTranslateX,
            useNativeDriver: false,
            tension: 50,
            friction: 7,
          }).start(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onToggle();
          });
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Animated.spring(slideValue, {
            toValue: 0,
            useNativeDriver: false,
            tension: 50,
            friction: 7,
          }).start();
        }
      },
    })
  ).current;

  const translateX = slideValue.interpolate({
    inputRange: [0, maxTranslateX],
    outputRange: [0, maxTranslateX],
    extrapolate: "clamp",
  });

  const handlePress = () => {
    if (status === "offline") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Animated.spring(slideValue, {
        toValue: maxTranslateX,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }).start(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onToggle();
      });
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.spring(slideValue, {
        toValue: 0,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }).start(() => {
        onToggle();
      });
    }
  };

  if (status !== "offline") return null;

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <AnimatedText
          text="გადადით ონლაინ რეჟიმში"
          slideValue={slideValue}
          maxTranslateX={maxTranslateX}
        />
      </View>
      <Animated.View
        style={[styles.track, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={handlePress}
          activeOpacity={0.9}
        >
          <Ionicons name="chevron-forward" size={28} color="#4CAF50" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    borderRadius: 32,
    backgroundColor: "#4CAF50",
    overflow: "hidden",
    position: "relative",
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  textContainer: {
    position: "absolute",
    top: 0,
    left: Platform.OS === "ios" ? 0 : 30,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
    elevation: Platform.OS === "android" ? 2 : 0,
  },
  track: {
    position: "absolute",
    left: 6,
    top: 6,
    bottom: 6,
    width: 52,
    zIndex: 1,
    elevation: Platform.OS === "android" ? 1 : 0,
  },
  button: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});

