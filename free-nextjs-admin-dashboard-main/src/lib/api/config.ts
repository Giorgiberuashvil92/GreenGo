// API Configuration for Admin Dashboard
export const API_CONFIG = {
  // Development - Use local backend or Next.js proxy
  DEV: {
    // Option 1: Local backend (if running on localhost:3001)
    LOCAL: 'http://localhost:3001/api',
    // Option 2: Next.js proxy to Railway (if Railway is running)
    PROXY: '/api-proxy',
    // Option 3: Direct Railway URL (if CORS is fixed)
    RAILWAY: 'https://greengo.up.railway.app/api',
  },
  // Production - Direct connection to Railway
  PROD: {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://greengo.up.railway.app/api',
  },
};

// Get current API URL based on environment
export const getApiUrl = () => {
  // Check if we're in browser and in development mode
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Use environment variable if set, otherwise try local backend first
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    // Default to local backend for development
    return API_CONFIG.DEV.LOCAL;
  }
  return API_CONFIG.PROD.BASE_URL;
};

export const API_BASE_URL = getApiUrl();
