import { useEffect, useState } from "react";
import { apiService } from "../utils/api";
import type { BannerPlacement } from "./useBanners";

export interface HomeSectionRestaurant {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  rating: number;
  reviewCount: number;
  deliveryFee: number;
  deliveryTime: string;
  image: string;
  heroImage?: string;
  isActive: boolean;
  cuisine?: string[];
  categories?: string[];
}

export interface HomeSection {
  _id: string;
  slug: string;
  title: string;
  layout: "carousel" | "list" | "banner";
  isActive: boolean;
  order: number;
  showSeeAll: boolean;
  restaurants: HomeSectionRestaurant[];
}

function sortHomeSections(sections: HomeSection[]): HomeSection[] {
  return [...sections].sort((a, b) => a.order - b.order);
}

export function getBannerPlacement(sectionSlug: string): BannerPlacement {
  return sectionSlug === "promo-banner-mid" ? "mid" : "top";
}

export function useHomeSections() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getHomeSections();

      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : [];
        const mapped = data.map((section: HomeSection) => ({
          ...section,
          restaurants: (section.restaurants ?? []).map((r) => ({
            ...r,
            id: r._id || r.id,
          })),
        }));
        setSections(sortHomeSections(mapped));
      } else {
        setError(response.error?.details || "სექციების ჩატვირთვა ვერ მოხერხდა");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "სექციების ჩატვირთვა ვერ მოხერხდა";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  return { sections, loading, error, refetch: fetchSections };
}
