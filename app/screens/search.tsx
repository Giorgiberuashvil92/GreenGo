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
import { categories } from "../../assets/data/categories";
import { restaurantsData } from "../../assets/data/restaurantsData";
import { FilterModal } from "../components";

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Recently ordered restaurants (mock data - in real app this would come from order history)
  const recentlyOrdered = restaurantsData.slice(0, 2);

  const handleRestaurantPress = (restaurantId: string) => {
    router.push({
      pathname: "/screens/restaurant",
      params: { restaurantId },
    });
  };

  const handleCategoryPress = (category: any) => {
    if (category.link) {
      router.push(category.link as any);
    }
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
      key={restaurant.id}
      style={styles.recentItem}
      onPress={() => handleRestaurantPress(restaurant.id)}
    >
      <Image source={restaurant.image} style={styles.recentItemImage} />
      <View style={styles.recentItemDetails}>
        <Text style={styles.recentItemName}>{restaurant.name}</Text>
        <Text style={styles.recentItemCategory}>რესტორანი</Text>
        <View style={styles.recentItemInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="cash-outline" size={14} color="#666" />
            <Text style={styles.infoText}>
              {restaurant.deliveryFee.toFixed(2)}₾
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.infoText}>{restaurant.deliveryTime} წუთი</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.infoText}>{restaurant.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = (category: any) => (
    <TouchableOpacity
      key={category.id}
      style={styles.categoryItem}
      onPress={() => handleCategoryPress(category)}
    >
      <Image source={category.icon} style={styles.categoryIcon} />
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ბოლოს შეკვეთილი</Text>
          {recentlyOrdered.map(renderRecentlyOrderedItem)}
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.categoriesHeader}>
            <Ionicons name="grid-outline" size={20} color="#4CAF50" />
            <Text style={styles.sectionTitle}>კატეგორიები</Text>
          </View>
          {categories.map(renderCategoryItem)}
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
});
