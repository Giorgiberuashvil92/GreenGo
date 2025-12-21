import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiService } from "../../utils/api";

interface Courier {
  _id: string;
  name: string;
  phoneNumber: string;
  currentLocation?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    lastUpdated: Date;
  };
  status: string;
}

interface Restaurant {
  _id: string;
  name: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
  };
}

interface OrderTracking {
  order: {
    id: string;
    status: string;
    deliveryAddress: {
      street: string;
      city: string;
      coordinates: { lat: number; lng: number };
      instructions?: string;
    };
    estimatedDelivery: string;
    actualDelivery?: string;
    items?: {
      name: string;
      price: number;
      quantity: number;
      specialInstructions?: string;
    }[];
    totalAmount?: number;
    deliveryFee?: number;
    tip?: number;
    paymentMethod?: string;
  };
  restaurant: Restaurant;
  courier?: Courier;
}

// Order status stages
const ORDER_STAGES = [
  { key: 'pending', label: 'შეკვეთა მიღებულია', icon: 'document-text' },
  { key: 'preparing', label: 'მზადდება', icon: 'restaurant' },
  { key: 'ready', label: 'მზადაა', icon: 'checkmark-circle' },
  { key: 'delivering', label: 'მიტანისას', icon: 'bicycle' },
  { key: 'delivered', label: 'მიტანილია', icon: 'checkmark-done-circle' },
];

