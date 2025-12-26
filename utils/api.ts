// API Service Layer for GreenGo Mobile App
// Base URL - შეცვალეთ production-ზე

import { getApiUrl } from './apiConfig';
import { USE_MOCK_DATA, mockApiService } from './mockData';

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

// Check if we should use mock data
let useMockData = USE_MOCK_DATA;
let backendChecked = false;

const checkBackendAvailability = async (): Promise<boolean> => {
  if (backendChecked && useMockData) {
    return false; // Backend was already checked and is unavailable
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 seconds timeout
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    backendChecked = true;
    
    if (response.ok) {
      useMockData = false;
      console.log('✅ Backend is available, using real API');
      return true;
    }
    
    useMockData = true;
    console.log('⚠️ Backend health check failed, using mock data');
    return false;
  } catch {
    backendChecked = true;
    useMockData = true;
    console.log('⚠️ Backend is unavailable, using mock data');
    return false;
  }
};

// Initialize backend check
checkBackendAvailability();

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

      let data;
      try {
        data = await response.json();
      } catch {
        // If response is not JSON, get text
        const text = await response.text();
        console.error('Non-JSON response:', text);
        return {
          success: false,
          error: {
            code: 'API_ERROR',
            details: text || `HTTP ${response.status}: ${response.statusText}`,
          },
        };
      }

      if (!response.ok) {
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data: data,
        });
        
        // Handle validation errors
        if (response.status === 400 && Array.isArray(data.message)) {
          const validationErrors = data.message.map((err: any) => 
            `${err.property}: ${Object.values(err.constraints || {}).join(', ')}`
          ).join('; ');
          return {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              details: validationErrors || 'Validation failed',
            },
          };
        }
        
        return {
          success: false,
          error: {
            code: 'API_ERROR',
            details: data.error?.details || data.message || `HTTP ${response.status}: ${response.statusText}`,
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
    // Check if we should use mock data
    if (useMockData || USE_MOCK_DATA) {
      console.log('🔶 Using mock restaurants data');
      return mockApiService.getRestaurants(params);
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);

    const query = queryParams.toString();
    const result = await this.request(`/restaurants${query ? `?${query}` : ''}`);
    
    // If request failed, fallback to mock
    if (!result.success) {
      console.log('🔶 API request failed, falling back to mock data');
      useMockData = true;
      return mockApiService.getRestaurants(params);
    }
    
    return result;
  }

  async getRestaurant(id: string) {
    if (useMockData || USE_MOCK_DATA) {
      console.log('🔶 Using mock restaurant data');
      return mockApiService.getRestaurant(id);
    }

    const result = await this.request(`/restaurants/${id}`);
    
    if (!result.success) {
      console.log('🔶 API request failed, falling back to mock data');
      useMockData = true;
      return mockApiService.getRestaurant(id);
    }
    
    return result;
  }

  // Menu Items API
  async getMenuItems(params?: {
    restaurantId?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    if (useMockData || USE_MOCK_DATA) {
      console.log('🔶 Using mock menu items data');
      return mockApiService.getMenuItems(params);
    }

    const queryParams = new URLSearchParams();
    if (params?.restaurantId)
      queryParams.append('restaurantId', params.restaurantId);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    const result = await this.request(`/menu-items${query ? `?${query}` : ''}`);
    
    if (!result.success) {
      console.log('🔶 API request failed, falling back to mock data');
      useMockData = true;
      return mockApiService.getMenuItems(params);
    }
    
    return result;
  }

  async getMenuItem(id: string) {
    if (useMockData || USE_MOCK_DATA) {
      console.log('🔶 Using mock menu item data');
      return mockApiService.getMenuItem(id);
    }

    const result = await this.request(`/menu-items/${id}`);
    
    if (!result.success) {
      console.log('🔶 API request failed, falling back to mock data');
      useMockData = true;
      return mockApiService.getMenuItem(id);
    }
    
    return result;
  }

  async getMenuItemsByRestaurant(restaurantId: string) {
    if (useMockData || USE_MOCK_DATA) {
      console.log('🔶 Using mock menu items by restaurant data');
      return mockApiService.getMenuItems({ restaurantId });
    }

    const result = await this.request(`/menu-items/restaurant/${restaurantId}`);
    
    if (!result.success) {
      console.log('🔶 API request failed, falling back to mock data');
      useMockData = true;
      return mockApiService.getMenuItems({ restaurantId });
    }
    
    return result;
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
    if (useMockData || USE_MOCK_DATA) {
      console.log('🔶 Using mock order creation');
      return mockApiService.createOrder(orderData);
    }

    const result = await this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    
    if (!result.success) {
      console.log('🔶 API request failed, falling back to mock data');
      useMockData = true;
      return mockApiService.createOrder(orderData);
    }
    
    return result;
  }

  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
  }) {
    if (useMockData || USE_MOCK_DATA) {
      console.log('🔶 Using mock orders data');
      return mockApiService.getOrders(params);
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.userId) queryParams.append('userId', params.userId);

    const query = queryParams.toString();
    const result = await this.request(`/orders${query ? `?${query}` : ''}`);
    
    if (!result.success) {
      console.log('🔶 API request failed, falling back to mock data');
      useMockData = true;
      return mockApiService.getOrders(params);
    }
    
    return result;
  }

  async getOrder(id: string) {
    if (useMockData || USE_MOCK_DATA) {
      console.log('🔶 Using mock order data');
      return mockApiService.getOrder(id);
    }

    const result = await this.request(`/orders/${id}`);
    
    if (!result.success) {
      console.log('🔶 API request failed, falling back to mock data');
      useMockData = true;
      return mockApiService.getOrder(id);
    }
    
    return result;
  }

  async updateOrderStatus(id: string, status: string) {
    if (useMockData || USE_MOCK_DATA) {
      console.log('🔶 Using mock order status update');
      return mockApiService.updateOrderStatus(id, status);
    }

    const result = await this.request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    
    if (!result.success) {
      console.log('🔶 API request failed, falling back to mock data');
      useMockData = true;
      return mockApiService.updateOrderStatus(id, status);
    }
    
    return result;
  }

  async getOrderTracking(id: string) {
    if (useMockData || USE_MOCK_DATA) {
      console.log('🔶 Using mock order tracking data');
      return mockApiService.getOrderTracking(id);
    }

    const result = await this.request(`/orders/${id}/tracking`);
    
    if (!result.success) {
      console.log('🔶 API request failed, falling back to mock data');
      useMockData = true;
      return mockApiService.getOrderTracking(id);
    }
    
    return result;
  }

  async assignCourierToOrder(orderId: string, courierId?: string) {
    if (useMockData || USE_MOCK_DATA) {
      console.log('🔶 Using mock courier assignment');
      return mockApiService.assignCourierToOrder(orderId, courierId);
    }

    const result = await this.request(`/orders/${orderId}/assign-courier`, {
      method: 'PATCH',
      body: JSON.stringify({ courierId }),
    });
    
    if (!result.success) {
      console.log('🔶 API request failed, falling back to mock data');
      useMockData = true;
      return mockApiService.assignCourierToOrder(orderId, courierId);
    }
    
    return result;
  }

  async sendVerificationCode(phoneNumber: string, countryCode: string) {
    if (useMockData || USE_MOCK_DATA) {
      console.log('🔶 Using mock verification code');
      return mockApiService.sendVerificationCode(phoneNumber, countryCode);
    }

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
        // Fallback to mock on error
        console.log('🔶 API request failed, falling back to mock data');
        useMockData = true;
        return mockApiService.sendVerificationCode(phoneNumber, countryCode);
      }

      return response.json();
    } catch (error: any) {
      console.log('🔶 API request failed, falling back to mock data');
      useMockData = true;
      return mockApiService.sendVerificationCode(phoneNumber, countryCode);
    }
  }

  async verifyCode(phoneNumber: string, verificationCode: string) {
    if (useMockData || USE_MOCK_DATA) {
      console.log('🔶 Using mock code verification');
      return mockApiService.verifyCode(phoneNumber, verificationCode);
    }

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
        // Fallback to mock on error
        console.log('🔶 API request failed, falling back to mock data');
        useMockData = true;
        return mockApiService.verifyCode(phoneNumber, verificationCode);
      }

      return response.json();
    } catch (error: any) {
      console.log('🔶 API request failed, falling back to mock data');
      useMockData = true;
      return mockApiService.verifyCode(phoneNumber, verificationCode);
    }
  }

  // Get user profile (protected)
  async getProfile() {
    if (useMockData || USE_MOCK_DATA) {
      console.log('🔶 Using mock profile data');
      return mockApiService.getProfile();
    }

    const result = await this.request('/auth/profile');
    
    if (!result.success) {
      console.log('🔶 API request failed, falling back to mock data');
      useMockData = true;
      return mockApiService.getProfile();
    }
    
    return result;
  }

  // Verify token (protected)
  async verifyToken() {
    if (useMockData || USE_MOCK_DATA) {
      console.log('🔶 Using mock token verification');
      return mockApiService.verifyToken();
    }

    const result = await this.request('/auth/verify-token', {
      method: 'POST',
    });
    
    if (!result.success) {
      console.log('🔶 API request failed, falling back to mock data');
      useMockData = true;
      return mockApiService.verifyToken();
    }
    
    return result;
  }

  // Complete registration (protected)
  async completeRegistration(firstName: string, lastName: string, email: string) {
    if (useMockData || USE_MOCK_DATA) {
      console.log('🔶 Using mock registration completion');
      return mockApiService.completeRegistration(firstName, lastName, email);
    }

    const result = await this.request('/auth/complete-registration', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email }),
    });
    
    if (!result.success) {
      console.log('🔶 API request failed, falling back to mock data');
      useMockData = true;
      return mockApiService.completeRegistration(firstName, lastName, email);
    }
    
    return result;
  }

  // Categories API
  async getCategories() {
    const result = await this.request('/categories');
    
    if (!result.success) {
      console.log('🔶 API request failed for categories');
    }
    
    return result;
  }

  async getActiveCategories() {
    const result = await this.request('/categories/active');
    
    if (!result.success) {
      console.log('🔶 API request failed for active categories');
    }
    
    return result;
  }

  async getCategory(id: string) {
    const result = await this.request(`/categories/${id}`);
    
    if (!result.success) {
      console.log('🔶 API request failed for category');
    }
    
    return result;
  }

  // Users API
  async getUsers() {
    const result = await this.request('/users');
    
    if (!result.success) {
      console.log('🔶 API request failed for users');
    }
    
    return result;
  }

  async getUser(id: string) {
    const result = await this.request(`/users/${id}`);
    
    if (!result.success) {
      console.log('🔶 API request failed for user');
    }
    
    return result;
  }

  async updateUser(id: string, userData: {
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
  }) {
    const result = await this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
    
    if (!result.success) {
      console.log('🔶 API request failed for user update');
    }
    
    return result;
  }

  // Couriers API
  async getCouriers(params?: {
    page?: number;
    limit?: number;
    status?: string;
    isAvailable?: boolean;
    phoneNumber?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.isAvailable !== undefined) queryParams.append('isAvailable', params.isAvailable.toString());
    if (params?.phoneNumber) queryParams.append('phoneNumber', params.phoneNumber);

    const query = queryParams.toString();
    const result = await this.request(`/couriers${query ? `?${query}` : ''}`);
    
    if (!result.success) {
      console.log('🔶 API request failed for couriers');
    }
    
    return result;
  }

  async getCourier(id: string) {
    const result = await this.request(`/couriers/${id}`);
    
    if (!result.success) {
      console.log('🔶 API request failed for courier');
    }
    
    return result;
  }

  async getAvailableCouriers(latitude: number, longitude: number, maxDistance?: number) {
    const queryParams = new URLSearchParams();
    queryParams.append('latitude', latitude.toString());
    queryParams.append('longitude', longitude.toString());
    if (maxDistance) queryParams.append('maxDistance', maxDistance.toString());

    const result = await this.request(`/couriers/available?${queryParams.toString()}`);
    
    if (!result.success) {
      console.log('🔶 API request failed for available couriers');
    }
    
    return result;
  }

  async registerCourier(courierData: {
    phoneNumber: string;
    firstName: string;
    lastName: string;
    email?: string;
    vehicleType: 'bicycle' | 'motorcycle' | 'car';
    vehicleNumber?: string;
    otpCode: string;
  }) {
    const result = await this.request('/couriers/register', {
      method: 'POST',
      body: JSON.stringify(courierData),
    });
    
    if (!result.success) {
      console.log('🔶 API request failed for courier registration');
    }
    
    return result;
  }

  async updateCourierLocation(id: string, location: {
    latitude: number;
    longitude: number;
  }) {
    const result = await this.request(`/couriers/${id}/location`, {
      method: 'PATCH',
      body: JSON.stringify(location),
    });
    
    if (!result.success) {
      console.log('🔶 API request failed for courier location update');
    }
    
    return result;
  }

  async updateCourierStatus(id: string, status: 'available' | 'busy' | 'offline') {
    const result = await this.request(`/couriers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    
    if (!result.success) {
      console.log('🔶 API request failed for courier status update');
    }
    
    return result;
  }

  async getCourierStatistics(id: string, period: 'today' | 'week' | 'month' = 'today') {
    const result = await this.request(`/couriers/${id}/statistics?period=${period}`);
    
    if (!result.success) {
      console.log('🔶 API request failed for courier statistics');
    }
    
    return result;
  }

  async completeCourierOrder(id: string) {
    const result = await this.request(`/couriers/${id}/complete-order`, {
      method: 'PATCH',
    });
    
    if (!result.success) {
      console.log('🔶 API request failed for completing courier order');
    }
    
    return result;
  }

  // Delete Order
  async deleteOrder(id: string) {
    const result = await this.request(`/orders/${id}`, {
      method: 'DELETE',
    });
    
    if (!result.success) {
      console.log('🔶 API request failed for order deletion');
    }
    
    return result;
  }

  // Helper method to check if using mock data
  isUsingMockData(): boolean {
    return useMockData || USE_MOCK_DATA;
  }

  // Force use of mock data
  enableMockData(): void {
    useMockData = true;
    console.log('🔶 Mock data enabled manually');
  }

  // Force use of real API (will check availability)
  async disableMockData(): Promise<boolean> {
    backendChecked = false;
    const available = await checkBackendAvailability();
    return available;
  }
}

export const apiService = new ApiService();
export default apiService;
