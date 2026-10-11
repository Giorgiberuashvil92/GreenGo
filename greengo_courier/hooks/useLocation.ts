import { useEffect, useMemo, useRef, useState } from "react";
import * as Location from "expo-location";
import { Location as LocationType } from "../types";
import { DEFAULT_LOCATION } from "../utils/location";

export const useLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const driverLocation = useMemo<LocationType>(() => {
    return location
      ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }
      : DEFAULT_LOCATION;
  }, [location]);

  const mapRegion = useMemo(() => {
    if (location) {
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    return {
      latitude: DEFAULT_LOCATION.latitude,
      longitude: DEFAULT_LOCATION.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [location]);

  const startWatching = async () => {
    try {
      setIsLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setIsLoading(false);
        return;
      }

      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(initial);
      setIsLoading(false);

      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }

      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000,
          distanceInterval: 15,
          mayShowUserSettingsDialog: true,
        },
        (next) => {
          setLocation(next);
        },
      );
    } catch (error) {
      console.error("Error getting location:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    startWatching();

    return () => {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, []);

  return {
    location,
    driverLocation,
    mapRegion,
    isLoading,
    refreshLocation: startWatching,
  };
};
