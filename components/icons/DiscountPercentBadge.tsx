import React from "react";
import { View } from "react-native";
import Svg, { Circle, Path, Text as SvgText } from "react-native-svg";

type Tone = "red" | "pink" | "green";

const TONE_COLORS: Record<Tone, { outer: string; inner: string }> = {
  red: { outer: "#E31C23", inner: "#C41018" },
  pink: { outer: "#E31C23", inner: "#C41018" },
  green: { outer: "#0B8068", inner: "#056653" },
};

/** შეთავაზების წითელი პროცენტის ბეჯი */
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
        <Circle cx="20" cy="20" r="12.5" fill={colors.inner} />
        <SvgText
          x="20"
          y="25"
          fill="#FFFFFF"
          fontSize="15"
          fontWeight="700"
          textAnchor="middle"
        >
          %
        </SvgText>
      </Svg>
    </View>
  );
}
