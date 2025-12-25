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
          <View style={styles.cartContentLeft}>
            {/* Quantity Badge */}
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityText}>{totalItems}</Text>
            </View>

            {/* Checkout Text - Two lines */}
            <View style={styles.textContainer}>
              <Text style={styles.checkoutTextTop}>გადახდის გვერდზე</Text>
              <Text style={styles.checkoutTextBottom}>გადასვლა</Text>
            </View>
          </View>

          {/* Total Price */}
          <Text style={styles.totalPrice}>
            {totalPrice.toFixed(2).replace(".", ",")}₾
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 10, // Above the tab bar
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
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  quantityText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#181B1A",
  },
  cartContentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  checkoutTextTop: {
    fontSize: 16,
    fontWeight: "400",
    color: "#FFFFFF",
    lineHeight: 20,
  },
  checkoutTextBottom: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    lineHeight: 22,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
