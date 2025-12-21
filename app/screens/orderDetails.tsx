import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiService } from "../../utils/api";

interface OrderDetails {
  _id: string;
  userId: {
    name?: string;
    phoneNumber: string;
  };
  restaurantId: {
    _id: string;
    name: string;
    image?: string;
  };
  items: Array<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    specialInstructions?: string;
  }>;
  totalAmount: number;
  deliveryFee: number;
  status: string;
  paymentMethod: string;
  deliveryAddress: {
    street: string;
    city: string;
    coordinates: { lat: number; lng: number };
    instructions?: string;
  };
  estimatedDelivery: string;
  actualDelivery?: string;
  orderDate: string;
  createdAt: string;
  tip?: number;
  deliveryType?: string;
  courierId?: {
    _id: string;
    name: string;
    phoneNumber: string;
  };
}

const statusColors: Record<string, string> = {
  pending: "#FFA726",
  confirmed: "#42A5F5",
  preparing: "#42A5F5",
  ready: "#42A5F5",
  delivering: "#42A5F5",
  delivered: "#4CAF50",
  cancelled: "#EF4444",
};

const statusLabels: Record<string, string> = {
  pending: "მოლოდინში",
  confirmed: "დადასტურებული",
  preparing: "მზადდება",
  ready: "მზადაა",
  delivering: "მიტანისას",
  delivered: "მიწოდებული",
  cancelled: "გაუქმებული",
};

export default function OrderDetailsScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getOrder(orderId);

      if (response.success && response.data) {
        setOrder(response.data as OrderDetails);
      } else {
        setError(response.error?.details || "შეცდომა შეკვეთის მონაცემების მიღებისას");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "უცნობი შეცდომა");
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrder = () => {
    if (orderId) {
      router.push({
        pathname: "/screens/orderTracking",
        params: { orderId },
      });
    }
  };

  const canTrack = order?.status && ["preparing", "ready", "delivering"].includes(order.status);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error || "შეკვეთა ვერ მოიძებნა"}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrderDetails}>
            <Text style={styles.retryButtonText}>ხელახლა ცდა</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>უკან დაბრუნება</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const total = order.totalAmount + order.deliveryFee + (order.tip || 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButtonHeader} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>შეკვეთის დეტალები</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColors[order.status] || "#666" }]} />
            <Text style={styles.statusText}>{statusLabels[order.status] || order.status}</Text>
          </View>
          {order.estimatedDelivery && (
            <Text style={styles.estimatedTime}>
              სავარაუდო მიტანის დრო: {new Date(order.estimatedDelivery).toLocaleTimeString("ka-GE", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          )}
        </View>

        {/* Restaurant Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="restaurant" size={20} color="#4CAF50" />
            <Text style={styles.cardTitle}>რესტორანი</Text>
          </View>
          <View style={styles.restaurantInfo}>
            {order.restaurantId.image ? (
              <Image source={{ uri: order.restaurantId.image }} style={styles.restaurantImage} />
            ) : (
              <View style={[styles.restaurantImage, styles.restaurantImagePlaceholder]}>
                <Ionicons name="restaurant" size={24} color="#9E9E9E" />
              </View>
            )}
            <Text style={styles.restaurantName}>{order.restaurantId.name}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="list" size={20} color="#4CAF50" />
            <Text style={styles.cardTitle}>შეკვეთის პროდუქტები</Text>
          </View>
          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.orderItemInfo}>
                <Text style={styles.orderItemName}>{item.name}</Text>
                {item.specialInstructions && (
                  <Text style={styles.specialInstructions}>{item.specialInstructions}</Text>
                )}
                <Text style={styles.orderItemQuantity}>რაოდენობა: {item.quantity}</Text>
              </View>
              <Text style={styles.orderItemPrice}>{(item.price * item.quantity).toFixed(2)}₾</Text>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        {order.deliveryType === "delivery" && order.deliveryAddress && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location" size={20} color="#4CAF50" />
              <Text style={styles.cardTitle}>მიტანის მისამართი</Text>
            </View>
            <Text style={styles.addressText}>
              {order.deliveryAddress.street}, {order.deliveryAddress.city}
            </Text>
            {order.deliveryAddress.instructions && (
              <Text style={styles.instructionsText}>{order.deliveryAddress.instructions}</Text>
            )}
          </View>
        )}

        {/* Courier Info */}
        {order.courierId && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="bicycle" size={20} color="#4CAF50" />
              <Text style={styles.cardTitle}>კურიერი</Text>
            </View>
            <Text style={styles.courierName}>{order.courierId.name}</Text>
            <Text style={styles.courierPhone}>{order.courierId.phoneNumber}</Text>
          </View>
        )}

        {/* Payment Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="card" size={20} color="#4CAF50" />
            <Text style={styles.cardTitle}>გადახდა</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>მეთოდი:</Text>
            <Text style={styles.paymentValue}>
              {order.paymentMethod === "card" ? "💳 ბარათი" : order.paymentMethod === "cash" ? "💵 ნაღდი" : "💰 GreenGo ბალანსი"}
            </Text>
          </View>
        </View>

        {/* Price Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="receipt" size={20} color="#4CAF50" />
            <Text style={styles.cardTitle}>ჯამი</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>პროდუქტები:</Text>
            <Text style={styles.priceValue}>{order.totalAmount.toFixed(2)}₾</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>მიტანის ღირებულება:</Text>
            <Text style={styles.priceValue}>{order.deliveryFee.toFixed(2)}₾</Text>
          </View>
          {order.tip && order.tip > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>ჩაი:</Text>
              <Text style={styles.priceValue}>{order.tip.toFixed(2)}₾</Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>სულ:</Text>
            <Text style={styles.totalValue}>{total.toFixed(2)}₾</Text>
          </View>
        </View>

        {/* Order Date */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={20} color="#4CAF50" />
            <Text style={styles.cardTitle}>შეკვეთის თარიღი</Text>
          </View>
          <Text style={styles.dateText}>
            {new Date(order.orderDate || order.createdAt).toLocaleString("ka-GE", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </ScrollView>

      {/* Track Order Button */}
      {canTrack && (
        <View style={styles.trackButtonContainer}>
          <TouchableOpacity style={styles.trackButton} onPress={handleTrackOrder}>
            <Ionicons name="location" size={20} color="#FFFFFF" />
            <Text style={styles.trackButtonText}>შეკვეთის ტრეკინგი</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButtonHeader: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
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
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  backButton: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  estimatedTime: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginLeft: 8,
  },
  restaurantInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  restaurantImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  restaurantImagePlaceholder: {
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  orderItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  orderItemName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 4,
  },
  specialInstructions: {
    fontSize: 13,
    color: "#666666",
    fontStyle: "italic",
    marginBottom: 4,
  },
  orderItemQuantity: {
    fontSize: 13,
    color: "#666666",
  },
  orderItemPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333333",
  },
  addressText: {
    fontSize: 15,
    color: "#333333",
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 13,
    color: "#666666",
    fontStyle: "italic",
  },
  courierName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 4,
  },
  courierPhone: {
    fontSize: 14,
    color: "#666666",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 15,
    color: "#666666",
  },
  paymentValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333333",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 15,
    color: "#666666",
  },
  priceValue: {
    fontSize: 15,
    color: "#333333",
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4CAF50",
  },
  dateText: {
    fontSize: 15,
    color: "#333333",
  },
  trackButtonContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  trackButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  trackButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

