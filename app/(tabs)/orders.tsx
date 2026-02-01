import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../utils/api";

interface Order {
  _id: string;
  restaurantId: string | {
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
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 41.7151,
    longitude: 44.8271,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    console.log('📦 Orders useEffect - User:', JSON.stringify(user, null, 2));
    console.log('📦 Orders useEffect - User ID:', user?.id);
    console.log('📦 Orders useEffect - User _id:', (user as any)?._id);
    
    const userId = user?.id || (user as any)?._id;
    
    if (userId) {
      console.log('📦 Fetching orders for user ID:', userId);
      fetchOrders();
    } else {
      console.log('⚠️ No user ID available, user object:', user);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = user?.id || (user as any)?._id || "";
      console.log('📦 Fetching orders for user ID:', userId);
      console.log('📦 Full user object:', JSON.stringify(user, null, 2));
      
      if (!userId) {
        console.error('❌ No user ID available!');
        setError("მომხმარებლის ID არ არის მითითებული");
        setLoading(false);
        return;
      }
      
      const response = await apiService.getOrders({
        userId: userId,
        limit: 50,
      });

      console.log('📦 Orders API Response:', JSON.stringify(response, null, 2));

      if (response.success && response.data) {
        let orders: Order[] = [];
        
        // Backend returns { data: Order[], total, page, limit }
        // api.ts wraps it in { success: true, data: { data: Order[], total, page, limit } }
        const backendResponse = response.data as any;
        
        if (Array.isArray(backendResponse)) {
          // If response.data is directly an array
          orders = backendResponse;
        } else if (backendResponse && typeof backendResponse === 'object') {
          // If response.data is { data: Order[], total, page, limit }
          if ('data' in backendResponse && Array.isArray(backendResponse.data)) {
            orders = backendResponse.data;
          } else if (Array.isArray(backendResponse)) {
            orders = backendResponse;
          }
        }

        console.log('📦 Parsed orders:', orders.length, 'Orders:', JSON.stringify(orders.slice(0, 2), null, 2));

        // Filter orders by status
        const current = orders.filter(o => 
          ["pending", "confirmed", "preparing", "ready", "delivering"].includes(o.status)
        );
        const previous = orders.filter(o => 
          ["delivered", "cancelled"].includes(o.status)
        );

        console.log('📦 Current orders:', current.length, 'Previous orders:', previous.length);

        setCurrentOrders(current);
        setPreviousOrders(previous);
      } else {
        console.error('❌ Orders fetch failed:', response.error);
        setError(response.error?.details || "შეცდომა მონაცემების მიღებისას");
      }
    } catch (err: unknown) {
      console.error('❌ Orders fetch error:', err);
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

  const handleOrderPress = (order: Order) => {
    // Navigate to order details screen
    router.push({
      pathname: '/screens/orderDetails',
      params: { orderId: order._id },
    });
  };

  const handleTrackOrder = (orderId: string) => {
    console.log('📍 Navigating to tracking screen with orderId:', orderId);
    router.push({
      pathname: '/screens/orderTracking',
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
          const minLat = Math.min(...locations.map(l => l.lat));
          const maxLat = Math.max(...locations.map(l => l.lat));
          const minLng = Math.min(...locations.map(l => l.lng));
          const maxLng = Math.max(...locations.map(l => l.lng));
          
          setMapRegion({
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.01),
            longitudeDelta: Math.max((maxLng - minLng) * 1.5, 0.01),
          });
        }
      }
    } catch (err) {
      console.error('Error fetching tracking data:', err);
    } finally {
      setTrackingLoading(false);
    }
  };


