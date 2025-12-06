import { useEffect, useState } from 'react';
import { apiService } from '../utils/api';

interface Restaurant {
  _id: string;
  id?: string; // For backward compatibility
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  deliveryFee: number;
  deliveryTime: string;
  image: string;
  heroImage: string;
  isActive: boolean;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    district?: string;
    postalCode?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  workingHours?: {
    [key: string]: string;
  };
  features?: {
    hasDelivery: boolean;
    hasPickup: boolean;
    hasDineIn: boolean;
    acceptsOnlineOrders: boolean;
    hasParking: boolean;
    isWheelchairAccessible: boolean;
  };
  categories: string[];
  priceRange?: '€' | '€€' | '€€€' | '€€€€';
  cuisine?: string[];
  allergens?: string[];
  paymentMethods?: string[];
}

export const useRestaurants = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRestaurants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.search, params?.category]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getRestaurants(params);

      if (response.success && response.data) {
        // Backend returns { data: Restaurant[], total, page, limit }
        // So response.data is the whole object, and response.data.data is the array
        const backendResponse = response.data as any;
        const restaurantsData = Array.isArray(backendResponse) 
          ? backendResponse 
          : (backendResponse?.data || []);
        
        // Transform data for backward compatibility
        const transformedData = restaurantsData.map((restaurant: Restaurant) => ({
          ...restaurant,
          id: restaurant._id || restaurant.id,
        }));
        setRestaurants(transformedData);
      } else {
        setError(response.error?.details || 'შეცდომა მონაცემების მიღებისას');
      }
    } catch (err: any) {
      setError(err.message || 'შეცდომა API-სთან დაკავშირებისას');
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchRestaurants();
  };

  return {
    restaurants,
    loading,
    error,
    refetch,
  };
};

export const useRestaurant = (id: string) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchRestaurant();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getRestaurant(id);

      if (response.success && response.data) {
        const restaurantData = response.data as any;
        const transformedData: Restaurant = {
          ...restaurantData,
          id: restaurantData._id || restaurantData.id,
        };
        setRestaurant(transformedData);
      } else {
        setError(response.error?.details || 'რესტორნი ვერ მოიძებნა');
      }
    } catch (err: any) {
      setError(err.message || 'შეცდომა API-სთან დაკავშირებისას');
      console.error('Error fetching restaurant:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    restaurant,
    loading,
    error,
    refetch: fetchRestaurant,
  };
};

