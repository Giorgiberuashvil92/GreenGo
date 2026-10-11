import React from "react";
import { Image, StyleSheet, View } from "react-native";

/** შეთავაზების პროცენტის ბეჯი — დიზაინის 40×40 აქტივი */
export default function DiscountPercentBadge({
  size = 40,
}: {
  size?: number;
  /** tone აღარ გამოიყენება — ერთი დიზაინის აქტივია */
  tone?: "red" | "pink" | "green";
}) {
  return (
    <View style={{ width: size, height: size }}>
      <Image
        source={require("../../assets/images/discount-percent-40.png")}
        style={[styles.image, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 40,
    height: 40,
  },
});
