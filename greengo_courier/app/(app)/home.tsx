import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { DriverLottieOverlay } from "../../components/DriverLottieOverlay";
import { Header } from "../../components/Header";
import { MapMarkers } from "../../components/MapMarkers";
import { NavigationDrawer } from "../../components/NavigationDrawer";
import { OrderDeliveryScreen } from "../../components/OrderDeliveryScreen";
import { OrderOfferScreen } from "../../components/OrderOfferScreen";
import { OrderPickupScreen } from "../../components/OrderPickupScreen";
import { SlideButton } from "../../components/SlideButton";
import { Colors } from "../../constants/colors";
import { Dimensions as Dims } from "../../constants/dimensions";
import {
  COURIER_ONLINE_KEY,
  useCourierAuth,
} from "../../hooks/useCourierAuth";
import { useCourierLocation } from "../../hooks/useCourierLocation";
import { useCourierOrders } from "../../hooks/useCourierOrders";
import { useDrawer } from "../../hooks/useDrawer";
import { useLocation } from "../../hooks/useLocation";
import { usePushNotifications } from "../../hooks/usePushNotifications";
import { DemandLevel, Location, Status } from "../../types";
import { apiService } from "../../utils/api";
import { getApiInfo } from "../../utils/apiConfig";
import { generateSmoothRoute, getDistance } from "../../utils/location";

async function persistOnlineStatus(next: Status) {
  try {
    await AsyncStorage.setItem(
      COURIER_ONLINE_KEY,
      next === "online" ? "1" : "0",
    );
  } catch (error) {
    console.error("Error saving online status:", error);
  }
}

