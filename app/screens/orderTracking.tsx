import BackCircleIcon from "@/components/icons/BackCircleIcon";
import TrackingDeliveryIcon from "@/components/icons/TrackingDeliveryIcon";
import TrackingOrderReceivedIcon from "@/components/icons/TrackingOrderReceivedIcon";
import TrackingPreparingIcon from "@/components/icons/TrackingPreparingIcon";
import TrackingReadyIcon from "@/components/icons/TrackingReadyIcon";
import { BRAND_GREEN, LIST_ACCENT_GREEN } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiService } from "../../utils/api";

const PROGRESS_GREEN = "#7BC99A";
const PROGRESS_ACTIVE = LIST_ACCENT_GREEN;
const MARKER_BG = "#111827";

interface Courier {
  _id: string;
  name: string;
  phoneNumber: string;
  currentLocation?: {
    type: 'Point';
    coordinates: [number, number];
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

const TRACKING_STAGES = [
  { key: "received", Icon: TrackingOrderReceivedIcon },
  { key: "preparing", Icon: TrackingPreparingIcon },
  { key: "ready", Icon: TrackingReadyIcon },
  { key: "delivering", Icon: TrackingDeliveryIcon },
] as const;

function formatRestaurantHeader(name?: string) {
  if (!name) return "რესტორანი";
  const trimmed = name.trim();
  if (trimmed.toLowerCase().startsWith("რესტორანი")) {
    return trimmed;
  }
  return `რესტორანი ${trimmed}`;
}

function getStatusMessage(status: string, restaurantName?: string) {
  const name = restaurantName?.trim() || "რესტორანი";
  switch (status) {
    case "preparing":
      return `რესტორანი '${name}' ამზადებს თქვენს შეკვეთას`;
    case "ready":
      return "შეკვეთა მზადაა გატანისთვის";
    case "delivering":
      return "კურიერი მოდის თქვენთან";
    case "delivered":
      return "შეკვეთა წარმატებით მიტანილია";
    default:
      return `რესტორანმა '${name}' მიიღო თქვენი შეკვეთა`;
  }
}

export default function OrderTrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
  const isInitialLoadRef = useRef(true);
  const userHasMovedMapRef = useRef(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const stageAnimations = useRef(
    TRACKING_STAGES.map(() => new Animated.Value(0)),
  ).current;
  const [showDeliveredModal, setShowDeliveredModal] = useState(false);
  const modalScaleAnim = useRef(new Animated.Value(0)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;
  
  const getCurrentStageIndex = useCallback((status: string): number => {
    if (status === "pending" || status === "confirmed") return 0;
    if (status === "preparing") return 1;
    if (status === "ready") return 2;
    if (status === "delivering" || status === "delivered") return 3;
    return 0;
  }, []);

  const fetchTracking = useCallback(async (showLoading: boolean = true) => {
    if (!orderId) {
      setError("შეკვეთის ID არ არის მითითებული");
      setLoading(false);
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      const response = await apiService.getOrderTracking(orderId);
      
      if (response.success && response.data) {
        const trackingData = response.data as OrderTracking;
        
        const currentStatus = previousStatusRef.current;
        const newStatus = trackingData.order.status;
        const statusChanged = currentStatus !== newStatus;
        
        if (statusChanged && currentStatus !== null) {
          const newStageIndex = getCurrentStageIndex(trackingData.order.status);
          if (newStageIndex < TRACKING_STAGES.length) {
            Animated.spring(stageAnimations[newStageIndex], {
              toValue: 1,
              useNativeDriver: true,
              tension: 50,
              friction: 7,
            }).start();
          }
          
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
        
        // Only update tracking if there's a meaningful change (status or significant location change)
        // This prevents unnecessary re-renders and marker flickering
        const shouldUpdate = statusChanged || 
          !tracking || 
          (tracking.courier?._id !== trackingData.courier?._id) ||
          (trackingData.courier?.currentLocation?.coordinates && 
           tracking.courier?.currentLocation?.coordinates &&
           (Math.abs(trackingData.courier.currentLocation.coordinates[0] - tracking.courier.currentLocation.coordinates[0]) > 0.0001 ||
            Math.abs(trackingData.courier.currentLocation.coordinates[1] - tracking.courier.currentLocation.coordinates[1]) > 0.0001));
        
        if (shouldUpdate) {
          setTracking(trackingData);
        } else {
          // Still update previousStatusRef even if we don't update tracking
          previousStatusRef.current = newStatus;
        }
        
        if (!statusChanged) {
          previousStatusRef.current = newStatus;
        }
        
        const locations: { lat: number; lng: number }[] = [];
        
        if (trackingData.restaurant?.location) {
          locations.push({
            lat: trackingData.restaurant.location.latitude,
            lng: trackingData.restaurant.location.longitude,
          });
        }
        
        if (trackingData.order?.deliveryAddress?.coordinates) {
          locations.push({
            lat: trackingData.order.deliveryAddress.coordinates.lat,
            lng: trackingData.order.deliveryAddress.coordinates.lng,
          });
        }
        
        if (trackingData.courier?.currentLocation?.coordinates) {
          const [lng, lat] = trackingData.courier.currentLocation.coordinates;
          locations.push({ lat, lng });
        }
        
        // Only update map region on initial load or if user hasn't moved the map
        if (locations.length > 0 && (isInitialLoadRef.current || !userHasMovedMapRef.current)) {
          const minLat = Math.min(...locations.map(l => l.lat));
          const maxLat = Math.max(...locations.map(l => l.lat));
          const minLng = Math.min(...locations.map(l => l.lng));
          const maxLng = Math.max(...locations.map(l => l.lng));
          
          const latDiff = Math.abs(maxLat - minLat);
          const lngDiff = Math.abs(maxLng - minLng);
          
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
          
          if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
          }
        }
      } else {
        setError(response.error?.details || "შეკვეთის მონაცემები ვერ მოიძებნა");
      }
    } catch (err: any) {
      setError(err.message || "შეცდომა მონაცემების მიღებისას");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, getCurrentStageIndex, pulseAnim, stageAnimations]);

  useEffect(() => {
    fetchTracking(true); // Initial load with loading indicator
    
    // Polling for real-time updates (without loading indicator)
    const pollingInterval = setInterval(() => {
      if (orderId) {
        fetchTracking(false); // Silent update
      }
    }, 5000); // Update every 5 seconds
    
    return () => {
      clearInterval(pollingInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    if (tracking) {
      const currentStageIndex = getCurrentStageIndex(tracking.order.status);
      TRACKING_STAGES.forEach((_, index) => {
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

  useEffect(() => {
    if (tracking?.order.status === 'delivered' && !showDeliveredModal) {
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
      router.replace("/(tabs)" as any);
    });
  };


  const getEstimatedDeliveryTime = () => {
    if (!tracking?.order.estimatedDelivery) return null;
    const estimated = new Date(tracking.order.estimatedDelivery);
    const startTime = estimated.toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' });
    const endTime = new Date(estimated.getTime() + 10 * 60000).toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' });
    return `${startTime} - ${endTime}`;
  };

  const handleRegionChangeComplete = useCallback((region: Region) => {
    setMapRegion(region);
    // Mark that user has manually moved the map
    if (!isInitialLoadRef.current) {
      userHasMovedMapRef.current = true;
    }
  }, []);

  // Memoize locations to prevent unnecessary re-renders (must be before early returns)
  const courierCoordinates = tracking?.courier?.currentLocation?.coordinates;
  const courierLat = courierCoordinates?.[1];
  const courierLng = courierCoordinates?.[0];
  
  const courierLocation = useMemo(() => {
    if (!courierCoordinates || courierLat === undefined || courierLng === undefined) return null;
    return { latitude: courierLat, longitude: courierLng };
  }, [courierCoordinates, courierLat, courierLng]);

  const restaurantLocation = useMemo(() => {
    if (!tracking?.restaurant?.location) return null;
    return {
      latitude: tracking.restaurant.location.latitude,
      longitude: tracking.restaurant.location.longitude,
    };
  }, [tracking?.restaurant?.location]);

  const deliveryLocation = useMemo(() => {
    if (!tracking?.order?.deliveryAddress?.coordinates) return null;
    return {
      latitude: tracking.order.deliveryAddress.coordinates.lat,
      longitude: tracking.order.deliveryAddress.coordinates.lng,
    };
  }, [tracking?.order?.deliveryAddress?.coordinates]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={LIST_ACCENT_GREEN} />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      </View>
    );
  }

  if (error || !tracking) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="alert-circle" size={64} color="#EF4444" />
          </View>
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
      </View>
    );
  }

  const currentStageIndex = getCurrentStageIndex(tracking.order.status);
  const estimatedTime = getEstimatedDeliveryTime();

  const headerTitle = formatRestaurantHeader(tracking.restaurant?.name);
  const statusMessage = getStatusMessage(
    tracking.order.status,
    tracking.restaurant?.name,
  );

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <BackCircleIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {headerTitle}
          </Text>
          <View style={styles.headerSide} />
        </View>

        <MapView
          ref={mapRef}
          style={styles.map}
          region={mapRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
          mapType="standard"
          onRegionChangeComplete={handleRegionChangeComplete}
        >
          {restaurantLocation && (
            <Marker
              key={`restaurant-${tracking.restaurant?._id || "restaurant"}`}
              coordinate={restaurantLocation}
              tracksViewChanges={false}
            >
              <View style={styles.mapMarker}>
                <Ionicons name="storefront" size={18} color="#FFFFFF" />
              </View>
            </Marker>
          )}

          {deliveryLocation && (
            <Marker
              key={`delivery-${tracking.order.id || "delivery"}`}
              coordinate={deliveryLocation}
              tracksViewChanges={false}
            >
              <View style={styles.mapMarker}>
                <Ionicons name="person" size={18} color="#FFFFFF" />
              </View>
            </Marker>
          )}

          {courierLocation && tracking.order.status === "delivering" && (
            <Marker
              key={`courier-${tracking.courier?._id || "courier"}`}
              coordinate={courierLocation}
              tracksViewChanges={false}
            >
              <View style={[styles.mapMarker, styles.courierMarker]}>
                <Ionicons name="bicycle" size={18} color="#FFFFFF" />
              </View>
            </Marker>
          )}
        </MapView>
      </View>

      <View
        style={[
          styles.bottomCard,
          { paddingBottom: Math.max(insets.bottom, 20) },
        ]}
      >
        <View style={styles.cardHandle} />

        {estimatedTime ? (
          <View style={styles.deliveryTimeContainer}>
            <Text style={styles.deliveryTimeLabel}>
              მიწოდების სავარაუდო დრო
            </Text>
            <Text style={styles.deliveryTimeValue}>{estimatedTime}</Text>
          </View>
        ) : null}

        <View style={styles.progressContainer}>
          {TRACKING_STAGES.map((stage, index) => {
            const isReached = index <= currentStageIndex;
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const StageIcon = stage.Icon;

            const scale = stageAnimations[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0.85, 1],
            });

            return (
              <React.Fragment key={stage.key}>
                <Animated.View
                  style={[
                    styles.stageIconWrap,
                    !isReached && styles.stageIconDimmed,
                    {
                      transform: [
                        { scale: isCurrent ? pulseAnim : scale },
                      ],
                    },
                  ]}
                >
                  <StageIcon size={32} />
                </Animated.View>
                {index < TRACKING_STAGES.length - 1 ? (
                  <View
                    style={[
                      styles.stageConnector,
                      isCompleted && styles.stageConnectorActive,
                    ]}
                  />
                ) : null}
              </React.Fragment>
            );
          })}
        </View>

        <Text style={styles.statusMessage}>{statusMessage}</Text>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showDeliveredModal}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseDeliveredModal}
      >
        <Animated.View
          style={[
            styles.modalOverlay,
            { opacity: modalOpacityAnim },
          ]}
        >
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ scale: modalScaleAnim }] },
            ]}
          >
            <View style={styles.modalIconContainer}>
              <View style={styles.modalIconCircle}>
                <Ionicons
                  name="checkmark-circle"
                  size={64}
                  color={LIST_ACCENT_GREEN}
                />
              </View>
            </View>
            <Text style={styles.modalTitle}>შეკვეთა მიტანილია!</Text>
            <Text style={styles.modalMessage}>
              თქვენ შეკვეთა წარმატებით მიიღეთ. მადლობთ, რომ აირჩიეთ GreenGo!
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
    </View>
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
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorIconContainer: {
    marginBottom: 16,
  },
  errorText: {
    marginTop: 16,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: "#EF4444",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: BRAND_GREEN,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  retryButtonText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: "#FFFFFF",
  },
  backButton: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerBack: {
    width: 32,
  },
  headerTitle: {
    flex: 1,
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 20,
    color: BRAND_GREEN,
    textAlign: "center",
    marginHorizontal: 8,
  },
  headerSide: {
    width: 32,
  },
  mapMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MARKER_BG,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  courierMarker: {
    backgroundColor: BRAND_GREEN,
  },
  bottomCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 100,
  },
  cardHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  deliveryTimeContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  deliveryTimeLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
    marginBottom: 6,
    textAlign: "center",
  },
  deliveryTimeValue: {
    fontFamily: fontFamily.semiBold,
    fontSize: 28,
    lineHeight: 34,
    color: "#111827",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  stageIconWrap: {
    width: 32,
    height: 32,
  },
  stageIconDimmed: {
    opacity: 0.45,
  },
  stageConnector: {
    flex: 1,
    height: 0,
    borderTopWidth: 2,
    borderStyle: "dotted",
    borderColor: PROGRESS_GREEN,
    marginHorizontal: 4,
    marginTop: 0,
  },
  stageConnectorActive: {
    borderStyle: "solid",
    borderColor: PROGRESS_ACTIVE,
  },
  statusMessage: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: BRAND_GREEN,
    textAlign: "center",
    marginBottom: 4,
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
  modalIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F2FAF7",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: 20,
    lineHeight: 26,
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  modalMessage: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
  },
  modalButton: {
    backgroundColor: BRAND_GREEN,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: "#FFFFFF",
  },
});
