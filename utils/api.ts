// API Service Layer for GreenGo Mobile App
// Base URL - შეცვალეთ production-ზე

import { getApiUrl } from './apiConfig';

const API_BASE_URL = getApiUrl();

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    details: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiService {
  private async fetchWithTimeout(url: string, options: RequestInit, timeout = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Network request timed out. Please check if backend is running.');
      }
      throw error;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getToken();

      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}${endpoint}`,
        {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
          },
        },
        10000 // 10 seconds timeout
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: 'API_ERROR',
            details: data.error?.details || data.message || 'API Error',
          },
        };
      }

      // NestJS returns data directly, wrap it in ApiResponse format
      return {
        success: true,
        data: data as T,
      };
    } catch (error: any) {
      console.error('API Error:', error);
      if (error.message.includes('timed out') || error.message.includes('Network request')) {
        return {
          success: false,
          error: {
            code: 'TIMEOUT_ERROR',
            details: 'Backend server is not responding. Please make sure the backend is running on port 3001.',
          },
        };
      }
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          details: error.message || 'Network error occurred',
        },
      };
    }
  }

  private async getToken(): Promise<string | null> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('@greengo:auth_token');
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Restaurants API
  async getRestaurants(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);

    const query = queryParams.toString();
    return this.request(`/restaurants${query ? `?${query}` : ''}`);
  }

  async getRestaurant(id: string) {
    return this.request(`/restaurants/${id}`);
  }

  // Menu Items API
  async getMenuItems(params?: {
    restaurantId?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.restaurantId)
      queryParams.append('restaurantId', params.restaurantId);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return this.request(`/menu-items${query ? `?${query}` : ''}`);
  }

  async getMenuItem(id: string) {
    return this.request(`/menu-items/${id}`);
  }

  // Orders API
  async createOrder(orderData: {
    userId: string;
    restaurantId: string;
    items: {
      menuItemId: string;
      name: string;
      price: number;
      quantity: number;
      specialInstructions?: string;
    }[];
    totalAmount: number;
    deliveryFee: number;
    paymentMethod: 'card' | 'cash' | 'greengo_balance';
    deliveryAddress: {
      street: string;
      city: string;
      coordinates: { lat: number; lng: number };
      instructions?: string;
    };
    estimatedDelivery: string;
    promoCode?: string;
    notes?: string;
  }) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.userId) queryParams.append('userId', params.userId);

    const query = queryParams.toString();
    return this.request(`/orders${query ? `?${query}` : ''}`);
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request(`/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async sendVerificationCode(phoneNumber: string, countryCode: string) {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/auth/send-verification-code`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phoneNumber, countryCode }),
        },
        10000 // 10 seconds timeout
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.details || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error: any) {
      if (error.message.includes('timed out') || error.message.includes('Network request')) {
        throw new Error('Backend server is not responding. Please make sure the backend is running on port 3001.');
      }
      throw error;
    }
  }

  async verifyCode(phoneNumber: string, verificationCode: string) {
    try {
      const response = await this.fetchWithTimeout(
        `${API_BASE_URL}/auth/verify-code`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phoneNumber, verificationCode }),
        },
        10000 // 10 seconds timeout
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.details || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error: any) {
      if (error.message.includes('timed out') || error.message.includes('Network request')) {
        throw new Error('Backend server is not responding. Please make sure the backend is running on port 3001.');
      }
      throw error;
    }
  }

  // Get user profile (protected)
  async getProfile() {
    return this.request('/auth/profile');
  }

  // Verify token (protected)
  async verifyToken() {
    return this.request('/auth/verify-token', {
      method: 'POST',
    });
  }

  // Complete registration (protected)
  async completeRegistration(firstName: string, lastName: string, email: string) {
    return this.request('/auth/complete-registration', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;

