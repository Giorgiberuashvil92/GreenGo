import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import OrderMenuIcon from "../../components/icons/OrderMenuIcon";
import { fontFamily } from "../../constants/fonts";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../utils/api";
import { ordersFromGetOrdersData } from "../../utils/ordersFromResponse";

interface Order {
  _id: string;
  restaurantId:
    | string
    | {
        _id?: string;
        name: string;
        image?: string;
        heroImage?: string;
        location?: any;
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
  estimatedDelivery?: string;
  courierId?:
    | string
    | {
        _id?: string;
        name: string;
        phoneNumber: string;
      };
}

const ACCENT_GREEN = "#003E20";
const REPEAT_GREEN = "#00592D";
const SEGMENT_BG = "#F3F4F6";
const FEATURED_BG = "#F2FAF7";
const REPEAT_BTN_BG = "#F2FAF7";
const DETAILS_BLUE = "#2563EB";

function getRestaurantFromOrder(order: Order) {
  return typeof order.restaurantId === "object" ? order.restaurantId : null;
}

function getOrderTotal(order: Order) {
  return order.totalAmount + order.deliveryFee;
}

function formatPriceGel(amount: number) {
  return amount.toFixed(2).replace(".", ",") + "₾";
}

function canTrackOrder(order: Order) {
  return ["pending", "confirmed", "preparing", "ready", "delivering"].includes(
    order.status,
  );
}

function getOrderDisplayTitle(order: Order) {
  if (order.items.length === 1) {
    return order.items[0].name;
  }
  const restaurant = getRestaurantFromOrder(order);
  return restaurant?.name || "რესტორანი";
}

export default function OrdersScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<"current" | "previous">(
    "current",
  );
  const { user } = useAuth();
  const [currentOrders, setCurrentOrders] = useState<Order[]>([]);
  const [previousOrders, setPreviousOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [selectedOrderForTracking, setSelectedOrderForTracking] =
    useState<Order | null>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 41.7151,
    longitude: 44.8271,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [menuOrder, setMenuOrder] = useState<Order | null>(null);

  useEffect(() => {
    console.log("📦 Orders useEffect - User:", JSON.stringify(user, null, 2));
    console.log("📦 Orders useEffect - User ID:", user?.id);
    console.log("📦 Orders useEffect - User _id:", (user as any)?._id);

    const userId = user?.id || (user as any)?._id;

    if (userId) {
      console.log("📦 Fetching orders for user ID:", userId);
      fetchOrders();
    } else {
      console.log("⚠️ No user ID available, user object:", user);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id || (user as any)?._id || "";
      console.log("📦 Fetching orders for user ID:", userId);
      console.log("📦 Full user object:", JSON.stringify(user, null, 2));

      if (!userId) {
        console.error("❌ No user ID available!");
        setError("მომხმარებლის ID არ არის მითითებული");
        setLoading(false);
        return;
      }

      const response = await apiService.getOrders({
        userId: userId,
        limit: 50,
      });

      console.log("📦 Orders API Response:", JSON.stringify(response, null, 2));

      if (response.success && response.data) {
        const orders = ordersFromGetOrdersData(response.data) as Order[];

        console.log(
          "📦 Parsed orders:",
          orders.length,
          "Orders:",
          JSON.stringify(orders.slice(0, 2), null, 2),
        );

        // Filter orders by status
        const current = orders.filter((o) =>
          ["pending", "confirmed", "preparing", "ready", "delivering"].includes(
            o.status,
          ),
        );
        const previous = orders.filter((o) =>
          ["delivered", "cancelled"].includes(o.status),
        );

        console.log(
          "📦 Current orders:",
          current.length,
          "Previous orders:",
          previous.length,
        );

        setCurrentOrders(current);
        setPreviousOrders(previous);
      } else {
        console.error("❌ Orders fetch failed:", response.error);
        setError(response.error?.details || "შეცდომა მონაცემების მიღებისას");
      }
    } catch (err: unknown) {
      console.error("❌ Orders fetch error:", err);
      setError(err instanceof Error ? err.message : "უცნობი შეცდომა");
    } finally {
      setLoading(false);
    }
  };

  const handleRepeatOrder = (order: Order) => {
    console.log("Repeating order:", order._id);
    // TODO: Implement repeat order functionality
  };

  const openOrderMenu = (order: Order) => {
    setMenuOrder(order);
  };

  const closeOrderMenu = () => {
    setMenuOrder(null);
  };

  const handleMenuRepeat = () => {
    if (!menuOrder) return;
    const order = menuOrder;
    closeOrderMenu();
    handleRepeatOrder(order);
  };

  const handleMenuDetails = () => {
    if (!menuOrder) return;
    const order = menuOrder;
    closeOrderMenu();
    handleOrderPress(order);
  };

  const handleOrderPress = (order: Order) => {
    // Navigate to order details screen
    router.push({
      pathname: "/screens/orderDetails",
      params: { orderId: order._id },
    });
  };

  const handleTrackOrder = (orderId: string) => {
    console.log("📍 Navigating to tracking screen with orderId:", orderId);
    router.push({
      pathname: "/screens/orderTracking",
      params: { orderId: orderId },
    });
  };

  const fetchTrackingData = async (orderId: string) => {
    try {
      setTrackingLoading(true);
      const response = await apiService.getOrderTracking(orderId);

      if (response.success && response.data) {
        const data = response.data as any;
        setTrackingData(data);

        // Calculate map region
        const locations: { lat: number; lng: number }[] = [];

        if (data.restaurant?.location) {
          locations.push({
            lat: data.restaurant.location.latitude,
            lng: data.restaurant.location.longitude,
          });
        }

        if (data.order?.deliveryAddress?.coordinates) {
          locations.push({
            lat: data.order.deliveryAddress.coordinates.lat,
            lng: data.order.deliveryAddress.coordinates.lng,
          });
        }

        if (data.courier?.currentLocation?.coordinates) {
          const [lng, lat] = data.courier.currentLocation.coordinates;
          locations.push({ lat, lng });
        }

        if (locations.length > 0) {
          const minLat = Math.min(...locations.map((l) => l.lat));
          const maxLat = Math.max(...locations.map((l) => l.lat));
          const minLng = Math.min(...locations.map((l) => l.lng));
          const maxLng = Math.max(...locations.map((l) => l.lng));

          setMapRegion({
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.01),
            longitudeDelta: Math.max((maxLng - minLng) * 1.5, 0.01),
          });
        }
      }
    } catch (err) {
      console.error("Error fetching tracking data:", err);
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleFeaturedPress = (order: Order) => {
    if (canTrackOrder(order)) {
      handleTrackOrder(order._id);
    } else {
      handleOrderPress(order);
    }
  };

  const renderOrderThumbnail = (imageUri: string | null) =>
    imageUri ? (
      <Image source={{ uri: imageUri }} style={styles.rowImage} />
    ) : (
      <View style={[styles.rowImage, styles.rowImagePlaceholder]}>
        <Ionicons name="restaurant" size={24} color="#9CA3AF" />
      </View>
    );

  const renderFeaturedCurrentOrder = (order: Order) => {
    const restaurant = getRestaurantFromOrder(order);
    const imageUri = restaurant?.image || restaurant?.heroImage || null;
    const restaurantName = restaurant?.name || "რესტორანი";

    return (
      <TouchableOpacity
        key={"featured-" + order._id}
        style={styles.featuredCard}
        onPress={() => handleFeaturedPress(order)}
        activeOpacity={0.85}
      >
        {renderOrderThumbnail(imageUri)}
        <View style={styles.featuredTextBlock}>
          <Text style={styles.featuredTitle}>მიმდინარე შეკვეთა</Text>
          <Text style={styles.featuredSubtitle} numberOfLines={1}>
            რესტორანი {restaurantName}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={ACCENT_GREEN} />
      </TouchableOpacity>
    );
  };

  const renderOrderRow = (order: Order, isLast: boolean) => {
    const restaurant = getRestaurantFromOrder(order);
    const imageUri = restaurant?.image || restaurant?.heroImage || null;
    const total = getOrderTotal(order);

    return (
      <View key={order._id}>
        <TouchableOpacity
          style={styles.orderRow}
          onPress={() => handleOrderPress(order)}
          activeOpacity={0.7}
        >
          {renderOrderThumbnail(imageUri)}
          <View style={styles.orderRowText}>
            <Text style={styles.orderRowName} numberOfLines={1}>
              {restaurant?.name || "რესტორანი"}
            </Text>
            <Text style={styles.orderRowPrice}>{formatPriceGel(total)}</Text>
          </View>
          <TouchableOpacity
            style={styles.orderMenuButton}
            onPress={(e) => {
              e.stopPropagation();
              openOrderMenu(order);
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <OrderMenuIcon size={24} />
          </TouchableOpacity>
        </TouchableOpacity>
        {!isLast && <View style={styles.rowDivider} />}
      </View>
    );
  };

  const renderPreviousOrderCard = (order: Order) => {
    const restaurant = getRestaurantFromOrder(order);
    const imageUri = restaurant?.image || restaurant?.heroImage || null;
    const total = getOrderTotal(order);
    const title = getOrderDisplayTitle(order);

    return (
      <View key={order._id} style={styles.previousOrderCard}>
        <View style={styles.previousOrderTop}>
          {renderOrderThumbnail(imageUri)}
          <View style={styles.previousOrderBody}>
            <Text style={styles.previousOrderName} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.previousOrderPrice}>
              {formatPriceGel(total)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.previousOrderMenu}
            onPress={() => openOrderMenu(order)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <OrderMenuIcon size={24} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.repeatOrderButton}
          onPress={() => handleRepeatOrder(order)}
          activeOpacity={0.8}
        >
          <Text style={styles.repeatOrderButtonText}>შეკვეთის განმეორება</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderOrdersContent = () => {
    if (selectedTab === "current") {
      const hasFeatured = currentOrders.length > 0;
      const listOrders = previousOrders;

      if (!hasFeatured && listOrders.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>შეკვეთები არ არის</Text>
            <Text style={styles.emptySubtitle}>
              ახალი შეკვეთის შექმნისას ის აქ გამოჩნდება
            </Text>
          </View>
        );
      }

      return (
        <>
          {hasFeatured && renderFeaturedCurrentOrder(currentOrders[0])}
          {listOrders.length > 0 && (
            <View style={styles.orderListBlock}>
              {listOrders.map((order, index) =>
                renderOrderRow(order, index === listOrders.length - 1),
              )}
            </View>
          )}
        </>
      );
    }

    if (previousOrders.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>წინა შეკვეთები არ არის</Text>
          <Text style={styles.emptySubtitle}>
            დასრულებული შეკვეთები აქ გამოჩნდება
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.previousOrdersList}>
        {previousOrders.map(renderPreviousOrderCard)}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            selectedTab === "current" && styles.segmentButtonActive,
          ]}
          onPress={() => setSelectedTab("current")}
          activeOpacity={0.7}
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
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.segmentText,
              selectedTab === "previous" && styles.segmentTextActive,
            ]}
          >
            წინა შეკვეთები
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ACCENT_GREEN} />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={56} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchOrders}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>ხელახლა ცდა</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.ordersList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.ordersListContent}
        >
          {renderOrdersContent()}
        </ScrollView>
      )}

      <Modal
        visible={menuOrder !== null}
        transparent
        animationType="fade"
        onRequestClose={closeOrderMenu}
      >
        <View style={styles.menuOverlay}>
          <Pressable style={styles.menuBackdrop} onPress={closeOrderMenu} />
          <SafeAreaView style={styles.menuSheets} edges={["bottom"]}>
            <View style={styles.menuActionGroup}>
              <TouchableOpacity
                style={styles.menuActionRow}
                onPress={handleMenuRepeat}
                activeOpacity={0.7}
              >
                <Text style={styles.menuActionRepeat}>შეკვეთის განმეორება</Text>
              </TouchableOpacity>
              <View style={styles.menuActionDivider} />
              <TouchableOpacity
                style={styles.menuActionRow}
                onPress={handleMenuDetails}
                activeOpacity={0.7}
              >
                <Text style={styles.menuActionDetails}>დეტალების ნახვა</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.menuCancelGroup}
              onPress={closeOrderMenu}
              activeOpacity={0.7}
            >
              <Text style={styles.menuActionCancel}>გაუქმება</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </Modal>

      {/* Tracking Modal */}
      <Modal
        visible={trackingModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setTrackingModalVisible(false);
          setTrackingData(null);
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setTrackingModalVisible(false);
                setTrackingData(null);
              }}
            >
              <Ionicons name="close" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>შეკვეთის ტრეკინგი</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          {trackingLoading ? (
            <View style={styles.modalLoadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.modalLoadingText}>იტვირთება...</Text>
            </View>
          ) : trackingData ? (
            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Map */}
              <View style={styles.modalMapContainer}>
                <MapView
                  style={styles.modalMap}
                  region={mapRegion}
                  showsUserLocation={false}
                  showsMyLocationButton={false}
                >
                  {/* Restaurant Marker */}
                  {trackingData.restaurant?.location && (
                    <Marker
                      coordinate={{
                        latitude: trackingData.restaurant.location.latitude,
                        longitude: trackingData.restaurant.location.longitude,
                      }}
                      title={trackingData.restaurant.name}
                      description="რესტორანი"
                    >
                      <View style={styles.restaurantMarker}>
                        <Ionicons name="restaurant" size={24} color="#FF5722" />
                      </View>
                    </Marker>
                  )}

                  {/* Delivery Address Marker */}
                  {trackingData.order?.deliveryAddress?.coordinates && (
                    <Marker
                      coordinate={{
                        latitude:
                          trackingData.order.deliveryAddress.coordinates.lat,
                        longitude:
                          trackingData.order.deliveryAddress.coordinates.lng,
                      }}
                      title="მიტანის მისამართი"
                      description={trackingData.order.deliveryAddress.street}
                    >
                      <View style={styles.deliveryMarker}>
                        <Ionicons name="location" size={24} color="#4CAF50" />
                      </View>
                    </Marker>
                  )}

                  {/* Courier Marker */}
                  {trackingData.courier?.currentLocation?.coordinates && (
                    <Marker
                      coordinate={{
                        latitude:
                          trackingData.courier.currentLocation.coordinates[1],
                        longitude:
                          trackingData.courier.currentLocation.coordinates[0],
                      }}
                      title={trackingData.courier.name || "კურიერი"}
                      description={trackingData.courier.phoneNumber}
                    >
                      <View style={styles.courierMarker}>
                        <Ionicons name="bicycle" size={24} color="#2196F3" />
                      </View>
                    </Marker>
                  )}

                  {/* Route from restaurant to delivery */}
                  {trackingData.restaurant?.location &&
                    trackingData.order?.deliveryAddress?.coordinates && (
                      <Polyline
                        coordinates={[
                          {
                            latitude: trackingData.restaurant.location.latitude,
                            longitude:
                              trackingData.restaurant.location.longitude,
                          },
                          {
                            latitude:
                              trackingData.order.deliveryAddress.coordinates
                                .lat,
                            longitude:
                              trackingData.order.deliveryAddress.coordinates
                                .lng,
                          },
                        ]}
                        strokeColor="#4CAF50"
                        strokeWidth={3}
                        lineDashPattern={[5, 5]}
                      />
                    )}

                  {/* Route from courier to delivery */}
                  {trackingData.courier?.currentLocation?.coordinates &&
                    trackingData.order?.deliveryAddress?.coordinates && (
                      <Polyline
                        coordinates={[
                          {
                            latitude:
                              trackingData.courier.currentLocation
                                .coordinates[1],
                            longitude:
                              trackingData.courier.currentLocation
                                .coordinates[0],
                          },
                          {
                            latitude:
                              trackingData.order.deliveryAddress.coordinates
                                .lat,
                            longitude:
                              trackingData.order.deliveryAddress.coordinates
                                .lng,
                          },
                        ]}
                        strokeColor="#2196F3"
                        strokeWidth={4}
                      />
                    )}
                </MapView>
              </View>

              {/* Details */}
              <View style={styles.modalDetailsContainer}>
                {/* Status */}
                <View style={styles.modalDetailCard}>
                  <View style={styles.modalDetailHeader}>
                    <Ionicons
                      name="information-circle"
                      size={20}
                      color="#4CAF50"
                    />
                    <Text style={styles.modalDetailTitle}>
                      შეკვეთის სტატუსი
                    </Text>
                  </View>
                  <Text style={styles.modalDetailText}>
                    {trackingData.order?.status === "preparing"
                      ? "მზადდება"
                      : trackingData.order?.status === "ready"
                        ? "მზადაა"
                        : trackingData.order?.status === "delivering"
                          ? "მიტანისას"
                          : trackingData.order?.status || "უცნობი"}
                  </Text>
                </View>

                {/* Restaurant */}
                {trackingData.restaurant && (
                  <View style={styles.modalDetailCard}>
                    <View style={styles.modalDetailHeader}>
                      <Ionicons name="restaurant" size={20} color="#4CAF50" />
                      <Text style={styles.modalDetailTitle}>რესტორანი</Text>
                    </View>
                    <Text style={styles.modalDetailText}>
                      {trackingData.restaurant.name}
                    </Text>
                    {trackingData.restaurant.location && (
                      <Text style={styles.modalDetailSubtext}>
                        {trackingData.restaurant.location.address ||
                          "მისამართი ვერ მოიძებნა"}
                      </Text>
                    )}
                  </View>
                )}

                {/* Courier */}
                {trackingData.courier && (
                  <View style={styles.modalDetailCard}>
                    <View style={styles.modalDetailHeader}>
                      <Ionicons name="bicycle" size={20} color="#4CAF50" />
                      <Text style={styles.modalDetailTitle}>კურიერი</Text>
                    </View>
                    <Text style={styles.modalDetailText}>
                      {trackingData.courier.name}
                    </Text>
                    <Text style={styles.modalDetailSubtext}>
                      {trackingData.courier.phoneNumber}
                    </Text>
                    <Text style={styles.modalDetailSubtext}>
                      სტატუსი:{" "}
                      {trackingData.courier.status === "available"
                        ? "ხელმისაწვდომი"
                        : trackingData.courier.status === "busy"
                          ? "დაკავებული"
                          : trackingData.courier.status || "უცნობი"}
                    </Text>
                  </View>
                )}

                {/* Delivery Address */}
                {trackingData.order?.deliveryAddress && (
                  <View style={styles.modalDetailCard}>
                    <View style={styles.modalDetailHeader}>
                      <Ionicons name="location" size={20} color="#4CAF50" />
                      <Text style={styles.modalDetailTitle}>
                        მიტანის მისამართი
                      </Text>
                    </View>
                    <Text style={styles.modalDetailText}>
                      {trackingData.order.deliveryAddress.street}
                    </Text>
                    <Text style={styles.modalDetailSubtext}>
                      {trackingData.order.deliveryAddress.city}
                    </Text>
                    {trackingData.order.deliveryAddress.instructions && (
                      <Text style={styles.modalDetailSubtext}>
                        ინსტრუქციები:{" "}
                        {trackingData.order.deliveryAddress.instructions}
                      </Text>
                    )}
                  </View>
                )}

                {/* Estimated Delivery */}
                {trackingData.order?.estimatedDelivery && (
                  <View style={styles.modalDetailCard}>
                    <View style={styles.modalDetailHeader}>
                      <Ionicons name="time" size={20} color="#4CAF50" />
                      <Text style={styles.modalDetailTitle}>
                        სავარაუდო მიტანის დრო
                      </Text>
                    </View>
                    <Text style={styles.modalDetailText}>
                      {new Date(
                        trackingData.order.estimatedDelivery,
                      ).toLocaleTimeString("ka-GE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                )}
              </View>

              {/* Full Screen Button */}
              {selectedOrderForTracking && (
                <TouchableOpacity
                  style={styles.modalFullScreenButton}
                  onPress={() => {
                    setTrackingModalVisible(false);
                    setTrackingData(null);
                    handleTrackOrder(selectedOrderForTracking._id);
                  }}
                >
                  <Text style={styles.modalFullScreenButtonText}>
                    სრული ეკრანი
                  </Text>
                  <Ionicons name="expand" size={20} color="#4CAF50" />
                </TouchableOpacity>
              )}
            </ScrollView>
          ) : (
            <View style={styles.modalErrorContainer}>
              <Text style={styles.modalErrorText}>
                ტრეკინგის მონაცემები ვერ მოიძებნა
              </Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  segmentedControl: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: SEGMENT_BG,
    borderRadius: 12,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontFamily: fontFamily.medium,
    color: "#6B7280",
  },
  segmentTextActive: {
    fontFamily: fontFamily.semiBold,
    color: "#111827",
  },
  ordersList: {
    flex: 1,
  },
  ordersListContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  featuredCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: FEATURED_BG,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  featuredTextBlock: {
    flex: 1,
    gap: 4,
  },
  featuredTitle: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: ACCENT_GREEN,
  },
  featuredSubtitle: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: "#6B7280",
  },
  orderListBlock: {
    marginTop: 4,
  },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  rowImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  rowImagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  orderRowText: {
    flex: 1,
    gap: 4,
  },
  orderRowName: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: "#111827",
  },
  orderRowPrice: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.medium,
    color: "#6B7280",
  },
  orderMenuButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
    marginLeft: 72,
  },
  previousOrdersList: {
    gap: 12,
  },
  previousOrderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    padding: 12,
    gap: 12,
  },
  previousOrderTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  previousOrderBody: {
    flex: 1,
    paddingTop: 2,
    gap: 6,
    paddingRight: 4,
  },
  previousOrderName: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: "#111827",
  },
  previousOrderPrice: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.medium,
    color: "#111827",
  },
  previousOrderMenu: {
    alignSelf: "flex-start",
    marginTop: -2,
  },
  repeatOrderButton: {
    backgroundColor: "#F1F8F9",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  repeatOrderButtonText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.medium,
    color: "#1D4045",
  },
  menuOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  menuSheets: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  menuActionGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
  },
  menuActionRow: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  menuActionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
  },
  menuActionRepeat: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: "#1D4045",
  },
  menuActionDetails: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: "#2F80ED",
  },
  menuCancelGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  menuActionCancel: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: "#111827",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 20,
  },
  errorIconContainer: {
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    fontWeight: "600",
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: ACCENT_GREEN,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 60,
    paddingTop: 100,
  },
  emptyIconContainer: {
    marginBottom: 24,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: fontFamily.semiBold,
    color: "#374151",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  orderImagePlaceholder: {
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginTop: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  trackingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trackingBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#4CAF50",
  },
  trackingPreview: {
    marginTop: 14,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#D1FAE5",
    backgroundColor: "#F0FDF4",
  },
  trackingPreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#FFFFFF",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  trackingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
  },
  trackingPreviewText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#059669",
    letterSpacing: -0.2,
  },
  trackingMapContainer: {
    height: 140,
    width: "100%",
    backgroundColor: "#F9FAFB",
    overflow: "hidden",
  },
  trackingMapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  trackingMapPlaceholderText: {
    marginTop: 10,
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },
  deliveryInfoContainer: {
    marginTop: 12,
    gap: 10,
  },
  estimatedDeliveryContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  estimatedDeliveryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0284C7",
    flex: 1,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  callButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    flex: 1,
    textAlign: "center",
  },
  modalHeaderSpacer: {
    width: 32,
  },
  modalFullScreenButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#F5F5F5",
    gap: 8,
  },
  modalFullScreenButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
  modalLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  modalLoadingText: {
    fontSize: 16,
    color: "#666",
  },
  modalContent: {
    flex: 1,
  },
  modalMapContainer: {
    height: 300,
    width: "100%",
  },
  modalMap: {
    flex: 1,
  },
  restaurantMarker: {
    backgroundColor: "#FF5722",
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  deliveryMarker: {
    backgroundColor: "#4CAF50",
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  courierMarker: {
    backgroundColor: "#2196F3",
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  modalDetailsContainer: {
    padding: 16,
    gap: 12,
  },
  modalDetailCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
  },
  modalDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  modalDetailTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  modalDetailText: {
    fontSize: 15,
    color: "#333333",
    marginBottom: 4,
  },
  modalDetailSubtext: {
    fontSize: 13,
    color: "#666666",
    marginTop: 2,
  },
  modalErrorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalErrorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
  },
});
