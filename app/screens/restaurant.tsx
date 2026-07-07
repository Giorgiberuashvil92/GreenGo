import { LIST_ACCENT_GREEN } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CartBottomBar from "../../components/CartBottomBar";
import BackCircleIcon from "../../components/icons/BackCircleIcon";
import PopularMenuCard, {
  POPULAR_MENU_CARD_GAP,
} from "../../components/PopularMenuCard";
import ProductModal from "../../components/ProductModal";
import { useRestaurant } from "../../hooks/useRestaurants";
import { apiService } from "../../utils/api";

const HERO_IMAGE_HEIGHT = 205;
const TAB_UNDERLINE = "#003E20";
const DETAILS_TEXT_COLOR = "#1D4045";

/** სექციის სათაურები — 16/20 extraBold uppercase */
const SECTION_TITLE: TextStyle = {
  fontSize: 14,
  lineHeight: 20,
  fontFamily: fontFamily.semiBold,
  color: "#181B1A",
  textAlign: "center",
};

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

function deliveryTimeMain(time?: string): string {
  const t = time?.trim() || "";
  if (!t) return "—";
  return t.replace(/\s*წუთ.*$/i, "").trim() || t;
}

function normalizeCategoryName(name: string): string {
  return name.trim().toLocaleLowerCase("ka");
}

function categoryMatches(itemCategory: string, tabCategory: string): boolean {
  return (
    normalizeCategoryName(itemCategory) === normalizeCategoryName(tabCategory)
  );
}

