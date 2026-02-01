import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FilterModal } from "../../app/components";
import { useRestaurants } from "../../hooks/useRestaurants";

interface FilterState {
  sortBy: string;
  priceRange: string;
  rating: string;
  deliveryTime: string;
  categories: string[];
}

const RestaurantsScreen = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category?: string }>();
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "",
    priceRange: "",
    rating: "",
    deliveryTime: "",
    categories: [],
  });
  
  // Pass filters to useRestaurants hook for backend filtering
  const { restaurants, loading, error, refetch } = useRestaurants({
    category: category,
    limit: 100, // Get more restaurants when filtering by category
    categories: filters.categories.length > 0 ? filters.categories : undefined,
    priceRange: filters.priceRange || undefined,
    rating: filters.rating || undefined,
    deliveryTime: filters.deliveryTime || undefined,
    sortBy: filters.sortBy || undefined,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleApplyFilters = (appliedFilters: FilterState) => {
    setFilters(appliedFilters);
    setShowFilterModal(false);
  };

  // Apply filters to restaurants
  const filteredRestaurants = useMemo(() => {
    console.log("🔍 Applying filters:", filters);
    console.log("📊 Total restaurants:", restaurants.length);
    
    let result = restaurants.filter((r) => r.isActive);
    console.log("✅ Active restaurants:", result.length);

    // Filter by price range
    if (filters.priceRange) {
      const before = result.length;
      result = result.filter((r) => r.priceRange === filters.priceRange);
      console.log(`💰 Price filter (${filters.priceRange}): ${before} -> ${result.length}`);
    }

    // Filter by rating
    if (filters.rating) {
      const before = result.length;
      const minRating = parseFloat(filters.rating);
      result = result.filter((r) => r.rating >= minRating);
      console.log(`⭐ Rating filter (>=${minRating}): ${before} -> ${result.length}`);
    }

    // Filter by delivery time
    if (filters.deliveryTime) {
      const before = result.length;
      const maxTime = parseInt(filters.deliveryTime);
      result = result.filter((r) => {
        // Handle different formats: "20-30", "20-30 წუთი", "20"
        const timeStr = r.deliveryTime.replace(/[^0-9-]/g, ""); // Remove non-numeric except dash
        const timeRange = timeStr.split("-");
        if (timeRange.length > 1) {
          const maxDeliveryTime = parseInt(timeRange[timeRange.length - 1]);
          return maxDeliveryTime <= maxTime;
        } else {
          const singleTime = parseInt(timeRange[0]);
          return singleTime <= maxTime;
        }
      });
      console.log(`⏱️ Delivery time filter (<=${maxTime}min): ${before} -> ${result.length}`);
    }

    // Filter by categories (multiple selection)
    if (filters.categories.length > 0) {
      const before = result.length;
      result = result.filter((r) => {
        return filters.categories.some((filterCat) => {
          // Map filter category IDs to actual category names
          const categoryMap: { [key: string]: string[] } = {
            georgian: ["ქართული"],
            fastfood: ["სწრაფი კვება", "Fast Food"],
            shawarma: ["შაურმა", "Shawarma"],
            pizza: ["პიცა", "Pizza"],
            burger: ["ბურგერი", "Burger"],
            chicken: ["ქათამი", "Chicken"],
            dessert: ["დესერტი", "Dessert"],
            soup: ["წვნიანი", "Soup"],
            pastries: ["ცომეული", "Pastries"],
            breakfast: ["საუზმე", "Breakfast"],
            vegetarian: ["ვეგეტარიანული", "Vegetarian"],
            healthy: ["ჯანსაღი", "Healthy"],
            flowers: ["ყვავილები", "Flowers"],
          };
          const mappedCategories = categoryMap[filterCat] || [filterCat];
          return (
            r.categories?.some((cat) =>
              mappedCategories.some((mapped) =>
                cat.toLowerCase().includes(mapped.toLowerCase())
              )
            ) ||
            r.cuisine?.some((cuisine) =>
              mappedCategories.some((mapped) =>
                cuisine.toLowerCase().includes(mapped.toLowerCase())
              )
            )
          );
        });
      });
      console.log(`📂 Categories filter (${filters.categories.join(", ")}): ${before} -> ${result.length}`);
    }

    // Sort restaurants
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "rating":
          result = [...result].sort((a, b) => b.rating - a.rating);
          console.log("📊 Sorted by rating");
          break;
        case "fastest":
          result = [...result].sort((a, b) => {
            const timeStrA = a.deliveryTime.replace(/[^0-9-]/g, "");
            const timeStrB = b.deliveryTime.replace(/[^0-9-]/g, "");
            const timeA = parseInt(timeStrA.split("-")[0]) || 999;
            const timeB = parseInt(timeStrB.split("-")[0]) || 999;
            return timeA - timeB;
          });
          console.log("📊 Sorted by fastest delivery");
          break;
        case "cheapest":
          result = [...result].sort((a, b) => a.deliveryFee - b.deliveryFee);
          console.log("📊 Sorted by cheapest");
          break;
        case "closest":
          // For closest, we'd need user location - for now, sort by name
          result = [...result].sort((a, b) => a.name.localeCompare(b.name));
          console.log("📊 Sorted by name (closest not available)");
          break;
        default:
          break;
      }
    }

    console.log("✅ Final filtered restaurants:", result.length);
    return result;
  }, [restaurants, filters]);

  if (loading && restaurants.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>
          {category ? `${category} - რესტორნები` : "რესტორნები"}
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && restaurants.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>
          {category ? `${category} - რესტორნები` : "რესტორნები"}
        </Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refetch}
          >
            <Text style={styles.retryButtonText}>ხელახლა ცდა</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {category ? `${category} - რესტორნები` : "რესტორნები"}
        </Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="options-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredRestaurants}
        keyExtractor={(item) => item.id || item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/screens/restaurant",
                params: { restaurantId: item.id || item._id },
              })
            }
          >
            <Image
              source={
                typeof item.image === "string"
                  ? { uri: item.image }
                  : item.image
              }
              style={styles.image}
              defaultSource={require("../../assets/images/magnolia.png")}
            />

            <View style={styles.infoContainer}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  ⭐ {item.rating.toFixed(1)} ({item.reviewCount})
                </Text>
                <Text style={styles.metaText}>⏱ {item.deliveryTime} წთ</Text>
                {typeof item.deliveryFee === "number" && (
                  <Text style={styles.metaText}>
                    🚚 {item.deliveryFee.toFixed(2)} ₾
                  </Text>
                )}
              </View>

              <View style={styles.actionsRow}>
                <Text style={styles.address} numberOfLines={1}>
                  {item.location.address}, {item.location.city}
                </Text>

                <View style={styles.mapBadge}>
                  <Text style={styles.mapBadgeText}>რუკაზე ნახვა</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {filters.sortBy || filters.priceRange || filters.rating || filters.deliveryTime || filters.categories.length > 0
                ? "ფილტრის შედეგები ვერ მოიძებნა"
                : "რესტორნები ვერ მოიძებნა"}
            </Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  filterButton: {
    padding: 8,
    marginLeft: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  infoContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  description: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  metaText: {
    fontSize: 12,
    color: "#4B5563",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  address: {
    flex: 1,
    fontSize: 12,
    color: "#9CA3AF",
    marginRight: 8,
  },
  mapBadge: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  mapBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default RestaurantsScreen;
