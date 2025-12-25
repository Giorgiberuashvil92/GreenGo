import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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
import { flowersData } from "../../assets/data/flowersData";
import { handmadeData } from "../../assets/data/handmadeData";
import { useRestaurants } from "../../hooks/useRestaurants";
import { apiService } from "../../utils/api";
import { USE_MOCK_DATA, mockRestaurants } from "../../utils/mockData";

const AllCategoriesScreen = () => {
  const router = useRouter();
  const { restaurants } = useRestaurants();
  const [refreshing, setRefreshing] = useState(false);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
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

  // Combine all data
  const restaurantsToUse =
    restaurants.length > 0
      ? restaurants
      : USE_MOCK_DATA || apiService.isUsingMockData()
      ? mockRestaurants
      : [];

  const allItems = [
    ...restaurantsToUse
      .filter((r) => r.isActive !== false)
      .map((r) => ({
        id: r._id || r.id,
        name: r.name,
        category: r.cuisine?.[0] || "რესტორანი",
        rating: r.rating,
        reviewCount: r.reviewCount,
        deliveryFee: r.deliveryFee,
        deliveryTime: `${r.deliveryTime} წუთი`,
        image: r.image,
        type: "food",
      })),
    ...flowersData
      .filter((f) => f.isActive)
      .map((f) => ({
        id: f.id,
        name: f.name,
        category: f.category,
        rating: f.rating,
        reviewCount: f.reviewCount,
        deliveryFee: f.deliveryFee,
        deliveryTime: `${f.deliveryTime} წუთი`,
        image: f.image,
        type: "flowers",
      })),
    ...handmadeData
      .filter((h) => h.isActive)
      .map((h) => ({
        id: h.id,
        name: h.name,
        category: h.category,
        rating: h.rating,
        reviewCount: h.reviewCount,
        deliveryFee: h.deliveryFee,
        deliveryTime: h.deliveryTime,
        image: h.image,
        type: "handmade",
      })),
  ];

  const renderCard = ({ item }: { item: any }) => {
    const isLiked = likedItems.has(item.id);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => {
          if (item.type === "food") {
            router.push({
              pathname: "/(tabs)/restaurant",
              params: { restaurantId: item.id },
            });
          }
        }}
      >
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={
              typeof item.image === "string" ? { uri: item.image } : item.image
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
                <Text style={styles.deliveryTimeText}>{item.deliveryTime}</Text>
              </BlurView>
            ) : (
              <View style={styles.deliveryTimeBadgeAndroid}>
                <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                <Text style={styles.deliveryTimeText}>{item.deliveryTime}</Text>
              </View>
            )}
          </View>

          {/* Heart Button */}
          <TouchableOpacity
            style={[styles.likeButton, isLiked && styles.likeButtonActive]}
            onPress={() => toggleLike(item.id)}
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
          <Text style={styles.shopName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.shopCategory} numberOfLines={1}>
            {item.category}
          </Text>

          {/* Dashed Line */}
          <View style={styles.dashedLineContainer}>
            <View style={styles.dashedLine} />
          </View>

          {/* Delivery and Rating Info */}
          <View style={styles.bottomInfo}>
            <View style={styles.deliveryInfo}>
              <Ionicons
                name={
                  item.type === "handmade" ? "cube-outline" : "bicycle-outline"
                }
                size={14}
                color="#9B9B9B"
              />
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#181B1A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerAddress}>4 შანიძის ქუჩა</Text>
          <Text style={styles.headerCity}>წყალტუბო</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>ყველა</Text>

      {/* List */}
      <FlatList
        data={allItems}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerAddress: {
    fontSize: 16,
    fontWeight: "600",
    color: "#181B1A",
  },
  headerCity: {
    fontSize: 14,
    color: "#9B9B9B",
    marginTop: 2,
  },
  headerRight: {
    width: 44,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#181B1A",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
  deliveryTimeBadgeWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  likeButtonActive: {
    backgroundColor: "#FFF0F0",
  },
  cardBottomSection: {
    padding: 14,
    backgroundColor: "#FFFFFF",
  },
  shopName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  shopCategory: {
    fontSize: 14,
    color: "#8A8A8A",
    marginBottom: 12,
  },
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
});

export default AllCategoriesScreen;

