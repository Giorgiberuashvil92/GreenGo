import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { OrderHistoryItem } from "../assets/data/ordersData";

interface RecentOrdersProps {
  orders: OrderHistoryItem[];
  totalCount: number;
}

export default function RecentOrders({
  orders,
  totalCount,
}: RecentOrdersProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ka-GE", {
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "#00C851";
      case "cancelled":
        return "#FF4444";
      case "refunded":
        return "#FF8800";
      default:
        return "#666";
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>შეკვეთები</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push("/screens/orderHistory")}
        >
          <Text style={styles.viewAllText}>ყველა</Text>
          <Ionicons name="chevron-forward" size={16} color="#00C851" />
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.ordersScrollView}
        contentContainerStyle={styles.ordersContainer}
      >
        {orders.map((order) => (
          <TouchableOpacity
            key={order.id}
            style={styles.orderCard}
            onPress={() => router.push("/screens/orderHistory")}
          >
            {/* Restaurant Name */}
            <Text style={styles.restaurantName} numberOfLines={1}>
              {order.restaurantName}
            </Text>

            {/* Order Items */}
            <View style={styles.itemsContainer}>
              {order.items.slice(0, 2).map((item, index) => (
                <Text key={index} style={styles.itemText} numberOfLines={1}>
                  {item}
                </Text>
              ))}
              {order.items.length > 2 && (
                <Text style={styles.moreItemsText}>
                  +{order.items.length - 2} სხვა
                </Text>
              )}
            </View>

            {/* Order Footer */}
            <View style={styles.orderFooter}>
              <View style={styles.orderInfo}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(order.status) },
                  ]}
                />
                <Text style={styles.orderDate}>
                  {formatDate(order.orderDate)}
                </Text>
              </View>
              <Text style={styles.totalAmount}>
                {order.totalAmount.toFixed(2)} ₾
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* View All Card */}
        {orders.length > 0 && (
          <TouchableOpacity
            style={styles.viewAllCard}
            onPress={() => router.push("/screens/orderHistory")}
          >
            <Ionicons name="list-outline" size={32} color="#00C851" />
            <Text style={styles.viewAllCardText}>ყველა</Text>
            <Text style={styles.viewAllCardCount}>{totalCount}+ შეკვეთა</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 16,
    color: "#00C851",
    fontWeight: "500",
    marginRight: 4,
  },
  ordersScrollView: {
    paddingLeft: 20,
  },
  ordersContainer: {
    paddingRight: 20,
  },
  orderCard: {
    width: 160,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  moreItemsText: {
    fontSize: 12,
    color: "#00C851",
    fontStyle: "italic",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  orderDate: {
    fontSize: 12,
    color: "#666",
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#00C851",
  },
  viewAllCard: {
    width: 160,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#00C851",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  viewAllCardText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00C851",
    marginTop: 8,
    marginBottom: 4,
  },
  viewAllCardCount: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
