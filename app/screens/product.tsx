import ProductModal from "@/components/ProductModal";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useRestaurant } from "../../hooks/useRestaurants";
import { requireAuth } from "../../utils/requireAuth";

export default function ProductScreen() {
  const { productId, restaurantId } = useLocalSearchParams<{
    productId: string;
    restaurantId: string;
  }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
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
        onAddedToCart={() => {
          if (!requireAuth(isAuthenticated, router)) return;
          router.replace({
            pathname: "/screens/checkout",
            params: { restaurantId: rid },
          });
        }}
      />
    </View>
  );
}
