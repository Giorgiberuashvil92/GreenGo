// API Service Layer for GreenGo Courier App
import { getApiInfo, getApiUrl } from './apiConfig';

const API_BASE_URL = getApiUrl();

// Log API configuration on startup
console.log('🔧 API Configuration:', getApiInfo());

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    details: string;
  };
}

class ApiService {
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout = 30000 // Increased to 30 seconds
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(`⏱️ Request timeout after ${timeout}ms: ${url}`);
      controller.abort();
    }, timeout);

    try {
      const startTime = Date.now();
      console.log(`🚀 Starting request to: ${url}`);
      console.log(`📋 Request options:`, {
        method: options.method || 'GET',
        headers: options.headers,
        body: options.body ? (typeof options.body === 'string' ? options.body.substring(0, 100) : 'Binary') : undefined,
      });
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      console.log(`✅ Request completed in ${duration}ms: ${url}`);
      console.log(`📊 Response status: ${response.status} ${response.statusText}`);
      console.log(`📦 Response headers:`, Object.fromEntries(response.headers.entries()));
      
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // Check if it's an abort error
      if (error.name === 'AbortError' || error.message?.includes('Aborted')) {
        console.error(`⏱️ Request timeout after ${timeout}ms: ${url}`);
        console.error(`💡 Possible causes:`);
        console.error(`   1. Backend is not running on ${url}`);
        console.error(`   2. Network connectivity issue`);
        console.error(`   3. Firewall blocking port`);
        throw new Error(`Request timeout: ${url}`);
      }
      // Network errors
      if (error.message?.includes('Network request failed') || error.message?.includes('Failed to connect')) {
        console.error(`❌ Network error: Cannot connect to ${url}`);
        console.error(`💡 Make sure backend is running on ${url}`);
        console.error(`💡 Check that device and computer are on the same WiFi network`);
        console.error(`💡 Verify firewall is not blocking port 3001`);
      }
      console.error(`❌ Request failed:`, error.message);
      console.error(`❌ Error details:`, error);
      throw error;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
      console.log(`📡 Full URL: ${url}`);
      console.log(`🔧 Base URL: ${API_BASE_URL}`);

      const response = await this.fetchWithTimeout(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type');
      let data: any;
      
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (parseError: any) {
            console.error(`❌ Failed to parse JSON response:`, text);
            console.error(`❌ Parse error:`, parseError?.message);
            throw new Error(`Invalid JSON response from ${url}`);
          }
        } else {
          console.warn(`⚠️ Empty response body from ${url}`);
          data = {};
        }
      } else {
        const text = await response.text();
        console.warn(`⚠️ Non-JSON response from ${url}:`, text.substring(0, 100));
        data = { message: text };
      }

      if (!response.ok) {
        console.error(`❌ API Error: ${response.status}`, data);
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            details: data.message || data.error?.details || 'უცნობი შეცდომა',
          },
        };
      }

      console.log(`✅ API Success: ${endpoint}`, data);
      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error: unknown) {
      console.error(`❌ API Exception: ${endpoint}`, error);
      const errorMessage =
        error instanceof Error ? error.message : 'Network request failed';
      
      // More detailed error messages
      let errorDetails = errorMessage;
      if (errorMessage.includes('timeout')) {
        errorDetails = `Backend-თან კავშირი ვერ დამყარდა (timeout). გთხოვთ დარწმუნდეთ რომ backend გაშვებულია ${API_BASE_URL}-ზე`;
      } else if (errorMessage.includes('Network request failed') || errorMessage.includes('Failed to connect')) {
        errorDetails = `Backend-თან კავშირი ვერ დამყარდა. URL: ${API_BASE_URL}`;
      }
      
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          details: errorDetails,
        },
      };
    }
  }

  // Courier endpoints
  async getCourier(courierId: string): Promise<ApiResponse<any>> {
    return this.request(`/couriers/${courierId}`);
  }

  async findCourierByPhone(phoneNumber: string): Promise<ApiResponse<any>> {
    // Backend returns: { data: Courier[], total, page, limit }
    // When phoneNumber is provided, it returns: { data: [courier] or [], total: 1 or 0, page: 1, limit: 1 }
    // Use shorter timeout for this request (10 seconds)
    try {
      const url = `${API_BASE_URL}/couriers?phoneNumber=${encodeURIComponent(phoneNumber)}&limit=1`;
      console.log(`🌐 API Request: GET ${url}`);

      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }, 10000); // 10 seconds timeout

      const data = await response.json();

      if (!response.ok) {
        console.log(`⚠️ API Error: ${response.status}`, data);
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            details: data.message || data.error?.details || 'უცნობი შეცდომა',
          },
        };
      }

      console.log(`✅ API Success: /couriers?phoneNumber=...`, data);
      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error: unknown) {
      // Silently handle timeout - courier might not exist, so we'll try registration
      const errorMessage =
        error instanceof Error ? error.message : 'Network request failed';
      
      if (errorMessage.includes('timeout')) {
        console.log('⏱️ Request timeout - courier might not exist, will try registration');
        return {
          success: false,
          error: {
            code: 'TIMEOUT',
            details: 'Request timeout',
          },
        };
      }
      
      console.log(`⚠️ API Exception: /couriers?phoneNumber=...`, errorMessage);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          details: errorMessage,
        },
      };
    }
  }

  async sendVerificationCode(phoneNumber: string, countryCode?: string): Promise<ApiResponse<{ code: string }>> {
    return this.request('/auth/send-verification-code', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, countryCode }),
    });
  }

  async verifyVerificationCode(
    phoneNumber: string,
    verificationCode: string
  ): Promise<ApiResponse<any>> {
    // Courier login — returns Courier document (_id), not customer /auth/verify-code
    return this.request('/couriers/login', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, verificationCode }),
    });
  }

  async registerCourier(phoneNumber: string, verificationCode: string, name?: string): Promise<ApiResponse<any>> {
    // Backend returns: Courier object directly
    return this.request('/couriers/register', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, verificationCode, name }),
    });
  }

  async createCourier(courierData: {
    name: string;
    phoneNumber: string;
    email?: string;
    status?: 'available' | 'busy' | 'offline';
    isAvailable?: boolean;
    currentLocation?: { latitude: number; longitude: number };
  }): Promise<ApiResponse<any>> {
    // Backend returns: Courier object directly
    return this.request('/couriers', {
      method: 'POST',
      body: JSON.stringify(courierData),
    });
  }

  async updateCourierLocation(
    courierId: string,
    latitude: number,
    longitude: number
  ): Promise<ApiResponse<any>> {
    return this.request(`/couriers/${courierId}/location`, {
      method: 'PATCH',
      body: JSON.stringify({
        location: { latitude, longitude },
      }),
    });
  }

  async updateCourierStatus(
    courierId: string,
    status: 'available' | 'busy' | 'offline',
    isAvailable: boolean
  ): Promise<ApiResponse<any>> {
    return this.request(`/couriers/${courierId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, isAvailable }),
    });
  }

  /** Native FCM (Android) / APNs (iOS) token — backend sends via Firebase Admin SDK */
  async updateCourierPushToken(
    courierId: string,
    payload: {
      fcmToken: string;
      platform: 'ios' | 'android';
    }
  ): Promise<ApiResponse<any>> {
    // Keep push-token registration on its dedicated backend route. The generic
    // courier update DTO intentionally does not expose push credentials.
    return this.request(`/couriers/${courierId}/push-token`, {
      method: 'PATCH',
      body: JSON.stringify({
        fcmToken: payload.fcmToken,
        pushPlatform: payload.platform,
      }),
    });
  }

  // Order endpoints
  async getAvailableOrders(
    courierId: string,
    latitude: number,
    longitude: number
  ): Promise<ApiResponse<any[]>> {
    
    return this.request(
      `/orders?status=confirmed&type=delivery&limit=10&forCourier=${courierId}`
    );
  }

  async getCourierOrders(courierId: string): Promise<ApiResponse<any[]>> {
    return this.request(`/orders?courierId=${courierId}&limit=50`);
  }

  async getOrder(orderId: string): Promise<ApiResponse<any>> {
    return this.request(`/orders/${orderId}`);
  }

  async acceptOrder(
    orderId: string,
    courierId: string
  ): Promise<ApiResponse<any>> {
    return this.request(`/orders/${orderId}/assign-courier`, {
      method: 'PATCH',
      body: JSON.stringify({ courierId }),
    });
  }

  async rejectOrder(
    orderId: string,
    courierId: string
  ): Promise<ApiResponse<any>> {
    return this.request(`/orders/${orderId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ courierId }),
    });
  }

  async updateOrderStatus(
    orderId: string,
    status: string
  ): Promise<ApiResponse<any>> {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async completeOrder(orderId: string, courierId: string): Promise<ApiResponse<any>> {
    // Update order status to delivered
    const statusResponse = await this.updateOrderStatus(orderId, 'delivered');
    if (!statusResponse.success) {
      return statusResponse;
    }

    // Complete order in courier service
    return this.request(`/couriers/${courierId}/complete-order`, {
      method: 'PATCH',
    });
  }

  async getCourierStatistics(
    courierId: string,
    period: 'today' | 'week' | 'month' = 'today'
  ): Promise<ApiResponse<any>> {
    return this.request(`/couriers/${courierId}/statistics?period=${period}`);
  }

  // Admin/Restaurant endpoints for order assignment
  async getAllOrders(filters?: {
    status?: string;
    restaurantId?: string;
    courierId?: string;
  }): Promise<ApiResponse<any[]>> {
    let query = '/orders?limit=100';
    if (filters?.status) {
      query += `&status=${filters.status}`;
    }
    if (filters?.restaurantId) {
      query += `&restaurantId=${filters.restaurantId}`;
    }
    if (filters?.courierId) {
      query += `&courierId=${filters.courierId}`;
    }
    return this.request(query);
  }

  async getAvailableCouriers(): Promise<ApiResponse<any[]>> {
    return this.request('/couriers?isAvailable=true&isActive=true&limit=100');
  }

  async assignOrderToCourier(
    orderId: string,
    courierId: string
  ): Promise<ApiResponse<any>> {
    return this.request(`/orders/${orderId}/assign-courier`, {
      method: 'PATCH',
      body: JSON.stringify({ courierId }),
    });
  }
}

export const apiService = new ApiService();
