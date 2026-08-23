import { useEffect, useState } from "react";
import type { ImageSourcePropType } from "react-native";
import { getBannerRestaurantId } from "../utils/bannerActions";
import { apiService } from "../utils/api";

export type BannerPlacement = "top" | "mid";

export interface AppBanner {
  id: string;
  source: ImageSourcePropType;
  link?: string;
  restaurantId?: string;
  isClickable?: boolean;
  title?: string;
}

export function useBanners(placement: BannerPlacement = "top") {
  const [banners, setBanners] = useState<AppBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await apiService.getActiveBanners(placement);

        if (cancelled) return;

        if (response.success && Array.isArray(response.data)) {
          const fromApi = response.data
            .filter((banner: { image?: string }) => Boolean(banner.image))
            .map(
              (banner: {
                _id: string;
                image: string;
                link?: string;
                restaurantId?: unknown;
                isClickable?: boolean;
                title?: string;
              }) => ({
                id: banner._id,
                source: { uri: banner.image },
                link: banner.link,
                restaurantId: getBannerRestaurantId(banner),
                isClickable: banner.isClickable !== false,
                title: banner.title,
              }),
            );

          setBanners(fromApi);
        } else {
          setBanners([]);
        }
      } catch {
        if (!cancelled) setBanners([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchBanners();

    return () => {
      cancelled = true;
    };
  }, [placement]);

  return { banners, loading };
}
