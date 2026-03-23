import { fontFamily } from "@/constants/fonts";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "../contexts/CartContext";

/** მაკეტის მუქი მწვანე — ერთიანი pill ბარათი */
const BAR_GREEN = "#0E4D27";

interface CartBottomBarProps {
  restaurantId: string;
}

function formatTotal(n: number): string {
  return `${n.toFixed(2).replace(".", ",")} ₾`;
}

export default function CartBottomBar({ restaurantId }: CartBottomBarProps) {
  const insets = useSafeAreaInsets();
  const { cartItems } = useCart();
  const router = useRouter();

  const restaurantCartItems = cartItems.filter(
    (item) => item.restaurantId === restaurantId,
  );
  const totalItems = restaurantCartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const totalPrice = restaurantCartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  if (totalItems === 0) {
    return null;
  }

  const handleCheckout = () => {
    router.push({
      pathname: "/screens/checkout",
      params: { restaurantId },
    });
  };

  return (
    <View
      style={[
        styles.wrap,
        { paddingBottom: Math.max(insets.bottom, 14) },
      ]}
    >
      <TouchableOpacity
        style={styles.pill}
        onPress={handleCheckout}
        activeOpacity={0.92}
        accessibilityRole="button"
        accessibilityLabel="გადახდის გვერდზე გადასვლა"
      >
        <View style={styles.badge}>
          <Text style={styles.badgeNum}>{totalItems}</Text>
        </View>
        <Text style={styles.label} numberOfLines={2}>
          გადახდის გვერდზე გადასვლა
        </Text>
        <Text style={styles.price}>{formatTotal(totalPrice)}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "transparent",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: BAR_GREEN,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeNum: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    color: BAR_GREEN,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: "#FFFFFF",
    lineHeight: 20,
  },
  price: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: "#FFFFFF",
  },
});
