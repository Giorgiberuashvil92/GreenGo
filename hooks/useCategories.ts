import { useEffect, useState } from 'react';
import { apiService } from '../utils/api';

interface Category {
  _id: string;
  id?: string; // For backward compatibility
  name: string;
  description?: string;
  icon?: string; // URL string from backend
  bgColor?: string;
  isActive: boolean;
  order?: number;
}

export const useCategories = (activeOnly: boolean = true) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOnly]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getCategories(activeOnly);

      if (response.success && response.data) {
        const categoriesData = Array.isArray(response.data) 
          ? response.data 
          : [];
        
        // Transform data for backward compatibility
        const transformedData = categoriesData.map((category: Category) => ({
          ...category,
          id: category._id || category.id,
        }));
        setCategories(transformedData);
      } else {
        setError(response.error?.details || 'შეცდომა კატეგორიების მიღებისას');
      }
    } catch (err: any) {
      setError(err.message || 'შეცდომა API-სთან დაკავშირებისას');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchCategories();
  };

  return {
    categories,
    loading,
    error,
    refetch,
  };
};
