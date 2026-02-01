// API Configuration for Admin Dashboard
export const API_CONFIG = {
  // Development - NestJS Backend
  DEV: {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.103:3001/api',
  },
  // Production
  PROD: {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://greengo-production.up.railway.app/api',
  },
};

// Get current API URL based on environment
export const getApiUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return API_CONFIG.DEV.BASE_URL;
  }
  return API_CONFIG.PROD.BASE_URL;
};

export const API_BASE_URL = getApiUrl();
