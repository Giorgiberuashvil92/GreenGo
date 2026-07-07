import { fontFamily } from "@/constants/fonts";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { apiService } from "../utils/api";

const LOGO_WIDTH = 65;
const LOGO_HEIGHT = 50;
const CARD_SIDE_PADDING = 16;
/** Figma — პირველი ქარდი */
const FIGMA_MAIN_W = 264;
const FIGMA_MAIN_H = 114;
const FIGMA_MAIN_PADDING = 8;
/** Figma — მეორე სვეტი */
const FIGMA_THUMB_W = 100;
const FIGMA_THUMB_COL_H = 114;
const FIGMA_GALLERY_GAP = 10;
const FIGMA_THUMB_GAP = 6;

function useGalleryLayout() {
  const { width: screenWidth } = useWindowDimensions();
  const clipWidth = screenWidth - CARD_SIDE_PADDING;
  const designTotal = FIGMA_MAIN_W + FIGMA_GALLERY_GAP + FIGMA_THUMB_W;
  /** ~82% thumb ჩანს, ~18% ოდნავ მოჭრილი; სქროლით ჩანს სრულად */
  const THUMB_PEEK_VISIBLE = 0.82;
  const hiddenThumb = FIGMA_THUMB_W * (1 - THUMB_PEEK_VISIBLE);
  const rowScale = Math.min(1.06, clipWidth / (designTotal - hiddenThumb));
  const mainHeight = Math.round(FIGMA_MAIN_H * rowScale);
  const thumbColHeight = Math.round(FIGMA_THUMB_COL_H * rowScale);
  const thumbGap = Math.round(FIGMA_THUMB_GAP * rowScale);

  return {
    clipWidth,
    mainWidth: Math.round(FIGMA_MAIN_W * rowScale),
    mainHeight,
    thumbWidth: Math.round(FIGMA_THUMB_W * rowScale),
    thumbColHeight,
    thumbHeight: Math.round((thumbColHeight - thumbGap) / 2),
    galleryGap: Math.round(FIGMA_GALLERY_GAP * rowScale),
    thumbGap,
    mainPadding: Math.round(FIGMA_MAIN_PADDING * rowScale),
  };
}

interface MenuPreviewItem {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  image?: string | number;
  isPopular?: boolean;
}

/** სტატიკური კერძები — როცა API-დან 3-ზე ნაკლები მოდის */
const STATIC_GALLERY_ITEMS: MenuPreviewItem[] = [
  {
    id: "static-burger",
    name: "ბურგერი",
    price: 20,
    image: require("../assets/images/burger.png"),
  },
  {
    id: "static-ribs",
    name: "შებოლილი ნეკნები",
    price: 28.4,
    image: require("../assets/images/kfc.png"),
  },
  {
    id: "static-shawarma",
    name: "შაურმა სტანდარტი",
    price: 14,
    image: require("../assets/images/shaurma.png"),
  },
];

function isStaticGalleryItem(id?: string): boolean {
  return (
    !id ||
    id === "hero" ||
    id.startsWith("static-") ||
    id.startsWith("fallback-")
  );
}

function buildGalleryItems(
  fromApi: MenuPreviewItem[],
  restaurant: RestaurantListCardRestaurant,
): MenuPreviewItem[] {
  const slots: MenuPreviewItem[] = [...fromApi.slice(0, 12)];

  for (let i = slots.length; i < 3; i++) {
    if (STATIC_GALLERY_ITEMS[i]) {
      slots.push({ ...STATIC_GALLERY_ITEMS[i] });
      continue;
    }
    slots.push({
      id: "fallback-" + i,
      name: restaurant.name,
      price: 0,
      image: restaurant.image,
    });
  }

  return slots;
}

function chunkGalleryBlocks(items: MenuPreviewItem[]): MenuPreviewItem[][] {
  const blocks: MenuPreviewItem[][] = [];
  for (let i = 0; i < items.length; i += 3) {
    const block = items.slice(i, i + 3);
    if (block.length > 0) blocks.push(block);
  }
  return blocks;
}

