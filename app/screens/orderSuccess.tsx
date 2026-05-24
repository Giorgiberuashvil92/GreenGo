import { BRAND_GREEN, LIST_ACCENT_GREEN } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "../../contexts/CartContext";
import { useRestaurant } from "../../hooks/useRestaurants";

const CARD_BG = "#F2FAF7";
const TEXT_MUTED = "#6B7280";
const TITLE_COLOR = "#111827";

function formatGel(amount: number): string {
  return `${amount.toFixed(2).replace(".", ",")} ₾`;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function OrderSuccessScreen() {
  const { restaurantId, orderId, deliveryFee: deliveryFeeParam } =
    useLocalSearchParams<{
      restaurantId: string;
      orderId?: string;
      deliveryFee?: string;
    }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { clearCart } = useCart();
  const { restaurant } = useRestaurant(restaurantId || "");

  const deliveryFee = deliveryFeeParam
    ? Number.parseFloat(deliveryFeeParam)
    : restaurant?.deliveryFee ?? 0;
  const deliveryTime = restaurant?.deliveryTime || "20-30 წუთი";
  const restaurantName = restaurant?.name || "რესტორანი";

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  const handleViewTracking = () => {
    if (orderId) {
      router.replace({
        pathname: "/screens/orderTracking",
        params: { orderId },
      });
      return;
    }
    router.replace("/(tabs)/orders");
  };

  const handleBackToHome = () => {
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(insets.top, 24) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark" size={40} color={LIST_ACCENT_GREEN} />
        </View>

        <Text style={styles.title}>შეკვეთა მიღებულია!</Text>
        <Text style={styles.subtitle}>
          თქვენი შეკვეთა {restaurantName}-დან მიღებულია და მუშავდება
        </Text>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>შეკვეთის დეტალები</Text>
          <DetailRow label="რესტორანი" value={restaurantName} />
          <DetailRow label="მიტანის დრო" value={deliveryTime} />
          <DetailRow
            label="მიტანის ღირებულება"
            value={formatGel(deliveryFee)}
          />
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <TouchableOpacity
          style={styles.trackingButton}
          activeOpacity={0.85}
          onPress={handleViewTracking}
        >
          <Ionicons name="location" size={20} color="#FFFFFF" />
          <Text style={styles.trackingButtonText}>
            შეკვეთის მდებარეობის ნახვა
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          activeOpacity={0.85}
          onPress={handleBackToHome}
        >
          <Text style={styles.homeButtonText}>მთავარ გვერდზე დაბრუნება</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    alignItems: "center",
    paddingBottom: 24,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: CARD_BG,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontFamily: fontFamily.extraBold,
    fontSize: 20,
    lineHeight: 26,
    color: TITLE_COLOR,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: TEXT_MUTED,
    textAlign: "center",
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  detailsCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    width: "100%",
    gap: 12,
  },
  detailsTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 20,
    color: BRAND_GREEN,
    marginBottom: 4,
  },
  detailRow: {
    gap: 4,
  },
  detailLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: TEXT_MUTED,
  },
  detailValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 20,
    color: TITLE_COLOR,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  trackingButton: {
    backgroundColor: BRAND_GREEN,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  trackingButtonText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: "#FFFFFF",
  },
  homeButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BRAND_GREEN,
  },
  homeButtonText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: BRAND_GREEN,
  },
});
