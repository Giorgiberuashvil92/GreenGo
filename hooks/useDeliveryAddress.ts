import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

import {
  type DeliveryAddress,
  detectCurrentDeliveryAddress,
  loadDeliveryAddress,
} from "@/utils/address";

export function useDeliveryAddress() {
  const [address, setAddress] = useState<DeliveryAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const hasTriedGps = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const run = async () => {
        setLoading(true);
        try {
          const saved = await loadDeliveryAddress();
          if (cancelled) return;

          if (saved?.street?.trim()) {
            setAddress(saved);
            return;
          }

          if (!hasTriedGps.current) {
            hasTriedGps.current = true;
            const detected = await detectCurrentDeliveryAddress();
            if (!cancelled) {
              setAddress(detected);
            }
            return;
          }

          setAddress(null);
        } catch (error) {
          console.error("Delivery address load error:", error);
          if (!cancelled) setAddress(null);
        } finally {
          if (!cancelled) setLoading(false);
        }
      };

      void run();

      return () => {
        cancelled = true;
      };
    }, []),
  );

  return { address, loading };
}
