import { useCallback, useEffect, useRef } from "react";
import { Location } from "../types";
import { apiService } from "../utils/api";

interface UseCourierLocationProps {
  courierId: string | null;
  driverLocation: Location;
  isOnline: boolean;
}

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const useCourierLocation = ({
  courierId,
  driverLocation,
  isOnline,
}: UseCourierLocationProps) => {
  const lastSentRef = useRef<Location | null>(null);
  const inFlightRef = useRef(false);

  const pushLocation = useCallback(
    async (force = false) => {
      if (!courierId || !isOnline || inFlightRef.current) return;

      const lastSent = lastSentRef.current;
      if (!force && lastSent) {
        const distance = calculateDistance(
          lastSent.latitude,
          lastSent.longitude,
          driverLocation.latitude,
          driverLocation.longitude,
        );
        // Skip if moved less than ~10 meters
        if (distance < 0.01) return;
      }

      try {
        inFlightRef.current = true;
        await apiService.updateCourierLocation(
          courierId,
          driverLocation.latitude,
          driverLocation.longitude,
        );
        lastSentRef.current = { ...driverLocation };
      } catch (error) {
        console.error("Error updating courier location:", error);
      } finally {
        inFlightRef.current = false;
      }
    },
    [
      courierId,
      isOnline,
      driverLocation.latitude,
      driverLocation.longitude,
    ],
  );

  // Push whenever GPS coords change while online
  useEffect(() => {
    if (!isOnline || !courierId) return;
    pushLocation();
  }, [
    isOnline,
    courierId,
    driverLocation.latitude,
    driverLocation.longitude,
    pushLocation,
  ]);

  // Fallback heartbeat every 15s (in case device reports same rounded coords)
  useEffect(() => {
    if (!isOnline || !courierId) return;

    const interval = setInterval(() => {
      pushLocation(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [isOnline, courierId, pushLocation]);
};
