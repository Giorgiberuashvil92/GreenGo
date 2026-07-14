import {
  ApiHomeCategory,
  buildHomeCategories,
  HomeCategory,
  homeCategories as fallbackCategories,
} from "@/assets/data/categories";
import { apiService } from "@/utils/api";
import { useEffect, useState } from "react";

export function useHomeCategories() {
  const [categories, setCategories] =
    useState<HomeCategory[]>(fallbackCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const response = await apiService.getCategories(true);
        if (cancelled) return;

        const list: ApiHomeCategory[] = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];

        if (list.length > 0) {
          setCategories(buildHomeCategories(list));
        }
      } catch (error) {
        console.error("Failed to load home categories:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading };
}
