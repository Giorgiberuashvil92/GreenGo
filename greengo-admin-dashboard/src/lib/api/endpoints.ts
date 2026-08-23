// API Endpoints for Admin Dashboard
import { apiClient } from './client';

// Types
export interface Order {
  _id: string;
  userId: string;
  restaurantId: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    price: number;
    name?: string;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivering' | 'delivered' | 'cancelled';
  deliveryType?: 'delivery' | 'pickup';
  deliveryAddress?: {
    street: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    instructions?: string;
  };
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  courierId?: string;
}

export interface Restaurant {
  _id: string;
  name: string;
  description: string;
  image?: string;
  heroImage?: string;
  address?: {
    street: string;
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  location?: {
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
  businessUsername?: string;
  cuisineType?: string;
  cuisine?: string[];
  rating?: number;
  reviewCount?: number;
  deliveryTime?: string;
  deliveryFee?: number;
  minimumOrder?: number;
  isActive: boolean;
  order?: number;
  categories?: string[];
  menuCategories?: RestaurantMenuCategory[];
  priceRange?: '€' | '€€' | '€€€' | '€€€€';
  features?: {
    hasDelivery?: boolean;
    hasPickup?: boolean;
    hasDineIn?: boolean;
    acceptsOnlineOrders?: boolean;
    hasParking?: boolean;
    isWheelchairAccessible?: boolean;
  };
  workingHours?: { [key: string]: string };
  allergens?: string[];
  paymentMethods?: string[];
  listPreviewMenuItemIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRestaurantPayload {
  name: string;
  description: string;
  deliveryFee: number;
  deliveryTime: string;
  image: string;
  heroImage: string;
  isActive?: boolean;
  order?: number;
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
  businessUsername?: string;
  businessPassword?: string;
  features?: {
    hasDelivery?: boolean;
    hasPickup?: boolean;
    hasDineIn?: boolean;
    acceptsOnlineOrders?: boolean;
    hasParking?: boolean;
    isWheelchairAccessible?: boolean;
  };
  categories: string[];
  menuCategories?: RestaurantMenuCategory[];
  priceRange?: '€' | '€€' | '€€€' | '€€€€';
  cuisine?: string[];
  allergens?: string[];
  paymentMethods?: string[];
  /** მთავარი გვერდის / სიის ბარათის გალერეა */
  listPreviewMenuItemIds?: string[];
}

export interface DuplicateRestaurantPayload {
  name?: string;
  businessUsername: string;
  businessPassword: string;
  isActive?: boolean;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    city?: string;
    district?: string;
    postalCode?: string;
  };
}

export interface DuplicateRestaurantResponse {
  restaurant: Restaurant;
  menuItemsCount: number;
}

export interface User {
  _id: string;
  phoneNumber: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantMenuCategory {
  name: string;
  order: number;
  isActive: boolean;
}

export interface MenuItem {
  _id: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  heroImage?: string;
  category: string;
  order?: number;
  isPopular?: boolean;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  /** აიკონის URL (backend field) */
  icon?: string;
  /** ლეგასი/ალტერნატივა */
  image?: string;
  bgColor?: string;
  order?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Courier {
  _id: string;
  name?: string;
  phoneNumber: string;
  email?: string;
  profileImage?: string;
  status: 'available' | 'busy' | 'offline';
  isAvailable: boolean;
  isActive: boolean;
  currentLocation?: {
    type?: 'Point';
    coordinates?: [number, number];
    latitude?: number;
    longitude?: number;
    lastUpdated?: string;
  };
  currentOrderId?: string;
  totalDeliveries?: number;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Delivery Info Type
export interface DeliveryInfo {
  orderId: string;
  status: string;
  restaurant: {
    id: string;
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    contact: {
      phone?: string;
      email?: string;
      website?: string;
    };
  };
  deliveryAddress: {
    street: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    instructions: string;
  };
  customer: {
    name: string;
    phoneNumber: string;
  };
  distance: {
    kilometers: number;
    meters: number;
  };
  estimatedDeliveryTime: {
    minutes: number;
    formatted: string;
  };
  orderDetails: {
    items: Array<{
      menuItemId: string;
      name: string;
      price: number;
      quantity: number;
      specialInstructions?: string;
    }>;
    totalAmount: number;
    deliveryFee: number;
    tip: number;
    paymentMethod: string;
    estimatedDelivery: string;
    notes: string;
  };
  courier: {
    id: string;
    name: string;
    phoneNumber: string;
    status: string;
  } | null;
}

// Orders Analytics Type
export interface OrdersAnalytics {
  period: {
    start: string;
    end: string;
    durationMinutes: number;
  };
  summary: {
    totalOrders: number;
    activityLevel: 'დაბალი' | 'საშუალო' | 'მაღალი';
    activityLevelEn: 'low' | 'medium' | 'high';
    averageOrderValue: number;
    totalRevenue: number;
  };
  byStatus: {
    pending: number;
    confirmed: number;
    preparing: number;
    ready: number;
    delivering: number;
    delivered: number;
    cancelled: number;
  };
  comparison: {
    previousPeriodTotal: number;
    change: number;
    changePercentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
}

// Orders API
export const ordersApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
    restaurantId?: string;
    courierId?: string;
  }) => apiClient.get<{ data: Order[]; total: number; page: number; limit: number }>('/orders', params),
  
  getById: (id: string) => apiClient.get<Order>(`/orders/${id}`),
  
  getDeliveryInfo: (id: string) => apiClient.get<DeliveryInfo>(`/orders/${id}/delivery-info`),
  
  getRecentAnalytics: () => apiClient.get<OrdersAnalytics>('/orders/analytics/recent'),
  
  updateStatus: (id: string, status: string) => 
    apiClient.patch<Order>(`/orders/${id}/status`, { status }),
  
  assignCourier: (id: string, courierId?: string) =>
    apiClient.patch<Order>(`/orders/${id}/assign-courier`, { courierId }),
  
  delete: (id: string) => apiClient.delete(`/orders/${id}`),
};

// Restaurants API
export const restaurantsApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    isActive?: boolean;
  }) => apiClient.get<{ data: Restaurant[]; total: number; page: number; limit: number }>('/restaurants', params),
  
