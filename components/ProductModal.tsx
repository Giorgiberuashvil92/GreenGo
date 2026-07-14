import { BRAND_GREEN, BRAND_GREEN_LIGHT } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
import { apiService } from "@/utils/api";
import {
  getItemOfferPricing,
  type RestaurantOffer,
} from "@/utils/restaurantOffers";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "../contexts/CartContext";

const HERO_HEIGHT = 320;

interface MenuItem {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  heroImage?: string;
  category: string;
  isPopular?: boolean;
  restaurantId: string;
  ingredients?: {
    id: string;
    name: string;
    icon: string;
    canRemove: boolean;
    isDefault: boolean;
  }[];
  drinks?: {
    id: string;
    name: string;
    price: number;
    image: string;
  }[];
}

function formatPriceGel(n: number): string {
  return `${n.toFixed(2).replace(".", ",")}₾`;
}

function ingredientEmoji(icon: string): string {
  const k = icon?.toLowerCase?.() || "";
  if (k.includes("ketchup") || k.includes("კეტჩ")) return "🥫";
  if (k.includes("mayo") || k.includes("მაიო")) return "⚪";
  if (k.includes("onion") || k.includes("ხახვ")) return "🧅";
  if (k.includes("lettuce") || k.includes("სალათ")) return "🥬";
  if (k.includes("chili") || k.includes("წიწაკ")) return "🌶️";
  if (k.includes("cheese") || k.includes("ყველი")) return "🧀";
  if (k.includes("tomato") || k.includes("პომიდ")) return "🍅";
  if (k.includes("all") || k.includes("ყველაფერი")) return "✨";
  if (icon && icon.length <= 4 && /[\u0080-\uFFFF]/.test(icon)) return icon;
  return "•";
}

type ProductModalProps = {
  visible: boolean;
  productId: string | null;
  restaurantId: string;
  restaurantName: string;
  onClose: () => void;
  asModal?: boolean;
};

