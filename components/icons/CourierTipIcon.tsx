import React from "react";
import { Image, StyleSheet } from "react-native";

export default function CourierTipIcon({ size = 40 }: { size?: number }) {
  return (
    <Image
      source={require("../../assets/images/courier-tip.png")}
      style={[styles.icon, { width: size, height: size }]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  icon: {},
});