  const renderOrderCard = (order: Order) => {
    const firstItem = order.items[0];
    const total = order.totalAmount + order.deliveryFee;
    const canTrack = ['pending', 'confirmed', 'preparing', 'ready', 'delivering'].includes(order.status);
    
    // Handle restaurant data - could be populated object or just ID
    const restaurant = typeof order.restaurantId === 'object' ? order.restaurantId : null;
    const restaurantImage = restaurant?.image || restaurant?.heroImage || null;
    
    return (
      <TouchableOpacity
        key={order._id}
        style={styles.orderCard}
        onPress={() => handleOrderPress(order)}
        activeOpacity={0.7}
      >
        <View style={styles.orderContent}>
          {restaurantImage ? (
            <Image
              source={{ uri: restaurantImage }}
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
              {restaurant?.name || "რესტორანი"}
            </Text>
            <Text style={styles.price}>{total.toFixed(2)}₾</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusText}>
                {getStatusText(order.status)}
              </Text>
              {canTrack && (
                <View style={styles.trackingBadge}>
                  <Ionicons name="location" size={14} color="#4CAF50" />
                  <Text style={styles.trackingBadgeText}>Tracking</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={(e) => {
              e.stopPropagation();
              handleOrderPress(order);
            }}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#9E9E9E"
            />
          </TouchableOpacity>
        </View>
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
        
        {/* Tracking Button - Small Map Preview (like Bolt) */}
        {canTrack && selectedTab === "current" && (
          <TouchableOpacity
            style={styles.trackingPreview}
            onPress={(e) => {
              e.stopPropagation();
              handleTrackOrder(order._id);
            }}
          >
            <View style={styles.trackingPreviewHeader}>
              <Ionicons name="location" size={16} color="#4CAF50" />
              <Text style={styles.trackingPreviewText}>შეკვეთის ტრეკინგი</Text>
            </View>
            <View style={styles.trackingMapContainer}>
              <View style={styles.trackingMapPlaceholder}>
                <Ionicons name="map" size={32} color="#4CAF50" />
                <Text style={styles.trackingMapPlaceholderText}>რუკა</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
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
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
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
                        latitude: trackingData.order.deliveryAddress.coordinates.lat,
                        longitude: trackingData.order.deliveryAddress.coordinates.lng,
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
                        latitude: trackingData.courier.currentLocation.coordinates[1],
                        longitude: trackingData.courier.currentLocation.coordinates[0],
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
                  {trackingData.restaurant?.location && trackingData.order?.deliveryAddress?.coordinates && (
                    <Polyline
                      coordinates={[
                        {
                          latitude: trackingData.restaurant.location.latitude,
                          longitude: trackingData.restaurant.location.longitude,
                        },
                        {
                          latitude: trackingData.order.deliveryAddress.coordinates.lat,
                          longitude: trackingData.order.deliveryAddress.coordinates.lng,
                        },
                      ]}
                      strokeColor="#4CAF50"
                      strokeWidth={3}
                      lineDashPattern={[5, 5]}
                    />
                  )}

                  {/* Route from courier to delivery */}
                  {trackingData.courier?.currentLocation?.coordinates && trackingData.order?.deliveryAddress?.coordinates && (
                    <Polyline
                      coordinates={[
                        {
                          latitude: trackingData.courier.currentLocation.coordinates[1],
                          longitude: trackingData.courier.currentLocation.coordinates[0],
                        },
                        {
                          latitude: trackingData.order.deliveryAddress.coordinates.lat,
                          longitude: trackingData.order.deliveryAddress.coordinates.lng,
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
                    <Ionicons name="information-circle" size={20} color="#4CAF50" />
                    <Text style={styles.modalDetailTitle}>შეკვეთის სტატუსი</Text>
                  </View>
                  <Text style={styles.modalDetailText}>
                    {trackingData.order?.status === 'preparing' ? 'მზადდება' :
                     trackingData.order?.status === 'ready' ? 'მზადაა' :
                     trackingData.order?.status === 'delivering' ? 'მიტანისას' :
                     trackingData.order?.status || 'უცნობი'}
                  </Text>
                </View>

                {/* Restaurant */}
                {trackingData.restaurant && (
                  <View style={styles.modalDetailCard}>
                    <View style={styles.modalDetailHeader}>
                      <Ionicons name="restaurant" size={20} color="#4CAF50" />
                      <Text style={styles.modalDetailTitle}>რესტორანი</Text>
                    </View>
                    <Text style={styles.modalDetailText}>{trackingData.restaurant.name}</Text>
                    {trackingData.restaurant.location && (
                      <Text style={styles.modalDetailSubtext}>
                        {trackingData.restaurant.location.address || 'მისამართი ვერ მოიძებნა'}
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
                    <Text style={styles.modalDetailText}>{trackingData.courier.name}</Text>
                    <Text style={styles.modalDetailSubtext}>{trackingData.courier.phoneNumber}</Text>
                    <Text style={styles.modalDetailSubtext}>
                      სტატუსი: {trackingData.courier.status === 'available' ? 'ხელმისაწვდომი' :
                                trackingData.courier.status === 'busy' ? 'დაკავებული' :
                                trackingData.courier.status || 'უცნობი'}
                    </Text>
                  </View>
                )}

                {/* Delivery Address */}
                {trackingData.order?.deliveryAddress && (
                  <View style={styles.modalDetailCard}>
                    <View style={styles.modalDetailHeader}>
                      <Ionicons name="location" size={20} color="#4CAF50" />
                      <Text style={styles.modalDetailTitle}>მიტანის მისამართი</Text>
                    </View>
                    <Text style={styles.modalDetailText}>
                      {trackingData.order.deliveryAddress.street}
                    </Text>
                    <Text style={styles.modalDetailSubtext}>
                      {trackingData.order.deliveryAddress.city}
                    </Text>
                    {trackingData.order.deliveryAddress.instructions && (
                      <Text style={styles.modalDetailSubtext}>
                        ინსტრუქციები: {trackingData.order.deliveryAddress.instructions}
                      </Text>
                    )}
                  </View>
                )}

                {/* Estimated Delivery */}
                {trackingData.order?.estimatedDelivery && (
                  <View style={styles.modalDetailCard}>
                    <View style={styles.modalDetailHeader}>
                      <Ionicons name="time" size={20} color="#4CAF50" />
                      <Text style={styles.modalDetailTitle}>სავარაუდო მიტანის დრო</Text>
                    </View>
                    <Text style={styles.modalDetailText}>
                      {new Date(trackingData.order.estimatedDelivery).toLocaleTimeString("ka-GE", {
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
                  <Text style={styles.modalFullScreenButtonText}>სრული ეკრანი</Text>
                  <Ionicons name="expand" size={20} color="#4CAF50" />
                </TouchableOpacity>
              )}
            </ScrollView>
          ) : (
            <View style={styles.modalErrorContainer}>
              <Text style={styles.modalErrorText}>ტრეკინგის მონაცემები ვერ მოიძებნა</Text>
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
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  trackingPreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F5F5F5",
    gap: 8,
  },
  trackingPreviewText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
  },
  trackingMapContainer: {
    height: 120,
    width: "100%",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    overflow: "hidden",
  },
  trackingMapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
  },
  trackingMapPlaceholderText: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
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
