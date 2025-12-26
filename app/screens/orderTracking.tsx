import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiService } from "../../utils/api";

interface Courier {
  _id: string;
  name: string;
  phoneNumber: string;
  currentLocation?: {
    type: "Point";
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

// Order status stages - 4 stages as shown in design
const ORDER_STAGES = [
  { key: "confirmed", icon: "clipboard-text-outline" },
  { key: "preparing", icon: "chef-hat" },
  { key: "ready", icon: "package-variant" },
  { key: "delivering", icon: "moped" },
];

// Simulation statuses for testing
const SIMULATION_STATUSES = [
  "confirmed",
  "preparing",
  "ready",
  "delivering",
  "delivered",
];

export default function OrderTrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 41.7151,
    longitude: 44.8271,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  const mapRef = useRef<MapView | null>(null);
  const [showDeliveredModal, setShowDeliveredModal] = useState(false);
  const modalScaleAnim = useRef(new Animated.Value(0)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

  // Simulation state
  const [simulationIndex, setSimulationIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [courierPosition, setCourierPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const courierAnimationRef = useRef<NodeJS.Timeout | null>(null);

  // Animate courier movement towards delivery location
  const startCourierAnimation = useCallback(
    (startLat: number, startLng: number, endLat: number, endLng: number) => {
      // Clear any existing animation
      if (courierAnimationRef.current) {
        clearInterval(courierAnimationRef.current);
      }

      const totalSteps = 30; // Number of steps for animation
      let currentStep = 0;

      const latStep = (endLat - startLat) / totalSteps;
      const lngStep = (endLng - startLng) / totalSteps;

      // Set initial position
      setCourierPosition({ lat: startLat, lng: startLng });

      // Animate
      courierAnimationRef.current = setInterval(() => {
        currentStep++;

        if (currentStep >= totalSteps) {
          // Animation complete - courier arrived
          setCourierPosition({ lat: endLat, lng: endLng });
          if (courierAnimationRef.current) {
            clearInterval(courierAnimationRef.current);
            courierAnimationRef.current = null;
          }
          return;
        }

        // Add some randomness for realistic movement
        const randomLat = (Math.random() - 0.5) * 0.0005;
        const randomLng = (Math.random() - 0.5) * 0.0005;

        setCourierPosition((prev) => {
          if (!prev) return { lat: startLat, lng: startLng };
          return {
            lat: prev.lat + latStep + randomLat,
            lng: prev.lng + lngStep + randomLng,
          };
        });
      }, 1000); // Update every second
    },
    []
  );

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (courierAnimationRef.current) {
        clearInterval(courierAnimationRef.current);
      }
    };
  }, []);

  // Simulate next status
  const handleSimulateNextStatus = () => {
    if (!tracking) {
      // Create mock tracking data for simulation
      const mockTracking: OrderTracking = {
        order: {
          id: "test-order-123",
          status: SIMULATION_STATUSES[0],
          deliveryAddress: {
            street: "შანიძის ქუჩა 4",
            city: "თბილისი",
            coordinates: { lat: 41.7201, lng: 44.8001 },
          },
          estimatedDelivery: new Date(Date.now() + 30 * 60000).toISOString(),
        },
        restaurant: {
          _id: "rest-123",
          name: "მაგნოლია",
          location: {
            latitude: 41.7151,
            longitude: 44.8271,
            address: "ტაბიძის ქუჩა",
          },
        },
        courier: undefined,
      };
      setTracking(mockTracking);
      setIsSimulating(true);
      setLoading(false);
      return;
    }

    const nextIndex = (simulationIndex + 1) % SIMULATION_STATUSES.length;
    setSimulationIndex(nextIndex);

    const newStatus = SIMULATION_STATUSES[nextIndex];

    // Get restaurant and delivery coordinates
    const restaurantLat = tracking.restaurant?.location?.latitude || 41.7151;
    const restaurantLng = tracking.restaurant?.location?.longitude || 44.8271;
    const deliveryLat = tracking.order?.deliveryAddress?.coordinates?.lat || 41.7201;
    const deliveryLng = tracking.order?.deliveryAddress?.coordinates?.lng || 44.8001;

    // Start courier animation when delivering
    if (newStatus === "delivering") {
      startCourierAnimation(restaurantLat, restaurantLng, deliveryLat, deliveryLng);
    } else {
      // Stop animation for other statuses
      if (courierAnimationRef.current) {
        clearInterval(courierAnimationRef.current);
        courierAnimationRef.current = null;
      }
      setCourierPosition(null);
    }

    // Update tracking with new status
    setTracking((prev) => {
      if (!prev) return prev;

      // Add courier when status is "ready" or "delivering"
      const courierData: Courier | undefined =
        newStatus === "ready" || newStatus === "delivering"
          ? {
              _id: "courier-123",
              name: "გიორგი",
              phoneNumber: "+995 555 12 34 56",
              currentLocation: {
                type: "Point" as const,
                coordinates:
                  newStatus === "ready"
                    ? [restaurantLng, restaurantLat] // Near restaurant
                    : [restaurantLng, restaurantLat], // Start from restaurant
                lastUpdated: new Date(),
              },
              status: "active",
            }
          : undefined;

      return {
        ...prev,
        order: {
          ...prev.order,
          status: newStatus,
        },
        courier: courierData,
      };
    });
  };
  
  const getCurrentStageIndex = useCallback((status: string): number => {
    if (status === "pending" || status === "confirmed") return 0;
    if (status === "preparing") return 1;
    if (status === "ready") return 2;
    if (status === "delivering") return 3;
    if (status === "delivered") return 4;
    return 0;
  }, []);

  const getStatusMessage = useCallback(
    (status: string, restaurantName?: string): string => {
      switch (status) {
        case "pending":
        case "confirmed":
          return `რესტორანი ${restaurantName || "მაგნოლია"} დათანხმდა\nთქვენს შეკვეთას`;
        case "preparing":
          return `რესტორანი ${restaurantName || "მაგნოლიამ"} მიიღო\nთქვენი შეკვეთა`;
        case "ready":
          return "თქვენი შეკვეთა მზადდება";
        case "delivering":
          return "კურიერი მოემართება თქვენთან";
        case "delivered":
          return "შეკვეთა მიტანილია!";
        default:
          return "";
      }
    },
    []
  );

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
        setTracking(trackingData);
        
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
          const minLat = Math.min(...locations.map((l) => l.lat));
          const maxLat = Math.max(...locations.map((l) => l.lat));
          const minLng = Math.min(...locations.map((l) => l.lng));
          const maxLng = Math.max(...locations.map((l) => l.lng));

            setMapRegion({
              latitude: (minLat + maxLat) / 2,
              longitude: (minLng + maxLng) / 2,
            latitudeDelta: Math.max((maxLat - minLat) * 1.8, 0.015),
            longitudeDelta: Math.max((maxLng - minLng) * 1.8, 0.015),
            });
        }
      } else {
        setError(
          (response as { error?: { details?: string } }).error?.details ||
            "შეკვეთის მონაცემები ვერ მოიძებნა"
        );
      }
    } catch (err: any) {
      setError(err.message || "შეცდომა მონაცემების მიღებისას");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  // Show delivered modal when order status changes to delivered
  useEffect(() => {
    if (tracking?.order.status === "delivered" && !showDeliveredModal) {
      setShowDeliveredModal(true);
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
  }, [
    tracking?.order.status,
    showDeliveredModal,
    modalScaleAnim,
    modalOpacityAnim,
  ]);

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
      router.replace("/(tabs)" as any);
    });
  };

  const getEstimatedDeliveryTime = () => {
    if (!tracking?.order.estimatedDelivery) return null;
    const estimated = new Date(tracking.order.estimatedDelivery);
    
    const startTime = estimated.toLocaleTimeString("ka-GE", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const endTime = new Date(
      estimated.getTime() + 10 * 60000
    ).toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" });
    
    return `${startTime} - ${endTime}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || (!tracking && !isSimulating)) {
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
          <TouchableOpacity
            style={styles.simulateButton}
            onPress={handleSimulateNextStatus}
          >
            <Text style={styles.simulateButtonText}>🧪 სიმულაცია</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButtonError}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonErrorText}>უკან დაბრუნება</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Use animated position if available, otherwise use courier's current location
  const courierLocation = courierPosition
    ? {
        latitude: courierPosition.lat,
        longitude: courierPosition.lng,
      }
    : tracking.courier?.currentLocation?.coordinates
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
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {tracking.restaurant?.name || "რესტორანი"}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={setMapRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
          mapType="standard"
        >
          {/* User/Delivery Address Marker */}
          {deliveryLocation && (
            <Marker
              coordinate={deliveryLocation}
              title="მიტანის მისამართი"
              description={tracking.order.deliveryAddress.street}
            >
              <View style={styles.userMarker}>
                <Ionicons name="person" size={18} color="#FFFFFF" />
              </View>
            </Marker>
          )}

          {/* Restaurant Marker */}
          {restaurantLocation && (
            <Marker
              coordinate={restaurantLocation}
              title={tracking.restaurant?.name || "რესტორანი"}
              description={tracking.restaurant?.location?.address || ""}
            >
              <View style={styles.restaurantMarker}>
                <Ionicons name="storefront" size={18} color="#FFFFFF" />
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
                <MaterialCommunityIcons
                  name="bike-fast"
                  size={20}
                  color="#FFFFFF"
                />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Courier Info Button */}
        {tracking.courier && (
          <TouchableOpacity style={styles.courierInfoButton}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#666666"
            />
            <Text style={styles.courierInfoButtonText}>კურიერი</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Card */}
      <View style={styles.bottomCard}>
        {/* Card Handle */}
        <View style={styles.cardHandle} />

        {/* Estimated Delivery Time */}
        <Text style={styles.deliveryTimeLabel}>მინოდების სავარაუდო დრო</Text>
        <Text style={styles.deliveryTimeValue}>{estimatedTime || "20:55 - 21:05"}</Text>

        {/* Progress Timeline */}
        <View style={styles.progressContainer}>
          {ORDER_STAGES.map((stage, index) => {
            const isActive = index <= currentStageIndex;
            const isLast = index === ORDER_STAGES.length - 1;
            const lineActive = index < currentStageIndex;
            
            return (
              <React.Fragment key={stage.key}>
                <View style={styles.stageItem}>
                  <View
                    style={[
                      styles.stageIcon,
                      isActive && styles.stageIconActive,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={stage.icon as any}
                      size={22}
                      color={isActive ? "#2E7D32" : "#E0E0E0"}
                    />
                  </View>
                </View>
                {!isLast && (
                  <View style={styles.stageLineContainer}>
                    {[...Array(8)].map((_, i) => (
                      <View
                        key={i}
                      style={[
                          styles.stageDot,
                          lineActive && styles.stageDotActive,
                      ]}
                    />
                    ))}
                </View>
                )}
              </React.Fragment>
            );
          })}
        </View>

        {/* Status Message */}
          <Text style={styles.statusMessage}>
          {getStatusMessage(tracking.order.status, tracking.restaurant?.name)}
          </Text>

        {/* Simulation Button - for testing */}
        <TouchableOpacity
          style={styles.simulateButtonSmall}
          onPress={handleSimulateNextStatus}
        >
          <Text style={styles.simulateButtonSmallText}>
            🧪 შემდეგი სტატუსი ({SIMULATION_STATUSES[(simulationIndex + 1) % SIMULATION_STATUSES.length]})
                  </Text>
        </TouchableOpacity>
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
              <Ionicons name="checkmark-circle" size={80} color="#2E7D32" />
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
    backgroundColor: "#2E7D32",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  backButtonError: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonErrorText: {
    color: "#666",
    fontSize: 16,
  },
  simulateButton: {
    marginTop: 16,
    backgroundColor: "#FF9800",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  simulateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  simulateButtonSmall: {
    marginTop: 20,
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF9800",
    alignSelf: "center",
  },
  simulateButtonSmallText: {
    color: "#E65100",
    fontSize: 13,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  userMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1A1A1A",
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
  restaurantMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1A1A1A",
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4FC3F7",
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
  courierInfoButton: {
    position: "absolute",
    bottom: 20,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  courierInfoButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  bottomCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  cardHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  deliveryTimeLabel: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 4,
  },
  deliveryTimeValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 24,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  stageItem: {
    alignItems: "center",
  },
  stageIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  stageIconActive: {
    backgroundColor: "#E8F5E9",
    borderColor: "#2E7D32",
  },
  stageLineContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 4,
    gap: 3,
  },
  stageDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
  },
  stageDotActive: {
    backgroundColor: "#2E7D32",
  },
  statusMessage: {
    fontSize: 15,
    color: "#1A1A1A",
    textAlign: "center",
    lineHeight: 22,
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
    backgroundColor: "#2E7D32",
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
