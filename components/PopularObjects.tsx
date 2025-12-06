import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useRestaurants } from "../hooks/useRestaurants";

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
      pathname: "/screens/restaurant",
      params: { restaurantId },
    });
  };

  // Filter active restaurants and sort by rating (popular)
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
          style={{
            backgroundColor: "#EFFBF5",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
          }}
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
        {popularRestaurants.map((restaurant) => (
          <TouchableOpacity
            key={restaurant._id || restaurant.id}
            style={styles.popularCard}
            onPress={() => navigateToRestaurant(restaurant._id || restaurant.id || "")}
          >
            {/* Image Section */}
            <View style={styles.imageContainer}>
              <Image
                source={
                  typeof restaurant.image === "string"
                    ? { uri: restaurant.image }
                    : restaurant.image || require("../assets/images/magnolia.png")
                }
                style={styles.cardImage}
              />

              {/* Delivery Time Overlay */}
              <View style={styles.deliveryTimeOverlay}>
                <Ionicons name="time-outline" size={12} color="#666666" />
                <Text style={styles.deliveryTimeText}>
                  {restaurant.deliveryTime} წთ
                </Text>
              </View>

              {/* Like Button */}
              <TouchableOpacity
                style={styles.likeButton}
                onPress={() => toggleLike(restaurant._id || restaurant.id || "")}
              >
                {likedItems.has(restaurant._id || restaurant.id || "") ? (
                  <Feather name="heart" size={20} color="#FF3B30" />
                ) : (
                  <Feather name="heart" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>

            {/* Bottom Section */}
            <View style={styles.cardBottomSection}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              <Text style={styles.restaurantCategory}>
                {restaurant.cuisine && restaurant.cuisine.length > 0
                  ? restaurant.cuisine[0]
                  : "რესტორანი"}
              </Text>

              {/* Dashed Line */}
              <View style={styles.dashedLine} />

              {/* Delivery and Rating Info */}
              <View style={styles.bottomInfo}>
                <View style={styles.deliveryInfo}>
                  <Ionicons name="car-outline" size={12} color="#9B9B9B" />
                  <Text style={styles.deliveryText}>
                    {restaurant.deliveryFee.toFixed(2)}₾
                  </Text>
                </View>
                <View style={styles.ratingInfo}>
                  <Ionicons name="star" size={12} color="#FFD700" />
                  <Text style={styles.ratingText}>
                    {restaurant.rating.toFixed(1)} ({restaurant.reviewCount})
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: "#B3B3B3",
    marginRight: 16,
    width: 200,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: 140,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    // resizeMode: "cover",
  },
  deliveryTimeOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryTimeText: {
    fontSize: 12,
    color: "#666666",
    marginLeft: 4,
    fontWeight: "500",
  },
  likeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "transparent",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  cardBottomSection: {
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 2,
  },
  restaurantCategory: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
  },
  dashedLine: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginBottom: 12,
    borderStyle: "dashed",
  },
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
    fontSize: 12,
    color: "#9B9B9B",
    marginLeft: 4,
    fontWeight: "500",
  },
  ratingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: "#333333",
    marginLeft: 4,
    fontWeight: "500",
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
