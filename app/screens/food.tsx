import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiService } from "../../utils/api";
import { useRestaurants } from "../../hooks/useRestaurants";

interface MenuItem {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  restaurantId: string | { _id: string; name: string };
  restaurant?: { _id: string; name: string };
}

const FoodScreen = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { restaurants } = useRestaurants({ limit: 100 });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMenuItems({
        limit: 100,
      });

      if (response.success && response.data) {
        const items = Array.isArray(response.data)
          ? response.data
          : (response.data as any)?.data || [];
        
        // Transform items to include restaurant info
        const transformedItems = items.map((item: MenuItem) => {
          const restaurantId = typeof item.restaurantId === 'string' 
            ? item.restaurantId 
            : item.restaurantId?._id || item.restaurant?._id;
          
          const restaurant = restaurants.find(
            (r) => (r._id || r.id) === restaurantId
          );

          return {
            ...item,
            id: item._id || item.id,
            restaurant: restaurant?.name || 'რესტორანი',
            restaurantId: restaurantId,
          };
        });

        setMenuItems(transformedItems);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMenuItemImage = (item: MenuItem) => {
    if (item.image) {
      return { uri: item.image };
    }
    return require("../../assets/images/eskizi.png");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/(tabs)")}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.addressContainer}>
          <Text style={styles.addressLine1}>4 შანიძის ქუჩა</Text>
          <Text style={styles.addressLine2}>წყალტუბო</Text>
        </View>

        <TouchableOpacity style={styles.cartButton}>
          <Text style={styles.cartButtonText}>🛍️</Text>
        </TouchableOpacity>
      </View>

      {/* Section Title */}
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>კვება</Text>
      </View>

      {/* Food Items List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {menuItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>საკვები ვერ მოიძებნა</Text>
            </View>
          ) : (
            menuItems.map((item) => (
              <View key={item.id || item._id} style={styles.foodCard}>
                <Image 
                  source={getMenuItemImage(item)} 
                  style={styles.foodImage} 
                />

                {/* Favorite Button */}
                <TouchableOpacity style={styles.favoriteButton}>
                  <Text style={styles.favoriteButtonText}>♡</Text>
                </TouchableOpacity>

                <BlurView intensity={40} tint="dark" style={styles.infoOverlay}>
                  <View style={styles.overlayDark} />
                  <View style={styles.infoRow}>
                    {/* სახელი */}
                    <Text style={styles.restaurantName}>
                      {typeof item.restaurant === 'string' 
                        ? item.restaurant 
                        : item.restaurant?.name || 'რესტორანი'}
                    </Text>

                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      {/* ფასი */}
                      <View style={styles.infoItem}>
                        <Text style={styles.infoIcon}>💰</Text>
                        <Text style={styles.infoText}>{item.price.toFixed(2)}₾</Text>
                      </View>

                      {/* კატეგორია */}
                      <View style={styles.infoItem}>
                        <Text style={styles.infoIcon}>📋</Text>
                        <Text style={styles.infoText}>{item.category || 'საკვები'}</Text>
                      </View>
                    </View>
                  </View>
                </BlurView>
              </View>
            ))
          )}
        </ScrollView>
      )}
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
    paddingBottom: 20,
    paddingTop: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  addressContainer: {
    flex: 1,
    alignItems: "center",
  },
  addressLine1: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  addressLine2: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  cartButton: {
    padding: 8,
  },
  cartButtonText: {
    fontSize: 24,
  },
  sectionTitleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  foodCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  foodImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 20,
    padding: 8,
  },
  favoriteButtonText: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  infoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 12,
    margin: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    overflow: "hidden", // overlay რომ სწორად დაჯდეს
  },
  overlayDark: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)", // მუქი ნახევრად გამჭვირვალე ფენა
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  infoText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
});

export default FoodScreen;
