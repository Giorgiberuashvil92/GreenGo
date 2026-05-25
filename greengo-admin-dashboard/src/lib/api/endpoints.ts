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
  description?: string;
  image?: string;
  address: {
    street: string;
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  cuisineType?: string;
  rating?: number;
  deliveryTime?: number;
  deliveryFee?: number;
  minimumOrder?: number;
  isActive: boolean;
  categories?: string[];
  createdAt: string;
  updatedAt: string;
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

export interface MenuItem {
  _id: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Courier {
  _id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  vehicleType?: string;
  isAvailable: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
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
  
  create: (data: Partial<Restaurant>) => apiClient.post<Restaurant>('/restaurants', data),
  
  update: (id: string, data: Partial<Restaurant>) => 
    apiClient.patch<Restaurant>(`/restaurants/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/restaurants/${id}`),
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
    isAvailable?: boolean;
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
  isActive: boolean;
  order: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Banners API
export const bannersApi = {
  getAll: () => apiClient.get<Banner[]>('/banners'),
  
  getActive: () => apiClient.get<Banner[]>('/banners/active'),
  
  getById: (id: string) => apiClient.get<Banner>(`/banners/${id}`),
  
  create: (data: Partial<Banner>) => apiClient.post<Banner>('/banners', data),
  
  update: (id: string, data: Partial<Banner>) => 
    apiClient.patch<Banner>(`/banners/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/banners/${id}`),
};
