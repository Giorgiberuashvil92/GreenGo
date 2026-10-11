import { fontFamily } from "@/constants/fonts";
import type { RestaurantOffer } from "@/utils/restaurantOffers";
import { offerSubtitle } from "@/utils/restaurantOffers";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import OfferCouponIcon from "./icons/OfferCouponIcon";

type OfferBottomBarProps = {
  offer: RestaurantOffer;
  onPress?: (offer: RestaurantOffer) => void;
};

export default function OfferBottomBar({ offer, onPress }: OfferBottomBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <TouchableOpacity
        style={styles.pill}
        onPress={() => onPress?.(offer)}
        activeOpacity={0.92}
        accessibilityRole="button"
        accessibilityLabel={offer.title}
      >
        <View style={styles.inner}>
          <OfferCouponIcon size={24} />
          <View style={styles.textCol}>
            <Text style={styles.title} numberOfLines={1}>
              {offer.title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {offerSubtitle(offer)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 0,
    paddingTop: 8,
    backgroundColor: "transparent",
    zIndex: 15,
  },
  pill: {
    width: "100%",
    height: 46,
    minHeight: 46,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 60,
    backgroundColor: "rgba(29, 64, 69, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
    height: 30,
  },
  textCol: {
    flex: 1,
    height: 30,
    justifyContent: "center",
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    lineHeight: 16,
    color: "#FFFFFF",
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 14,
    color: "#E0E0E0",
  },
});