export default function OrderTrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 41.7151,
    longitude: 44.8271,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const mapRef = useRef<MapView | null>(null);
  const previousStatusRef = useRef<string | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const stageAnimations = useRef(
    ORDER_STAGES.map(() => new Animated.Value(0))
  ).current;
  const [showDeliveredModal, setShowDeliveredModal] = useState(false);
  const modalScaleAnim = useRef(new Animated.Value(0)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;
  
  const getCurrentStageIndex = useCallback((status: string): number => {
    if (status === 'pending' || status === 'confirmed') return 0;
    if (status === 'preparing') return 1;
    if (status === 'ready') return 2;
    if (status === 'delivering') return 3;
    if (status === 'delivered') return 4;
    return 0;
  }, []);

  const fetchTracking = useCallback(async () => {
    if (!orderId) {
      setError("შეკვეთის ID არ არის მითითებული");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getOrderTracking(orderId);
      
      if (response.success && response.data) {
        const trackingData = response.data as OrderTracking;
        
        // Check if status changed using ref to avoid dependency
        const currentStatus = previousStatusRef.current;
        const newStatus = trackingData.order.status;
        const statusChanged = currentStatus !== newStatus;
        
        if (statusChanged && currentStatus !== null) {
          // Animate status change
          const newStageIndex = getCurrentStageIndex(trackingData.order.status);
          if (newStageIndex < ORDER_STAGES.length) {
            Animated.spring(stageAnimations[newStageIndex], {
              toValue: 1,
              useNativeDriver: true,
              tension: 50,
              friction: 7,
            }).start();
          }
          
          // Pulse animation for status change
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.2,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
          
          previousStatusRef.current = newStatus;
        }
        
        setTracking(trackingData);
        
        // Update previous status ref
        if (!statusChanged) {
          previousStatusRef.current = newStatus;
        }
        
        // Update map region to show all relevant locations
        const locations: { lat: number; lng: number }[] = [];
        
        // Restaurant location
        if (trackingData.restaurant?.location) {
          locations.push({
            lat: trackingData.restaurant.location.latitude,
            lng: trackingData.restaurant.location.longitude,
          });
        }
        
        // Delivery address
        if (trackingData.order?.deliveryAddress?.coordinates) {
          locations.push({
            lat: trackingData.order.deliveryAddress.coordinates.lat,
            lng: trackingData.order.deliveryAddress.coordinates.lng,
          });
        }
        
        // Courier location
        if (trackingData.courier?.currentLocation?.coordinates) {
          const [lng, lat] = trackingData.courier.currentLocation.coordinates;
          locations.push({ lat, lng });
        }
        
        if (locations.length > 0) {
          const minLat = Math.min(...locations.map(l => l.lat));
          const maxLat = Math.max(...locations.map(l => l.lat));
          const minLng = Math.min(...locations.map(l => l.lng));
          const maxLng = Math.max(...locations.map(l => l.lng));
          
          const latDiff = Math.abs(maxLat - minLat);
          const lngDiff = Math.abs(maxLng - minLng);
          
          // If locations are too far apart, focus on delivery address
          if (latDiff > 1 || lngDiff > 1) {
            if (trackingData.order?.deliveryAddress?.coordinates) {
              setMapRegion({
                latitude: trackingData.order.deliveryAddress.coordinates.lat,
                longitude: trackingData.order.deliveryAddress.coordinates.lng,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              });
            } else if (trackingData.restaurant?.location) {
              setMapRegion({
                latitude: trackingData.restaurant.location.latitude,
                longitude: trackingData.restaurant.location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              });
            }
          } else {
            setMapRegion({
              latitude: (minLat + maxLat) / 2,
              longitude: (minLng + maxLng) / 2,
              latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.01),
              longitudeDelta: Math.max((maxLng - minLng) * 1.5, 0.01),
            });
          }
        }
      } else {
        setError(response.error?.details || "შეკვეთის მონაცემები ვერ მოიძებნა");
      }
    } catch (err: any) {
      setError(err.message || "შეცდომა მონაცემების მიღებისას");
    } finally {
      setLoading(false);
    }
  }, [orderId, getCurrentStageIndex, pulseAnim, stageAnimations]);

  useEffect(() => {
    // Initial fetch only - no automatic polling
    fetchTracking();
  }, [fetchTracking]);

  // Initialize animations when component mounts or status changes
  useEffect(() => {
    if (tracking) {
      const currentStageIndex = getCurrentStageIndex(tracking.order.status);
      ORDER_STAGES.forEach((_, index) => {
        if (index <= currentStageIndex) {
          Animated.timing(stageAnimations[index], {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      });
    }
  }, [tracking, getCurrentStageIndex, stageAnimations]);

  // Show delivered modal when order status changes to delivered
  useEffect(() => {
    if (tracking?.order.status === 'delivered' && !showDeliveredModal) {
      setShowDeliveredModal(true);
      // Animate modal appearance
      Animated.parallel([
        Animated.spring(modalScaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [tracking?.order.status, showDeliveredModal, modalScaleAnim, modalOpacityAnim]);

  const handleCloseDeliveredModal = () => {
    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowDeliveredModal(false);
      // Navigate to home screen after modal closes
      router.replace("/(tabs)" as any);
    });
  };


  const getEstimatedDeliveryTime = () => {
    if (!tracking?.order.estimatedDelivery) return null;
    const estimated = new Date(tracking.order.estimatedDelivery);
    
    // Format as time range (e.g., "20:55 - 21:05")
    const startTime = estimated.toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' });
    const endTime = new Date(estimated.getTime() + 10 * 60000).toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' });
    
    return `${startTime} - ${endTime}`;
  };

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

  if (error || !tracking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#F44336" />
          <Text style={styles.errorText}>{error || "შეკვეთა ვერ მოიძებნა"}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
              fetchTracking();
            }}
          >
            <Text style={styles.retryButtonText}>ხელახლა ცდა</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>უკან დაბრუნება</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const courierLocation = tracking.courier?.currentLocation?.coordinates
    ? {
        latitude: tracking.courier.currentLocation.coordinates[1],
        longitude: tracking.courier.currentLocation.coordinates[0],
      }
    : null;

  const restaurantLocation = tracking.restaurant?.location
    ? {
        latitude: tracking.restaurant.location.latitude,
        longitude: tracking.restaurant.location.longitude,
      }
    : null;

  const deliveryLocation = tracking.order?.deliveryAddress?.coordinates
    ? {
        latitude: tracking.order.deliveryAddress.coordinates.lat,
        longitude: tracking.order.deliveryAddress.coordinates.lng,
      }
    : null;

  const currentStageIndex = getCurrentStageIndex(tracking.order.status);
  const estimatedTime = getEstimatedDeliveryTime();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
        <TouchableOpacity 
          onPress={() => {
            setLoading(true);
            fetchTracking();
          }} 
          style={styles.refreshButton}
        >
          <Ionicons name="refresh" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Map - Takes up most of the screen */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={mapRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
          mapType="standard"
          onRegionChangeComplete={setMapRegion}
        >
          {/* Restaurant Marker */}
          {restaurantLocation && (
            <Marker
              coordinate={restaurantLocation}
              title={tracking.restaurant?.name || "რესტორანი"}
              description="რესტორანი"
            >
              <View style={styles.restaurantMarker}>
                <Ionicons name="restaurant" size={20} color="#FFFFFF" />
              </View>
            </Marker>
          )}

          {/* Delivery Address Marker */}
          {deliveryLocation && (
            <Marker
              coordinate={deliveryLocation}
              title="მიტანის მისამართი"
              description={tracking.order.deliveryAddress.street}
            >
              <View style={styles.deliveryMarker}>
                <Ionicons name="location" size={20} color="#FFFFFF" />
              </View>
            </Marker>
          )}

          {/* Courier Marker */}
          {courierLocation && (
            <Marker
              coordinate={courierLocation}
              title={tracking.courier?.name || "კურიერი"}
              description={`ტელეფონი: ${tracking.courier?.phoneNumber || "N/A"}`}
            >
              <View style={styles.courierMarker}>
                <Ionicons name="bicycle" size={18} color="#FFFFFF" />
              </View>
            </Marker>
          )}

          {/* Route from restaurant to delivery - only show if not delivering */}
          {restaurantLocation && deliveryLocation && tracking.order.status !== 'delivering' && (
            <Polyline
              coordinates={[restaurantLocation, deliveryLocation]}
              strokeColor="#4CAF50"
              strokeWidth={3}
              lineDashPattern={[5, 5]}
            />
          )}

          {/* Route from courier to delivery - only show when delivering */}
          {courierLocation && deliveryLocation && tracking.order.status === 'delivering' && (
            <Polyline
              coordinates={[courierLocation, deliveryLocation]}
              strokeColor="#2196F3"
              strokeWidth={4}
            />
          )}
        </MapView>

        {/* Zoom Controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={() => {
              if (mapRef.current) {
                mapRef.current.animateToRegion({
                  ...mapRegion,
                  latitudeDelta: mapRegion.latitudeDelta * 0.5,
                  longitudeDelta: mapRegion.longitudeDelta * 0.5,
                }, 300);
              }
            }}
          >
            <Ionicons name="add" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.zoomButton, styles.zoomButtonBottom]}
            onPress={() => {
              if (mapRef.current) {
                mapRef.current.animateToRegion({
                  ...mapRegion,
                  latitudeDelta: mapRegion.latitudeDelta * 2,
                  longitudeDelta: mapRegion.longitudeDelta * 2,
                }, 300);
              }
            }}
          >
            <Ionicons name="remove" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Card - Slides up from bottom */}
      <View style={styles.bottomCard}>
        {/* Card Handle */}
        <View style={styles.cardHandle} />

        {/* Estimated Delivery Time */}
        {estimatedTime && (
          <View style={styles.deliveryTimeContainer}>
            <Text style={styles.deliveryTimeLabel}>მიწოდების სავარაუდო დრო</Text>
            <Text style={styles.deliveryTimeValue}>{estimatedTime}</Text>
          </View>
        )}

        {/* Progress Timeline */}
        <View style={styles.progressContainer}>
          {ORDER_STAGES.map((stage, index) => {
            const isActive = index <= currentStageIndex;
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            
            const scale = stageAnimations[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            });
            
            const opacity = stageAnimations[index];
            
            return (
              <React.Fragment key={stage.key}>
                <View style={styles.stageItem}>
                  <Animated.View
                    style={[
                      styles.stageIcon,
                      isActive && styles.stageIconActive,
                      isCompleted && styles.stageIconCompleted,
                      isCurrent && {
                        transform: [{ scale: pulseAnim }],
                      },
                      {
                        transform: [{ scale }],
                        opacity,
                      },
                    ]}
                  >
                    <Ionicons
                      name={stage.icon as any}
                      size={20}
                      color={isActive ? "#FFFFFF" : "#E0E0E0"}
                    />
                    {isCurrent && (
                      <View style={styles.pulseRing} />
                    )}
                  </Animated.View>
                  {index < ORDER_STAGES.length - 1 && (
                    <Animated.View
                      style={[
                        styles.stageLine,
                        isCompleted && styles.stageLineCompleted,
                        {
                          opacity: isCompleted ? 1 : opacity,
                        },
                      ]}
                    />
                  )}
                </View>
              </React.Fragment>
            );
          })}
        </View>

        {/* Status Message */}
        <View style={styles.statusMessageContainer}>
          <Text style={styles.statusMessage}>
            {tracking.order.status === 'pending' || tracking.order.status === 'confirmed'
              ? `${tracking.restaurant?.name || 'რესტორანმა'} მიიღო თქვენი შეკვეთა`
              : tracking.order.status === 'preparing'
              ? `${tracking.restaurant?.name || 'რესტორანი'} მზადებს თქვენს შეკვეთას`
              : tracking.order.status === 'ready'
              ? 'შეკვეთა მზადაა'
              : tracking.order.status === 'delivering'
              ? `${tracking.courier?.name || 'კურიერი'} მიდის თქვენთან`
              : 'შეკვეთა მიტანილია'}
          </Text>
        </View>

        {/* Restaurant Info */}
        {tracking.restaurant && (
          <View style={styles.restaurantInfoContainer}>
            <View style={styles.restaurantInfoRow}>
              <Ionicons name="restaurant" size={20} color="#666" />
              <Text style={styles.restaurantInfoText}>{tracking.restaurant.name}</Text>
            </View>
            {tracking.restaurant.location?.address && (
              <Text style={styles.restaurantAddress}>{tracking.restaurant.location.address}</Text>
            )}
          </View>
        )}

        {/* Courier Info */}
        {tracking.courier && (
          <View style={styles.courierInfoContainer}>
            <View style={styles.courierInfoRow}>
              <Ionicons name="bicycle" size={20} color="#666" />
              <View style={styles.courierInfoTextContainer}>
                <Text style={styles.courierInfoText}>{tracking.courier.name}</Text>
                <Text style={styles.courierPhone}>{tracking.courier.phoneNumber}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Delivery Address */}
        {tracking.order.deliveryAddress && (
          <View style={styles.deliveryAddressContainer}>
            <View style={styles.deliveryAddressRow}>
              <Ionicons name="location" size={20} color="#666" />
              <View style={styles.deliveryAddressTextContainer}>
                <Text style={styles.deliveryAddressText}>
                  {tracking.order.deliveryAddress.street}
                </Text>
                <Text style={styles.deliveryAddressCity}>
                  {tracking.order.deliveryAddress.city}
                </Text>
                {tracking.order.deliveryAddress.instructions && (
                  <Text style={styles.deliveryInstructions}>
                    {tracking.order.deliveryAddress.instructions}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Order Details */}
        {tracking.order.items && tracking.order.items.length > 0 && (
          <View style={styles.orderDetailsContainer}>
            <Text style={styles.orderDetailsTitle}>შეკვეთის დეტალები</Text>
            <ScrollView 
              style={styles.orderItemsScroll}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
            >
              {tracking.order.items.map((item, index) => (
                <View key={index} style={styles.orderItemRow}>
                  <View style={styles.orderItemInfo}>
                    <Text style={styles.orderItemName}>{item.name}</Text>
                    <Text style={styles.orderItemQuantity}>x{item.quantity}</Text>
                  </View>
                  <Text style={styles.orderItemPrice}>
                    {(item.price * item.quantity).toFixed(2)} ₾
                  </Text>
                </View>
              ))}
              <View style={styles.orderDivider} />
              <View style={styles.orderTotalRow}>
                <Text style={styles.orderTotalLabel}>პროდუქტები:</Text>
                <Text style={styles.orderTotalValue}>
                  {(
                    tracking.order.items.reduce(
                      (sum, item) => sum + item.price * item.quantity,
                      0
                    )
                  ).toFixed(2)} ₾
                </Text>
              </View>
              {tracking.order.deliveryFee !== undefined && tracking.order.deliveryFee > 0 && (
                <View style={styles.orderFeeRow}>
                  <Text style={styles.orderFeeLabel}>მიტანის საფასური:</Text>
                  <Text style={styles.orderFeeValue}>
                    {tracking.order.deliveryFee.toFixed(2)} ₾
                  </Text>
                </View>
              )}
              {tracking.order.tip !== undefined && tracking.order.tip > 0 && (
                <View style={styles.orderFeeRow}>
                  <Text style={styles.orderFeeLabel}>ჩაი:</Text>
                  <Text style={styles.orderFeeValue}>
                    {tracking.order.tip.toFixed(2)} ₾
                  </Text>
                </View>
              )}
              {tracking.order.totalAmount !== undefined && (
                <View style={[styles.orderTotalRow, styles.orderFinalTotalRow]}>
                  <Text style={styles.orderFinalTotalLabel}>სულ:</Text>
                  <Text style={styles.orderFinalTotalValue}>
                    {tracking.order.totalAmount.toFixed(2)} ₾
                  </Text>
                </View>
              )}
              {tracking.order.paymentMethod && (
                <View style={styles.orderPaymentRow}>
                  <Text style={styles.orderPaymentLabel}>გადახდის მეთოდი:</Text>
                  <Text style={styles.orderPaymentValue}>
                    {tracking.order.paymentMethod === 'card' 
                      ? 'ბარათი' 
                      : tracking.order.paymentMethod === 'cash' 
                      ? 'ნაღდი' 
                      : tracking.order.paymentMethod === 'greengo_balance'
                      ? 'GreenGo ბალანსი'
                      : tracking.order.paymentMethod}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Delivered Success Modal */}
      <Modal
        visible={showDeliveredModal}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseDeliveredModal}
      >
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              opacity: modalOpacityAnim,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ scale: modalScaleAnim }],
              },
            ]}
          >
            <View style={styles.modalIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
            </View>
            <Text style={styles.modalTitle}>შეკვეთა მიტანილია! 🎉</Text>
            <Text style={styles.modalMessage}>
              თქვენი შეკვეთა წარმატებით მიიტანა. მადლობთ, რომ აირჩიეთ GreenGo!
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCloseDeliveredModal}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>კარგი</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: "#666",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    zIndex: 10,
    minHeight: 50,
  },
  backButtonHeader: {
    padding: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerSpacer: {
    flex: 1,
  },
  refreshButton: {
    padding: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapContainer: {
    flex: 1,
    width: "100%",
  },
  map: {
    flex: 1,
  },
  restaurantMarker: {
    backgroundColor: "#FF5722",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  deliveryMarker: {
    backgroundColor: "#4CAF50",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  courierMarker: {
    backgroundColor: "#2196F3",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    maxHeight: "55%",
  },
  cardHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  deliveryTimeContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 16,
    marginBottom: 16,
  },
  deliveryTimeLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  deliveryTimeValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  stageItem: {
    alignItems: "center",
    flex: 1,
  },
  stageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  stageIconActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  stageIconCompleted: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  pulseRing: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#4CAF50",
    opacity: 0.3,
  },
  stageLine: {
    position: "absolute",
    top: 20,
    left: "50%",
    width: "100%",
    height: 2,
    backgroundColor: "#E0E0E0",
    zIndex: -1,
  },
  stageLineCompleted: {
    backgroundColor: "#4CAF50",
  },
  statusMessageContainer: {
    marginBottom: 16,
    position: "relative",
  },
  statusMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    lineHeight: 22,
  },
  statusChangeIndicator: {
    marginTop: 8,
    alignItems: "center",
  },
  statusChangeText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  restaurantInfoContainer: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  restaurantInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  restaurantInfoText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  restaurantAddress: {
    fontSize: 13,
    color: "#666",
    marginLeft: 28,
    marginTop: 2,
  },
  courierInfoContainer: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  courierInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  courierInfoTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  courierInfoText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  courierPhone: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  deliveryAddressContainer: {
    marginBottom: 8,
  },
  deliveryAddressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  deliveryAddressTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  deliveryAddressText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 20,
  },
  deliveryAddressCity: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  deliveryInstructions: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    marginTop: 4,
  },
  orderDetailsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  orderDetailsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  orderItemsScroll: {
    maxHeight: 200,
  },
  orderItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderItemInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  orderItemName: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    marginRight: 8,
  },
  orderItemQuantity: {
    fontSize: 12,
    color: "#666",
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  orderDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 12,
  },
  orderTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderTotalLabel: {
    fontSize: 14,
    color: "#666",
  },
  orderTotalValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  orderFeeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  orderFeeLabel: {
    fontSize: 12,
    color: "#666",
  },
  orderFeeValue: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  orderFinalTotalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  orderFinalTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  orderFinalTotalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4CAF50",
  },
  orderPaymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  orderPaymentLabel: {
    fontSize: 12,
    color: "#666",
  },
  orderPaymentValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  zoomControls: {
    position: "absolute",
    right: 16,
    top: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    overflow: "hidden",
  },
  zoomButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  zoomButtonBottom: {
    borderBottomWidth: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalIconContainer: {
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  modalButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
