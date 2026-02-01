// API Client for Admin Dashboard
import { API_BASE_URL } from './config';

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  [key: string]: any;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    if (!params) {
      return this.request<T>(endpoint, {
        method: 'GET',
      });
    }

    // Filter out undefined, null, empty string, and "undefined" string values
    const filteredParams: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(params)) {
      // Skip if value is undefined, null, empty string, or the string "undefined"
      if (
        value === undefined || 
        value === null || 
        value === '' ||
        String(value) === 'undefined' ||
        String(value) === 'null'
      ) {
        continue;
      }
      
      // Convert boolean to string
      if (typeof value === 'boolean') {
        filteredParams[key] = value.toString();
      } else {
        filteredParams[key] = String(value);
      }
    }

    const queryString = Object.keys(filteredParams).length > 0
      ? '?' + new URLSearchParams(filteredParams).toString()
      : '';
    
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
