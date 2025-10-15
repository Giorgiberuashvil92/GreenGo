import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { orderHistory } from "../../assets/data/ordersData";

export default function OrderHistoryScreen() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ka-GE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "მიწოდებული";
      case "cancelled":
        return "გაუქმებული";
      case "refunded":
        return "დაბრუნებული";
      default:
        return status;
    }
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
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>შეკვეთების ისტორია</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.ordersList}>
          {orderHistory.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              {/* Order Header */}
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.restaurantName}>
                    {order.restaurantName}
                  </Text>
                  <Text style={styles.orderDate}>
                    {formatDate(order.orderDate)}
                  </Text>
                </View>
                <View style={styles.orderStatus}>
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(order.status) },
                    ]}
                  >
                    {getStatusText(order.status)}
                  </Text>
                  <Text style={styles.totalAmount}>
                    {order.totalAmount.toFixed(2)} ₾
                  </Text>
                </View>
              </View>

              {/* Order Items */}
              <View style={styles.orderItems}>
                {order.items.map((item, index) => (
                  <View key={index} style={styles.orderItem}>
                    <Ionicons
                      name="restaurant-outline"
                      size={16}
                      color="#666"
                    />
                    <Text style={styles.itemText}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* Order Actions */}
              <View style={styles.orderActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>ხელახლა შეკვეთა</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>დეტალები</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
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
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  ordersList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
  },
  orderStatus: {
    alignItems: "flex-end",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00C851",
  },
  orderItems: {
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  itemText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  orderActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#00C851",
    marginHorizontal: 4,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 14,
    color: "#00C851",
    fontWeight: "500",
  },
  bottomSpacing: {
    height: 30,
  },
});
