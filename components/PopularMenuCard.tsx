import { fontFamily } from "@/constants/fonts";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export const POPULAR_MENU_CARD_WIDTH = 140;
const POPULAR_MENU_IMAGE_HEIGHT = 80;
const POPULAR_MENU_IMAGE_RADIUS = 12;
const POPULAR_MENU_CARD_GAP = 12;

function formatPriceGel(n: number): string {
  return `${n.toFixed(2).replace(".", ",")}₾`;
}

function DashedLine() {
  return (
    <View style={styles.dashedLine}>
      {Array.from({ length: 18 }).map((_, index) => (
        <View key={index} style={styles.dashSegment} />
      ))}
    </View>
  );
}

export { POPULAR_MENU_CARD_GAP };

export default function PopularMenuCard({
  name,
  price,
  imageUri,
  onPress,
}: {
  name: string;
  price: number;
  imageUri?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}

      <View style={styles.textBlock}>
        <View style={styles.priceSection}>
          <Text style={styles.price}>{formatPriceGel(price)}</Text>
        </View>
        <DashedLine />
        <Text style={styles.description} numberOfLines={2}>
          {name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: POPULAR_MENU_CARD_WIDTH,
  },
  image: {
    width: POPULAR_MENU_CARD_WIDTH,
    height: POPULAR_MENU_IMAGE_HEIGHT,
    borderRadius: POPULAR_MENU_IMAGE_RADIUS,
    resizeMode: "cover",
    backgroundColor: "#D9D9D9",
  },
  imagePlaceholder: {
    backgroundColor: "#D9D9D9",
  },
  textBlock: {
    alignSelf: "stretch",
    marginTop: 8,
    gap: 4,
  },
  priceSection: {
    alignSelf: "stretch",
    paddingBottom: 4,
  },
  price: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.bold,
    color: "#1D4045",
    letterSpacing: 1,
  },
  dashedLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
    overflow: "hidden",
  },
  dashSegment: {
    width: 5,
    height: 1,
    backgroundColor: "#E0E0E0",
    borderRadius: 1,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.semiBold,
    color: "#666666",
    alignSelf: "stretch",
  },
});
