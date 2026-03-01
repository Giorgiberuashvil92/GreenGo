import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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
  estimatedDelivery?: string;
  courierId?: string | {
    _id?: string;
    name: string;
    phoneNumber: string;
  };
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

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
      pending: { bg: "#FFF4E6", text: "#F59E0B", icon: "time-outline" },
      confirmed: { bg: "#E0F2FE", text: "#0284C7", icon: "checkmark-circle-outline" },
      preparing: { bg: "#FEF3C7", text: "#D97706", icon: "restaurant-outline" },
      ready: { bg: "#D1FAE5", text: "#059669", icon: "checkmark-done-circle-outline" },
      delivering: { bg: "#DBEAFE", text: "#2563EB", icon: "bicycle-outline" },
      delivered: { bg: "#D1FAE5", text: "#059669", icon: "checkmark-circle" },
      cancelled: { bg: "#FEE2E2", text: "#DC2626", icon: "close-circle-outline" },
    };
    return colorMap[status] || { bg: "#F3F4F6", text: "#6B7280", icon: "help-circle-outline" };
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
    const total = order.totalAmount + order.deliveryFee;
    const canTrack = ['pending', 'confirmed', 'preparing', 'ready', 'delivering'].includes(order.status);
    
    // Handle restaurant data - could be populated object or just ID
    const restaurant = typeof order.restaurantId === 'object' ? order.restaurantId : null;
    const restaurantImage = restaurant?.image || restaurant?.heroImage || null;
    const statusColor = getStatusColor(order.status);
    const itemCount = order.items.length;
    
    // Handle courier data - could be populated object or just ID
    const courier = typeof order.courierId === 'object' ? order.courierId : null;
    const courierPhoneNumber = courier?.phoneNumber;
    
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return "ახლახან";
      if (diffMins < 60) return `${diffMins} წუთის წინ`;
      if (diffHours < 24) return `${diffHours} საათის წინ`;
      if (diffDays < 7) return `${diffDays} დღის წინ`;
      return date.toLocaleDateString("ka-GE", { day: "numeric", month: "short" });
    };
    
    const formatEstimatedDelivery = (dateString?: string) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 0) return "გვიანია";
      if (diffMins < 60) return `${diffMins} წუთში`;
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      if (mins === 0) return `${hours} საათში`;
      return `${hours} საათი ${mins} წუთში`;
    };
    
    const handleCallCourier = async (phoneNumber: string) => {
      try {
        const phoneUrl = `tel:${phoneNumber}`;
        const canOpen = await Linking.canOpenURL(phoneUrl);
        if (canOpen) {
          await Linking.openURL(phoneUrl);
        } else {
          console.error('Cannot open phone dialer');
        }
      } catch (error) {
        console.error('Error calling courier:', error);
      }
    };
    
    const estimatedDeliveryText = formatEstimatedDelivery(order.estimatedDelivery);
    
    return (
      <TouchableOpacity
        key={order._id}
        style={styles.orderCard}
        onPress={() => handleOrderPress(order)}
        activeOpacity={0.8}
      >
        <View style={styles.orderContent}>
          {restaurantImage ? (
            <Image
              source={{ uri: restaurantImage }}
              style={styles.orderImage}
            />
          ) : (
            <View style={[styles.orderImage, styles.orderImagePlaceholder]}>
              <Ionicons name="restaurant" size={32} color="#9E9E9E" />
            </View>
          )}
          <View style={styles.orderDetails}>
            <View style={styles.orderHeader}>
              <View style={styles.orderTitleContainer}>
                <Text style={styles.orderName} numberOfLines={1}>
                  {restaurant?.name || "რესტორანი"}
                </Text>
                <Text style={styles.orderTime}>{formatDate(order.createdAt)}</Text>
              </View>
              <Text style={styles.price}>{total.toFixed(2)}₾</Text>
            </View>
            
            <View style={styles.orderItemsInfo}>
              <Ionicons name="receipt-outline" size={14} color="#666666" />
              <Text style={styles.orderItemsText}>
                {itemCount} {itemCount === 1 ? "პროდუქტი" : "პროდუქტი"}
              </Text>
            </View>
            
            <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
              <Ionicons name={statusColor.icon as any} size={16} color={statusColor.text} />
              <Text style={[styles.statusText, { color: statusColor.text }]}>
                {getStatusText(order.status)}
              </Text>
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
              size={22}
              color="#9E9E9E"
            />
          </TouchableOpacity>
        </View>
        
        {/* Tracking Button - Small Map Preview (like Bolt) */}
        {canTrack && selectedTab === "current" && (
          <>
            <TouchableOpacity
              style={styles.trackingPreview}
              onPress={(e) => {
                e.stopPropagation();
                handleTrackOrder(order._id);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.trackingPreviewHeader}>
                <View style={styles.trackingIconContainer}>
                  <Ionicons name="location" size={18} color="#4CAF50" />
                </View>
                <Text style={styles.trackingPreviewText}>შეკვეთის ტრეკინგი</Text>
                <Ionicons name="chevron-forward" size={18} color="#4CAF50" />
              </View>
              <View style={styles.trackingMapContainer}>
                <View style={styles.trackingMapPlaceholder}>
                  <Ionicons name="map-outline" size={40} color="#4CAF50" />
                  <Text style={styles.trackingMapPlaceholderText}>რუკა</Text>
                </View>
              </View>
            </TouchableOpacity>
            
            {/* Estimated Delivery Time & Call Button */}
            {(estimatedDeliveryText || courierPhoneNumber) && (
              <View style={styles.deliveryInfoContainer}>
                {estimatedDeliveryText && (
                  <View style={styles.estimatedDeliveryContainer}>
                    <Ionicons name="time-outline" size={18} color="#0284C7" />
                    <Text style={styles.estimatedDeliveryText}>
                      სავარაუდო მიტანა: {estimatedDeliveryText}
                    </Text>
                  </View>
                )}
                {courierPhoneNumber && (
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleCallCourier(courierPhoneNumber);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call" size={18} color="#FFFFFF" />
                    <Text style={styles.callButtonText}>კურიერთან დარეკვა</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}
        
        {selectedTab === "previous" && (
          <TouchableOpacity
            style={styles.repeatButton}
            onPress={(e) => {
              e.stopPropagation();
              handleRepeatOrder(order);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={18} color="#4CAF50" />
            <Text style={styles.repeatButtonText}>შეკვეთის განმეორება</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>შეკვეთები</Text>
          <Text style={styles.headerSubtitle}>
            {selectedTab === "current" 
              ? `${currentOrders.length} მიმდინარე` 
              : `${previousOrders.length} წინა`}
          </Text>
        </View>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            selectedTab === "current" && styles.segmentButtonActive,
          ]}
          onPress={() => setSelectedTab("current")}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="time-outline" 
            size={18} 
            color={selectedTab === "current" ? "#4CAF50" : "#9CA3AF"} 
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.segmentText,
              selectedTab === "current" && styles.segmentTextActive,
            ]}
          >
            მიმდინარე
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
          <Ionicons 
            name="checkmark-done-outline" 
            size={18} 
            color={selectedTab === "previous" ? "#4CAF50" : "#9CA3AF"} 
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.segmentText,
              selectedTab === "previous" && styles.segmentTextActive,
            ]}
          >
            წინა
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
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          </View>
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
          {selectedTab === "current"
            ? currentOrders.length > 0
              ? currentOrders.map(renderOrderCard)
              : (
                  <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                      <Ionicons name="receipt-outline" size={80} color="#D1D5DB" />
                    </View>
                    <Text style={styles.emptyTitle}>მიმდინარე შეკვეთები არ არის</Text>
                    <Text style={styles.emptySubtitle}>
                      ახალი შეკვეთების შექმნისას ისინი აქ გამოჩნდება
                    </Text>
                  </View>
                )
            : previousOrders.length > 0
            ? previousOrders.map(renderOrderCard)
            : (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconContainer}>
                    <Ionicons name="checkmark-done-circle-outline" size={80} color="#D1D5DB" />
                  </View>
                  <Text style={styles.emptyTitle}>წინა შეკვეთები არ არის</Text>
                  <Text style={styles.emptySubtitle}>
                    დასრულებული შეკვეთები აქ გამოჩნდება
                  </Text>
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
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerContent: {
    alignItems: "flex-start",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  headerSpacer: {
    width: 32,
  },
  segmentedControl: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  segmentButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  segmentTextActive: {
    color: "#4CAF50",
  },
  ordersList: {
    flex: 1,
  },
  ordersListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  orderContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  orderImage: {
    width: 90,
    height: 90,
    borderRadius: 16,
    marginRight: 14,
    backgroundColor: "#F5F5F5",
  },
  orderDetails: {
    flex: 1,
    paddingTop: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  orderTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  orderName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  orderTime: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#181B1A",
    letterSpacing: -0.3,
  },
  orderItemsInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 6,
  },
  orderItemsText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  infoButton: {
    padding: 6,
    marginTop: -4,
  },
  repeatButton: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  repeatButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#059669",
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
    backgroundColor: "#4CAF50",
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
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
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
