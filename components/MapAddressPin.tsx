import { BRAND_GREEN } from "@/constants/colors";
import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";

type MapAddressPinProps = {
  size?: number;
};

export default function MapAddressPin({ size = 48 }: MapAddressPinProps) {
  const height = Math.round(size * 1.22);

  return (
    <View style={[styles.wrap, { width: size, height: height + 6 }]}>
      <Svg width={size} height={height} viewBox="0 0 48 58" fill="none">
        <Defs>
          <LinearGradient id="pinGradient" x1="24" y1="4" x2="24" y2="52">
            <Stop offset="0" stopColor="#2F6B73" />
            <Stop offset="1" stopColor={BRAND_GREEN} />
          </LinearGradient>
        </Defs>

        <Ellipse cx="24" cy="55.5" rx="10" ry="2.8" fill="rgba(17,24,39,0.18)" />

        <Path
          d="M24 3C15.163 3 8 10.163 8 19C8 31.5 24 51 24 51C24 51 40 31.5 40 19C40 10.163 32.837 3 24 3Z"
          fill="url(#pinGradient)"
        />

        <Path
          d="M24 3C15.163 3 8 10.163 8 19C8 31.5 24 51 24 51C24 51 40 31.5 40 19C40 10.163 32.837 3 24 3Z"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={1.2}
        />

        <Circle cx="24" cy="19" r="8.5" fill="#FFFFFF" />
        <Circle cx="24" cy="19" r="4.5" fill={BRAND_GREEN} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
});
