import { LIST_ACCENT_GREEN } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CartBottomBar from "../../components/CartBottomBar";
import { useRestaurant } from "../../hooks/useRestaurants";
import { apiService } from "../../utils/api";

const HERO_IMAGE_HEIGHT = 205;
const TAB_UNDERLINE = "#003E20";

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

function formatPriceGel(n: number): string {
  return `${n.toFixed(2).replace(".", ",")}₾`;
}

export default function RestaurantScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { restaurant, loading: restaurantLoading } = useRestaurant(
    restaurantId || "",
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
          : (response.data as { data?: MenuItem[] })?.data || [];
        setMenuItems(items);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
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
            .filter(
              (category) => category && category !== "ყველაზე პოპულარული",
            ),
        ),
      ];
      if (categories.length > 0) {
        setSelectedCategory(categories[0]);
      }
    }
  }, [menuItems, selectedCategory]);

  const getImageSource = (image: string | undefined) => {
    if (!image) return undefined;
    if (typeof image === "string") {
      return { uri: image };
    }
    return image;
  };

  if (restaurantLoading || loadingMenuItems) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={LIST_ACCENT_GREEN} />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>რესტორნი ვერ მოიძებნა</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>უკან დაბრუნება</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const rid = restaurant._id || restaurant.id || restaurantId || "";
  const coverUrl =
    (typeof restaurant.heroImage === "string" && restaurant.heroImage) ||
    (typeof restaurant.image === "string" && restaurant.image) ||
    "";

  const popularItems = menuItems.filter((item) => item.isPopular);
  const categories = [
    ...new Set(
      menuItems
        .map((item) => item.category)
        .filter((category) => category && category !== "ყველაზე პოპულარული"),
    ),
  ];
  const categoryItems = menuItems.filter(
    (item) => item.category === selectedCategory,
  );

  const navigateToProduct = (itemId: string) => {
    router.push({
      pathname: "/screens/product",
      params: {
        productId: itemId,
        restaurantId: rid,
      },
    });
  };

  const onShare = async () => {
    try {
      await Share.share({
        message: `${restaurant.name} — GreenGo`,
      });
    } catch {
      /* ignore */
    }
  };

  const logoLetter = restaurant.name?.trim()?.charAt(0)?.toUpperCase() || "G";

  const overlayTop = insets.top + 8;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces
      >
        <View style={[styles.heroWrap, { height: HERO_IMAGE_HEIGHT }]}>
          {coverUrl ? (
            <Image
              source={{ uri: coverUrl }}
              style={styles.heroImage}
              defaultSource={require("../../assets/images/magnolia.png")}
            />
          ) : (
            <Image
              source={require("../../assets/images/magnolia.png")}
              style={styles.heroImage}
            />
          )}

          <TouchableOpacity
            style={[styles.circleBtn, { top: overlayTop, left: 16 }]}
            onPress={() => router.back()}
            activeOpacity={0.85}
            accessibilityLabel="უკან"
          >
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.circleBtn, { top: overlayTop, right: 16 }]}
            onPress={() => setIsLiked((v) => !v)}
            activeOpacity={0.85}
            accessibilityLabel="რჩეული"
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={22}
              color={isLiked ? "#EF4444" : "#111827"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.sheet}>
          <View style={styles.logoWrap}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoLetter}>{logoLetter}</Text>
            </View>
          </View>

          <Text style={styles.restaurantTitle}>{restaurant.name}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCell}>
              <Ionicons name="star" size={18} color="#EAB308" />
              <Text style={styles.statValue}>
                {restaurant.rating?.toFixed?.(1) ?? restaurant.rating}
              </Text>
              <Text style={styles.statLabel}>რეიტინგი</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Ionicons name="bicycle-outline" size={18} color="#6B7280" />
              <Text style={styles.statValue}>
                {formatPriceGel(restaurant.deliveryFee)}
              </Text>
              <Text style={styles.statLabel}>მიტანა</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <Ionicons name="time-outline" size={18} color="#6B7280" />
              <Text style={styles.statValue} numberOfLines={1}>
                {restaurant.deliveryTime?.replace(/\s*წუთ.*$/i, "") || "—"}
              </Text>
              <Text style={styles.statLabel}>წუთი</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.detailsBtn}
              activeOpacity={0.88}
              onPress={() =>
                router.push({
                  pathname: "/screens/restaurantDetails",
                  params: { restaurantId: rid },
                })
              }
            >
              <Text style={styles.detailsBtnText}>დეტალური ინფორმაცია</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={onShare}
              activeOpacity={0.88}
            >
              <Ionicons name="share-outline" size={22} color={"#00592D"} />
            </TouchableOpacity>
          </View>
        </View>

        {popularItems.length > 0 ? (
          <View style={styles.block}>
            <Text style={styles.blockTitle}>ყველაზე პოპულარული</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularScrollInner}
            >
              {popularItems.map((item) => (
                <TouchableOpacity
                  key={item._id || item.id}
                  style={styles.popularCard}
                  activeOpacity={0.9}
                  onPress={() => navigateToProduct(item._id || item.id || "")}
                >
                  {item.image ? (
                    <Image
                      source={getImageSource(item.image)!}
                      style={styles.popularImage}
                    />
                  ) : (
                    <View style={styles.popularImage} />
                  )}
                  <View style={styles.popularTextBlock}>
                    {item.description ? (
                      <Text style={styles.popularDesc} numberOfLines={2}>
                        {item.description}
                      </Text>
                    ) : null}
                    <Text style={styles.popularPrice}>
                      {formatPriceGel(item.price)}
                    </Text>
                    <Text style={styles.popularName} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {categories.length > 0 ? (
          <View style={styles.tabsOuter}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsScrollInner}
            >
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={styles.tabItem}
                    onPress={() => setSelectedCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[styles.tabText, active && styles.tabTextActive]}
                      numberOfLines={1}
                    >
                      {cat}
                    </Text>
                    <View
                      style={[
                        styles.tabUnderline,
                        active && styles.tabUnderlineActive,
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.block}>
          <Text style={styles.blockTitle}>{selectedCategory || "მენიუ"}</Text>
          {categoryItems.map((item, index) => (
            <TouchableOpacity
              key={item._id || item.id}
              style={[
                styles.menuRow,
                index < categoryItems.length - 1 && styles.menuRowBorder,
              ]}
              activeOpacity={0.75}
              onPress={() => navigateToProduct(item._id || item.id || "")}
            >
              <View style={styles.menuRowText}>
                <Text style={styles.menuName}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.menuDesc} numberOfLines={3}>
                    {item.description}
                  </Text>
                ) : null}
                <Text style={styles.menuPrice}>
                  {item.price.toFixed(2).replace(".", ",")} ₾
                </Text>
              </View>
              {item.image ? (
                <Image
                  source={getImageSource(item.image)!}
                  style={styles.menuThumb}
                />
              ) : (
                <View style={styles.menuThumb} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <CartBottomBar restaurantId={rid} />
    </View>
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
  heroWrap: {
    width: "100%",
    position: "relative",
    backgroundColor: "#E5E7EB",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  circleBtn: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    zIndex: 2,
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -28,
    paddingHorizontal: 20,
    paddingBottom: 8,
    paddingTop: 0,
    zIndex: 1,
  },
  logoWrap: {
    alignItems: "center",
    marginTop: -36,
    marginBottom: 8,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: LIST_ACCENT_GREEN,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  logoLetter: {
    fontSize: 28,
    fontFamily: fontFamily.bold,
    color: "#FFFFFF",
  },
  restaurantTitle: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    color: "#111827",
    textAlign: "center",
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  statCell: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 44,
    backgroundColor: "#E5E7EB",
  },
  statValue: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: "#111827",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: "#6B7280",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailsBtn: {
    flex: 1,
    backgroundColor: "#EFFBF5",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  detailsBtnText: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: "#166534",
    textAlign: "center",
  },
  shareBtn: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: "#EFFBF5",
    alignItems: "center",
    justifyContent: "center",
  },
  block: {
    paddingHorizontal: 20,
    marginTop: 22,
  },
  blockTitle: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    color: "#111827",
    marginBottom: 14,
  },
  popularScrollInner: {
    paddingRight: 20,
    gap: 12,
    flexDirection: "row",
  },
  popularCard: {
    width: 140,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  popularImage: {
    width: 140,
    height: 100,
    resizeMode: "cover",
    backgroundColor: "#F3F4F6",
  },
  popularTextBlock: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 4,
  },
  popularDesc: {
    fontSize: 11,
    fontFamily: fontFamily.regular,
    color: "#6B7280",
    lineHeight: 15,
  },
  popularPrice: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: LIST_ACCENT_GREEN,
  },
  popularName: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    color: "#111827",
    lineHeight: 17,
    marginTop: 2,
  },
  tabsOuter: {
    marginTop: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  tabsScrollInner: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  tabItem: {
    marginRight: 20,
    paddingBottom: 10,
    minWidth: 56,
  },
  tabText: {
    fontSize: 15,
    fontFamily: fontFamily.medium,
    color: "#6B7280",
    marginBottom: 8,
  },
  tabTextActive: {
    color: "#111827",
    fontFamily: fontFamily.semiBold,
  },
  tabUnderline: {
    height: 3,
    borderRadius: 2,
    backgroundColor: "transparent",
  },
  tabUnderlineActive: {
    backgroundColor: TAB_UNDERLINE,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  menuRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  menuRowText: {
    flex: 1,
    minWidth: 0,
  },
  menuName: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: "#111827",
    lineHeight: 16,
    marginBottom: 4,
  },
  menuDesc: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: "#6B7280",
    lineHeight: 17,
    marginBottom: 8,
  },
  menuPrice: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    lineHeight: 20,
    color: LIST_ACCENT_GREEN,
  },
  menuThumb: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: "#6B7280",
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
    fontFamily: fontFamily.regular,
    color: "#EF4444",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: LIST_ACCENT_GREEN,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
  },
});
