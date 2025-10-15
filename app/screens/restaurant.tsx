import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MenuItem, restaurantsData } from "../../assets/data/restaurantsData";

const { width } = Dimensions.get("window");

export default function RestaurantScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const router = useRouter();
  const restaurant = restaurantsData.find((r) => r.id === restaurantId);

  const [isLiked, setIsLiked] = useState(restaurant?.isLiked || false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Restaurant not found</Text>
      </SafeAreaView>
    );
  }

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const popularItems = restaurant.menuItems.filter((item) => item.isPopular);
  const bakedGoods = restaurant.menuItems.filter(
    (item) => item.category === "ცომეული"
  );

  const navigateToProduct = (itemId: string) => {
    router.push({
      pathname: "/screens/product",
      params: { productId: itemId },
    });
  };

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => navigateToProduct(item.id)}
    >
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.menuItemDescription}>{item.description}</Text>
          )}
          <Text style={styles.menuItemPrice}>{item.price.toFixed(2)} ₾</Text>
        </View>
        <Image source={{ uri: item.image }} style={styles.menuItemImage} />
      </View>
    </TouchableOpacity>
  );

  const renderPopularItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.popularItem}
      onPress={() => navigateToProduct(item.id)}
    >
      <Image source={{ uri: item.image }} style={styles.popularItemImage} />
      <Text style={styles.popularItemPrice}>{item.price.toFixed(2)}₾</Text>
      <Text style={styles.popularItemName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image Section */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: restaurant.heroImage }}
            style={styles.heroImage}
          />

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>

          {/* Like Button */}
          <TouchableOpacity style={styles.likeButton} onPress={toggleLike}>
            <Feather
              name="heart"
              size={24}
              color={isLiked ? "#FF3B30" : "#FFFFFF"}
            />
          </TouchableOpacity>

          {/* Restaurant Name Overlay */}
          <View style={styles.restaurantNameOverlay}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.infoValue}>{restaurant.rating}</Text>
              <Text style={styles.infoLabel}>რეიტინგი</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="car-outline" size={20} color="#9B9B9B" />
              <Text style={styles.infoValue}>
                {restaurant.deliveryFee.toFixed(2)}₾
              </Text>
              <Text style={styles.infoLabel}>მიტანა</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color="#9B9B9B" />
              <Text style={styles.infoValue}>{restaurant.deliveryTime}</Text>
              <Text style={styles.infoLabel}>წუთი</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() =>
                router.push({
                  pathname: "/screens/restaurantDetails",
                  params: { restaurantId: restaurant.id },
                })
              }
            >
              <Text style={styles.detailsButtonText}>დეტალური ინფორმაცია</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={20} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Most Popular Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>ყველაზე პოპულარული</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.popularScroll}
          >
            {popularItems.map(renderPopularItem)}
          </ScrollView>
        </View>

        {/* Baked Goods Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>ცომეული</Text>
          {bakedGoods.map(renderMenuItem)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  heroSection: {
    height: 300,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  likeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  restaurantNameOverlay: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginTop: -20,
    zIndex: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  infoItem: {
    alignItems: "center",
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 8,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666666",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailsButton: {
    backgroundColor: "#E8F5E8",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginRight: 12,
  },
  detailsButtonText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  shareButton: {
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
  },
  popularScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  popularItem: {
    marginRight: 16,
    alignItems: "center",
  },
  popularItemImage: {
    width: 120,
    height: 120,
    borderRadius: 15,
    marginBottom: 8,
  },
  popularItemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  popularItemName: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  menuItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginBottom: 12,
    padding: 16,
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    flex: 1,
    marginRight: 12,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 12,
    color: "#666666",
    lineHeight: 16,
    marginBottom: 8,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
});
