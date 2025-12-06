// API Configuration for GreenGo
// შეცვალეთ ეს მნიშვნელობები თქვენი backend URL-ის მიხედვით

import { Platform } from 'react-native';

export const API_CONFIG = {
  // Development - NestJS Backend
  DEV: {
    // Android Emulator-ისთვის:
    ANDROID: 'http://10.0.2.2:3001/api',
    // iOS Simulator-ისთვის:
    IOS: 'http://localhost:3001/api',
    // Physical Device-ისთვის (თქვენი კომპიუტერის IP):
    // BASE_URL: 'http://192.168.1.XXX:3001/api',
  },

  // Production
  PROD: {
    BASE_URL: 'https://api.greengo.ge/api',
  },
};

// Get current API URL based on environment and platform
export const getApiUrl = () => {
  if (__DEV__) {
    // Auto-detect platform
    if (Platform.OS === 'android') {
      return API_CONFIG.DEV.ANDROID;
    } else if (Platform.OS === 'ios') {
      return API_CONFIG.DEV.IOS;
    }
    // Fallback to Android (most common)
    return API_CONFIG.DEV.ANDROID;
  }
  return API_CONFIG.PROD.BASE_URL;
};

// Helper function to check if API is available
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout
    
    const response = await fetch(`${getApiUrl()}/health`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
};

// Get platform info for debugging
export const getApiInfo = () => {
  return {
    platform: Platform.OS,
    url: getApiUrl(),
    isDev: __DEV__,
  };
};

