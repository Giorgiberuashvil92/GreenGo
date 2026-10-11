import LottieView from "lottie-react-native";
import React, { useRef } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

type CourierLottieLogoProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
  autoPlay?: boolean;
  loop?: boolean;
};

export function CourierLottieLogo({
  size = 120,
  style,
  autoPlay = true,
  loop = true,
}: CourierLottieLogoProps) {
  const animationRef = useRef<LottieView>(null);

  return (
    <View style={[{ width: size, height: size }, style]}>
      <LottieView
        ref={animationRef}
        source={require("../assets/lottie/courier-logo.json")}
        autoPlay={autoPlay}
        loop={loop}
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  animation: {
    width: "100%",
    height: "100%",
  },
});
