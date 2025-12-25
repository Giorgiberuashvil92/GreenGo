import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRestaurants } from "../../hooks/useRestaurants";
import { apiService } from "../../utils/api";
import { USE_MOCK_DATA, mockRestaurants } from "../../utils/mockData";

const RestaurantsScreen = () => {
  const router = useRouter();
  const { restaurants, loading, refetch } = useRestaurants();
  const [refreshing, setRefreshing] = useState(false);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

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

  // Use mock data if no restaurants from API
  const restaurantsToUse =
    restaurants.length > 0
      ? restaurants
      : USE_MOCK_DATA || apiService.isUsingMockData()
      ? mockRestaurants
      : [];

  const activeRestaurants = restaurantsToUse.filter((r) => r.isActive !== false);

  if (loading && activeRestaurants.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Text style={styles.title}>რესტორნები</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </SafeAreaView>
    );
  }

  const renderRestaurantCard = ({ item }: { item: any }) => {
    const isLiked = likedItems.has(item._id || item.id || "");
    const restaurantId = item._id || item.id || "";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/restaurant",
            params: { restaurantId },
          })
        }
      >
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={
              typeof item.image === "string"
                ? { uri: item.image }
                : item.image || require("../../assets/images/magnolia.png")
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
                  {item.deliveryTime} წუთი
                </Text>
              </BlurView>
            ) : (
              <View style={styles.deliveryTimeBadgeAndroid}>
                <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                <Text style={styles.deliveryTimeText}>
                  {item.deliveryTime} წუთი
                </Text>
              </View>
            )}
          </View>

          {/* Heart Button */}
          <TouchableOpacity
            style={[styles.likeButton, isLiked && styles.likeButtonActive]}
            onPress={() => toggleLike(restaurantId)}
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
            {item.name}
          </Text>
          <Text style={styles.restaurantCategory} numberOfLines={1}>
            {item.cuisine && item.cuisine.length > 0
              ? item.cuisine[0]
              : "რესტორანი"}
          </Text>

          {/* Dashed Line */}
          <View style={styles.dashedLineContainer}>
            <View style={styles.dashedLine} />
          </View>

          {/* Delivery and Rating Info */}
          <View style={styles.bottomInfo}>
            <View style={styles.deliveryInfo}>
              <Ionicons name="bicycle-outline" size={14} color="#9B9B9B" />
              <Text style={styles.deliveryFeeText}>
                {item.deliveryFee?.toFixed(2)}₾
              </Text>
            </View>
            <View style={styles.ratingInfo}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>
                {item.rating?.toFixed(1)} ({item.reviewCount})
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Title */}
      <Text style={styles.title}>რესტორნები</Text>

      {/* Restaurant List */}
      <FlatList
        data={activeRestaurants}
        keyExtractor={(item) => item._id || item.id}
        renderItem={renderRestaurantCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4CAF50"
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#181B1A",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  // Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
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
    height: 180,
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
    overflow: "hidden",
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
  deliveryFeeText: {
    fontSize: 13,
    color: "#9B9B9B",
    marginLeft: 6,
    fontWeight: "500",
  },
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
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default RestaurantsScreen;