function buildCategoryList(
  menuItems: MenuItem[],
  menuCategories?: { name: string; isActive?: boolean; order?: number }[],
): string[] {
  const adminCategories =
    menuCategories
      ?.filter((category) => category.isActive !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((category) => category.name) || [];

  if (adminCategories.length > 0) {
    return adminCategories;
  }

  return [
    ...new Set(
      menuItems
        .map((item) => item.category)
        .filter(
          (category) => category && category !== "ყველაზე პოპულარული",
        ),
    ),
  ];
}

export default function RestaurantScreen() {
  const { restaurantId, menuItemId } = useLocalSearchParams<{
    restaurantId: string;
    menuItemId?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { restaurant, loading: restaurantLoading } = useRestaurant(
    restaurantId || "",
  );
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingMenuItems, setLoadingMenuItems] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  const fetchMenuItems = async () => {
    if (!restaurantId) return;

    try {
      setLoadingMenuItems(true);
      const response = await apiService.getMenuItems({
        restaurantId,
        limit: 500,
      });
      if (response.success && response.data) {
        const items = Array.isArray(response.data)
          ? response.data
          : (response.data as { data?: MenuItem[] })?.data || [];
        setMenuItems(items);
      } else {
        setMenuItems([]);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      setMenuItems([]);
    } finally {
      setLoadingMenuItems(false);
    }
  };

  useEffect(() => {
    setMenuItems([]);
    setSelectedCategory("");
    setActiveProductId(menuItemId ?? null);

    if (restaurantId) {
      void fetchMenuItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const categories = useMemo(
    () =>
      buildCategoryList(
        menuItems,
        (
          restaurant as {
            menuCategories?: {
              name: string;
              isActive?: boolean;
              order?: number;
            }[];
          } | null
        )?.menuCategories,
      ),
    [menuItems, restaurant],
  );

  useEffect(() => {
    if (categories.length === 0) {
      setSelectedCategory("");
      return;
    }

    const selectedHasItems = menuItems.some((item) =>
      categoryMatches(item.category, selectedCategory),
    );
    const selectedExists = categories.some(
      (category) => categoryMatches(category, selectedCategory),
    );

    if (selectedCategory && selectedExists && selectedHasItems) {
      return;
    }

    const firstCategoryWithItems =
      categories.find((category) =>
        menuItems.some((item) => categoryMatches(item.category, category)),
      ) ?? categories[0];

    setSelectedCategory(firstCategoryWithItems);
  }, [categories, menuItems, selectedCategory]);

  useEffect(() => {
    if (menuItemId) {
      setActiveProductId(menuItemId);
    }
  }, [menuItemId]);

  const popularItems = useMemo(
    () => menuItems.filter((item) => item.isPopular),
    [menuItems],
  );

  const categoryItems = useMemo(
    () =>
      menuItems.filter((item) =>
        categoryMatches(item.category, selectedCategory),
      ),
    [menuItems, selectedCategory],
  );

  const getImageSource = (image: string | undefined) => {
    if (!image) return undefined;
    if (typeof image === "string") {
      return { uri: image };
    }
    return image;
  };

  if (
    (restaurantLoading && !restaurant) ||
    (loadingMenuItems && menuItems.length === 0)
  ) {
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

  const openProduct = (itemId: string) => {
    setActiveProductId(itemId);
  };

  const closeProduct = () => {
    setActiveProductId(null);
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
  const logoUri =
    typeof restaurant.image === "string" && restaurant.image.length > 0
      ? restaurant.image
      : null;

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
            <BackCircleIcon size={32} />
          </TouchableOpacity>
        </View>

        <View style={styles.sheet}>
          <View style={styles.logoWrap}>
            <View style={styles.logoRing}>
              {logoUri ? (
                <Image source={{ uri: logoUri }} style={styles.logoImage} />
              ) : (
                <View style={styles.logoCircle}>
                  <Text style={styles.logoLetter}>{logoLetter}</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.restaurantTitle}>{restaurant.name}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCell}>
              <View style={styles.statValueRow}>
                <Ionicons name="star" size={16} color="#EAB308" />
                <Text style={styles.statValue}>
                  {restaurant.rating?.toFixed?.(1) ?? restaurant.rating}
                </Text>
              </View>
              <Text style={styles.statLabel}>რეიტინგი</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <View style={styles.statValueRow}>
                <MaterialIcons name="two-wheeler" size={16} color="#181B1A" />
                <Text style={styles.statValue}>
                  {formatPriceGel(restaurant.deliveryFee)}
                </Text>
              </View>
              <Text style={styles.statLabel}>მიტანა</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCell}>
              <View style={styles.statValueRow}>
                <Ionicons name="time-outline" size={16} color="#181B1A" />
                <Text style={styles.statValue} numberOfLines={1}>
                  {deliveryTimeMain(restaurant.deliveryTime)}
                </Text>
              </View>
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
              <Text style={styles.detailsBtnText}>დეტალური ინფორმაცია </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={onShare}
              activeOpacity={0.88}
              accessibilityLabel="გაზიარება"
            >
              <Ionicons
                name="share-outline"
                size={22}
                color={DETAILS_TEXT_COLOR}
              />
            </TouchableOpacity>
          </View>
        </View>

        {popularItems.length > 0 ? (
          <View style={styles.popularBlock}>
            <Text style={styles.blockTitle}>ყველაზე პოპულარული</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularScrollInner}
            >
              {popularItems.map((item, index) => (
                <View
                  key={item._id || item.id}
                  style={
                    index < popularItems.length - 1
                      ? { marginRight: POPULAR_MENU_CARD_GAP }
                      : undefined
                  }
                >
                  <PopularMenuCard
                    name={item.name}
                    price={item.price}
                    imageUri={
                      typeof item.image === "string" ? item.image : undefined
                    }
                    onPress={() => openProduct(item._id || item.id || "")}
                  />
                </View>
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
                const active = categoryMatches(cat, selectedCategory);
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
                    {active ? <View style={styles.tabUnderlineActive} /> : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.menuBlock}>
          {categoryItems.map((item, index) => (
            <TouchableOpacity
              key={item._id || item.id}
              style={[
                styles.menuRow,
                index < categoryItems.length - 1 && styles.menuRowBorder,
              ]}
              activeOpacity={0.75}
              onPress={() => openProduct(item._id || item.id || "")}
            >
              <View style={styles.menuRowText}>
                <Text style={styles.menuName}>{item.name}</Text>

                <Text style={styles.menuDesc} numberOfLines={3}>
                  {item.description
                    ? item.description
                    : "დეტალები დაემატება მალე"}
                </Text>

                <Text style={styles.menuPrice}>
                  {formatPriceGel(item.price)}
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

      <ProductModal
        visible={!!activeProductId}
        productId={activeProductId}
        restaurantId={rid}
        restaurantName={restaurant.name}
        onClose={closeProduct}
      />
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
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    zIndex: 2,
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -28,
    paddingHorizontal: 16,
    paddingBottom: 4,
    paddingTop: 0,
    zIndex: 1,
  },
  logoWrap: {
    alignItems: "center",
    marginTop: -32,
    marginBottom: 5,
  },
  logoRing: {
    borderWidth: 4,
    borderColor: "#FFFFFF",
    borderRadius: 49,
    paddingBottom: 3,
    paddingHorizontal: 1,
    backgroundColor: "#FFFFFF",
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F3F4F6",
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: LIST_ACCENT_GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: {
    fontSize: 24,
    fontFamily: fontFamily.bold,
    color: "#FFFFFF",
  },
  restaurantTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: fontFamily.bold,
    color: "#181B1A",
    textAlign: "center",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    width: "100%",
    marginBottom: 16,
  },
  statCell: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "#F0F0F0",
    flexShrink: 0,
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.bold,
    color: "#181B1A",
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.regular,
    color: "#9B9B9B",
    textAlign: "center",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  detailsBtn: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#F1F8F9",
  },
  detailsBtnText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: DETAILS_TEXT_COLOR,
    textAlign: "center",
  },
  shareBtn: {
    flexDirection: "row",
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#F1F8F9",
  },
  popularBlock: {
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 16,
  },
  blockTitle: {
    ...SECTION_TITLE,
    textAlign: "left",
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  popularScrollInner: {
    paddingRight: 16,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  tabsOuter: {
    marginBottom: 12,
    marginHorizontal: 16,
  },
  tabsScrollInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  tabItem: {
    marginRight: 22,
    paddingBottom: 7,
    alignItems: "flex-start",
  },
  tabText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.medium,
    color: "#666666",
    marginBottom: 7,
  },
  tabTextActive: {
    fontSize: 16,
    lineHeight: 20,
    color: "#181B1A",
    fontFamily: fontFamily.bold,
  },
  tabUnderlineActive: {
    height: 1,
    alignSelf: "stretch",
    backgroundColor: TAB_UNDERLINE,
    minWidth: 40,
  },
  menuBlock: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  menuRow: {
    position: "relative",
    flexDirection: "row",
    alignItems: "flex-start",
    paddingBottom: 12,
    marginBottom: 12,
  },
  menuRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F5F5F5",
  },
  menuRowText: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    paddingRight: 90,
    gap: 4,
  },
  menuName: {
    ...SECTION_TITLE,
    textAlign: "left",
    textTransform: "none",
  },
  menuDesc: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: fontFamily.regular,
    color: "#666666",
  },
  menuPrice: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.bold,
    color: "#1D4045",
    letterSpacing: 1,
  },
  menuThumb: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 90,
    height: 68,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.medium,
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
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.medium,
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
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
  },
});
