import { fontFamily } from "@/constants/fonts";
import type { RestaurantOffer } from "@/utils/restaurantOffers";
import { getOfferEligibleCount } from "@/utils/restaurantOffers";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DiscountPercentBadge from "./icons/DiscountPercentBadge";

const CARD_WIDTH = 250;
const CARD_HEIGHT = 72;
const NOTCH_SIZE = 14;
const OUTER_WIDTH = 262;
const CARD_INSET = 6;
const CARD_GAP = 12;

function DiscountTicket({
  offer,
  onPress,
}: {
  offer: RestaurantOffer;
  onPress?: (offer: RestaurantOffer) => void;
}) {
  const showDetails =
    offer.discountType === "percentage" && getOfferEligibleCount(offer) > 0;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress?.(offer)}
      style={styles.outer}
      accessibilityRole="button"
      accessibilityLabel={offer.title}
    >
      <View style={styles.card}>
        <View style={styles.row}>
          <DiscountPercentBadge size={40} />
          <View style={styles.textCol}>
            <Text
              style={styles.title}
              numberOfLines={showDetails ? 1 : 2}
            >
              {offer.title}
            </Text>
            {showDetails ? (
              <Text style={styles.details}>დეტალურად</Text>
            ) : null}
          </View>
        </View>
      </View>
      <View style={[styles.notch, styles.notchLeft]} pointerEvents="none" />
      <View style={[styles.notch, styles.notchRight]} pointerEvents="none" />
    </TouchableOpacity>
  );
}

export default function RestaurantDiscounts({
  offers,
  onOfferPress,
}: {
  offers: RestaurantOffer[];
  onOfferPress?: (offer: RestaurantOffer) => void;
}) {
  if (offers.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollInner}
      >
        {offers.map((offer, index) => (
          <View
            key={offer._id}
            style={index < offers.length - 1 ? styles.cardGap : undefined}
          >
            <DiscountTicket offer={offer} onPress={onOfferPress} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 20,
    marginBottom: 4,
  },
  scrollInner: {
    paddingLeft: 10,
    paddingRight: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cardGap: {
    marginRight: CARD_GAP,
  },
  outer: {
    width: OUTER_WIDTH,
    height: CARD_HEIGHT,
    position: "relative",
  },
  card: {
    position: "absolute",
    left: CARD_INSET,
    top: 0,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: "#450805",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textCol: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.17,
    color: "#FFFFFF",
  },
  details: {
    fontFamily: fontFamily.medium,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0.17,
    color: "#FF8081",
  },
  notch: {
    position: "absolute",
    width: NOTCH_SIZE,
    height: NOTCH_SIZE,
    borderRadius: NOTCH_SIZE / 2,
    backgroundColor: "#FFFFFF",
    top: (CARD_HEIGHT - NOTCH_SIZE) / 2,
  },
  notchLeft: {
    left: 0,
  },
  notchRight: {
    right: 0,
  },
});
