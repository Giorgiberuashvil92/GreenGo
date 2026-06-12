import PromosIcon from "@/components/icons/PromosIcon";
import { fontFamily } from "@/constants/fonts";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { HomeSectionRestaurant } from "../hooks/useHomeSections";

const HORIZONTAL_PADDING = 16;
const CARD_GAP = 16;
const IMAGE_RADIUS = 16;
const IMAGE_WIDTH = 200;
const IMAGE_HEIGHT = 100;
const BADGE_ICON_SIZE = 12;

export const HOME_RESTAURANT_CARD_WIDTH = 200;
export const HOME_RESTAURANT_CARD_GAP = CARD_GAP;
export const HOME_RESTAURANT_CARD_PADDING = HORIZONTAL_PADDING;

function formatDeliveryTimeLabel(deliveryTime: string | number): string {
  if (typeof deliveryTime === "string") {
    const range = deliveryTime.match(/(\d+)\s*[-–]\s*(\d+)/);
    if (range) return `${range[1]}-${range[2]} წუთი`;
    const single = deliveryTime.match(/(\d+)/);
    if (single) {
      const m = parseInt(single[1], 10);
      return `${m}-${m + 10} წუთი`;
    }
  }
  const minutes =
    typeof deliveryTime === "number"
      ? deliveryTime
      : parseInt(String(deliveryTime).replace(/\D/g, ""), 10) || 25;
  const lo = Math.max(15, minutes - 5);
  const hi = minutes + 5;
  return `${lo}-${hi} წუთი`;
}

function formatGel(amount: number): string {
  return `${amount.toFixed(2).replace(".", ",")}₾`;
}

function getPromoLabel(restaurant: {
  deliveryFee: number;
  rating: number;
}): string | null {
  if (restaurant.deliveryFee <= 0) return "-100%";
  if (restaurant.rating >= 4.5) return "-20%";
  return null;
}

function DashedSeparator() {
  const n = 22;
  return (
    <View style={styles.dashRow}>
      {Array.from({ length: n }).map((_, i) => (
        <View key={i} style={styles.dashDot} />
      ))}
    </View>
  );
}

export default function HomeRestaurantCard({
  restaurant,
  onPress,
  width: widthProp,
}: {
  restaurant: HomeSectionRestaurant;
  onPress: () => void;
  width?: number;
}) {
  const width = widthProp ?? HOME_RESTAURANT_CARD_WIDTH;
  const promoLabel = getPromoLabel(restaurant);
  const fee = restaurant.deliveryFee;
  const imageSource =
    typeof restaurant.image === "string"
      ? { uri: restaurant.image }
      : restaurant.image || require("../assets/images/magnolia.png");

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={[styles.card, { width }]}
    >
      <ImageBackground
        source={imageSource}
        resizeMode="cover"
        imageStyle={styles.imageRadius}
        style={[styles.imageWrap, { width: IMAGE_WIDTH, height: IMAGE_HEIGHT }]}
      >
        <View style={styles.badgeRow}>
          <View style={styles.timeBadge}>
            <Ionicons
              name="time-outline"
              size={BADGE_ICON_SIZE}
              color="#FFFFFF"
            />
            <Text style={styles.badgeText}>
              {formatDeliveryTimeLabel(restaurant.deliveryTime)}
            </Text>
          </View>

          {promoLabel ? (
            <View style={styles.promoBadge}>
              <PromosIcon />
              <Text style={styles.badgeText}>{promoLabel}</Text>
            </View>
          ) : null}
        </View>
      </ImageBackground>

      <View style={styles.infoBlock}>
        <Text style={styles.name} numberOfLines={1}>
          {restaurant.name}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {restaurant.cuisine?.length ? restaurant.cuisine[0] : "რესტორანი"}
        </Text>
      </View>

      <DashedSeparator />

      <View style={styles.footerRow}>
        <View style={styles.deliveryInfo}>
          <MaterialIcons
            name="two-wheeler"
            size={BADGE_ICON_SIZE}
            color="#9B9B9B"
          />
          {fee <= 0 ? (
            <View style={styles.priceRow}>
              <Text style={styles.footerStrike}>{formatGel(4.99)}</Text>
              <Text style={styles.footerPromo}> {formatGel(0)}</Text>
            </View>
          ) : (
            <Text style={styles.footerMuted}>{formatGel(fee)}</Text>
          )}
        </View>

        <View style={styles.ratingInfo}>
          <Ionicons name="star" size={BADGE_ICON_SIZE} color="#F5B800" />
          <Text style={styles.ratingValue}>{restaurant.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}> ({restaurant.reviewCount})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingBottom: 8,
  },
  imageWrap: {
    marginBottom: 4,
    overflow: "hidden",
    borderRadius: IMAGE_RADIUS,
    justifyContent: "flex-start",
  },
  imageRadius: {
    borderRadius: IMAGE_RADIUS,
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 4,
    paddingHorizontal: 4,
    width: "100%",
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00000033",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  promoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EB000080",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontFamily: fontFamily.medium,
    lineHeight: 12,
  },
  infoBlock: {
    alignSelf: "flex-start",
    paddingBottom: 4,
    marginBottom: 4,
    width: "100%",
  },
  name: {
    color: "#181B1A",
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    textTransform: "uppercase",
    lineHeight: 20,
  },
  category: {
    color: "#9B9B9B",
    fontSize: 10,
    fontFamily: fontFamily.regular,
    lineHeight: 15,
    marginTop: 2,
  },
  dashRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    width: "100%",
    overflow: "hidden",
  },
  dashDot: {
    width: 3,
    height: 1,
    backgroundColor: "#D8D8D8",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: "100%",
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerMuted: {
    color: "#9B9B9B",
    fontSize: 10,
    fontFamily: fontFamily.medium,
    lineHeight: 15,
  },
  footerStrike: {
    textDecorationLine: "line-through",
    color: "#9B9B9B",
    fontSize: 10,
    fontFamily: fontFamily.medium,
    lineHeight: 15,
  },
  footerPromo: {
    color: "#D94F3D",
    fontSize: 10,
    fontFamily: fontFamily.bold,
    lineHeight: 15,
  },
  ratingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  ratingValue: {
    color: "#181B1A",
    fontSize: 10,
    fontFamily: fontFamily.bold,
    lineHeight: 15,
    marginLeft: 2,
  },
  reviewCount: {
    color: "#9B9B9B",
    fontSize: 10,
    fontFamily: fontFamily.medium,
    lineHeight: 15,
  },
});