  getById: (id: string) => apiClient.get<Restaurant>(`/restaurants/${id}`),
  
  create: (data: CreateRestaurantPayload) => apiClient.post<Restaurant>('/restaurants', data),
  
  update: (id: string, data: Partial<CreateRestaurantPayload>) => 
    apiClient.patch<Restaurant>(`/restaurants/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/restaurants/${id}`),

  duplicate: (id: string, data: DuplicateRestaurantPayload) =>
    apiClient.post<DuplicateRestaurantResponse>(`/restaurants/${id}/duplicate`, data),

  copyMenu: (id: string, sourceRestaurantId: string) =>
    apiClient.post<{ menuItemsCount: number }>(`/restaurants/${id}/copy-menu`, {
      sourceRestaurantId,
    }),
};

// Users API
export const usersApi = {
  getAll: () => apiClient.get<User[]>('/users'),
  
  getById: (id: string) => apiClient.get<User>(`/users/${id}`),
  
  update: (id: string, data: Partial<User>) => 
    apiClient.patch<User>(`/users/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/users/${id}`),
};

// Menu Items API
export const menuItemsApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    restaurantId?: string;
    category?: string;
    search?: string;
    isPopular?: boolean;
  }) => apiClient.get<{ data: MenuItem[]; total: number; page: number; limit: number }>('/menu-items', params),
  
  getById: (id: string) => apiClient.get<MenuItem>(`/menu-items/${id}`),
  
  getByRestaurant: (restaurantId: string) => 
    apiClient.get<MenuItem[]>(`/menu-items/restaurant/${restaurantId}`),
  
  create: (data: Partial<MenuItem>) => apiClient.post<MenuItem>('/menu-items', data),
  
  update: (id: string, data: Partial<MenuItem>) => 
    apiClient.patch<MenuItem>(`/menu-items/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/menu-items/${id}`),
};

// Categories API
export const categoriesApi = {
  getAll: () => apiClient.get<Category[]>('/categories'),
  
  getActive: () => apiClient.get<Category[]>('/categories/active'),
  
  getById: (id: string) => apiClient.get<Category>(`/categories/${id}`),
  
  create: (data: Partial<Category>) => apiClient.post<Category>('/categories', data),
  
  update: (id: string, data: Partial<Category>) => 
    apiClient.patch<Category>(`/categories/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/categories/${id}`),
};

// Couriers API
export const couriersApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    isAvailable?: boolean;
    phoneNumber?: string;
  }) => apiClient.get<{ data: Courier[]; total: number; page: number; limit: number }>('/couriers', params),
  
  getById: (id: string) => apiClient.get<Courier>(`/couriers/${id}`),
  
  create: (data: Partial<Courier>) => apiClient.post<Courier>('/couriers', data),
  
  update: (id: string, data: Partial<Courier>) => 
    apiClient.patch<Courier>(`/couriers/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/couriers/${id}`),
};

