import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { restaurantsData } from "../../assets/data/restaurantsData";
import { useCart } from "../../contexts/CartContext";

export default function OrderSuccessScreen() {
  const { restaurantId, orderId } = useLocalSearchParams<{ restaurantId: string; orderId: string }>();
  const router = useRouter();
  const { clearCart } = useCart();

  const restaurant = restaurantsData.find((r) => r.id === restaurantId);

  const handleBackToHome = () => {
    clearCart();
    router.push("/(tabs)/");
  };

  const handleViewOrders = () => {
    clearCart();
    router.push("/(tabs)/orders");
  };

  const handleViewTracking = () => {
    if (orderId) {
      router.push({
        pathname: "/screens/orderTracking",
        params: { orderId },
      });
    } else {
      // If no orderId, go to orders page
      handleViewOrders();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#2E7D32" />
        </View>

        {/* Success Message */}
        <Text style={styles.title}>შეკვეთა მიღებულია!</Text>
        <Text style={styles.subtitle}>
          თქვენი შეკვეთა {restaurant?.name}-დან მიღებულია და მუშავდება
        </Text>

        {/* Order Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>შეკვეთის დეტალები</Text>
          <Text style={styles.detailsText}>რესტორანი: {restaurant?.name}</Text>
          <Text style={styles.detailsText}>მიტანის დრო: 20-30 წუთი</Text>
          <Text style={styles.detailsText}>მიტანის ღირებულება: 4.99₾</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {orderId && (
            <TouchableOpacity
              style={styles.trackingButton}
              onPress={handleViewTracking}
            >
              <Ionicons name="location" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.trackingButtonText}>
                შეკვეთის მდებარეობის ნახვა
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleBackToHome}
          >
            <Text style={styles.primaryButtonText}>
              მთავარ გვერდზე დაბრუნება
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleViewOrders}
          >
            <Text style={styles.secondaryButtonText}>შეკვეთების ნახვა</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    marginBottom: 32,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 16,
  },
  detailsText: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 8,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  trackingButton: {
    backgroundColor: "#2196F3",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  trackingButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  primaryButton: {
    backgroundColor: "#2E7D32",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2E7D32",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
  },
});
