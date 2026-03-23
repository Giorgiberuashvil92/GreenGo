import { fontFamily } from "@/constants/fonts";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRestaurants } from "../hooks/useRestaurants";

const CARD_WIDTH = 250;
const CARD_HEIGHT = 200;
/** სურათის ზონა 100px; დანარჩენი სიმაღლე — ქვედა პლატფორმა (ტექსტი, ხაზი, ფუტერი) */
const IMAGE_HEIGHT = 120;

function DashedSeparator() {
  const n = 26;
  return (
    <View style={styles.dashRow}>
      {Array.from({ length: n }).map((_, i) => (
        <View key={i} style={styles.dashDot} />
      ))}
    </View>
  );
}

function formatDeliveryRange(deliveryTime: string | number): string {
  const minutes =
    typeof deliveryTime === "number"
      ? deliveryTime
      : parseInt(String(deliveryTime).replace(/\D/g, ""), 10) || 25;
  const lo = Math.max(15, minutes - 5);
  const hi = minutes + 5;
  return `${lo}–${hi} წთ`;
}

export default function PopularObjects() {
  const router = useRouter();
  const { restaurants, loading } = useRestaurants({ limit: 10 });
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    setLikedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
          const liked = likedItems.has(id);
          const fee = restaurant.deliveryFee;
          const freeDelivery = fee <= 0;

          return (
            <View key={id} style={styles.popularCard}>
              <View style={styles.imageContainer}>
                <TouchableOpacity
                  activeOpacity={0.92}
                  onPress={() => navigateToRestaurant(id)}
                  style={StyleSheet.absoluteFill}
                >
                  <Image
                    source={
                      typeof restaurant.image === "string"
                        ? { uri: restaurant.image }
                        : restaurant.image ||
                          require("../assets/images/magnolia.png")
                    }
                    style={styles.cardImage}
                  />
                </TouchableOpacity>

                <View style={styles.deliveryTimeBadge} pointerEvents="none">
                  <Ionicons name="time-outline" size={12} color="#FFFFFF" />
                  <Text style={styles.deliveryTimeBadgeText}>
                    {formatDeliveryRange(restaurant.deliveryTime)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.likeButton}
                  onPress={() => toggleLike(id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={liked ? "heart" : "heart-outline"}
                    size={18}
                    color={liked ? "#FF3B30" : "#8E8E93"}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.cardBottomSection}
                activeOpacity={0.92}
                onPress={() => navigateToRestaurant(id)}
              >
                <Text style={styles.restaurantName} numberOfLines={1}>
                  {restaurant.name}
                </Text>
                <Text style={styles.restaurantCategory} numberOfLines={1}>
                  {restaurant.cuisine && restaurant.cuisine.length > 0
                    ? restaurant.cuisine[0]
                    : "რესტორანი"}
                </Text>

                <DashedSeparator />

                <View style={styles.bottomInfo}>
                  <View style={styles.deliveryInfo}>
                    <MaterialIcons
                      name="local-shipping"
                      size={14}
                      color="#9B9B9B"
                    />
                    {freeDelivery ? (
                      <View style={styles.deliveryPriceRow}>
                        <Text style={styles.deliveryStrike}>4,99₾</Text>
                        <Text style={styles.deliveryPromo}> 0,00₾</Text>
                      </View>
                    ) : (
                      <Text style={styles.deliveryText}>
                        {fee.toFixed(2).replace(".", ",")}₾
                      </Text>
                    )}
                  </View>
                  <View style={styles.ratingInfo}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>
                      {restaurant.rating.toFixed(1)} ({restaurant.reviewCount})
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
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
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
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
    fontFamily: fontFamily.semiBold,
    lineHeight: 14,
    textAlign: "center",
  },
  popularScrollContent: {
    paddingHorizontal: 20,
  },
  popularCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginRight: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
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
  deliveryTimeBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },
  deliveryTimeBadgeText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontFamily: fontFamily.medium,
  },
  likeButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  cardBottomSection: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  restaurantName: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: "#000000",
    marginBottom: 4,
    paddingHorizontal: 2,
    lineHeight: 18,
  },
  restaurantCategory: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: "#9E9E9E",
    marginBottom: 6,
    paddingHorizontal: 2,
    lineHeight: 15,
  },
  dashRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    marginHorizontal: 2,
    overflow: "hidden",
  },
  dashDot: {
    width: 3,
    height: 1,
    borderRadius: 0.5,
    backgroundColor: "#D1D5DB",
  },
  bottomInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 2,
    paddingTop: 2,
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
    paddingVertical: 2,
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
    color: "#EF4444",
    textDecorationLine: "line-through",
  },
  deliveryPromo: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: "#EF4444",
  },
  ratingInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
    paddingLeft: 2,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: "#000000",
    marginLeft: 4,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
