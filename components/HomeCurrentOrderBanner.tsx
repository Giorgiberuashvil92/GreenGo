import { fontFamily } from "@/constants/fonts";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  useCurrentOrder,
  type CurrentOrder,
} from "../hooks/useCurrentOrder";

const PRIMARY = "#1D4045";
const CARD_BG = "#F1F8F9";

function getRestaurant(order: CurrentOrder) {
  return typeof order.restaurantId === "object" ? order.restaurantId : null;
}

function restaurantLabel(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "რესტორანი";
  if (trimmed.toLocaleLowerCase("ka").startsWith("რესტორანი")) {
    return trimmed;
  }
  return `რესტორანი ${trimmed}`;
}

export default function HomeCurrentOrderBanner() {
  const { order } = useCurrentOrder();

  if (!order) return null;

  const restaurant = getRestaurant(order);
  const imageUri = restaurant?.image || restaurant?.heroImage || null;
  const name = restaurant?.name || "რესტორანი";

  const onPress = () => {
    router.push({
      pathname: "/screens/orderTracking",
      params: { orderId: order._id },
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel="მიმდინარე შეკვეთა"
    >
      <View style={styles.left}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="restaurant" size={22} color="#9CA3AF" />
          </View>
        )}
        <View style={styles.textCol}>
          <Text style={styles.title}>მიმდინარე შეკვეთა</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {restaurantLabel(name)}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={PRIMARY} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    gap: 8,
    minHeight: 75,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    minWidth: 0,
  },
  image: {
    width: 48,
    height: 43,
    borderRadius: 8,
    backgroundColor: "#E5E7EB",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: "space-between",
    gap: 3,
    paddingVertical: 2,
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 20,
    color: PRIMARY,
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: "#666666",
  },
});
