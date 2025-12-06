import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../utils/api";

interface Order {
  _id: string;
  restaurantId: {
    name: string;
    image?: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  deliveryFee: number;
  status: string;
  createdAt: string;
}

export default function OrdersScreen() {
  const [selectedTab, setSelectedTab] = useState<"current" | "previous">(
    "current"
  );
  const { user } = useAuth();
  const [currentOrders, setCurrentOrders] = useState<Order[]>([]);
  const [previousOrders, setPreviousOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getOrders({
        userId: user?.id || "",
        limit: 50,
      });

      if (response.success && response.data) {
        const backendResponse = response.data as unknown;
        let orders: Order[] = [];
        
        if (Array.isArray(backendResponse)) {
          orders = backendResponse;
        } else if (backendResponse && typeof backendResponse === 'object' && 'data' in backendResponse) {
          orders = Array.isArray((backendResponse as { data: Order[] }).data) 
            ? (backendResponse as { data: Order[] }).data 
            : [];
        }

        // Filter orders by status
        const current = orders.filter(o => 
          ["pending", "confirmed", "preparing", "ready", "delivering"].includes(o.status)
        );
        const previous = orders.filter(o => 
          ["delivered", "cancelled"].includes(o.status)
        );

        setCurrentOrders(current);
        setPreviousOrders(previous);
      } else {
        setError("შეცდომა მონაცემების მიღებისას");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "უცნობი შეცდომა");
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "მოლოდინში",
      confirmed: "დადასტურებული",
      preparing: "მზადდება",
      ready: "მზადაა",
      delivering: "მიტანისას",
      delivered: "მიწოდებული",
      cancelled: "გაუქმებული",
    };
    return statusMap[status] || status;
  };

  const handleRepeatOrder = (order: Order) => {
    console.log("Repeating order:", order._id);
    // TODO: Implement repeat order functionality
  };

  const renderOrderCard = (order: Order) => {
    const firstItem = order.items[0];
    const total = order.totalAmount + order.deliveryFee;
    
    return (
      <View key={order._id} style={styles.orderCard}>
        <View style={styles.orderContent}>
          {order.restaurantId.image ? (
            <Image
              source={{ uri: order.restaurantId.image }}
              style={styles.orderImage}
            />
          ) : (
            <View style={[styles.orderImage, styles.orderImagePlaceholder]}>
              <Ionicons name="restaurant" size={24} color="#9E9E9E" />
            </View>
          )}
          <View style={styles.orderDetails}>
            <Text style={styles.orderName}>
              {firstItem?.name || "შეკვეთა"}
            </Text>
            <Text style={styles.restaurantName}>
              {order.restaurantId.name}
            </Text>
            <Text style={styles.price}>{total.toFixed(2)}₾</Text>
            <Text style={styles.statusText}>
              {getStatusText(order.status)}
            </Text>
          </View>
          <TouchableOpacity style={styles.infoButton}>
            <Ionicons name="information-circle" size={20} color="#9E9E9E" />
          </TouchableOpacity>
        </View>
        {selectedTab === "previous" && (
          <TouchableOpacity
            style={styles.repeatButton}
            onPress={() => handleRepeatOrder(order)}
          >
            <Text style={styles.repeatButtonText}>შეკვეთის განმეორება</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity> */}
        <Text style={styles.headerTitle}>შეკვეთები</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            selectedTab === "current" && styles.segmentButtonActive,
          ]}
          onPress={() => setSelectedTab("current")}
        >
          <Text
            style={[
              styles.segmentText,
              selectedTab === "current" && styles.segmentTextActive,
            ]}
          >
            შეკვეთები
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            selectedTab === "previous" && styles.segmentButtonActive,
          ]}
          onPress={() => setSelectedTab("previous")}
        >
          <Text
            style={[
              styles.segmentText,
              selectedTab === "previous" && styles.segmentTextActive,
            ]}
          >
            წინა შეკვეთბი
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchOrders}
          >
            <Text style={styles.retryButtonText}>ხელახლა ცდა</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.ordersList}
          showsVerticalScrollIndicator={false}
        >
          {selectedTab === "current"
            ? currentOrders.length > 0
              ? currentOrders.map(renderOrderCard)
              : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>მიმდინარე შეკვეთები არ არის</Text>
                  </View>
                )
            : previousOrders.length > 0
            ? previousOrders.map(renderOrderCard)
            : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>წინა შეკვეთები არ არის</Text>
                </View>
              )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  headerSpacer: {
    width: 32,
  },
  segmentedControl: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginVertical: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 32,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 62,
    alignItems: "center",
  },
  segmentButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    color: "#181B1A",
    fontWeight: "600",
    fontSize: 14,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9E9E9E",
  },
  segmentTextActive: {
    color: "#333333",
  },
  ordersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F3F2F2FF",
    // borderRadius: 12,
    borderRadius: 15,
    marginBottom: 16,
    padding: 16,
  },
  orderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  orderDetails: {
    flex: 1,
  },
  orderName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#181B1A",
  },
  infoButton: {
    padding: 4,
  },
  repeatButton: {
    backgroundColor: "#E8F5E8",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: "center",
  },
  repeatButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4CAF50",
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  orderImagePlaceholder: {
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
});
