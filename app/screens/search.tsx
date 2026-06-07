import { homeCategories, resolveCategoryIcon } from "@/assets/data/categories";
import { BRAND_GREEN } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { apiService } from "../../utils/api";
import { ordersFromGetOrdersData } from "../../utils/ordersFromResponse";
import { FilterModal } from "../components";

type RecentRestaurant = {
  id: string;
  name: string;
  image?: string;
  deliveryFee: number;
  deliveryTime: string;
  rating: number;
};

function formatLari(value: number): string {
  return `${value.toFixed(2).replace(".", ",")}₾`;
}

export default function SearchScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [recentlyOrdered, setRecentlyOrdered] = useState<RecentRestaurant[]>(
    [],
  );
  const [loadingOrders, setLoadingOrders] = useState(true);

  const fetchRecentlyOrdered = useCallback(async () => {
    const userId = user?.id || (user as { _id?: string })?._id;
    if (!userId) {
      setLoadingOrders(false);
      return;
    }
    try {
      setLoadingOrders(true);
      const response = await apiService.getOrders({
        userId,
        limit: 50,
        page: 1,
      });

      if (response.success && response.data) {
        const orders = ordersFromGetOrdersData(response.data);

        const restaurantMap = new Map<string, RecentRestaurant>();
        for (const order of orders) {
          if (!order?.restaurantId) continue;
          const rid =
            typeof order.restaurantId === "object"
              ? order.restaurantId._id
              : order.restaurantId;
          const idStr = rid != null ? String(rid) : "";
          if (!idStr || restaurantMap.has(idStr)) continue;

          const r =
            typeof order.restaurantId === "object"
              ? order.restaurantId
              : { _id: order.restaurantId };

          const deliveryTimeRaw = r.deliveryTime;
          const deliveryTimeStr =
            deliveryTimeRaw == null
              ? "20-30"
              : typeof deliveryTimeRaw === "number"
                ? `${deliveryTimeRaw}`
                : String(deliveryTimeRaw);

          restaurantMap.set(idStr, {
            id: idStr,
            name: r.name || "რესტორანი",
            image: r.image || r.heroImage,
            deliveryFee:
              typeof r.deliveryFee === "number" ? r.deliveryFee : 4.99,
            deliveryTime: deliveryTimeStr,
            rating: typeof r.rating === "number" ? r.rating : 4.5,
          });
        }
        setRecentlyOrdered(Array.from(restaurantMap.values()).slice(0, 8));
      }
    } catch (e) {
      console.error("Error fetching recently ordered:", e);
    } finally {
      setLoadingOrders(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id || (user as { _id?: string })?._id) {
      void fetchRecentlyOrdered();
    } else {
      setLoadingOrders(false);
    }
  }, [user, fetchRecentlyOrdered]);

  const handleRestaurantPress = (restaurantId: string) => {
    router.push({
      pathname: "/screens/restaurant",
      params: { restaurantId },
    });
  };

  const handleCategoryPress = (category: { name: string; link?: string }) => {
    if (category.link) {
      router.push(category.link as "/screens/food");
      return;
    }
    if (category.name === "ყველა") {
      router.push("/(tabs)/restaurants");
      return;
    }
    router.push({
      pathname: "/(tabs)/restaurants",
      params: { category: category.name },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.screenPadding}>
        {/* სერჩ-ბარი — ერთ ღია-ნაცრისფერ ბლოკში */}
        <View style={styles.searchBarWrap}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.searchBarIconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color="#181B1A" />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="რესტორნები, მაღაზიები, ხელნაკეთი ნივ..."
            placeholderTextColor="#9E9E9E"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.searchBarIconBtn}
            onPress={() => setShowFilterModal(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Image
              source={require("../../assets/images/filter-modern-square.png")}
              style={styles.filterIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ბოლოს შეკვეთილი */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ბოლოს შეკვეთილი</Text>
          {loadingOrders ? (
            <View style={styles.recentLoading}>
              <ActivityIndicator size="small" color={BRAND_GREEN} />
            </View>
          ) : recentlyOrdered.length === 0 ? (
            <Text style={styles.emptyHint}>
              აქ გამოჩნდება ბოლო დროს შეკვეთილი რესტორნები
            </Text>
          ) : (
            recentlyOrdered.map((restaurant, index) => (
              <View key={restaurant.id}>
                <TouchableOpacity
                  style={styles.recentRow}
                  onPress={() => handleRestaurantPress(restaurant.id)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={
                      restaurant.image && typeof restaurant.image === "string"
                        ? { uri: restaurant.image }
                        : require("../../assets/images/magnolia.png")
                    }
                    style={styles.recentThumb}
                  />
                  <View style={styles.recentBody}>
                    <Text style={styles.recentName} numberOfLines={1}>
                      {restaurant.name}
                    </Text>
                    <Text style={styles.recentSubtitle}>რესტორანი</Text>
                    <View style={styles.recentMetaRow}>
                      <View style={styles.metaChip}>
                        <MaterialIcons
                          name="delivery-dining"
                          size={15}
                          color="#6B7280"
                        />
                        <Text style={styles.metaText}>
                          {formatLari(restaurant.deliveryFee)}
                        </Text>
                      </View>
                      <View style={styles.metaChip}>
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color="#6B7280"
                        />
                        <Text style={styles.metaText}>
                          {String(restaurant.deliveryTime).includes("წუთ")
                            ? restaurant.deliveryTime
                            : `${restaurant.deliveryTime} წუთი`}
                        </Text>
                      </View>
                      <View style={styles.metaChip}>
                        <Ionicons name="star" size={14} color="#EAB308" />
                        <Text style={styles.metaDark}>
                          {restaurant.rating.toFixed(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
                {index < recentlyOrdered.length - 1 ? (
                  <View style={styles.rowDivider} />
                ) : null}
              </View>
            ))
          )}
        </View>

        {/* კატეგორიები */}
        <View style={styles.section}>
          <View style={styles.categoriesTitleRow}>
            <Ionicons name="grid-outline" size={16} color="#181B1A" />
            <Text style={styles.categoriesHeaderTitle}>კატეგორიები</Text>
          </View>
          {homeCategories.map((category, index) => (
            <View key={category.id}>
              <TouchableOpacity
                style={styles.categoryRow}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.65}
              >
                <Image
                  source={resolveCategoryIcon(category.name)}
                  style={styles.categoryRemoteIcon}
                />
                <Text style={styles.categoryLabel} numberOfLines={1}>
                  {category.name}
                </Text>
                <View style={styles.radioOuter} />
              </TouchableOpacity>
              {index < homeCategories.length - 1 ? (
                <View style={styles.categoryDivider} />
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={() => setShowFilterModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  screenPadding: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  searchBarWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 48,
  },
  searchBarIconBtn: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: "#181B1A",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  filterIcon: {
    width: 20,
    height: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: "#181B1A",
    lineHeight: 20,
    marginBottom: 14,
    textTransform: "uppercase",
  },
  categoriesTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  categoriesHeaderTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: "#181B1A",
    textTransform: "uppercase",
    textAlign: "left",
  },
  recentLoading: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyHint: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: "#9CA3AF",
    lineHeight: 20,
    paddingBottom: 8,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  recentThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  recentBody: {
    flex: 1,
    marginLeft: 14,
  },
  recentName: {
    fontSize: 14,
    lineHeight: 16,
    fontFamily: fontFamily.semiBold,
    color: "#181B1A",
    marginBottom: 2,
  },
  recentSubtitle: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: "#9CA3AF",
    marginBottom: 8,
  },
  recentMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 14,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: "#6B7280",
  },
  metaDark: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: "#181B1A",
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginLeft: 70,
  },
  categoryDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingRight: 4,
  },
  categoryEmoji: {
    fontSize: 22,
    width: 40,
    textAlign: "center",
  },
  categoryRemoteIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    marginHorizontal: 6,
    backgroundColor: "#F3F4F6",
  },
  categoryLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    lineHeight: 20,
    color: "#181B1A",
    marginLeft: 6,
    textTransform: "uppercase",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
});
