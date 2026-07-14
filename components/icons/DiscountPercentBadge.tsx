import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

type Tone = "red" | "pink" | "green";

const TONE_COLORS: Record<Tone, { outer: string; inner: string }> = {
  red: { outer: "#E31C23", inner: "#C41018" },
  pink: { outer: "#FF8A95", inner: "#FF6B7A" },
  green: { outer: "#7DCFB6", inner: "#5BBF9E" },
};

/** ფასდაკლების seal-აიქონი — დიზაინის % ბეჯი */
export default function DiscountPercentBadge({
  size = 40,
  tone = "red",
}: {
  size?: number;
  tone?: Tone;
}) {
  const colors = TONE_COLORS[tone];

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <Path
          d="M20 2l1.6 2.6 2.9-.6 1.1 2.8 2.8.9-.2 3 2.6 1.6-1.6 2.6.2 3-2.8.9-1.1 2.8-2.9-.6L20 38l-1.6-2.6-2.9.6-1.1-2.8-2.8-.9.2-3L9.2 27.7l1.6-2.6-.2-3 2.8-.9 1.1-2.8 2.9.6L20 2z"
          fill={colors.outer}
        />
        <Circle cx="20" cy="20" r="12" fill={colors.inner} />
      </Svg>
      <View
        style={[StyleSheet.absoluteFill, styles.center]}
        pointerEvents="none"
      >
        <Text style={[styles.pct, { fontSize: size * 0.38 }]}>%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  pct: {
    color: "#FFFFFF",
    fontWeight: "700",
    includeFontPadding: false,
  },
});
