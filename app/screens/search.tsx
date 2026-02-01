import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useCategories } from "../../hooks/useCategories";
import { apiService } from "../../utils/api";
import { FilterModal } from "../components";

export default function SearchScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [recentlyOrdered, setRecentlyOrdered] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Fetch recently ordered restaurants from orders API
  React.useEffect(() => {
    if (user?.id || (user as any)?._id) {
      fetchRecentlyOrdered();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchRecentlyOrdered = async () => {
    try {
      setLoadingOrders(true);
      const userId = user?.id || (user as any)?._id;
      const response = await apiService.getOrders({
        userId: userId,
        limit: 5,
        page: 1,
      });

      if (response.success && response.data) {
        const orders = (response.data as any).orders || (Array.isArray(response.data) ? response.data : []);
        
        // Get unique restaurants from recent orders
        const restaurantMap = new Map();
        orders.forEach((order: any) => {
          if (order.restaurantId && !restaurantMap.has(order.restaurantId._id || order.restaurantId)) {
            const restaurant = typeof order.restaurantId === 'object' 
              ? order.restaurantId 
              : { _id: order.restaurantId };
            
            restaurantMap.set(restaurant._id, {
              id: restaurant._id,
              name: restaurant.name || 'რესტორანი',
              image: restaurant.image || restaurant.heroImage,
              deliveryFee: restaurant.deliveryFee || 4.99,
              deliveryTime: restaurant.deliveryTime || '20-30',
              rating: restaurant.rating || 4.5,
            });
          }
        });
        
        setRecentlyOrdered(Array.from(restaurantMap.values()).slice(0, 2));
      }
    } catch (error) {
      console.error('Error fetching recently ordered:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleRestaurantPress = (restaurantId: string) => {
    router.push({
      pathname: "/screens/restaurant",
      params: { restaurantId },
    });
  };

  const handleCategoryPress = (category: any) => {
    // Navigate to restaurants screen with category filter
    router.push({
      pathname: "/(tabs)/restaurants",
      params: { category: category.name },
    });
  };

  // Fallback icon mapping for categories
  const getCategoryIcon = (categoryName: string, iconUrl?: string) => {
    if (iconUrl) {
      return { uri: iconUrl };
    }
    const nameLower = categoryName.toLowerCase();
    if (nameLower.includes('კვება') || nameLower.includes('food')) {
      return require("../../assets/images/categories/food.png");
    }
    if (nameLower.includes('ყვავილ') || nameLower.includes('flower')) {
      return require("../../assets/images/categories/flowers.png");
    }
    return require("../../assets/images/categories/all.png");
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  const handleCloseFilter = () => {
    setShowFilterModal(false);
  };

  const handleApplyFilters = (filters: any) => {
    console.log("Applied filters:", filters);
    setShowFilterModal(false);
  };

  const renderRecentlyOrderedItem = (restaurant: any) => (
    <TouchableOpacity
      key={restaurant.id || restaurant._id}
      style={styles.recentItem}
      onPress={() => handleRestaurantPress(restaurant.id || restaurant._id)}
    >
      <Image 
        source={
          typeof restaurant.image === "string"
            ? { uri: restaurant.image }
            : restaurant.image || require("../../assets/images/magnolia.png")
        } 
        style={styles.recentItemImage} 
      />
      <View style={styles.recentItemDetails}>
        <Text style={styles.recentItemName}>{restaurant.name}</Text>
        <Text style={styles.recentItemCategory}>რესტორანი</Text>
        <View style={styles.recentItemInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="cash-outline" size={14} color="#666" />
            <Text style={styles.infoText}>
              {restaurant.deliveryFee?.toFixed(2) || "4.99"}₾
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.infoText}>{restaurant.deliveryTime || "20-30"} წუთი</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.infoText}>{restaurant.rating?.toFixed(1) || "4.5"}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = (category: any) => (
    <TouchableOpacity
      key={category.id || category._id}
      style={styles.categoryItem}
      onPress={() => handleCategoryPress(category)}
    >
      <Image 
        source={getCategoryIcon(category.name, category.icon)} 
        style={styles.categoryIcon} 
      />
      <Text style={styles.categoryText}>{category.name}</Text>
      <View style={styles.radioButton}>
        {/* Radio button placeholder - can be made interactive later */}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#4CAF50" />
        </TouchableOpacity>

        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="რესტორნები,მაღაზიები,ხელნაკეთი ნივ..."
            placeholderTextColor="#9E9E9E"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={handleFilterPress}
          >
            <Ionicons name="options-outline" size={20} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Recently Ordered Section */}
        {recentlyOrdered.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ბოლოს შეკვეთილი</Text>
            {loadingOrders ? (
              <Text style={styles.loadingText}>იტვირთება...</Text>
            ) : (
              recentlyOrdered.map(renderRecentlyOrderedItem)
            )}
          </View>
        )}

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.categoriesHeader}>
            <Ionicons name="grid-outline" size={20} color="#4CAF50" />
            <Text style={styles.sectionTitle}>კატეგორიები</Text>
          </View>
          {categoriesLoading ? (
            <Text style={styles.loadingText}>იტვირთება...</Text>
          ) : (
            categories.map(renderCategoryItem)
          )}
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={handleCloseFilter}
        onApplyFilters={handleApplyFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F5F5F5",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 4,
  },
  filterButton: {
    padding: 4,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  categoriesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recentItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  recentItemDetails: {
    flex: 1,
  },
  recentItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  recentItemCategory: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  recentItemInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: "#666",
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  categoryIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  categoryText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingVertical: 20,
  },
});
