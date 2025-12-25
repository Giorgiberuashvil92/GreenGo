import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRestaurants } from "../../hooks/useRestaurants";
import { apiService } from "../../utils/api";
import {
  getRecentlyOrderedRestaurants,
  USE_MOCK_DATA,
} from "../../utils/mockData";
import FilterModal from "../components/FilterModal";

// Categories from FilterModal
const searchCategories = [
  { id: "stores", name: "მაღაზიები", icon: "🛒" },
  { id: "georgian", name: "ქართული", icon: "🇬🇪" },
  { id: "fastfood", name: "სწრაფი კვება", icon: "🍟" },
  { id: "shawarma", name: "შაურმა", icon: "🥙" },
  { id: "pizza", name: "პიცა", icon: "🍕" },
  { id: "burger", name: "ბურგერი", icon: "🍔" },
  { id: "chicken", name: "ქათამი", icon: "🍗" },
  { id: "dessert", name: "დესერტი", icon: "🍰" },
  { id: "soup", name: "წვნიანი", icon: "🥣" },
];

export default function SearchTabScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [recentlyOrdered, setRecentlyOrdered] = useState<any[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const { restaurants, loading, error, refetch } = useRestaurants({
    search: query || undefined,
    limit: 50,
  });

  useEffect(() => {
    // Load recently ordered restaurants
    if (USE_MOCK_DATA || apiService.isUsingMockData()) {
      const recent = getRecentlyOrderedRestaurants();
      setRecentlyOrdered(recent);
    } else {
      // TODO: Load from API when backend is ready
      setRecentlyOrdered([]);
    }
  }, []);

  // Filter active restaurants
  const filteredRestaurants = restaurants.filter((r) => r.isActive);

  return (
    <SafeAreaView style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="რესტორნები,მაღაზიები,ხელნაკეთი ნივ..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
          />
          <TouchableOpacity
            style={styles.filterButtonInside}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="options-outline" size={20} color="#2E7D32" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {query.length > 0 ? (
        // Search results
        loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>ძიება...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredRestaurants}
            keyExtractor={(item) => item._id || item.id || ""}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>რეზულტატი არ მოიძებნა</Text>
                <Text style={styles.emptyText}>
                  სცადე სხვა სიტყვა ან შეამოკლე ძიების ტექსტი.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/restaurant",
                    params: { restaurantId: item._id || item.id },
                  })
                }
              >
                <Image
                  source={
                    typeof item.image === "string"
                      ? { uri: item.image }
                      : item.image ||
                        require("../../assets/images/magnolia.png")
                  }
                  style={styles.image}
                />

                <View style={styles.infoContainer}>
                  <View style={styles.headerRow}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.priceRange}>{item.priceRange}</Text>
                  </View>

                  <Text style={styles.description} numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>
                      ⭐ {item.rating.toFixed(1)} ({item.reviewCount})
                    </Text>
                    <Text style={styles.metaText}>
                      ⏱ {item.deliveryTime} წთ
                    </Text>
                    <Text style={styles.metaText}>
                      🚚 {item.deliveryFee.toFixed(2)} ₾
                    </Text>
                  </View>

                  <View style={styles.footerRow}>
                    <Text style={styles.address} numberOfLines={1}>
                      {item.location?.address}, {item.location?.city}
                    </Text>
                    {item.cuisine && item.cuisine.length > 0 && (
                      <Text style={styles.cuisine} numberOfLines={1}>
                        {item.cuisine.join(" • ")}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )
      ) : (
        // Default view with Recently Ordered and Categories
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Recently Ordered Section */}
          {recentlyOrdered.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ბოლოს შეკვეთილი</Text>
              <View style={styles.recentlyOrderedList}>
                {recentlyOrdered.map((item) => (
                  <TouchableOpacity
                    key={item._id || item.id}
                    style={styles.recentlyOrderedCard}
                    activeOpacity={0.7}
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/restaurant",
                        params: { restaurantId: item._id || item.id },
                      })
                    }
                  >
                    <View style={styles.recentlyOrderedImageContainer}>
                      <Image
                        source={
                          typeof item.image === "string"
                            ? { uri: item.image }
                            : item.image ||
                              require("../../assets/images/magnolia.png")
                        }
                        style={styles.recentlyOrderedImage}
                      />
                    </View>
                    <View style={styles.recentlyOrderedInfo}>
                      <Text style={styles.recentlyOrderedName}>
                        {item.name}
                      </Text>
                      <Text style={styles.recentlyOrderedType}>რესტორანი</Text>
                      <View style={styles.recentlyOrderedMeta}>
                        <View style={styles.recentlyOrderedMetaItem}>
                          <Ionicons name="car-outline" size={14} color="#666" />
                          <Text style={styles.recentlyOrderedMetaText}>
                            {item.deliveryFee.toFixed(2)}₾
                          </Text>
                        </View>
                        <View style={styles.recentlyOrderedMetaItem}>
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color="#666"
                          />
                          <Text style={styles.recentlyOrderedMetaText}>
                            {item.deliveryTime} წუთი
                          </Text>
                        </View>
                        <View style={styles.recentlyOrderedMetaItem}>
                          <Ionicons name="star" size={14} color="#FFB800" />
                          <Text style={styles.recentlyOrderedMetaText}>
                            {item.rating.toFixed(1)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Categories Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Image
                source={require("../../assets/images/icons/category.png")}
                width={22}
                height={22}
                style={{ width: 22, height: 22 }}
              />
              <Text style={styles.sectionTitle}>კატეგორიები</Text>
            </View>
            <View style={styles.categoriesList}>
              {searchCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryItem}
                  activeOpacity={0.7}
                  onPress={() => {
                    // TODO: Navigate to category filter
                    console.log("Category selected:", category.id);
                  }}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <View style={styles.categoryRadio}>
                    <View style={styles.categoryRadioOuter} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApplyFilters={(filters: {
          sortBy: string;
          priceRange: string;
          rating: string;
          deliveryTime: string;
          categories: string[];
        }) => {
          // TODO: Apply filters to search
          console.log("Filters applied:", filters);
          setFilterModalVisible(false);
        }}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    paddingRight: 8,
  },
  filterButtonInside: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#181B1A",
  },
  recentlyOrderedList: {
    marginTop: 20,
    gap: 12,
    flexDirection: "column",
  },
  recentlyOrderedCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  recentlyOrderedImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
    marginRight: 12,
  },
  recentlyOrderedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  recentlyOrderedInfo: {
    flex: 1,
    justifyContent: "center",
  },
  recentlyOrderedName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#181B1A",
    marginBottom: 2,
  },
  recentlyOrderedType: {
    fontSize: 13,
    color: "#B3B3B3",
    marginBottom: 8,
  },
  recentlyOrderedMeta: {
    flexDirection: "row",
    gap: 12,
  },
  recentlyOrderedMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  recentlyOrderedMetaText: {
    fontSize: 12,
    color: "#666666",
  },
  categoriesList: {
    gap: 0,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 28,
  },
  categoryName: {
    flex: 1,
    fontSize: 15,
    color: "#181B1A",
  },
  categoryRadio: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryRadioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  image: {
    width: "100%",
    height: 140,
    resizeMode: "cover",
  },
  infoContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  priceRange: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  description: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  metaText: {
    fontSize: 12,
    color: "#4B5563",
  },
  footerRow: {
    marginTop: 6,
    gap: 2,
  },
  address: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  cuisine: {
    fontSize: 12,
    color: "#6B7280",
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
});