function ProductDetailBody({
  productId,
  restaurantId,
  restaurantName,
  onClose,
  asModal = true,
}: Omit<ProductModalProps, "visible">) {
  const insets = useSafeAreaInsets();
  const { addToCart, updateQuantity } = useCart();
  const [product, setProduct] = useState<MenuItem | null>(null);
  const [offers, setOffers] = useState<RestaurantOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(
    new Set(),
  );
  const [selectedDrink, setSelectedDrink] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setOffers([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        setQuantity(1);
        setSelectedDrink(null);
        const [response, offersRes] = await Promise.all([
          apiService.getMenuItem(productId),
          restaurantId
            ? apiService.getRestaurantOffers(restaurantId, true)
            : Promise.resolve({ success: false as const, data: undefined }),
        ]);
        if (cancelled) return;

        if (offersRes.success && offersRes.data) {
          setOffers(Array.isArray(offersRes.data) ? offersRes.data : []);
        } else {
          setOffers([]);
        }

        if (response.success && response.data) {
          const menuItem = response.data as unknown as MenuItem;
          setProduct(menuItem);
          if (menuItem.ingredients) {
            const defaultIngredientIds = menuItem.ingredients
              .filter((ing) => ing.isDefault)
              .map((ing) => ing.id);
            setSelectedIngredients(new Set(defaultIngredientIds));
          } else {
            setSelectedIngredients(new Set());
          }
        } else {
          setProduct(null);
          setError("პროდუქტი ვერ მოიძებნა");
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setProduct(null);
          setError(err instanceof Error ? err.message : "უცნობი შეცდომა");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [productId, restaurantId]);

  const toggleIngredient = (ingredientId: string) => {
    setSelectedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(ingredientId)) {
        next.delete(ingredientId);
      } else {
        next.add(ingredientId);
      }
      return next;
    });
  };

  const selectedDrinkData = selectedDrink
    ? product?.drinks?.find((d) => d.id === selectedDrink)
    : null;
  const selectedDrinkPrice = selectedDrinkData ? selectedDrinkData.price : 0;
  const productIdKey = product?._id || product?.id || productId || "";
  const offerPricing = product
    ? getItemOfferPricing(offers, productIdKey, product.price)
    : { original: 0, final: 0, percent: null, offer: null };
  const discountedUnit = offerPricing.final;
  const baseTotal = discountedUnit + selectedDrinkPrice;
  const lineTotal = baseTotal * quantity;

  const handleAddToCart = () => {
    if (!product) return;
    const id = product._id || product.id || productId || "";
    addToCart({
      id,
      name: product.name,
      price: baseTotal,
      image: product.heroImage || product.image,
      restaurantId,
      restaurantName,
    });
    if (quantity > 1) {
      updateQuantity(id, quantity);
    }
    onClose();
  };

  if (loading) {
    return (
      <View style={styles.stateWrap}>
        <ActivityIndicator size="large" color={BRAND_GREEN} />
        <Text style={styles.loadingText}>იტვირთება...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.stateWrap}>
        <Text style={styles.errorText}>{error || "პროდუქტი ვერ მოიძებნა"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onClose}>
          <Text style={styles.retryButtonText}>დახურვა</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const coverUri =
    (typeof product.heroImage === "string" && product.heroImage) ||
    (typeof product.image === "string" && product.image) ||
    "";

  const footerPad = Math.max(insets.bottom, 12);
  const closeButtonTop = asModal ? 12 : insets.top + 8;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 160 + footerPad },
        ]}
        bounces
      >
        <View style={[styles.heroWrap, { height: HERO_HEIGHT }]}>
          {coverUri ? (
            <Image
              source={{ uri: coverUri }}
              style={styles.heroImage}
              defaultSource={require("../assets/images/magnolia.png")}
            />
          ) : (
            <Image
              source={require("../assets/images/magnolia.png")}
              style={styles.heroImage}
            />
          )}
          <TouchableOpacity
            style={[styles.circleBack, { top: closeButtonTop }]}
            onPress={onClose}
            activeOpacity={0.85}
            accessibilityLabel="დახურვა"
          >
            <Ionicons name="close" size={22} color={BRAND_GREEN} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <Text style={styles.restaurantName}>{restaurantName}</Text>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>
              {formatPriceGel(offerPricing.final)}
            </Text>
            {offerPricing.percent != null ? (
              <>
                <Text style={styles.originalPrice}>
                  {formatPriceGel(offerPricing.original)}
                </Text>
                <Text style={styles.discountBadge}>
                  −{offerPricing.percent}%
                </Text>
              </>
            ) : null}
          </View>
          {product.description ? (
            <Text style={styles.productDescription}>{product.description}</Text>
          ) : null}
        </View>

        {product.ingredients && product.ingredients.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionDividerTop} />
            <View style={styles.sectionHeader}>
              <Ionicons name="grid-outline" size={20} color={BRAND_GREEN} />
              <Text style={styles.sectionTitle}>ინგრედიენტები</Text>
            </View>
            {product.ingredients.map((ingredient, idx) => {
              const mandatory = ingredient.canRemove === false;
              const selected =
                mandatory || selectedIngredients.has(ingredient.id);
              const canTap = ingredient.canRemove === true;
              return (
                <TouchableOpacity
                  key={ingredient.id}
                  style={[
                    styles.optionRow,
                    idx === product.ingredients!.length - 1 &&
                      styles.optionRowLast,
                  ]}
                  onPress={() =>
                    canTap ? toggleIngredient(ingredient.id) : undefined
                  }
                  activeOpacity={canTap ? 0.65 : 1}
                  disabled={!canTap}
                >
                  <View
                    style={[styles.radioOuter, selected && styles.radioOuterOn]}
                  >
                    {selected ? <View style={styles.radioInner} /> : null}
                  </View>
                  <Text style={styles.optionLabel} numberOfLines={2}>
                    {ingredient.name}
                  </Text>
                  <Text style={styles.optionEmoji} allowFontScaling={false}>
                    {ingredientEmoji(ingredient.icon)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        {product.drinks && product.drinks.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionDividerTop} />
            <View style={styles.sectionHeader}>
              <Ionicons name="cafe-outline" size={20} color={BRAND_GREEN} />
              <Text style={styles.sectionTitle}>აირჩიეთ სასმელი</Text>
            </View>
            {product.drinks.map((drink, idx) => {
              const selected = selectedDrink === drink.id;
              return (
                <TouchableOpacity
                  key={drink.id}
                  style={[
                    styles.optionRow,
                    idx === product.drinks!.length - 1 && styles.optionRowLast,
                  ]}
                  onPress={() => setSelectedDrink(drink.id)}
                  activeOpacity={0.65}
                >
                  <View
                    style={[styles.radioOuter, selected && styles.radioOuterOn]}
                  >
                    {selected ? <View style={styles.radioInner} /> : null}
                  </View>
                  <View style={styles.drinkTextCol}>
                    <Text style={styles.optionLabel} numberOfLines={2}>
                      {drink.name}
                      {drink.price > 0
                        ? `  +${formatPriceGel(drink.price)}`
                        : ""}
                    </Text>
                  </View>
                  {drink.image ? (
                    <Image
                      source={{ uri: drink.image }}
                      style={styles.drinkThumb}
                    />
                  ) : (
                    <View style={styles.drinkThumbPh} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: footerPad }]}>
        <View style={styles.footerRow}>
          <View style={styles.qtyBar}>
            <TouchableOpacity
              style={styles.qtyHit}
              onPress={() => quantity > 1 && setQuantity((q) => q - 1)}
              hitSlop={8}
            >
              <Ionicons name="remove" size={22} color={BRAND_GREEN} />
            </TouchableOpacity>
            <Text style={styles.qtyNum}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyHit}
              onPress={() => setQuantity((q) => q + 1)}
              hitSlop={8}
            >
              <Ionicons name="add" size={22} color={BRAND_GREEN} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleAddToCart}
            activeOpacity={0.9}
          >
            <Text style={styles.addBtnText}>დამატება</Text>
            <Text style={styles.addBtnPrice}>
              {lineTotal.toFixed(2).replace(".", ",")} ₾
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity activeOpacity={0.7} onPress={onClose}>
          <Text style={styles.footerHint}>
            დაამატეთ კიდევ სხვა შემადგენლობით
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ProductModal({
  visible,
  productId,
  restaurantId,
  restaurantName,
  onClose,
  asModal = true,
}: ProductModalProps) {
  const { height: screenHeight } = useWindowDimensions();
  const sheetHeight = screenHeight * 0.95;

  if (!asModal) {
    if (!productId) return null;
    return (
      <ProductDetailBody
        productId={productId}
        restaurantId={restaurantId}
        restaurantName={restaurantName}
        onClose={onClose}
        asModal={false}
      />
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={[styles.modalSheet, { height: sheetHeight }]}>
          {visible && productId ? (
            <ProductDetailBody
              productId={productId}
              restaurantId={restaurantId}
              restaurantName={restaurantName}
              onClose={onClose}
              asModal
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroWrap: {
    width: "100%",
    backgroundColor: "#E5E7EB",
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  circleBack: {
    position: "absolute",
    left: 16,
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
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  restaurantName: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: fontFamily.semiBold,
    textTransform: "uppercase",
    color: "#9B9B9B",
    marginBottom: 4,
  },
  productName: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    textTransform: "uppercase",
    color: "#111827",
    lineHeight: 24,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    color: BRAND_GREEN,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  originalPrice: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: "#C41018",
    textDecorationLine: "line-through",
  },
  discountBadge: {
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: "#C41018",
  },
  productDescription: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    textTransform: "uppercase",
    color: "#6B7280",
    lineHeight: 21,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  sectionDividerTop: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: "#111827",
    textTransform: "uppercase",
    lineHeight: 20,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    gap: 12,
  },
  optionRowLast: {
    borderBottomWidth: 0,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  radioOuterOn: {
    borderColor: BRAND_GREEN,
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: BRAND_GREEN,
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: "#111827",
  },
  optionEmoji: {
    fontSize: 20,
    width: 28,
    textAlign: "center",
  },
  drinkTextCol: {
    flex: 1,
    minWidth: 0,
  },
  drinkThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  drinkThumbPh: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  qtyBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BRAND_GREEN_LIGHT,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  qtyHit: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyNum: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    color: BRAND_GREEN,
    minWidth: 28,
    textAlign: "center",
  },
  addBtn: {
    flex: 1,
    backgroundColor: BRAND_GREEN,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  addBtnText: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: "#FFFFFF",
  },
  addBtnPrice: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: "#FFFFFF",
  },
  footerHint: {
    marginTop: 10,
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: "#9CA3AF",
    textAlign: "center",
    textDecorationLine: "underline",
  },
  stateWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 16,
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: "#EF4444",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: BRAND_GREEN,
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
