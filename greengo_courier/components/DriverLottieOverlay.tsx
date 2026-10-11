import LottieView from "lottie-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView from "react-native-maps";
import { Location } from "../types";

const MARKER_SIZE = 56;

type DriverLottieOverlayProps = {
  mapRef: React.RefObject<MapView | null>;
  coordinate: Location;
  regionRevision: number;
};

/**
 * Courier Lottie as map overlay (outside Marker).
 * Marker children + Lottie = Unimplemented on New Architecture.
 */
export function DriverLottieOverlay({
  mapRef,
  coordinate,
  regionRevision,
}: DriverLottieOverlayProps) {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const updatingRef = useRef(false);
  const lastKeyRef = useRef("");

  const updatePoint = useCallback(async () => {
    const map = mapRef.current;
    if (!map || updatingRef.current) return;

    const key = `${coordinate.latitude.toFixed(5)},${coordinate.longitude.toFixed(5)},${regionRevision}`;
    if (key === lastKeyRef.current) return;

    updatingRef.current = true;
    try {
      const next = await map.pointForCoordinate({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      });
      if (
        typeof next?.x === "number" &&
        typeof next?.y === "number" &&
        Number.isFinite(next.x) &&
        Number.isFinite(next.y)
      ) {
        lastKeyRef.current = key;
        setPoint((prev) => {
          if (prev && Math.abs(prev.x - next.x) < 0.5 && Math.abs(prev.y - next.y) < 0.5) {
            return prev;
          }
          return next;
        });
      }
    } catch {
      // Map not ready
    } finally {
      updatingRef.current = false;
    }
  }, [mapRef, coordinate.latitude, coordinate.longitude, regionRevision]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      updatePoint();
    });
    return () => cancelAnimationFrame(id);
  }, [updatePoint]);

  if (!point) return null;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.marker,
        {
          transform: [
            { translateX: point.x - MARKER_SIZE / 2 },
            { translateY: point.y - MARKER_SIZE / 2 },
          ],
        },
      ]}
    >
      <LottieView
        source={require("../assets/lottie/courier-logo.json")}
        autoPlay
        loop
        resizeMode="contain"
        style={styles.lottie}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  marker: {
    position: "absolute",
    left: 0,
    top: 0,
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    zIndex: 5,
  },
  lottie: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
  },
});
