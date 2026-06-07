import ProductModal from "@/components/ProductModal";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useRestaurant } from "../../hooks/useRestaurants";

export default function ProductScreen() {
  const { productId, restaurantId } = useLocalSearchParams<{
    productId: string;
    restaurantId: string;
  }>();
  const router = useRouter();
  const { restaurant } = useRestaurant(restaurantId || "");
  const rid = restaurant?._id || restaurant?.id || restaurantId || "";

  return (
    <View style={{ flex: 1 }}>
      <ProductModal
        visible
        asModal={false}
        productId={productId || null}
        restaurantId={rid}
        restaurantName={restaurant?.name || ""}
        onClose={() => router.back()}
      />
    </View>
  );
}
