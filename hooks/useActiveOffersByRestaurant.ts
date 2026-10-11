import { useEffect, useState } from "react";
import { apiService } from "../utils/api";
import {
  groupOffersByRestaurantId,
  type RestaurantOffer,
} from "../utils/restaurantOffers";

export function useActiveOffersByRestaurant() {
  const [offersByRestaurant, setOffersByRestaurant] = useState<
    Record<string, RestaurantOffer[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const response = await apiService.getActiveRestaurantOffers();
        if (cancelled) return;

        if (response.success && response.data) {
          const list = Array.isArray(response.data) ? response.data : [];
          setOffersByRestaurant(groupOffersByRestaurantId(list));
        } else {
          setOffersByRestaurant({});
        }
      } catch (error) {
        console.error("Error fetching active restaurant offers:", error);
        if (!cancelled) setOffersByRestaurant({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { offersByRestaurant, loading };
}
