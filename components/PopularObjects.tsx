import { fontFamily } from "@/constants/fonts";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { type ReactNode } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import PromosIcon from "@/components/icons/PromosIcon";
import { useRestaurants } from "../hooks/useRestaurants";

const CARD_WIDTH = 180;
const IMAGE_HEIGHT = 100;

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

function formatDeliveryTimeLabel(deliveryTime: string | number): string {
  if (typeof deliveryTime === "string") {
    const range = deliveryTime.match(/(\d+)\s*[-–]\s*(\d+)/);
    if (range) {
      return `${range[1]}-${range[2]} წუთი`;
    }
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

function GlassBadge({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.glassBadge, style]} pointerEvents="none">
      <BlurView intensity={16} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.glassBadgeOverlay} />
      <View style={styles.badgeContent}>{children}</View>
    </View>
  );
}

function PromoBadge({ label }: { label: string }) {
  return (
    <View style={styles.promoBadge} pointerEvents="none">
      <BlurView intensity={8} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.promoBadgeOverlay} />
      <View style={styles.badgeContent}>
        <PromosIcon />
        <Text style={styles.promoBadgeText}>{label}</Text>
      </View>
    </View>
  );
}

export default function PopularObjects() {
  const router = useRouter();
  const { restaurants, loading } = useRestaurants({ limit: 10 });

  const navigateToRestaurant = (restaurantId: string) => {
    router.push({
      pathname: "/screens/restaurant",
      params: { restaurantId },
    });
  };

  const popularRestaurants = restaurants
    .filter((r) => r.isActive)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);

  if (loading) {
    return (
      <View style={styles.popularContainer}>
        <View style={styles.popularHeader}>
          <Text style={styles.popularTitle}>პოპულარული ობიექტები</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4CAF50" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.popularContainer}>
      <View style={styles.popularHeader}>
        <Text style={styles.popularTitle}>პოპულარული ობიექტები</Text>
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={() => router.push("/(tabs)/restaurants")}
        >
          <Text style={styles.seeAllText}>
            სრულად <Feather name="arrow-right" size={10} color="#2E7354" />
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.popularScrollContent}
      >
        {popularRestaurants.map((restaurant) => {
          const id = restaurant._id || restaurant.id || "";
          const fee = restaurant.deliveryFee;
          const promoLabel = getPromoLabel(restaurant);

          return (
            <TouchableOpacity
              key={id}
              style={styles.popularCard}
              activeOpacity={0.92}
              onPress={() => navigateToRestaurant(id)}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={
                    typeof restaurant.image === "string"
                      ? { uri: restaurant.image }
                      : restaurant.image ||
                        require("../assets/images/magnolia.png")
                  }
                  style={styles.cardImage}
                />

                <GlassBadge style={styles.glassBadgeLeft}>
                  <Ionicons name="time-outline" size={11} color="#FFFFFF" />
                  <Text style={styles.badgeText}>
                    {formatDeliveryTimeLabel(restaurant.deliveryTime)}
                  </Text>
                </GlassBadge>

                {promoLabel ? <PromoBadge label={promoLabel} /> : null}
              </View>

              <View style={styles.cardBottomSection}>
                <Text style={styles.restaurantName} numberOfLines={1}>
                  {restaurant.name}
                </Text>
                <Text style={styles.restaurantCategory} numberOfLines={1}>
                  {restaurant.cuisine?.length
                    ? restaurant.cuisine[0]
                    : "რესტორანი"}
                </Text>

                <DashedSeparator />

                <View style={styles.bottomInfo}>
                  <View style={styles.deliveryInfo}>
                    <MaterialIcons
                      name="two-wheeler"
                      size={15}
                      color="#9B9B9B"
                    />
                    {fee <= 0 ? (
                      <View style={styles.deliveryPriceRow}>
                        <Text style={styles.deliveryStrike}>
                          {formatGel(4.99)}
                        </Text>
                        <Text style={styles.deliveryPromo}>
                          {" "}
                          {formatGel(0)}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.deliveryText}>{formatGel(fee)}</Text>
                    )}
                  </View>

                  <View style={styles.ratingInfo}>
                    <Ionicons name="star" size={14} color="#F5B800" />
                    <Text style={styles.ratingValue}>
                      {restaurant.rating.toFixed(1)}
                    </Text>
                    <Text style={styles.reviewCount}>
                      {" "}
                      ({restaurant.reviewCount})
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  popularContainer: {
    marginBottom: 40,
  },
  popularHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  popularTitle: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    textTransform: "uppercase",
    lineHeight: 20,
    color: "#181B1A",
  },
  seeAllButton: {
    backgroundColor: "#EFFBF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    width: 80,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  seeAllText: {
    fontSize: 10,
    color: "#2E7354",
    fontFamily: fontFamily.medium,
    textTransform: "uppercase",
    lineHeight: 14,
    textAlign: "center",
  },
  popularScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  popularCard: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EBEBEB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: "#F3F4F6",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  glassBadge: {
    position: "absolute",
    top: 4,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    zIndex: 3,
  },
  glassBadgeLeft: {
    left: 4,
  },
  glassBadgeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  promoBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    flexDirection: "row",
    alignItems: "center",
    height: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(235, 0, 0, 0.5)",
    zIndex: 5,
  },
  promoBadgeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(235, 0, 0, 0.5)",
  },
  badgeContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 12,
    color: "#FFFFFF",
    fontFamily: fontFamily.medium,
  },
  promoBadgeText: {
    fontSize: 8,
    lineHeight: 12,
    color: "#FFFFFF",
    fontFamily: fontFamily.bold,
  },
  cardBottomSection: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  restaurantName: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    textTransform: "uppercase",
    color: "#181B1A",
    marginBottom: 2,
    lineHeight: 20,
  },
  restaurantCategory: {
    fontSize: 8,
    fontFamily: fontFamily.medium,
    color: "#9E9E9E",
    marginBottom: 8,
    lineHeight: 15,
    textTransform: "uppercase",
  },
  dashRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  dashDot: {
    width: 3,
    height: 1,
    backgroundColor: "#D8D8D8",
  },
  bottomInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 6,
  },
  deliveryText: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: "#9B9B9B",
    marginLeft: 4,
  },
  deliveryPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
    flexShrink: 1,
  },
  deliveryStrike: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: "#9B9B9B",
    textDecorationLine: "line-through",
  },
  deliveryPromo: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: "#D94F3D",
  },
  ratingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  ratingValue: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: "#181B1A",
    marginLeft: 3,
  },
  reviewCount: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: "#9E9E9E",
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
