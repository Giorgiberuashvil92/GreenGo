import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../utils/api";
import { ordersFromGetOrdersData } from "../utils/ordersFromResponse";

export type CurrentOrderRestaurant = {
  _id?: string;
  name: string;
  image?: string;
  heroImage?: string;
};

export type CurrentOrder = {
  _id: string;
  status: string;
  restaurantId: string | CurrentOrderRestaurant;
};

const ACTIVE_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "delivering",
] as const;

export function useCurrentOrder() {
  const { user } = useAuth();
  const [order, setOrder] = useState<CurrentOrder | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCurrent = useCallback(async () => {
    const userId = user?.id || (user as { _id?: string } | null)?._id;
    if (!userId) {
      setOrder(null);
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.getOrders({
        userId: String(userId),
        limit: 20,
      });

      if (!response.success || !response.data) {
        setOrder(null);
        return;
      }

      const orders = ordersFromGetOrdersData(response.data) as CurrentOrder[];
      const active = orders.find((o) =>
        ACTIVE_STATUSES.includes(
          o.status as (typeof ACTIVE_STATUSES)[number],
        ),
      );
      setOrder(active ?? null);
    } catch (error) {
      console.error("Error fetching current order:", error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void fetchCurrent();
    }, [fetchCurrent]),
  );

  return { order, loading, refetch: fetchCurrent };
}
