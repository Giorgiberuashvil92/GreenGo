import { useState, useMemo, useCallback } from "react";
import { OrderState, Location } from "../types";
import { generateRandomNearbyLocation, generateSmoothRoute } from "../utils/location";

export const useOrderSimulation = (driverLocation: Location) => {
  const [orderState, setOrderState] = useState<OrderState>("none");
  const [orderPreparationTime, setOrderPreparationTime] = useState(0);
  const [isOrderReady, setIsOrderReady] = useState(false);
  const [preparationTimer, setPreparationTimer] = useState<
    ReturnType<typeof setInterval> | null
  >(null);

  const [restaurantLocation, setRestaurantLocation] = useState<Location>({
    latitude: 41.7201,
    longitude: 44.7831,
  });

  const [customerLocation, setCustomerLocation] = useState<Location>({
    latitude: 41.7101,
    longitude: 44.7931,
  });

  const routeCoordinates = useMemo(() => {
    if (orderState === "none") return [];
    
    // Only generate route if we have valid locations
    if (
      !driverLocation ||
      !restaurantLocation ||
      !customerLocation
    ) {
      return [];
    }
    
    return generateSmoothRoute([
      driverLocation,
      restaurantLocation,
      customerLocation,
    ]);
  }, [orderState, driverLocation, restaurantLocation, customerLocation]);

  const startSimulation = useCallback(() => {
    // Generate new locations
    const newRestaurant = generateRandomNearbyLocation(driverLocation, 2);
    const newCustomer = generateRandomNearbyLocation(newRestaurant, 3);
    
    // Reset state and set new locations
    setOrderState("none");
    setOrderPreparationTime(0);
    setIsOrderReady(false);
    setRestaurantLocation(newRestaurant);
    setCustomerLocation(newCustomer);
    
    // Set order state after locations are set
    // React will batch these updates, but useMemo will recalculate when locations change
    setOrderState("offer");
  }, [driverLocation]);

  const confirmOrder = useCallback(() => {
    setOrderState("pickup");
    setIsOrderReady(false);
    setOrderPreparationTime(4);

    let timeLeft = 4;
    const timer = setInterval(() => {
      timeLeft -= 1;
      setOrderPreparationTime(timeLeft);
      if (timeLeft <= 0) {
        setIsOrderReady(true);
        clearInterval(timer);
        setPreparationTimer(null);
      }
    }, 1000);
    setPreparationTimer(timer);
  }, []);

  const pickupOrder = useCallback(() => {
    if (isOrderReady) {
      setOrderState("delivery");
      setIsOrderReady(false);
    }
  }, [isOrderReady]);

  const deliverOrder = useCallback(() => {
    setOrderState("none");
    setOrderPreparationTime(0);
    setIsOrderReady(false);
    if (preparationTimer) {
      clearInterval(preparationTimer);
      setPreparationTimer(null);
    }
  }, [preparationTimer]);

  const rejectOrder = useCallback(() => {
    setOrderState("none");
    setOrderPreparationTime(0);
    setIsOrderReady(false);
    if (preparationTimer) {
      clearInterval(preparationTimer);
      setPreparationTimer(null);
    }
  }, [preparationTimer]);

  return {
    orderState,
    restaurantLocation,
    customerLocation,
    routeCoordinates,
    orderPreparationTime,
    isOrderReady,
    startSimulation,
    confirmOrder,
    pickupOrder,
    deliverOrder,
    rejectOrder,
  };
};

