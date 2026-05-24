import type { PaymentCardType } from "@/utils/payment";
import React from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

type CardBrandIconProps = {
  type: PaymentCardType;
  width?: number;
  height?: number;
};

const BRAND_IMAGES: Partial<
  Record<PaymentCardType, ImageSourcePropType>
> = {
  visa: require("@/assets/images/card-visa.png"),
  amex: require("@/assets/images/card-amex.png"),
};

function MastercardIcon({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 48 30" fill="none">
      <Circle cx={18} cy={15} r={10} fill="#EB001B" />
      <Circle cx={30} cy={15} r={10} fill="#F79E1B" />
    </Svg>
  );
}

export default function CardBrandIcon({
  type,
  width = 40,
  height = 24,
}: CardBrandIconProps) {
  const source = BRAND_IMAGES[type];
  if (source) {
    return (
      <Image
        source={source}
        style={[styles.image, { width, height }]}
        resizeMode="contain"
      />
    );
  }

  if (type === "mastercard") {
    return <MastercardIcon width={width} height={height} />;
  }

  return <MastercardIcon width={width} height={height} />;
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 2,
  },
});