type OrderState = "none" | "offer" | "pickup" | "delivery";

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("offline");
  const [demandLevel, setDemandLevel] = useState<DemandLevel>("low");
  const [orderState, setOrderState] = useState<OrderState>("none");
  const panelHeight = useRef(new Animated.Value(Dims.panel.minHeight)).current;
  const panelHeightValueRef = useRef(Dims.panel.minHeight);
  const panelDragStartRef = useRef(Dims.panel.minHeight);
  const [preparationTime, setPreparationTime] = useState(0);
  const prepTimerOrderIdRef = useRef<string | null>(null);
  const [isOrderReady, setIsOrderReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mapRef = useRef<MapView>(null);
  const initialRegionRef = useRef<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const hasRedirectedRef = useRef(false);
  const lastOrderStateRef = useRef<OrderState>("none");
  const [mapRegionRevision, setMapRegionRevision] = useState(0);

  // Custom hooks
  const {
    driverLocation,
    mapRegion,
    location,
    isLoading: locationLoading,
  } = useLocation();
  const drawer = useDrawer();
  const { courierId, isLoading: authLoading } = useCourierAuth();

  const isOnline = status === "online";
  const hasLocation = location !== null; // Check if location permission is granted
  const statusRestoredRef = useRef(false);

  usePushNotifications({
    courierId,
    enabled: !!courierId && !authLoading,
  });

  // Update courier location when online and location is available
  useCourierLocation({
    courierId,
    driverLocation,
    isOnline: isOnline && hasLocation, // Only update location if permission granted
  });

  // Restore online status — stays online until courier turns it off
  useEffect(() => {
    if (!courierId || authLoading || statusRestoredRef.current) return;

    let cancelled = false;

    const restore = async () => {
      try {
        const saved = await AsyncStorage.getItem(COURIER_ONLINE_KEY);
        if (cancelled || saved !== "1") {
          statusRestoredRef.current = true;
          return;
        }

        setStatus("online");
        statusRestoredRef.current = true;

        try {
          await apiService.updateCourierStatus(courierId, "available", true);
        } catch (error) {
          console.error("Error restoring courier status on server:", error);
        }
      } catch (error) {
        console.error("Error restoring online status:", error);
        statusRestoredRef.current = true;
      }
    };

    restore();
    return () => {
      cancelled = true;
    };
  }, [courierId, authLoading]);

  // Log API configuration on startup
  useEffect(() => {
    const apiInfo = getApiInfo();
    console.log("🔧 API Configuration:", apiInfo);
  }, []);

  // Initialize map region only once when location is first available
  useEffect(() => {
    if (mapRegion && !initialRegionRef.current) {
      initialRegionRef.current = mapRegion;
    }
    // Ensure we have a default region even if location is not available
    if (!initialRegionRef.current) {
      initialRegionRef.current = mapRegion || {
        latitude: 41.7151,
        longitude: 44.8271,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
  }, [mapRegion]);

  // Fetch orders from backend (only if location is available)
  const {
    availableOrders,
    currentOrder,
    loading: ordersLoading,
    acceptOrder: acceptOrderApi,
    updateOrderStatus,
    completeOrder: completeOrderApi,
    fetchAvailableOrders,
  } = useCourierOrders({
    courierId,
    driverLocation,
    isOnline: isOnline && hasLocation, // Only fetch orders if location is available
  });

  // Determine current order state based on order status
  // IMPORTANT: Only update orderState when order is first assigned or status changes
  // Don't automatically change to delivery - courier must click "pickup" button first
  useEffect(() => {
    if (!currentOrder) {
      setOrderState((prev) => {
        if (prev !== "none") return "none";
        return prev;
      });
      setIsOrderReady(false);
      setPreparationTime(0);
      prepTimerOrderIdRef.current = null;
      return;
    }

    const status = currentOrder.status;

    // If status is 'ready' or 'preparing', we're in pickup phase
    // Don't automatically change orderState if it's already 'pickup' - let courier control it
    // Note: 'confirmed' status means restaurant hasn't confirmed yet, so order won't appear in currentOrder
    if (status === "ready" || status === "preparing") {
      // Only set to pickup if we're not already in pickup or delivery state
      // This prevents automatic state changes when admin changes status
      setOrderState((prev) => {
        if (prev === "none" || prev === "offer") {
          return "pickup";
        }
        return prev; // Keep current state if already in pickup or delivery
      });

      // Only mark as ready if status is explicitly 'ready'
      // 'preparing' status means order is being prepared but not ready yet
      if (status === "ready") {
        setIsOrderReady(true);
        setPreparationTime(0);
      } else if (status === "preparing") {
        // Order is preparing but not ready - wait for backend to change status to 'ready'
        setIsOrderReady(false);
        const remainingFromReadyAt = currentOrder.estimatedReadyAt
          ? Math.ceil(
              (new Date(currentOrder.estimatedReadyAt).getTime() - Date.now()) /
                60000,
            )
          : null;
        const orderChanged =
          prepTimerOrderIdRef.current !== currentOrder._id;
        if (orderChanged) {
          prepTimerOrderIdRef.current = currentOrder._id;
        }
        // Prefer absolute ready-at; otherwise keep local countdown (don't reset on poll)
        setPreparationTime((prev) => {
          if (remainingFromReadyAt != null) {
            return Math.max(0, remainingFromReadyAt);
          }
          if (!orderChanged && prev > 0) return prev;
          return currentOrder.preparationMinutes &&
            currentOrder.preparationMinutes > 0
            ? currentOrder.preparationMinutes
            : 0;
        });
      }
    } else if (status === "delivering") {
      setOrderState("delivery");
      setIsOrderReady(false);
      setPreparationTime(0);
    } else {
      setOrderState((prev) => {
        if (prev !== "none") return "none";
        return prev;
      });
    }
  }, [currentOrder]);

  useEffect(() => {
    if (
      isOnline &&
      !currentOrder &&
      availableOrders.length > 0 &&
      orderState === "none"
    ) {
      setOrderState("offer");
    }
    // If orderState is "offer" but no available orders, reset to "none"
    if (orderState === "offer" && availableOrders.length === 0) {
      setOrderState("none");
    }
  }, [isOnline, currentOrder, availableOrders, orderState]);

  // Calculate locations for map
  const restaurantLocation = useMemo<Location>(() => {
    if (currentOrder?.restaurantId?.location) {
      return {
        latitude: currentOrder.restaurantId.location.latitude,
        longitude: currentOrder.restaurantId.location.longitude,
      };
    }
    // Default location
    return { latitude: 41.7201, longitude: 44.7831 };
  }, [currentOrder]);

  const customerLocation = useMemo<Location>(() => {
    if (currentOrder?.deliveryAddress?.coordinates) {
      return {
        latitude: currentOrder.deliveryAddress.coordinates.lat,
        longitude: currentOrder.deliveryAddress.coordinates.lng,
      };
    }
    // Default location
    return { latitude: 41.7101, longitude: 44.7931 };
  }, [currentOrder]);

  // Calculate route coordinates based on order state
  const routeCoordinates = useMemo(() => {
    if (orderState === "none" || orderState === "offer") return [];

    // During pickup: show route from driver to restaurant
    if (orderState === "pickup") {
      return generateSmoothRoute([driverLocation, restaurantLocation]);
    }

    // During delivery: show route from driver (current location) to customer
    if (orderState === "delivery") {
      return generateSmoothRoute([driverLocation, customerLocation]);
    }

    return [];
  }, [orderState, driverLocation, restaurantLocation, customerLocation]);

  // Calculate distance for offer screen
  const offerDistance = useMemo(() => {
    if (orderState !== "offer" || !availableOrders[0]) return undefined;
    const order = availableOrders[0];
    if (order.restaurantId?.location && order.deliveryAddress?.coordinates) {
      return getDistance(
        order.restaurantId.location.latitude,
        order.restaurantId.location.longitude,
        order.deliveryAddress.coordinates.lat,
        order.deliveryAddress.coordinates.lng,
      );
    }
    return undefined;
  }, [orderState, availableOrders]);

  // Panel dimensions — ჩაკეცილი / გაშლილი bottom sheet
  const panelExpandedHeight = height * Dims.panel.maxHeight;
  const panelCollapsedHeight = Math.min(
    Math.max(340, height * 0.38),
    panelExpandedHeight,
  );
  const isPanelDraggable = orderState !== "none";
  const panelExpandedRef = useRef(panelExpandedHeight);
  const panelCollapsedRef = useRef(panelCollapsedHeight);
  panelExpandedRef.current = panelExpandedHeight;
  panelCollapsedRef.current = panelCollapsedHeight;
  const isPanelDraggableRef = useRef(isPanelDraggable);
  isPanelDraggableRef.current = isPanelDraggable;

  // რუკის ღილაკები ყოველთვის პანელის ზემოთ
  const [mapControlsBottom, setMapControlsBottom] = useState(
    panelCollapsedHeight + Dims.padding.large,
  );

  useEffect(() => {
    if (!isPanelDraggable) {
      setMapControlsBottom(220 + Dims.padding.large);
      return;
    }

    setMapControlsBottom(panelCollapsedHeight + Dims.padding.large);
    const listenerId = panelHeight.addListener(({ value }) => {
      setMapControlsBottom(value + Dims.padding.large);
    });

    return () => {
      panelHeight.removeListener(listenerId);
    };
  }, [isPanelDraggable, panelCollapsedHeight, panelHeight]);

  // Slide button dimensions
  const slideWidth = width - Dims.padding.screen * 2;
  const maxTranslateX =
    slideWidth - Dims.slideButton.width - Dims.slideButton.padding * 2;

  // Demand interval effect
  useEffect(() => {
    if (orderState !== "none") return;

    const demandInterval = setInterval(() => {
      const levels: DemandLevel[] = ["low", "medium", "high"];
      const randomLevel = levels[Math.floor(Math.random() * levels.length)];
      setDemandLevel(randomLevel);
    }, 30000);

    return () => clearInterval(demandInterval);
  }, [orderState]);

  // Preparation timer (display only — ready status comes from restaurant)
  useEffect(() => {
    if (orderState === "pickup" && !isOrderReady && preparationTime > 0) {
      const timer = setInterval(() => {
        setPreparationTime((prev) => Math.max(0, prev - 1));
      }, 60000);

      return () => {
        if (timer) clearInterval(timer);
      };
    }
  }, [orderState, isOrderReady, preparationTime]);

  // შეკვეთისას ყოველთვის იწყება ჩაკეცილად
  useEffect(() => {
    if (isPanelDraggable) {
      const collapsed = panelCollapsedRef.current;
      panelHeightValueRef.current = collapsed;
      panelHeight.setValue(collapsed);
      Animated.spring(panelHeight, {
        toValue: collapsed,
        useNativeDriver: false,
        tension: 65,
        friction: 11,
      }).start();
    }
  }, [orderState, isPanelDraggable, panelHeight]);

  // Bottom sheet drag — აწევა = გაშლა, დაწევა = ჩაკეცვა
  const panelPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (!isPanelDraggableRef.current) return false;
        return Math.abs(gestureState.dy) > 4;
      },
      onPanResponderGrant: () => {
        panelHeight.stopAnimation((value) => {
          panelDragStartRef.current = value;
          panelHeightValueRef.current = value;
        });
      },
      onPanResponderMove: (_, gestureState) => {
        if (!isPanelDraggableRef.current) return;
        const next = panelDragStartRef.current - gestureState.dy;
        const clamped = Math.max(
          panelCollapsedRef.current,
          Math.min(panelExpandedRef.current, next),
        );
        panelHeightValueRef.current = clamped;
        panelHeight.setValue(clamped);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!isPanelDraggableRef.current) return;

        panelHeight.stopAnimation((value) => {
          panelHeightValueRef.current = value;
        });

        const collapsed = panelCollapsedRef.current;
        const expanded = panelExpandedRef.current;
        const mid = (collapsed + expanded) / 2;
        const shouldExpand =
          gestureState.dy < -30 || panelHeightValueRef.current > mid;
        const target = shouldExpand ? expanded : collapsed;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.spring(panelHeight, {
          toValue: target,
          useNativeDriver: false,
          tension: 65,
          friction: 11,
        }).start(() => {
          panelHeightValueRef.current = target;
        });
      },
    }),
  ).current;

  // Update courier status when toggling (only explicit off stops being online)
  const handleToggleStatus = async () => {
    const newStatus = status === "offline" ? "online" : "offline";
    setStatus(newStatus);
    await persistOnlineStatus(newStatus);

    if (courierId) {
      try {
        await apiService.updateCourierStatus(
          courierId,
          newStatus === "online" ? "available" : "offline",
          newStatus === "online",
        );
      } catch (error) {
        console.error("Error updating courier status:", error);
      }
    }
  };

  // Fit map to show route only when orderState changes (not when route coordinates update)
  useEffect(() => {
    // Only fit to coordinates if orderState actually changed
    if (
      orderState !== lastOrderStateRef.current &&
      orderState !== "none" &&
      routeCoordinates.length > 0 &&
      mapRef.current
    ) {
      lastOrderStateRef.current = orderState;
      const timer = setTimeout(() => {
        if (mapRef.current && routeCoordinates.length > 0) {
          mapRef.current.fitToCoordinates(routeCoordinates, {
            edgePadding: {
              top: 100,
              right: 50,
              bottom: 300,
              left: 50,
            },
            animated: true,
          });
        }
      }, 150);

      return () => clearTimeout(timer);
    } else if (orderState !== lastOrderStateRef.current) {
      // Update ref even if we don't fit to coordinates
      lastOrderStateRef.current = orderState;
    }
  }, [orderState, routeCoordinates]);

  const handleConfirmOrder = async () => {
    if (!courierId || !availableOrders[0] || isProcessing) return;

    setIsProcessing(true);
    try {
      const order = availableOrders[0];
      const success = await acceptOrderApi(order._id);

      if (success) {
        // Order is now in 'confirmed' status - wait for restaurant to confirm
        // Order will appear in currentOrder only when restaurant confirms (status becomes 'preparing' or 'ready')
        setOrderState("none");
        setIsOrderReady(false);
        setPreparationTime(0);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePickupOrder = async () => {
    if (!currentOrder || !isOrderReady || isProcessing) return;

    setIsProcessing(true);
    try {
      const success = await updateOrderStatus(currentOrder._id, "delivering");
      if (success) {
        setOrderState("delivery");
        setIsOrderReady(false);
        setPreparationTime(0);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeliverOrder = async () => {
    if (!currentOrder || !courierId || isProcessing) return;

    setIsProcessing(true);
    try {
      const success = await completeOrderApi(currentOrder._id);
      if (success) {
        setOrderState("none");
        setStatus("online");
        await persistOnlineStatus("online");
        setIsOrderReady(false);
        setPreparationTime(0);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectOrder = async () => {
    if (!courierId || !availableOrders[0] || isProcessing) return;

    setIsProcessing(true);
    try {
      const order = availableOrders[0];
      console.log("🚫 Rejecting order:", order._id, "by courier:", courierId);
      const success = await apiService.rejectOrder(order._id, courierId);

      if (success.success) {
        console.log(
          "✅ შეკვეთა წარმატებით უარყოფილია:",
          success.message || success.data?.message,
        );
        // Order rejected - it will be available for other couriers
        // შეკვეთა აღარ გამოჩნდება ამ კურიერისთვის (Backend-ში filter: rejectedCouriers: { $nin: [forCourier] })
        // Immediately set orderState to "none" to hide OrderOfferScreen
        setOrderState("none");
        setIsOrderReady(false);
        setPreparationTime(0);
        // Refresh available orders to remove the rejected one
        // The order will appear again for other couriers
        if (fetchAvailableOrders) {
          await fetchAvailableOrders();
        }
      } else {
        const errorMessage =
          success.error?.details || "შეცდომა შეკვეთის გაუქმებისას";
        console.error("❌ Error rejecting order:", errorMessage);
      }
    } catch (error: any) {
      console.error("❌ შეკვეთის უარყოფა ვერ მოხერხდა:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCenterOnLocation = () => {
    if (mapRef.current && driverLocation) {
      const newRegion = {
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(newRegion, 500);
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current
        .getCamera()
        .then((camera) => {
          if (mapRef.current && camera.center) {
            const currentZoom = camera.zoom || 15;
            const newZoom = Math.min(currentZoom + 2, 20); // Increased from +1 to +2 for more zoom
            const delta = 0.01 / Math.pow(2, newZoom - 15);

            mapRef.current.animateToRegion(
              {
                latitude: camera.center.latitude,
                longitude: camera.center.longitude,
                latitudeDelta: delta,
                longitudeDelta: delta,
              },
              300,
            );
          }
        })
        .catch(() => {
          // Fallback: use current map region
          if (mapRef.current) {
            const currentDelta = mapRegion.latitudeDelta || 0.01;
            const newDelta = currentDelta * 0.5; // Increased zoom: changed from 0.7 to 0.5 for more zoom in

            mapRef.current.animateToRegion(
              {
                latitude: mapRegion.latitude,
                longitude: mapRegion.longitude,
                latitudeDelta: Math.max(newDelta, 0.001),
                longitudeDelta: Math.max(newDelta, 0.001),
              },
              300,
            );
          }
        });
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current
        .getCamera()
        .then((camera) => {
          if (mapRef.current && camera.center) {
            const currentZoom = camera.zoom || 15;
            const newZoom = Math.max(currentZoom - 2, 3); // Increased from -1 to -2 for more zoom out
            const delta = 0.01 * Math.pow(2, 15 - newZoom);

            mapRef.current.animateToRegion(
              {
                latitude: camera.center.latitude,
                longitude: camera.center.longitude,
                latitudeDelta: Math.min(delta, 180),
                longitudeDelta: Math.min(delta, 360),
              },
              300,
            );
          }
        })
        .catch(() => {
          // Fallback: use current map region
          if (mapRef.current) {
            const currentDelta = mapRegion.latitudeDelta || 0.01;
            const newDelta = currentDelta * 2.0; // Increased zoom out: changed from 1.4 to 2.0 for more zoom out

            mapRef.current.animateToRegion(
              {
                latitude: mapRegion.latitude,
                longitude: mapRegion.longitude,
                latitudeDelta: Math.min(newDelta, 180),
                longitudeDelta: Math.min(newDelta, 360),
              },
              300,
            );
          }
        });
    }
  };

  const getStatusMessage = () => {
    if (orderState !== "none") return "";
    if (status === "offline") {
      return "გადადი ონლაინ რეჟიმში რადგან მიიღო შეკვეთები.";
    }
    if (availableOrders.length === 0) {
      return "თქვენ ხართ ონლაინ რეჟიმში. ახლა შეკვეთები არ არის.";
    }
    return "თქვენ ხართ ონლაინ რეჟიმში დაელოდეთ შეკვეთებს.";
  };

  // Redirect to auth if no courier ID (only once when auth loading completes)
  useEffect(() => {
    if (!authLoading && !courierId && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.replace("/(auth)/phone");
    }
  }, [authLoading, courierId, router]);

  // Show loading if auth is loading
  if (authLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>იტვირთება...</Text>
      </View>
    );
  }

  // Show loading while redirecting
  if (!courierId) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>გადამისამართება...</Text>
      </View>
    );
  }

  // Show location permission request if location is not available
  if (locationLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>ლოკაციის მიღება...</Text>
      </View>
    );
  }

  if (!hasLocation) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>გთხოვთ, მიუთითოთ ლოკაციის წვდომა</Text>
        <Text style={styles.errorSubtext}>
          აპლიკაციის მუშაობისთვის საჭიროა თქვენი ლოკაცია
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={Platform.OS === "android" ? ["top", "bottom"] : ["top"]}
    >
      <StatusBar
        barStyle="light-content"
        translucent={Platform.OS === "android"}
        backgroundColor={Platform.OS === "android" ? "transparent" : undefined}
      />

      {/* Map */}
      <View style={styles.map}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          initialRegion={
            initialRegionRef.current ||
            mapRegion || {
              latitude: 41.7151, // Tbilisi default
              longitude: 44.8271,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }
          }
          onRegionChangeComplete={() => {
            setMapRegionRevision((n) => n + 1);
          }}
          onMapReady={() => {
            setMapRegionRevision((n) => n + 1);
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
          toolbarEnabled={false}
          mapType="standard"
          loadingEnabled={true}
        >
          <MapMarkers
            driverLocation={driverLocation}
            restaurantLocation={restaurantLocation}
            customerLocation={customerLocation}
            showRoute={orderState !== "none"}
            orderState={orderState}
          />

          {/* Route polyline */}
          {routeCoordinates.length > 1 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={Colors.secondary}
              strokeWidth={5}
              lineCap="round"
              lineJoin="round"
              geodesic={true}
            />
          )}
        </MapView>

        <DriverLottieOverlay
          mapRef={mapRef}
          coordinate={driverLocation}
          regionRevision={mapRegionRevision}
        />

        {/* Center on location button */}
        <TouchableOpacity
          style={[styles.centerLocationButton, { bottom: mapControlsBottom }]}
          onPress={handleCenterOnLocation}
          activeOpacity={0.8}
        >
          <Ionicons name="locate" size={24} color={Colors.primary} />
        </TouchableOpacity>

        {/* Zoom controls */}
        <View style={[styles.zoomControls, { bottom: mapControlsBottom + 60 }]}>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={handleZoomIn}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={handleZoomOut}
            activeOpacity={0.8}
          >
            <Ionicons name="remove" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Header */}
      <Header
        status={status}
        orderState={orderState}
        onMenuPress={drawer.toggle}
        onToggleStatus={handleToggleStatus}
        onRejectOrder={handleRejectOrder}
      />

      {/* Delivery time badge */}
      {orderState === "delivery" && currentOrder && (
        <View style={styles.deliveryTimeBadge}>
          <Text style={styles.deliveryTimeText}>მიტანა მიმდინარეობს</Text>
        </View>
      )}

      {/* Bottom Panel — idle sticky; order: collapsed then drag up */}
      <Animated.View
        style={[
          styles.bottomPanelContainer,
          isPanelDraggable
            ? { height: panelHeight, maxHeight: panelExpandedHeight }
            : styles.bottomPanelIdle,
        ]}
      >
        <View style={styles.blurContainer}>
          {isPanelDraggable && (
            <View
              style={styles.dragHandleArea}
              {...panelPanResponder.panHandlers}
            >
              <View style={styles.dragHandle} />
            </View>
          )}

          <View
            style={[
              styles.panelContent,
              isPanelDraggable && styles.panelContentDraggable,
            ]}
          >
            {orderState === "none" && (
              <>
                <View style={styles.locationRow}>
                  <Text style={styles.locationName}>კურიერი</Text>
                  {ordersLoading && (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  )}
                </View>
                <Text style={styles.statusMessage}>{getStatusMessage()}</Text>
              </>
            )}

            {orderState === "offer" && (
              <OrderOfferScreen
                order={availableOrders[0] || null}
                distance={offerDistance}
                onConfirm={handleConfirmOrder}
                onReject={handleRejectOrder}
                isLoading={isProcessing}
              />
            )}

            {orderState === "pickup" && (
              <OrderPickupScreen
                order={currentOrder}
                preparationTime={preparationTime}
                isReady={isOrderReady}
                onPickup={handlePickupOrder}
              />
            )}

            {orderState === "delivery" && (
              <OrderDeliveryScreen
                order={currentOrder}
                onDeliver={handleDeliverOrder}
                isLoading={isProcessing}
              />
            )}

            {orderState === "none" && status === "offline" && (
              <SlideButton
                status={status}
                onToggle={handleToggleStatus}
                slideWidth={slideWidth}
                buttonWidth={Dims.slideButton.width}
                maxTranslateX={maxTranslateX}
              />
            )}
          </View>
        </View>
      </Animated.View>

      {/* Navigation Drawer */}
      <NavigationDrawer
        translateX={drawer.translateX}
        overlayOpacity={drawer.overlayOpacity}
        isOpen={drawer.isOpen}
        onClose={drawer.close}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray.medium,
  },
  errorText: {
    fontSize: 18,
    color: Colors.black,
    textAlign: "center",
    padding: 20,
    fontWeight: "600",
  },
  errorSubtext: {
    fontSize: 14,
    color: Colors.gray.medium,
    textAlign: "center",
    paddingHorizontal: 20,
    marginTop: 8,
  },
  map: {
    flex: 1,
    position: "relative",
  },
  deliveryTimeBadge: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 50,
    right: Dims.padding.large,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: Dims.padding.small,
    borderRadius: Dims.borderRadius.large,
    zIndex: 11,
    elevation: 5,
  },
  deliveryTimeText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  bottomPanelContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    zIndex: 20,
    elevation: 20,
  },
  bottomPanelIdle: {
    maxHeight: "40%",
  },
  blurContainer: {
    flex: 1,
    borderTopLeftRadius: Dims.borderRadius.xlarge,
    borderTopRightRadius: Dims.borderRadius.xlarge,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 1)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.08)",
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 15,
  },
  dragHandleArea: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 12,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0, 0, 0, 0.18)",
  },
  demandIndicator: {
    paddingVertical: 14,
    paddingHorizontal: Dims.padding.large,
    borderTopLeftRadius: Dims.borderRadius.xlarge,
    borderTopRightRadius: Dims.borderRadius.xlarge,
  },
  demandText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  panelContent: {
    paddingHorizontal: Dims.padding.screen,
    paddingBottom: Platform.OS === "ios" ? 34 : Dims.padding.screen,
    paddingTop: Dims.padding.small,
  },
  panelContentDraggable: {
    flex: 1,
  },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Dims.padding.small,
  },
  locationName: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: Dims.padding.small,
    letterSpacing: -0.5,
  },
  statusMessage: {
    fontSize: 15,
    color: Colors.gray.medium,
    marginBottom: Dims.padding.screen,
    lineHeight: 22,
    fontWeight: "400",
  },
  centerLocationButton: {
    position: "absolute",
    right: Dims.padding.large,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.gray.light,
    zIndex: 5,
  },
  zoomControls: {
    position: "absolute",
    right: Dims.padding.large,
    width: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.gray.light,
    zIndex: 5,
    overflow: "hidden",
  },
  zoomButton: {
    width: 48,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  zoomDivider: {
    width: "100%",
    height: 1,
    backgroundColor: Colors.gray.light,
  },
});
