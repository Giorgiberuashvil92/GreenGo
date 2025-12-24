import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCart } from "../contexts/CartContext";

interface CartBottomBarProps {
  restaurantId: string;
}

export default function CartBottomBar({ restaurantId }: CartBottomBarProps) {
  const { cartItems, getTotalPrice, getTotalItems } = useCart();
  const router = useRouter();

  // Only show items from the current restaurant
  const restaurantCartItems = cartItems.filter(
    (item) => item.restaurantId === restaurantId
  );
  const totalItems = restaurantCartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const totalPrice = restaurantCartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (totalItems === 0) {
    return null;
  }

  const handleCheckout = () => {
    // Navigate to checkout/payment page
    router.push({
      pathname: "/screens/checkout",
      params: { restaurantId },
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.cartButton} onPress={handleCheckout}>
        <View style={styles.cartContent}>
          {/* Quantity Badge */}
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityText}>{totalItems}</Text>
          </View>

          {/* Checkout Text */}
          <Text style={styles.checkoutText}>გადახდის გვერდზე გადასვლა</Text>

          {/* Total Price and Arrow */}
          <View style={styles.priceContainer}>
            <Text style={styles.totalPrice}>{totalPrice.toFixed(2)}₾</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 70, // Above the tab bar
    left: 16,
    right: 16,
    backgroundColor: "#2E7D32",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cartButton: {
    width: "100%",
  },
  cartContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  checkoutText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginHorizontal: 16,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 4,
  },
});
