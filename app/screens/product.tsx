import { apiService } from "@/utils/api";
import { Ionicons } from "@expo/vector-icons";
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
import { useCart } from "../../contexts/CartContext";
import { useRestaurant } from "../../hooks/useRestaurants";

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

export default function ProductScreen() {
  const { productId, restaurantId } = useLocalSearchParams<{
    productId: string;
    restaurantId: string;
  }>();
  const router = useRouter();
  const { addToCart } = useCart();
  const { restaurant, loading: restaurantLoading } = useRestaurant(
    restaurantId || ""
  );
  const [product, setProduct] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [removedIngredients, setRemovedIngredients] = useState<Set<string>>(
    new Set()
  );
  const [selectAll, setSelectAll] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (productId && restaurantId) {
      fetchProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, restaurantId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getMenuItem(productId || "");

      if (response.success && response.data) {
        const menuItem = response.data as unknown as MenuItem;
        setProduct(menuItem);
      } else {
        setError("პროდუქტი ვერ მოიძებნა");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "უცნობი შეცდომა");
    } finally {
      setLoading(false);
    }
  };

  if (loading || restaurantLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product || !restaurant) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || "პროდუქტი ვერ მოიძებნა"}
          </Text>
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

  const toggleIngredient = (ingredientId: string) => {
    setRemovedIngredients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientId)) {
        newSet.delete(ingredientId);
      } else {
        newSet.add(ingredientId);
      }
      return newSet;
    });
    setSelectAll(false);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setRemovedIngredients(new Set());
    } else {
      // Remove all removable ingredients
      const allRemovable =
        product.ingredients
          ?.filter((ing) => ing.canRemove)
          .map((ing) => ing.id) || [];
      setRemovedIngredients(new Set(allRemovable));
    }
    setSelectAll(!selectAll);
  };

  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const getIngredientEmoji = (icon: string) => {
    const emojiMap: { [key: string]: string } = {
      ketchup: "🍅",
      mayonnaise: "🥛",
      onion: "🧅",
      lettuce: "🥬",
      chili: "🌶️",
      pepperoni: "🍕",
      cheese: "🧀",
      herbs: "🌿",
      sauce: "🥫",
      bacon: "🥓",
      tomato: "🍅",
      pickle: "🥒",
    };
    return emojiMap[icon] || "";
  };

  const selectedDrinkData = selectedDrink
    ? product.drinks?.find((d) => d.id === selectedDrink)
    : null;
  const selectedDrinkPrice = selectedDrinkData ? selectedDrinkData.price : 0;
  const totalPrice = product.price + selectedDrinkPrice;

  const handleAddToCart = () => {
    if (restaurant && product) {
      addToCart({
        id: product._id || product.id || productId,
        name: product.name,
        price: totalPrice,
        image: product.heroImage || product.image,
        restaurantId: restaurant._id || restaurant.id || restaurantId,
        restaurantName: restaurant.name,
      });
      router.back();
    }
  };

  const getImageSource = (image: any) => {
    if (typeof image === "string") {
      return { uri: image };
    }
    return image;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Image Section */}
        <View style={styles.heroSection}>
          <Image
            source={getImageSource(product.heroImage || product.image)}
            style={styles.heroImage}
          />

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>

          {/* Restaurant Info on top right */}
          <View style={styles.restaurantBadge}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.restaurantPhone}>
              {restaurant.contact?.phone || "568 23 23 23"}
            </Text>
          </View>
        </View>

        {/* Product Details */}
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>
            {product.price.toFixed(2).replace(".", ",")}₾
          </Text>
          {product.description && (
            <Text style={styles.productDescription}>{product.description}</Text>
          )}
        </View>

        {/* Ingredients Section */}
        {product.ingredients && product.ingredients.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="grid-outline" size={18} color="#666666" />
              <Text style={styles.sectionTitle}>ინგრედიენტები</Text>
            </View>

            {product.ingredients.map((ingredient) => (
              <TouchableOpacity
                key={ingredient.id}
                style={styles.ingredientItem}
                onPress={() =>
                  ingredient.canRemove && toggleIngredient(ingredient.id)
                }
                disabled={!ingredient.canRemove}
              >
                <View style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      !removedIngredients.has(ingredient.id) &&
                        styles.checkboxChecked,
                    ]}
                  >
                    {!removedIngredients.has(ingredient.id) && (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </View>
                </View>
                <Text style={styles.ingredientName}>
                  {ingredient.name}
                  {ingredient.canRemove ? " (გარეშე)" : ""}
                </Text>
                {ingredient.icon && (
                  <Text style={styles.ingredientEmoji}>
                    {getIngredientEmoji(ingredient.icon)}
                  </Text>
                )}
              </TouchableOpacity>
            ))}

            {/* Select All Option */}
            <TouchableOpacity
              style={styles.ingredientItem}
              onPress={handleSelectAll}
            >
              <View style={styles.checkboxContainer}>
                <View
                  style={[styles.checkbox, selectAll && styles.checkboxChecked]}
                >
                  {selectAll && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  )}
                </View>
              </View>
              <Text style={styles.ingredientName}>ყველაფრით</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Drinks Section */}
        {product.drinks && product.drinks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trash-outline" size={18} color="#666666" />
              <Text style={styles.sectionTitle}>აირჩიეთ სასმელი</Text>
            </View>

            {product.drinks.map((drink) => (
              <TouchableOpacity
                key={drink.id}
                style={styles.drinkItem}
                onPress={() =>
                  setSelectedDrink(selectedDrink === drink.id ? null : drink.id)
                }
              >
                <View style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      selectedDrink === drink.id && styles.checkboxChecked,
                    ]}
                  >
                    {selectedDrink === drink.id && (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </View>
                </View>
                <Text style={styles.drinkName}>{drink.name}</Text>
                {drink.image && (
                  <Text style={styles.drinkEmoji}>🥤</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.quantitySelector}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={decrementQuantity}
          >
            <Ionicons name="remove" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={incrementQuantity}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Text style={styles.addToCartText}>დამატება</Text>
          <Text style={styles.addToCartPrice}>
            {(totalPrice * quantity).toFixed(2).replace(".", ",")} ₾
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>დაამატეთ კიდევ სხვა შემადგენლობით</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    height: 250,
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
  restaurantBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    alignItems: "flex-end",
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFD700",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  restaurantPhone: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  productDetails: {
    padding: 20,
  },
  productName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 12,
  },
  productDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  ingredientName: {
    flex: 1,
    fontSize: 15,
    color: "#1A1A1A",
  },
  ingredientEmoji: {
    fontSize: 18,
    marginLeft: 8,
  },
  drinkItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  drinkName: {
    flex: 1,
    fontSize: 15,
    color: "#1A1A1A",
  },
  drinkEmoji: {
    fontSize: 18,
    marginLeft: 8,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    gap: 16,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    padding: 4,
  },
  quantityButton: {
    backgroundColor: "#2E7D32",
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: "center",
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: "#2E7D32",
    borderRadius: 25,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  addToCartPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  footerText: {
    fontSize: 13,
    color: "#999999",
    textAlign: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "#2E7D32",
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