export interface RestaurantListCardRestaurant {
  _id?: string;
  id?: string;
  name: string;
  rating: number;
  reviewCount: number;
  deliveryFee: number;
  deliveryTime: string;
  image: string | number;
  heroImage?: string;
  categories?: string[];
  cuisine?: string[];
}

function formatGel(amount: number): string {
  return amount.toFixed(2).replace(".", ",") + " ₾";
}

function deliveryTimeLabel(time: string): string {
  const t = time?.trim() || "";
  if (!t) return "—";
  if (t.includes("წუთ")) return t;
  const range = t.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (range) return range[1] + "-" + range[2] + " წუთი";
  const single = t.match(/(\d+)/);
  if (single) {
    const m = parseInt(single[1], 10);
    return m + "-" + (m + 10) + " წუთი";
  }
  return t + " წუთი";
}

function getImageSource(image: unknown) {
  if (typeof image === "string" && image.length > 0) {
    return { uri: image };
  }
  if (image) {
    return image as number;
  }
  return require("../assets/images/magnolia.png");
}

/** Frame 20 — თეთრი blur ბეიჯი დიდ სურათზე */
function MainDishBadge({ label, inset }: { label: string; inset: number }) {
  return (
    <View
      style={[styles.mainDishBadge, { top: inset, left: inset }]}
      pointerEvents="none"
    >
      <BlurView intensity={16} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.mainDishBadgeOverlay} />
      <Text style={styles.mainDishBadgeText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/** პატარა სურათზე — მუქი ფასის ბეიჯი */
function ThumbPriceBadge({ label, inset }: { label: string; inset: number }) {
  return (
    <View
      style={[styles.thumbPriceBadge, { top: inset, left: inset }]}
      pointerEvents="none"
    >
      <Text style={styles.thumbPriceBadgeText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export default function RestaurantListCard({
  restaurant,
  onPress,
  onDishPress,
}: {
  restaurant: RestaurantListCardRestaurant;
  onPress: () => void;
  onDishPress?: (menuItemId: string) => void;
}) {
  const restaurantId = restaurant.id || restaurant._id || "";
  const [menuItems, setMenuItems] = useState<MenuPreviewItem[]>([]);
  const {
    clipWidth,
    mainWidth,
    mainHeight,
    thumbWidth,
    thumbColHeight,
    thumbHeight,
    galleryGap,
    thumbGap,
    mainPadding,
  } = useGalleryLayout();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await apiService.getMenuItems({
          restaurantId,
          limit: 12,
        });
        if (cancelled) return;

        const raw =
          response.success && response.data
            ? Array.isArray(response.data)
              ? (response.data as MenuPreviewItem[])
              : (response.data as { data?: MenuPreviewItem[] })?.data || []
            : [];
        const popular = raw.filter((item) => item.isPopular);
        const source = popular.length > 0 ? popular : raw;
        setMenuItems(source.slice(0, 12));
      } catch {
        if (!cancelled) setMenuItems([]);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  const categoryLabel =
    restaurant.categories?.[0] || restaurant.cuisine?.[0] || "რესტორანი";

  const galleryItems = useMemo(
    () => buildGalleryItems(menuItems, restaurant),
    [menuItems, restaurant],
  );

  const galleryBlocks = useMemo(
    () => chunkGalleryBlocks(galleryItems),
    [galleryItems],
  );

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.headerRow}
        activeOpacity={0.85}
        onPress={onPress}
      >
        <Image
          source={getImageSource(restaurant.image)}
          style={styles.logo}
          resizeMode="cover"
          defaultSource={require("../assets/images/magnolia.png")}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <Text style={styles.category} numberOfLines={1}>
            {categoryLabel}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialIcons name="two-wheeler" size={14} color="#9B9B9B" />
              <Text style={styles.metaText}>
                {formatGel(restaurant.deliveryFee)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={13} color="#9B9B9B" />
              <Text style={styles.metaText}>
                {deliveryTimeLabel(String(restaurant.deliveryTime))}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={13} color="#F5B800" />
              <Text style={styles.ratingValue}>
                {restaurant.rating.toFixed(1)}
              </Text>
              <Text style={styles.reviewCount}>({restaurant.reviewCount})</Text>
            </View>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color="#003E20"
          style={styles.headerChevron}
        />
      </TouchableOpacity>

      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        style={[
          styles.galleryScroll,
          { width: clipWidth, marginRight: -CARD_SIDE_PADDING },
        ]}
        contentContainerStyle={styles.galleryScrollContent}
      >
        {galleryBlocks.map((block, blockIndex) => {
          const mainItem = block[0];
          const thumbItems = block.slice(1);
          const mainBadgeLabel =
            mainItem.price > 0
              ? mainItem.name + " \u2022 " + formatGel(mainItem.price)
              : mainItem.name;

          return (
            <View
              key={"gallery-block-" + blockIndex}
              style={[
                styles.galleryRow,
                { gap: galleryGap },
                blockIndex < galleryBlocks.length - 1 && {
                  marginRight: galleryGap,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.mainDish,
                  { width: mainWidth, height: mainHeight },
                ]}
                activeOpacity={0.92}
                onPress={() => {
                  const id = mainItem._id || mainItem.id;
                  if (id && !isStaticGalleryItem(id) && onDishPress) {
                    onDishPress(id);
                  } else {
                    onPress();
                  }
                }}
              >
                <Image
                  source={getImageSource(mainItem.image || restaurant.image)}
                  style={styles.mainImage}
                />
                <MainDishBadge label={mainBadgeLabel} inset={mainPadding} />
              </TouchableOpacity>

              {thumbItems.length > 0 ? (
                <View
                  style={[
                    styles.thumbColumn,
                    {
                      width: thumbWidth,
                      height: thumbColHeight,
                      gap: thumbGap,
                    },
                  ]}
                >
                  {thumbItems.map((item, index) => {
                    const itemId =
                      item._id || item.id || "side-" + blockIndex + "-" + index;
                    return (
                      <TouchableOpacity
                        key={itemId}
                        style={[
                          styles.thumb,
                          { width: thumbWidth, height: thumbHeight },
                        ]}
                        activeOpacity={0.92}
                        onPress={() => {
                          if (
                            itemId &&
                            !isStaticGalleryItem(itemId) &&
                            onDishPress
                          ) {
                            onDishPress(itemId);
                          } else {
                            onPress();
                          }
                        }}
                      >
                        <Image
                          source={getImageSource(item.image || restaurant.image)}
                          style={styles.thumbImage}
                        />
                        {item.price > 0 ? (
                          <ThumbPriceBadge
                            label={formatGel(item.price)}
                            inset={mainPadding}
                          />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: CARD_SIDE_PADDING,
    overflow: "visible",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EEEEEE",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  headerInfo: {
    flex: 1,
    minWidth: 0,
  },
  headerChevron: {
    marginLeft: 2,
  },
  name: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    textTransform: "uppercase",
    color: "#181B1A",
    lineHeight: 20,
  },
  category: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: "#9E9E9E",
    marginTop: 2,
    lineHeight: 15,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 6,
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontSize: 8,
    fontFamily: fontFamily.medium,
    color: "#9B9B9B",
  },
  ratingValue: {
    fontSize: 11,
    fontFamily: fontFamily.semiBold,
    color: "#181B1A",
    marginLeft: 2,
  },
  reviewCount: {
    fontSize: 11,
    fontFamily: fontFamily.regular,
    color: "#9E9E9E",
  },
  galleryScroll: {
    marginTop: 10,
    alignSelf: "flex-start",
  },
  galleryScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: CARD_SIDE_PADDING,
  },
  galleryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  thumbColumn: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  mainDish: {
    flexDirection: "column",
    alignItems: "flex-start",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  thumb: {
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  mainDishBadge: {
    position: "absolute",
    maxWidth: "94%",
    minHeight: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  mainDishBadgeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  mainDishBadgeText: {
    fontSize: 8,
    lineHeight: 12,
    fontFamily: fontFamily.bold,
    color: "#FFFFFF",
  },
  thumbPriceBadge: {
    position: "absolute",
    maxWidth: "92%",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  thumbPriceBadgeText: {
    fontSize: 8,
    lineHeight: 12,
    fontFamily: fontFamily.bold,
    color: "#FFFFFF",
  },
});
