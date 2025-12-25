import { Feather, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRestaurants } from "../hooks/useRestaurants";
import { apiService } from "../utils/api";
import { USE_MOCK_DATA, mockRestaurants } from "../utils/mockData";

export default function PopularObjects() {
  const router = useRouter();
  const { restaurants, loading } = useRestaurants({ limit: 10 });
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    setLikedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const navigateToRestaurant = (restaurantId: string) => {
    router.push({
      pathname: "/(tabs)/restaurant",
      params: { restaurantId },
    });
  };

  // Filter active restaurants and sort by rating (popular)
  // Use mock data directly if no restaurants from API
  const restaurantsToUse =
    restaurants.length > 0
      ? restaurants
      : USE_MOCK_DATA || apiService.isUsingMockData()
      ? mockRestaurants
      : [];

  const popularRestaurants = restaurantsToUse
    .filter((r) => r.isActive !== false) // Allow undefined as true
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);

  if (loading && popularRestaurants.length === 0) {
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

  // Check if restaurant has discount
  const hasDiscount = (restaurant: any) => {
    return restaurant.discountedDeliveryFee !== undefined;
  };

  return (
    <View style={styles.popularContainer}>
      <View style={styles.popularHeader}>
        <Text style={styles.popularTitle}>პოპულარული ობიექტები</Text>
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={() => router.push("/(tabs)/restaurants")}
        >
          <Text style={styles.seeAllText}>
            სრულად <Feather name="arrow-right" size={14} color="#4CAF50" />
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.popularScrollContent}
      >
        {popularRestaurants.map((restaurant) => {
          const isLiked = likedItems.has(restaurant._id || restaurant.id || "");
          const showDiscount = hasDiscount(restaurant);

          return (
          <TouchableOpacity
            key={restaurant._id || restaurant.id}
            style={styles.popularCard}
              activeOpacity={0.9}
              onPress={() =>
                navigateToRestaurant(restaurant._id || restaurant.id || "")
              }
          >
            {/* Image Section */}
            <View style={styles.imageContainer}>
              <Image
                source={
                  typeof restaurant.image === "string"
                    ? { uri: restaurant.image }
                      : restaurant.image ||
                        require("../assets/images/magnolia.png")
                }
                style={styles.cardImage}
                  resizeMode="cover"
              />

                {/* Delivery Time Badge with Blur */}
                <View style={styles.deliveryTimeBadgeWrapper}>
                  {Platform.OS === "ios" ? (
                    <BlurView
                      intensity={50}
                      tint="dark"
                      style={styles.deliveryTimeBadge}
                    >
                      <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.deliveryTimeText}>
                        {restaurant.deliveryTime} წუთი
                      </Text>
                    </BlurView>
                  ) : (
                    <View style={styles.deliveryTimeBadgeAndroid}>
                      <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                <Text style={styles.deliveryTimeText}>
                        {restaurant.deliveryTime} წუთი
                </Text>
                    </View>
                  )}
              </View>

                {/* Heart Button */}
              <TouchableOpacity
                  style={[
                    styles.likeButton,
                    isLiked && styles.likeButtonActive,
                  ]}
                  onPress={() =>
                    toggleLike(restaurant._id || restaurant.id || "")
                  }
                  activeOpacity={0.8}
                >
                  {isLiked ? (
                    <Ionicons name="heart" size={20} color="#FF3B30" />
                ) : (
                    <Ionicons name="heart-outline" size={20} color="#666666" />
                )}
              </TouchableOpacity>
            </View>

            {/* Bottom Section */}
            <View style={styles.cardBottomSection}>
                <Text style={styles.restaurantName} numberOfLines={1}>
                  {restaurant.name}
                </Text>
                <Text style={styles.restaurantCategory} numberOfLines={1}>
                {restaurant.cuisine && restaurant.cuisine.length > 0
                  ? restaurant.cuisine[0]
                  : "რესტორანი"}
              </Text>

              {/* Dashed Line */}
                <View style={styles.dashedLineContainer}>
              <View style={styles.dashedLine} />
                </View>

              {/* Delivery and Rating Info */}
              <View style={styles.bottomInfo}>
                <View style={styles.deliveryInfo}>
                    <Ionicons
                      name="bicycle-outline"
                      size={14}
                      color="#9B9B9B"
                    />
                    {showDiscount ? (
                      <View style={styles.priceContainer}>
                        <Text style={styles.oldPrice}>
                          {restaurant.deliveryFee.toFixed(2)}₾
                        </Text>
                        <Text style={styles.discountedPrice}>
                          {restaurant.discountedDeliveryFee === 0
                            ? "0,00"
                            : restaurant.discountedDeliveryFee?.toFixed(2)}
                        </Text>
                      </View>
                    ) : (
                  <Text style={styles.deliveryText}>
                    {restaurant.deliveryFee.toFixed(2)}₾
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#181B1A",
  },
  seeAllButton: {
    backgroundColor: "#EFFBF5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
    lineHeight: 17,
  },
  popularScrollContent: {
    paddingHorizontal: 20,
  },
  popularCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginRight: 16,
    width: 200,
    overflow: "hidden",
    // Shadow for card
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.05)",
  },
  imageContainer: {
    position: "relative",
    height: 140,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  // Delivery Time Badge
  deliveryTimeBadgeWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    // borderRadius: 20,
    color: "white",
    overflow: "hidden",
    // Shadow for badge
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  deliveryTimeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: "hidden",
  },
  deliveryTimeBadgeAndroid: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  deliveryTimeText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginLeft: 6,
    fontWeight: "600",
  },
  // Like Button
  likeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    // Shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  likeButtonActive: {
    backgroundColor: "#FFF0F0",
  },
  // Bottom Section
  cardBottomSection: {
    padding: 14,
    backgroundColor: "#FFFFFF",
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  restaurantCategory: {
    fontSize: 14,
    color: "#8A8A8A",
    marginBottom: 12,
  },
  // Dashed Line
  dashedLineContainer: {
    marginBottom: 12,
  },
  dashedLine: {
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 1,
  },
  // Bottom Info
  bottomInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryText: {
    fontSize: 13,
    color: "#9B9B9B",
    marginLeft: 6,
    fontWeight: "500",
  },
  // Price with discount
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 6,
  },
  oldPrice: {
    fontSize: 13,
    color: "#9B9B9B",
    fontWeight: "500",
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
    marginRight: 6,
  },
  discountedPrice: {
    fontSize: 13,
    color: "#FF3B30",
    fontWeight: "600",
  },
  // Rating
  ratingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 13,
    color: "#333333",
    marginLeft: 4,
    fontWeight: "500",
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
