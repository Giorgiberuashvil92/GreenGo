import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import CartBottomBar from "../../components/CartBottomBar";
import { useRestaurant } from "../../hooks/useRestaurants";
import { apiService } from "../../utils/api";
import { USE_MOCK_DATA, mockMenuItems } from "../../utils/mockData";

interface MenuItem {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  isPopular?: boolean;
  restaurantId: string;
}

export default function RestaurantScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const router = useRouter();
  const { restaurant, loading: restaurantLoading } = useRestaurant(
    restaurantId || ""
  );
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingMenuItems, setLoadingMenuItems] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchMenuItems = async () => {
    try {
      setLoadingMenuItems(true);
      const response = await apiService.getMenuItems({
        restaurantId: restaurantId || "",
      });
      if (response.success && response.data) {
        const items = Array.isArray(response.data)
          ? response.data
          : (response.data as any)?.data || [];
        setMenuItems(items);
      } else if (USE_MOCK_DATA || apiService.isUsingMockData()) {
        console.log("🔶 Using direct mock menu items");
        const directMockItems = mockMenuItems.filter(
          (item) =>
            item.restaurantId === `restaurant-${restaurantId}` ||
            item.restaurantId === restaurantId
        );
        setMenuItems(directMockItems as MenuItem[]);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      if (USE_MOCK_DATA || apiService.isUsingMockData()) {
        const directMockItems = mockMenuItems.filter(
          (item) =>
            item.restaurantId === `restaurant-${restaurantId}` ||
            item.restaurantId === restaurantId
        );
        setMenuItems(directMockItems as MenuItem[]);
      }
    } finally {
      setLoadingMenuItems(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchMenuItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  useEffect(() => {
    if (menuItems.length > 0 && !selectedCategory) {
      const categories = [
        ...new Set(
          menuItems
            .map((item) => item.category)
            .filter((category) => category && category !== "ყველაზე პოპულარული")
        ),
      ];
      if (categories.length > 0) {
        setSelectedCategory(categories[0]);
      }
    }
  }, [menuItems, selectedCategory]);

  if (restaurantLoading || loadingMenuItems) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>რესტორნი ვერ მოიძებნა</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>უკან დაბრუნება</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const popularItems = menuItems.filter((item) => item.isPopular);

  const categories = [
    ...new Set(
      menuItems
        .map((item) => item.category)
        .filter((category) => category && category !== "ყველაზე პოპულარული")
    ),
  ];

  const categoryItems = menuItems.filter(
    (item) => item.category === selectedCategory
  );

  const navigateToProduct = (itemId: string) => {
    router.push({
      pathname: "/screens/product",
      params: {
        productId: itemId,
        restaurantId: restaurant._id || restaurant.id || restaurantId,
      },
    });
  };

  const getImageSource = (image: any) => {
    if (typeof image === "string") {
      return { uri: image };
    }
    return image;
  };

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item._id || item.id}
      style={styles.menuItem}
      onPress={() => navigateToProduct(item._id || item.id || "")}
    >
      <View style={styles.menuItemContent}>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.menuItemDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <Text style={styles.menuItemPrice}>
            {item.price.toFixed(2).replace(".", ",")} ₾
          </Text>
        </View>
        {item.image && (
          <Image
            source={getImageSource(item.image)}
            style={styles.menuItemImage}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderPopularItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item._id || item.id}
      style={styles.popularItem}
      onPress={() => navigateToProduct(item._id || item.id || "")}
    >
      {item.image && (
        <Image
          source={getImageSource(item.image)}
          style={styles.popularItemImage}
        />
      )}
      <View style={styles.popularItemInfo}>
        <Text style={styles.popularItemPrice}>
          {item.price.toFixed(2).replace(".", ",")} ₾
        </Text>
        <View style={styles.dottedLine} />
        <Text style={styles.popularItemName} numberOfLines={1}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Check if delivery has discount
  const hasDeliveryDiscount = restaurant.discountedDeliveryFee !== undefined;
  const deliveryFeeDisplay = hasDeliveryDiscount
    ? restaurant.discountedDeliveryFee
    : restaurant.deliveryFee;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image Section */}
        <View style={styles.heroSection}>
          {restaurant.heroImage && (
            <Image
              source={getImageSource(restaurant.heroImage)}
              style={styles.heroImage}
            />
          )}

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>

          {/* Like Button */}
          <TouchableOpacity style={styles.likeButton} onPress={toggleLike}>
            <Feather
              name="heart"
              size={24}
              color={isLiked ? "#E53935" : "#2E7D32"}
            />
          </TouchableOpacity>

          {/* Center Logo */}
          <View style={styles.logoWrapper}>
            {restaurant.image && (
              <Image
                source={getImageSource(restaurant.image)}
                style={styles.logoImage}
              />
            )}
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Restaurant Name */}
          <Text style={styles.restaurantTitle}>{restaurant.name}</Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {/* Rating */}
            <View style={styles.statBlock}>
              <View style={styles.statIconValueRow}>
                <Ionicons name="star" size={20} color="#F9A825" />
                <Text style={styles.statValue}>
                  {restaurant.rating.toFixed(1)}
                </Text>
              </View>
              <Text style={styles.statLabel}>რეიტინგი</Text>
            </View>

            {/* Divider */}
            <View style={styles.statDivider} />

            {/* Delivery */}
            <View style={styles.statBlock}>
              <View style={styles.statIconValueRow}>
                <MaterialCommunityIcons
                  name="moped"
                  size={22}
                  color="#111111"
                />
                <View style={styles.deliveryPriceContainer}>
                  {hasDeliveryDiscount && (
                    <Text style={styles.originalPrice}>
                      {restaurant.deliveryFee.toFixed(2).replace(".", ",")}₾
                    </Text>
                  )}
                  <Text style={styles.statValue}>
                    {deliveryFeeDisplay?.toFixed(2).replace(".", ",")}₾
                  </Text>
                </View>
              </View>
              <Text style={styles.statLabel}>მიტანა</Text>
            </View>

            {/* Divider */}
            <View style={styles.statDivider} />

            {/* Time */}
            <View style={styles.statBlock}>
              <View style={styles.statIconValueRow}>
                <Ionicons name="time-outline" size={20} color="#111111" />
                <Text style={styles.statValue}>
                  {restaurant.deliveryTime || "20-30"}
                </Text>
              </View>
              <Text style={styles.statLabel}>წუთი</Text>
            </View>
          </View>

          {/* CTA Row */}
          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={styles.ctaButton}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: "/screens/restaurantDetails",
                  params: { restaurantId: restaurant.id || restaurant._id },
                })
              }
            >
              <Text style={styles.ctaText}>დეტალური ინფორმაცია</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} activeOpacity={0.8}>
              <Ionicons name="share-outline" size={22} color="#2E7D32" />
            </TouchableOpacity>
          </View>

          {/* Popular Section */}
          {popularItems.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ყველაზე პოპულარული</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.popularScroll}
              >
                {popularItems.map(renderPopularItem)}
              </ScrollView>
            </View>
          )}

          {/* Category Tabs */}
          {categories.length > 0 && (
            <View style={styles.tabsContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabsScroll}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={styles.tabItem}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        selectedCategory === category && styles.tabTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                    {selectedCategory === category && (
                      <View style={styles.tabUnderline} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Menu Items */}
          <View style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{selectedCategory}</Text>
            {categoryItems.map(renderMenuItem)}
          </View>
        </View>
      </ScrollView>

      {/* Cart Bottom Bar */}
      <CartBottomBar
        restaurantId={restaurant._id || restaurant.id || restaurantId || ""}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    height: 220,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  likeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  logoWrapper: {
    position: "absolute",
    bottom: -45,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  logoImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingTop: 55,
    paddingHorizontal: 16,
  },
  restaurantTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginBottom: 16,
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
  },
  statIconValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E5E5",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "400",
    color: "#9E9E9E",
  },
  deliveryPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  originalPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9E9E9E",
    textDecorationLine: "line-through",
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  ctaButton: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaText: {
    color: "#2E7D32",
    fontSize: 16,
    fontWeight: "600",
  },
  shareButton: {
    width: 54,
    height: 54,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  popularScroll: {
    paddingRight: 16,
  },
  popularItem: {
    width: 200,
    marginRight: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  popularItemImage: {
    width: "100%",
    height: 140,
    resizeMode: "cover",
  },
  popularItemInfo: {
    padding: 12,
  },
  popularItemPrice: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 8,
  },
  dottedLine: {
    height: 1,
    borderStyle: "dotted",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 8,
  },
  popularItemName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1A1A1A",
  },
  tabsContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tabsScroll: {
    paddingRight: 16,
  },
  tabItem: {
    marginRight: 28,
    paddingBottom: 12,
    position: "relative",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#9E9E9E",
  },
  tabTextActive: {
    color: "#1A1A1A",
    fontWeight: "700",
  },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#2E7D32",
    borderRadius: 2,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuSectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  menuItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  menuItemText: {
    flex: 1,
    marginRight: 12,
  },
  menuItemName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  menuItemDescription: {
    fontSize: 13,
    color: "#757575",
    lineHeight: 18,
    marginBottom: 8,
  },
  menuItemPrice: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2E7D32",
  },
  menuItemImage: {
    width: 100,
    height: 100,
    borderRadius: 14,
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
});

