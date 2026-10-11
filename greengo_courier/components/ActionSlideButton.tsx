import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Colors } from "../constants/colors";
import { Dimensions as Dims } from "../constants/dimensions";

interface ActionSlideButtonProps {
  label: string;
  onConfirm: () => void;
  disabled?: boolean;
  style?: object;
}

export const ActionSlideButton: React.FC<ActionSlideButtonProps> = ({
  label,
  onConfirm,
  disabled = false,
  style,
}) => {
  const { width } = useWindowDimensions();
  const slideWidth = width - Dims.padding.screen * 2;
  const buttonWidth = Dims.slideButton.width;
  const maxTranslateX =
    slideWidth - buttonWidth - Dims.slideButton.padding * 2;

  const [slideValue] = useState(new Animated.Value(0));
  const completedRef = useRef(false);
  const maxTranslateRef = useRef(maxTranslateX);
  const disabledRef = useRef(disabled);
  const onConfirmRef = useRef(onConfirm);

  maxTranslateRef.current = maxTranslateX;
  disabledRef.current = disabled;
  onConfirmRef.current = onConfirm;

  useEffect(() => {
    completedRef.current = false;
    slideValue.setValue(0);
  }, [label, disabled, slideValue]);

  const reset = () => {
    completedRef.current = false;
    Animated.spring(slideValue, {
      toValue: 0,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  };

  const complete = () => {
    if (completedRef.current || disabledRef.current) return;
    completedRef.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirmRef.current();
    setTimeout(reset, 400);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabledRef.current,
      onMoveShouldSetPanResponder: () => !disabledRef.current,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        if (disabledRef.current) return;
        slideValue.setOffset((slideValue as any)._value || 0);
        slideValue.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (disabledRef.current) return;
        const currentValue =
          ((slideValue as any)._offset || 0) + gestureState.dx;
        const maxX = maxTranslateRef.current;
        const clampedValue = Math.max(0, Math.min(maxX, currentValue));
        slideValue.setValue(
          clampedValue - ((slideValue as any)._offset || 0),
        );
      },
      onPanResponderRelease: (_, gestureState) => {
        if (disabledRef.current) return;
        slideValue.flattenOffset();
        const currentValue = (slideValue as any)._value || 0;
        const maxX = maxTranslateRef.current;

        if (gestureState.dx > 50 || currentValue > maxX / 2) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Animated.spring(slideValue, {
            toValue: maxX,
            useNativeDriver: false,
            tension: 50,
            friction: 7,
          }).start(complete);
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
    }),
  ).current;

  const translateX = slideValue.interpolate({
    inputRange: [0, Math.max(maxTranslateX, 1)],
    outputRange: [0, Math.max(maxTranslateX, 1)],
    extrapolate: "clamp",
  });

  return (
    <View
      style={[styles.container, disabled && styles.containerDisabled, style]}
      pointerEvents={disabled ? "none" : "auto"}
    >
      <View style={styles.textContainer}>
        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          {label}
        </Text>
      </View>
      <Animated.View
        style={[styles.track, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.button}>
          <Ionicons
            name="chevron-forward"
            size={28}
            color={disabled ? Colors.gray.medium : Colors.primary}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    overflow: "hidden",
    position: "relative",
    marginTop: Dims.padding.large,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  containerDisabled: {
    backgroundColor: "#CCCCCC",
    shadowOpacity: 0,
    elevation: 0,
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
  },
  label: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  labelDisabled: {
    color: "#F5F5F5",
  },
  track: {
    position: "absolute",
    left: 6,
    top: 6,
    bottom: 6,
    width: 52,
    zIndex: 1,
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
