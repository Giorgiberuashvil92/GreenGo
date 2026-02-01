import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  const isInitialLoadRef = useRef(true);
  const userHasMovedMapRef = useRef(false);
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
          if (newStageIndex < ORDER_STAGES.length) {
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

  const handleGoToMyLocation = useCallback(async () => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'ლოკაციის ნებართვა',
          'გთხოვთ მიუთითოთ ლოკაციის ნებართვა, რომ ვნახოთ თქვენი მდებარეობა',
          [{ text: 'კარგი' }]
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // Animate map to user location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 500);
      }

      // Update map region state
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch {
      Alert.alert(
        'შეცდომა',
        'ლოკაციის მიღება ვერ მოხერხდა. გთხოვთ სცადოთ თავიდან.',
        [{ text: 'კარგი' }]
      );
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !tracking) {
    return (
      <SafeAreaView style={styles.container}>
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
      </SafeAreaView>
    );
  }

  const currentStageIndex = getCurrentStageIndex(tracking.order.status);
  const estimatedTime = getEstimatedDeliveryTime();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Map */}
      <View style={styles.mapContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
          <TouchableOpacity 
            onPress={() => {
              userHasMovedMapRef.current = false; // Reset flag on manual refresh
              setLoading(true);
              fetchTracking(true);
            }} 
            style={styles.refreshButton}
          >
            <Ionicons name="refresh" size={24} color="#000" />
          </TouchableOpacity>
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
              key={`restaurant-${tracking.restaurant?._id || 'restaurant'}`}
              coordinate={restaurantLocation}
              title={tracking.restaurant?.name || "რესტორანი"}
              description="რესტორანი"
              tracksViewChanges={false}
            >
              <View style={styles.restaurantMarker}>
                <Ionicons name="restaurant" size={20} color="#FFFFFF" />
              </View>
            </Marker>
          )}

          {deliveryLocation && (
            <Marker
              key={`delivery-${tracking.order.id || 'delivery'}`}
              coordinate={deliveryLocation}
              title="მიტანის მისამართი"
              description={tracking.order.deliveryAddress.street}
              tracksViewChanges={false}
            >
              <View style={styles.deliveryMarker}>
                <Ionicons name="location" size={20} color="#FFFFFF" />
              </View>
            </Marker>
          )}

          {courierLocation && tracking.order.status === 'delivering' && (
            <Marker
              key={`courier-${tracking.courier?._id || 'courier'}`}
              coordinate={courierLocation}
              title="კურიერი"
              description="კურიერი მოდის თქვენთან"
              tracksViewChanges={false}
            >
              <View style={styles.courierMarker}>
                <Ionicons name="bicycle" size={18} color="#FFFFFF" />
              </View>
            </Marker>
          )}

          {restaurantLocation && deliveryLocation && tracking.order.status !== 'delivering' && (
            <Polyline
              coordinates={[restaurantLocation, deliveryLocation]}
              strokeColor="#4CAF50"
              strokeWidth={3}
              lineDashPattern={[5, 5]}
            />
          )}

          {courierLocation && deliveryLocation && tracking.order.status === 'delivering' && (
            <Polyline
              coordinates={[courierLocation, deliveryLocation]}
              strokeColor="#2196F3"
              strokeWidth={4}
            />
          )}
        </MapView>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          {/* My Location Button */}
          <TouchableOpacity
            style={styles.myLocationButton}
            onPress={handleGoToMyLocation}
          >
            <Ionicons name="locate" size={20} color="#333" />
          </TouchableOpacity>
          
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
              <Ionicons name="add" size={18} color="#333" />
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
              <Ionicons name="remove" size={18} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Bottom Card */}
      <View style={styles.bottomCard}>
        <ScrollView 
          style={styles.bottomCardScroll}
          contentContainerStyle={styles.bottomCardContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
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
                ? `${tracking.restaurant?.name || 'რესტორანი'} ამზადებს თქვენს შეკვეთას`
                : tracking.order.status === 'ready'
                ? 'შეკვეთა მზადაა'
                : tracking.order.status === 'delivering'
                ? 'კურიერი მოდის თქვენთან'
                : 'შეკვეთა მიტანილია'}
            </Text>
          </View>

          {/* Restaurant Info */}
          {tracking.restaurant && (
            <View style={styles.restaurantInfoContainer}>
              <View style={styles.restaurantInfoRow}>
                <Ionicons name="restaurant" size={18} color="#666" />
                <Text style={styles.restaurantInfoText}>{tracking.restaurant.name}</Text>
              </View>
              {tracking.restaurant.location?.address && (
                <Text style={styles.restaurantAddress}>{tracking.restaurant.location.address}</Text>
              )}
            </View>
          )}

          {/* Delivery Address */}
          {tracking.order.deliveryAddress && (
            <View style={styles.deliveryAddressContainer}>
              <View style={styles.deliveryAddressRow}>
                <Ionicons name="location" size={18} color="#666" />
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
            </View>
          )}
        </ScrollView>
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
                <Ionicons name="checkmark-circle" size={64} color="#10B981" />
              </View>
            </View>
            <Text style={styles.modalTitle}>შეკვეთა მიტანილია! 🎉</Text>
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 70,
    paddingBottom: 8,
    backgroundColor: "transparent",
    zIndex: 10,
    minHeight: 50,
  },
  headerButton: {
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
  mapContainer: {
    flex: 1,
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
  mapControls: {
    position: "absolute",
    right: 12,
    bottom: "58%",
    gap: 8,
    zIndex: 1000,
  },
  myLocationButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  zoomControls: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    overflow: "hidden",
  },
  zoomButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  zoomButtonBottom: {
    borderBottomWidth: 0,
  },
  bottomCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    maxHeight: "55%",
    zIndex: 100,
  },
  bottomCardScroll: {
    maxHeight: "100%",
  },
  bottomCardContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
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
    paddingBottom: 12,
    marginBottom: 12,
  },
  deliveryTimeLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  deliveryTimeValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
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
    marginBottom: 12,
    position: "relative",
  },
  statusMessage: {
    fontSize: 13,
    color: "#333",
    textAlign: "center",
    lineHeight: 18,
  },
  restaurantInfoContainer: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  restaurantInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  restaurantInfoText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  restaurantAddress: {
    fontSize: 11,
    color: "#666",
    marginLeft: 26,
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
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
  },
  deliveryAddressCity: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  deliveryInstructions: {
    fontSize: 10,
    color: "#999",
    fontStyle: "italic",
    marginTop: 4,
  },
  orderDetailsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  orderDetailsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  orderItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  orderItemInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  orderItemName: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
    marginRight: 6,
  },
  orderItemQuantity: {
    fontSize: 11,
    color: "#666",
  },
  orderItemPrice: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  orderDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 10,
  },
  orderTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  orderTotalLabel: {
    fontSize: 12,
    color: "#666",
  },
  orderTotalValue: {
    fontSize: 12,
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
    fontSize: 11,
    color: "#666",
  },
  orderFeeValue: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  orderFinalTotalRow: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  orderFinalTotalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  orderFinalTotalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4CAF50",
  },
  orderPaymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  orderPaymentLabel: {
    fontSize: 11,
    color: "#666",
  },
  orderPaymentValue: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
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
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
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
