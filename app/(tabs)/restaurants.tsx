import { LIST_ACCENT_GREEN } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
import { useDeliveryAddress } from "@/hooks/useDeliveryAddress";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FilterModal } from "../../app/components";
import HomeSearchBar from "../../components/HomeSearchBar";
import RestaurantListCard from "../../components/RestaurantListCard";
import { useRestaurants } from "../../hooks/useRestaurants";

const NAV_ARROW = "#003E20";

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
  const { address, loading: addressLoading } = useDeliveryAddress();

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

  const { restaurants, loading, error, refetch } = useRestaurants({
    category: category,
    limit: 100,
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

  const filteredRestaurants = useMemo(() => {
    let result = restaurants.filter((r) => r.isActive);

    if (filters.priceRange) {
      result = result.filter((r) => r.priceRange === filters.priceRange);
    }

    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      result = result.filter((r) => r.rating >= minRating);
    }

    if (filters.deliveryTime) {
      const maxTime = parseInt(filters.deliveryTime);
      result = result.filter((r) => {
        const timeStr = r.deliveryTime.replace(/[^0-9-]/g, "");
        const timeRange = timeStr.split("-");
        if (timeRange.length > 1) {
          const maxDeliveryTime = parseInt(timeRange[timeRange.length - 1]);
          return maxDeliveryTime <= maxTime;
        }
        const singleTime = parseInt(timeRange[0]);
        return singleTime <= maxTime;
      });
    }

    if (filters.categories.length > 0) {
      result = result.filter((r) => {
        return filters.categories.some((filterCat) => {
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
            zoo: ["ზოომაღაზია", "Zoo", "Pet"],
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
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "rating":
          result = [...result].sort((a, b) => b.rating - a.rating);
          break;
        case "fastest":
          result = [...result].sort((a, b) => {
            const timeStrA = a.deliveryTime.replace(/[^0-9-]/g, "");
            const timeStrB = b.deliveryTime.replace(/[^0-9-]/g, "");
            const timeA = parseInt(timeStrA.split("-")[0]) || 999;
            const timeB = parseInt(timeStrB.split("-")[0]) || 999;
            return timeA - timeB;
          });
          break;
        case "cheapest":
          result = [...result].sort((a, b) => a.deliveryFee - b.deliveryFee);
          break;
        case "closest":
          result = [...result].sort((a, b) => a.name.localeCompare(b.name));
          break;
        default:
          break;
      }
    }

    return result;
  }, [restaurants, filters]);

  const citySubtitle = addressLoading
    ? "..."
    : address?.city?.trim() || address?.district?.trim() || "ქუთაისი";

  const listHeader = (
    <View style={styles.screenHeader}>
      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.backCircle}
          onPress={handleBack}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="უკან"
        >
          <Ionicons name="chevron-back" size={22} color={NAV_ARROW} />
        </TouchableOpacity>
        <View style={styles.titleBlock}>
          <Text style={styles.pageTitle}>რესტორნები</Text>
          <Text style={styles.pageSubtitle} numberOfLines={1}>
            {citySubtitle}
          </Text>
        </View>
        <View style={styles.navSpacer} />
      </View>
      <View style={styles.searchWrap}>
        <HomeSearchBar
          onFilterPress={() => setShowFilterModal(true)}
          searchBarStyle={styles.searchBar}
        />
      </View>
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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={LIST_ACCENT_GREEN}
            colors={[LIST_ACCENT_GREEN]}
          />
        }
        renderItem={({ item, index }) => {
          const rid = item.id || item._id || "";

          return (
            <RestaurantListCard
              tintedBackground={index % 2 === 1}
              restaurant={item}
              onPress={() =>
                router.push({
                  pathname: "/screens/restaurant",
                  params: { restaurantId: rid },
                })
              }
              onDishPress={(menuItemId) =>
                router.push({
                  pathname: "/screens/product",
                  params: { productId: menuItemId, restaurantId: rid },
                })
              }
            />
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
    backgroundColor: "#FFF",
  },
  screenHeader: {
    // backgroundColor: "#FFFFFF",
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 12,
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  pageTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: "#181B1A",
    textAlign: "center",
  },
  pageSubtitle: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: "#9E9E9E",
    marginTop: 2,
    textAlign: "center",
  },
  navSpacer: {
    width: 40,
  },
  searchWrap: {
    width: "100%",
  },
  listContent: {
    paddingBottom: 24,
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
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  searchBar: {
    backgroundColor: "#F7F7F7",
  },
});

export default RestaurantsScreen;
