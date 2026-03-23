import { LIST_ACCENT_GREEN } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
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

function deliveryTimeBadgeLabel(time: string): string {
  const t = time?.trim() || "";
  if (!t) return "—";
  if (t.includes("წუთ")) return t;
  return `${t} წუთი`;
}

const DEFAULT_STREET = "4 შანიძის ქუჩა";
const DEFAULT_CITY = "წყალტუბო";

const RestaurantsScreen = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category?: string }>();
  const sectionTitle = category?.trim() ? category : "კვება";

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(tabs)");
    }
  };
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "",
    priceRange: "",
    rating: "",
    deliveryTime: "",
    categories: [],
  });
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

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
    }

    // Filter by rating
    if (filters.rating) {
      const before = result.length;
      const minRating = parseFloat(filters.rating);
      result = result.filter((r) => r.rating >= minRating);
      console.log(
        `⭐ Rating filter (>=${minRating}): ${before} -> ${result.length}`,
      );
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
      console.log(
        `⏱️ Delivery time filter (<=${maxTime}min): ${before} -> ${result.length}`,
      );
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
                cat.toLowerCase().includes(mapped.toLowerCase()),
              ),
            ) ||
            r.cuisine?.some((cuisine) =>
              mappedCategories.some((mapped) =>
                cuisine.toLowerCase().includes(mapped.toLowerCase()),
              ),
            )
          );
        });
      });
      console.log(
        `📂 Categories filter (${filters.categories.join(", ")}): ${before} -> ${result.length}`,
      );
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

  const listHeader = (
    <View style={styles.screenHeader}>
      <View style={styles.topBar}>
        <View style={styles.topBarSide}>
          <TouchableOpacity
            style={styles.backCircle}
            onPress={handleBack}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="უკან"
          >
            <Ionicons name="chevron-back" size={22} color={LIST_ACCENT_GREEN} />
          </TouchableOpacity>
        </View>
        <View style={styles.addressBlock}>
          <Text style={styles.addrStreet} numberOfLines={1}>
            {DEFAULT_STREET}
          </Text>
          <Text style={styles.addrCity} numberOfLines={1}>
            {DEFAULT_CITY}
          </Text>
        </View>
        <View style={[styles.topBarSide, styles.topBarSideEnd]}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="options-outline"
              size={24}
              color={LIST_ACCENT_GREEN}
            />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.sectionHeading}>{sectionTitle}</Text>
    </View>
  );

  if (loading && restaurants.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {listHeader}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={LIST_ACCENT_GREEN} />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && restaurants.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {listHeader}
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>ხელახლა ცდა</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredRestaurants}
        keyExtractor={(item) => item.id || item._id}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={LIST_ACCENT_GREEN}
            colors={[LIST_ACCENT_GREEN]}
          />
        }
        renderItem={({ item }) => {
          const rid = item.id || item._id || "";
          const categoryLabel =
            item.categories?.[0] || item.cuisine?.[0] || "რესტორანი";
          const isFav = favorites[rid];

          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: "/screens/restaurant",
                  params: { restaurantId: rid },
                })
              }
            >
              <View style={styles.imageWrap}>
                <Image
                  source={
                    typeof item.image === "string"
                      ? { uri: item.image }
                      : item.image
                  }
                  style={styles.image}
                  defaultSource={require("../../assets/images/magnolia.png")}
                />
                <View style={styles.timeBadge}>
                  <Ionicons name="time-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.timeBadgeText} numberOfLines={1}>
                    {deliveryTimeBadgeLabel(String(item.deliveryTime))}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.favBtn}
                  onPress={() =>
                    setFavorites((f) => ({ ...f, [rid]: !f[rid] }))
                  }
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <View style={styles.favCircle}>
                    <Ionicons
                      name={isFav ? "heart" : "heart-outline"}
                      size={20}
                      color={isFav ? "#EF4444" : "#FFFFFF"}
                    />
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.categoryLine} numberOfLines={1}>
                  {categoryLabel}
                </Text>

                <View style={styles.dividerLine} />

                <View style={styles.cardFooter}>
                  <View style={styles.footerLeft}>
                    <Ionicons
                      name="bicycle-outline"
                      size={17}
                      color="#6B7280"
                    />
                    <Text style={styles.deliveryFeeText}>
                      {typeof item.deliveryFee === "number"
                        ? `${item.deliveryFee.toFixed(2).replace(".", ",")}₾`
                        : "—"}
                    </Text>
                  </View>
                  <View style={styles.footerRight}>
                    <Ionicons name="star" size={15} color="#EAB308" />
                    <Text style={styles.ratingBold}>
                      {item.rating.toFixed(1)}
                    </Text>
                    <Text style={styles.reviewsMuted}>
                      ({item.reviewCount})
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {filters.sortBy ||
              filters.priceRange ||
              filters.rating ||
              filters.deliveryTime ||
              filters.categories.length > 0
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
  screenHeader: {
    backgroundColor: "#F5F5F5",
    paddingBottom: 8,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 8,
  },
  topBarSide: {
    width: 48,
    justifyContent: "center",
  },
  topBarSideEnd: {
    alignItems: "flex-end",
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  addressBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  addrStreet: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: "#111827",
    textAlign: "center",
  },
  addrCity: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: "#9CA3AF",
    marginTop: 2,
    textAlign: "center",
  },
  sectionHeading: {
    fontSize: 26,
    fontFamily: fontFamily.bold,
    color: "#111827",
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 4,
  },
  filterButton: {
    padding: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  imageWrap: {
    position: "relative",
    width: "100%",
  },
  image: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  timeBadge: {
    position: "absolute",
    left: 10,
    top: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.55)",
    maxWidth: "78%",
  },
  timeBadgeText: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: "#FFFFFF",
    flexShrink: 1,
  },
  favBtn: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  favCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoContainer: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 2,
  },
  name: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    color: "#111827",
  },
  categoryLine: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: "#6B7280",
    marginTop: 2,
  },
  dividerLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginTop: 12,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  deliveryFeeText: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: "#374151",
  },
  ratingBold: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: "#111827",
  },
  reviewsMuted: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: "#9CA3AF",
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
    backgroundColor: LIST_ACCENT_GREEN,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
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
