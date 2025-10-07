import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  currentOrders,
  OrderItem,
  previousOrders,
} from "../../assets/data/ordersData";

export default function OrdersScreen() {
  const [selectedTab, setSelectedTab] = useState<"current" | "previous">(
    "current"
  );

  const handleRepeatOrder = (order: OrderItem) => {
    console.log("Repeating order:", order.name);
  };

  const renderOrderCard = (order: OrderItem) => (
    <View key={order.id} style={styles.orderCard}>
      <View style={styles.orderContent}>
        <Image
          source={order.image as ImageSourcePropType}
          style={styles.orderImage}
        />
        <View style={styles.orderDetails}>
          <Text style={styles.orderName}>{order.name}</Text>
          <Text style={styles.restaurantName}>{order.restaurant}</Text>
          <Text style={styles.price}>{order.price.toFixed(2)}₾</Text>
        </View>
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle" size={20} color="#9E9E9E" />
        </TouchableOpacity>
      </View>
      {order.status === "previous" && (
        <TouchableOpacity
          style={styles.repeatButton}
          onPress={() => handleRepeatOrder(order)}
        >
          <Text style={styles.repeatButtonText}>შეკვეთის განმეორება</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const currentOrdersData = currentOrders;
  const previousOrdersData = previousOrders;

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
      <ScrollView
        style={styles.ordersList}
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === "current"
          ? currentOrdersData.map(renderOrderCard)
          : previousOrdersData.map(renderOrderCard)}
      </ScrollView>
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
});
