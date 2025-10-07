import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { productsData } from "../../assets/data/productsData";

const { width } = Dimensions.get("window");

export default function ProductScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const router = useRouter();
  const product = productsData.find((p) => p.id === productId);

  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(
    new Set(
      product?.ingredients
        .filter((ing) => ing.isDefault)
        .map((ing) => ing.id) || []
    )
  );
  const [selectedDrink, setSelectedDrink] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Product not found</Text>
      </SafeAreaView>
    );
  }

  const toggleIngredient = (ingredientId: string) => {
    setSelectedIngredients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientId)) {
        newSet.delete(ingredientId);
      } else {
        newSet.add(ingredientId);
      }
      return newSet;
    });
  };

  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const getIngredientIcon = (iconName: string) => {
    switch (iconName) {
      case "ketchup":
        return "🔴";
      case "mayonnaise":
        return "⚪";
      case "onion":
        return "🟤";
      case "lettuce":
        return "🟢";
      case "chili":
        return "🔴";
      case "pepperoni":
        return "🔴";
      case "cheese":
        return "🟡";
      case "herbs":
        return "🟢";
      case "sauce":
        return "🔴";
      case "bacon":
        return "🟤";
      case "tomato":
        return "🔴";
      default:
        return "";
    }
  };

  const selectedDrinkData = selectedDrink
    ? product.drinks.find((d) => d.id === selectedDrink)
    : null;
  const selectedDrinkPrice = selectedDrinkData ? selectedDrinkData.price : 0;
  const totalPrice = product.price + selectedDrinkPrice;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image Section */}
        <View style={styles.heroSection}>
          <Image source={{ uri: product.heroImage }} style={styles.heroImage} />

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>

          {/* Restaurant Info */}
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{product.restaurant}</Text>
            <Text style={styles.restaurantPhone}>568 23 23</Text>
          </View>
        </View>

        {/* Product Details */}
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>{product.price.toFixed(2)}₾</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
        </View>

        {/* Ingredients Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="grid-outline" size={20} color="#666666" />
            <Text style={styles.sectionTitle}>ინგრედიენტები</Text>
          </View>

          {product.ingredients.map((ingredient) => (
            <TouchableOpacity
              key={ingredient.id}
              style={styles.ingredientItem}
              onPress={() =>
                ingredient.canRemove && toggleIngredient(ingredient.id)
              }
            >
              <View style={styles.ingredientLeft}>
                <View
                  style={[
                    styles.radioButton,
                    selectedIngredients.has(ingredient.id) &&
                      styles.radioButtonSelected,
                  ]}
                >
                  {selectedIngredients.has(ingredient.id) && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <Text style={styles.ingredientName}>{ingredient.name}</Text>
              </View>
              {ingredient.icon && (
                <Text style={styles.ingredientIcon}>
                  {getIngredientIcon(ingredient.icon)}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Drinks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cafe-outline" size={20} color="#666666" />
            <Text style={styles.sectionTitle}>აირჩიეთ სასმელი</Text>
          </View>

          {product.drinks.map((drink) => (
            <TouchableOpacity
              key={drink.id}
              style={[
                styles.drinkItem,
                selectedDrink === drink.id && styles.drinkItemSelected,
              ]}
              onPress={() => setSelectedDrink(drink.id)}
            >
              <Image source={{ uri: drink.image }} style={styles.drinkImage} />
              <View style={styles.drinkInfo}>
                <Text style={styles.drinkName}>{drink.name}</Text>
                <Text style={styles.drinkPrice}>{drink.price.toFixed(2)}₾</Text>
              </View>
              <View
                style={[
                  styles.radioButton,
                  selectedDrink === drink.id && styles.radioButtonSelected,
                ]}
              >
                {selectedDrink === drink.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add to Cart Section */}
        <View style={styles.addToCartSection}>
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

          <TouchableOpacity style={styles.addToCartButton}>
            <Text style={styles.addToCartText}>დამატება</Text>
            <Text style={styles.addToCartPrice}>
              {(totalPrice * quantity).toFixed(2)}₾
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>დაამატეთ კიდევ სხვა შემადგენლობით</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  heroSection: {
    height: 300,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  restaurantInfo: {
    position: "absolute",
    top: 50,
    right: 20,
    alignItems: "flex-end",
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 4,
  },
  restaurantPhone: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  productDetails: {
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 12,
  },
  productDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginLeft: 8,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  ingredientLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#DDDDDD",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: "#4CAF50",
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
  },
  ingredientName: {
    fontSize: 14,
    color: "#333333",
    flex: 1,
  },
  ingredientIcon: {
    fontSize: 20,
  },
  drinkItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
  },
  drinkItemSelected: {
    backgroundColor: "#E8F5E8",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  drinkImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  drinkInfo: {
    flex: 1,
  },
  drinkName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 2,
  },
  drinkPrice: {
    fontSize: 12,
    color: "#666666",
  },
  addToCartSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  quantityButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: "center",
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: "#2E7D32",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  addToCartPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  footerText: {
    fontSize: 12,
    color: "#999999",
    textAlign: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