// Banner type
export interface Banner {
  _id: string;
  title: string;
  oldPrice?: string;
  newPrice?: string;
  image: string;
  description?: string;
  link?: string;
  restaurantId?: string | { _id: string; name?: string } | null;
  isActive: boolean;
  order: number;
  placement?: 'top' | 'mid';
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Home section type
export interface HomeSection {
  _id: string;
  slug: string;
  title: string;
  layout: 'carousel' | 'list' | 'banner';
  isActive: boolean;
  order: number;
  showSeeAll: boolean;
  restaurantIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export const homeSectionsApi = {
  getAll: () => apiClient.get<HomeSection[]>('/home-sections'),

  getActive: () => apiClient.get<HomeSection[]>('/home-sections/active'),

  getById: (id: string) => apiClient.get<HomeSection>(`/home-sections/${id}`),

  update: (id: string, data: Partial<HomeSection>) =>
    apiClient.patch<HomeSection>(`/home-sections/${id}`, data),

  addRestaurant: (sectionId: string, restaurantId: string) =>
    apiClient.post<HomeSection>(`/home-sections/${sectionId}/restaurants`, {
      restaurantId,
    }),

  removeRestaurant: (sectionId: string, restaurantId: string) =>
    apiClient.delete<HomeSection>(
      `/home-sections/${sectionId}/restaurants/${restaurantId}`,
    ),
};

// Banners API
export const bannersApi = {
  getAll: () => apiClient.get<Banner[]>('/banners'),
  
  getActive: (placement?: 'top' | 'mid') =>
    apiClient.get<Banner[]>(
      '/banners/active',
      placement ? { placement } : undefined,
    ),
  
  getById: (id: string) => apiClient.get<Banner>(`/banners/${id}`),
  
  create: (data: Partial<Banner>) => apiClient.post<Banner>('/banners', data),
  
  update: (id: string, data: Partial<Banner>) => 
    apiClient.patch<Banner>(`/banners/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/banners/${id}`),
};

export interface PromoCode {
  _id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'free_delivery' | 'fixed_total' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
  createdAt: string;
  updatedAt: string;
}

export const promoCodesApi = {
  getAll: () => apiClient.get<PromoCode[]>('/promo-codes'),

  getById: (id: string) => apiClient.get<PromoCode>(`/promo-codes/${id}`),

  create: (data: Partial<PromoCode>) =>
    apiClient.post<PromoCode>('/promo-codes', data),

  update: (id: string, data: Partial<PromoCode>) =>
    apiClient.patch<PromoCode>(`/promo-codes/${id}`, data),

  delete: (id: string) => apiClient.delete(`/promo-codes/${id}`),

  validate: (code: string, subtotal: number, deliveryFee?: number, serviceFee?: number) =>
    apiClient.post<{
      valid: true;
      code: string;
      discountType: 'percentage' | 'free_delivery' | 'fixed_total';
      discountValue: number;
      discountAmount: number;
      freeDelivery?: boolean;
    }>('/promo-codes/validate', { code, subtotal, deliveryFee, serviceFee }),
};

export interface RestaurantOfferMenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  heroImage?: string;
  category?: string;
}

export interface RestaurantOffer {
  _id: string;
  restaurantId: string;
  title: string;
  description?: string;
  discountType: 'percentage' | 'delivery_fixed';
  discountValue: number;
  menuItemIds: Array<string | RestaurantOfferMenuItem>;
  isActive: boolean;
  sortOrder?: number;
  startsAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateRestaurantOfferPayload = {
  restaurantId: string;
  title: string;
  description?: string;
  discountType: 'percentage' | 'delivery_fixed';
  discountValue: number;
  menuItemIds?: string[];
  isActive?: boolean;
  sortOrder?: number;
  startsAt?: string;
  expiresAt?: string;
};

export const restaurantOffersApi = {
  getAll: (params?: { restaurantId?: string; active?: boolean }) =>
    apiClient.get<RestaurantOffer[]>('/restaurant-offers', {
      restaurantId: params?.restaurantId,
      active: params?.active ? 'true' : undefined,
    }),

  getById: (id: string) =>
    apiClient.get<RestaurantOffer>(`/restaurant-offers/${id}`),

  create: (data: CreateRestaurantOfferPayload) =>
    apiClient.post<RestaurantOffer>('/restaurant-offers', data),

  update: (id: string, data: Partial<CreateRestaurantOfferPayload>) =>
    apiClient.patch<RestaurantOffer>(`/restaurant-offers/${id}`, data),

  delete: (id: string) => apiClient.delete(`/restaurant-offers/${id}`),
};
