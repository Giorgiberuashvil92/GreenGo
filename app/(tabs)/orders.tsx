import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../utils/api";
import { USE_MOCK_DATA } from "../../utils/mockData";

interface Order {
  _id: string;
  restaurantId: {
    _id?: string;
    name: string;
    image?: string;
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
      city?: string;
      district?: string;
      postalCode?: string;
    };
  };
  items: {
    menuItemId?: string;
    name: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
  }[];
  totalAmount: number;
  deliveryFee: number;
  status: string;
  createdAt: string;
  deliveryAddress?: {
    street: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    instructions?: string;
  };
  deliveryType?: "delivery" | "pickup";
}

export default function OrdersScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<"current" | "previous">(
    "current"
  );
  const { user } = useAuth();
  const [currentOrders, setCurrentOrders] = useState<Order[]>([]);
  const [previousOrders, setPreviousOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    item: { name: string; quantity: number; price: number };
    order: Order;
  } | null>(null);

  useEffect(() => {
    const userId = user?.id || (user as any)?._id;
    
    if (userId || USE_MOCK_DATA || apiService.isUsingMockData()) {
      fetchOrders();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId =
        user?.id ||
        (user as any)?._id ||
        (USE_MOCK_DATA || apiService.isUsingMockData() ? "mock-user-001" : "");
      
      if (!userId && !(USE_MOCK_DATA || apiService.isUsingMockData())) {
        setError("მომხმარებლის ID არ არის მითითებული");
        setLoading(false);
        return;
      }
      
      const response = await apiService.getOrders({
        userId: userId,
        limit: 50,
      });

      if (response.success && response.data) {
        let orders: Order[] = [];
        const backendResponse = response.data as any;
        
        if (Array.isArray(backendResponse)) {
          orders = backendResponse;
        } else if (backendResponse && typeof backendResponse === "object") {
          if (
            "data" in backendResponse &&
            Array.isArray(backendResponse.data)
          ) {
            orders = backendResponse.data;
          } else if (Array.isArray(backendResponse)) {
            orders = backendResponse;
          }
        }

        const current = orders.filter((o) =>
          ["pending", "confirmed", "preparing", "ready", "delivering"].includes(
            o.status
          )
        );
        const previous = orders.filter((o) =>
          ["delivered", "cancelled"].includes(o.status)
        );

        setCurrentOrders(current);
        setPreviousOrders(previous);
      } else {
        const errorMessage =
          (response as any).error?.details || "შეცდომა მონაცემების მიღებისას";
        setError(errorMessage);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "უცნობი შეცდომა");
    } finally {
      setLoading(false);
    }
  };

  const handleRepeatOrder = (order: Order) => {
    console.log("Repeating order:", order._id);
    // TODO: Implement repeat order functionality
  };

  const handleInfoPress = (order: Order) => {
    if (Platform.OS === "ios") {
      // iOS - use native ActionSheetIOS
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["კერძის დამატება", "შეკვეთის გაუქმება", "გაუქმება"],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            console.log("Add dish to order:", order._id);
          } else if (buttonIndex === 1) {
            console.log("Cancel order:", order._id);
          }
        }
      );
    } else {
      // Android - show custom bottom sheet modal
      setSelectedOrder(order);
      setActionSheetVisible(true);
    }
  };

  const handleAddDish = () => {
    if (selectedOrder) {
      console.log("Add dish to order:", selectedOrder._id);
      setActionSheetVisible(false);
        }
  };

  const handleCancelOrder = () => {
    if (selectedOrder) {
      console.log("Cancel order:", selectedOrder._id);
      setActionSheetVisible(false);
    }
  };

  const handleMapPress = (item: { name: string; quantity: number; price: number }, order: Order) => {
    setSelectedItem({ item, order });
    setMapModalVisible(true);
  };

  const getMapCoordinates = (order: Order) => {
    // If delivery, use delivery address, otherwise use restaurant location
    if (order.deliveryType === "delivery" && order.deliveryAddress) {
      return {
        latitude: order.deliveryAddress.coordinates.lat,
        longitude: order.deliveryAddress.coordinates.lng,
        address: `${order.deliveryAddress.street}, ${order.deliveryAddress.city}`,
      };
    } else if (order.restaurantId?.location) {
      // Backend returns location as populated object
      const location = order.restaurantId.location;
      return {
        latitude: location.latitude || 41.7151,
        longitude: location.longitude || 44.8271,
        address: location.address || order.restaurantId.name || "თბილისი",
      };
    }
    // Default to Tbilisi center if no location available
    return {
      latitude: 41.7151,
      longitude: 44.8271,
      address: order.restaurantId?.name || "თბილისი",
    };
  };

  const renderOrderCard = (order: Order) => {
    const firstItem = order.items[0];
    const total = order.totalAmount + order.deliveryFee;
    
    return (
      <View key={order._id} style={styles.orderCard}>
        <View style={styles.orderContent}>
          {/* Order Image */}
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

          {/* Order Details */}
          <View style={styles.orderDetails}>
            {/* Food Name, Restaurant Name and Info Icon Container */}
            <View style={styles.orderInfoContainer}>
              <View style={styles.orderNameAndRestaurant}>
                <Text style={styles.orderName} numberOfLines={1}>
                  {firstItem?.name || "შეკვეთა"}
                </Text>
                <Text style={styles.restaurantName} numberOfLines={1}>
                  {order.restaurantId.name}
                </Text>
              </View>
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() => handleMapPress(firstItem, order)}
                >
                  <Ionicons name="map-outline" size={20} color="#4CAF50" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.infoButton}
                  onPress={() => handleInfoPress(order)}
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={20}
                    color="#666666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Price */}
            <Text style={styles.price}>{total.toFixed(2)}₾</Text>
          </View>
        </View>

        {/* Repeat Order Button - Only for Previous Orders */}
        {selectedTab === "previous" && (
          <TouchableOpacity
            style={styles.repeatButton}
            onPress={(e) => {
              e.stopPropagation();
              handleRepeatOrder(order);
            }}
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#181B1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>შეკვეთები</Text>
        <View style={styles.headerRight} />
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
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
            <Text style={styles.retryButtonText}>ხელახლა ცდა</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.ordersList}
          showsVerticalScrollIndicator={false}
        >
          {selectedTab === "current" ? (
            currentOrders.length > 0 ? (
              currentOrders.map(renderOrderCard)
            ) : (
                  <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  მიმდინარე შეკვეთები არ არის
                </Text>
                  </View>
                )
          ) : previousOrders.length > 0 ? (
            previousOrders.map(renderOrderCard)
          ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>წინა შეკვეთები არ არის</Text>
                </View>
              )}
        </ScrollView>
      )}

      {/* Android Bottom Sheet Modal */}
      <Modal
        visible={actionSheetVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActionSheetVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActionSheetVisible(false)}
        >
          <View style={styles.bottomSheet}>
            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleAddDish}
      >
                <Text style={styles.actionButtonText}>კერძის დამატება</Text>
              </TouchableOpacity>
              
              <View style={styles.separator} />
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleCancelOrder}
              >
                <Text style={styles.actionButtonTextDestructive}>
                  შეკვეთის გაუქმება
                </Text>
              </TouchableOpacity>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setActionSheetVisible(false)}
            >
              <Text style={styles.cancelButtonText}>გაუქმება</Text>
            </TouchableOpacity>
          </View>
                </TouchableOpacity>
      </Modal>

      {/* Map Modal */}
      <Modal
        visible={mapModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMapModalVisible(false)}
      >
        <View style={styles.mapModalContainer}>
          <View style={styles.mapModalContent}>
            {/* Header */}
            <View style={styles.mapModalHeader}>
              <Text style={styles.mapModalTitle}>ინფორმაცია</Text>
              <TouchableOpacity
                style={styles.mapModalCloseButton}
                onPress={() => setMapModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#181B1A" />
              </TouchableOpacity>
            </View>

            {/* Item Info */}
            {selectedItem && (
              <>
                <View style={styles.mapItemInfo}>
                  <Text style={styles.mapItemName}>
                    {selectedItem.item.quantity}x {selectedItem.item.name}
                  </Text>
                  <Text style={styles.mapItemPrice}>
                    {(selectedItem.item.price * selectedItem.item.quantity).toFixed(2)}₾
                  </Text>
                  <Text style={styles.mapRestaurantName}>
                    {selectedItem.order.restaurantId.name}
                  </Text>
                  {selectedItem.order.deliveryAddress && (
                    <Text style={styles.mapAddress}>
                      {selectedItem.order.deliveryAddress.street}, {selectedItem.order.deliveryAddress.city}
                    </Text>
                  )}
                  {selectedItem.order.restaurantId.location?.address && !selectedItem.order.deliveryAddress && (
                    <Text style={styles.mapAddress}>
                      {selectedItem.order.restaurantId.location.address}
                    </Text>
                  )}
                </View>

                {/* Map */}
                {selectedItem.order && (
                  <View style={styles.mapContainer}>
                    <MapView
                      style={styles.map}
                      region={{
                        latitude: getMapCoordinates(selectedItem.order).latitude,
                        longitude: getMapCoordinates(selectedItem.order).longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                      scrollEnabled={true}
                      zoomEnabled={true}
                      showsUserLocation={true}
                    >
                      <Marker
                        coordinate={{
                          latitude: getMapCoordinates(selectedItem.order).latitude,
                          longitude: getMapCoordinates(selectedItem.order).longitude,
                        }}
                        title={selectedItem.order.restaurantId.name}
                        description={getMapCoordinates(selectedItem.order).address}
                      >
                        <View style={styles.markerContainer}>
                          <View style={styles.marker}>
                            <Ionicons name="location" size={20} color="#FFFFFF" />
                          </View>
                        </View>
                      </Marker>
                    </MapView>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F5F5F5",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  headerRight: {
    width: 44,
  },
  segmentedControl: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginVertical: 16,
    backgroundColor: "#E8E8E8",
    borderRadius: 32,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 28,
    alignItems: "center",
  },
  segmentButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
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
    fontWeight: "600",
  },
  ordersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  orderContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  orderImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#F5F5F5",
  },
  orderImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  orderDetails: {
    flex: 1,
  },
  orderInfoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  orderNameAndRestaurant: {
    flex: 1,
  },
  orderName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#181B1A",
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 14,
    color: "#B3B3B3",
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00592D",
    marginTop: 12,
  },
  infoButton: {
    padding: 4,
    marginLeft: 8,
  },
  repeatButton: {
    backgroundColor: "#EFFBF5",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  repeatButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4CAF50",
    textAlign: "center",
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
  // Bottom Sheet Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    paddingHorizontal: 8,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  actionButtonsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 8,
  },
  actionButton: {
    paddingVertical: 18,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 18,
    color: "#333333",
  },
  actionButtonTextDestructive: {
    fontSize: 18,
    color: "#FF3B30",
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
  },
  mapButton: {
    padding: 4,
  },
  // Map Modal Styles
  mapModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  mapModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "90%",
    maxHeight: "80%",
    padding: 20,
  },
  mapModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  mapModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#181B1A",
  },
  mapModalCloseButton: {
    padding: 4,
  },
  mapItemInfo: {
    marginBottom: 16,
  },
  mapItemName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#181B1A",
    marginBottom: 4,
  },
  mapItemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00592D",
    marginBottom: 8,
  },
  mapRestaurantName: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  mapAddress: {
    fontSize: 14,
    color: "#999999",
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
});
