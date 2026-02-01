// API Configuration for GreenGo
// შეცვალეთ ეს მნიშვნელობები თქვენი backend URL-ის მიხედვით

import { Platform } from 'react-native';

export const API_CONFIG = {
  // Development - NestJS Backend
  DEV: {
    // Android Emulator-ისთვის:
    ANDROID: 'http://10.0.2.2:3001/api',
    // iOS Simulator-ისთვის (კომპიუტერის IP):
    IOS_SIMULATOR: 'http://192.168.0.103:3001/api',
    // Physical Device-ისთვის (თქვენი კომპიუტერის IP):
    // შეცვალეთ ეს IP თქვენი კომპიუტერის IP-ით (იპოვეთ: ipconfig getifaddr en0 ან en1)
    IOS_DEVICE: 'http://172.20.10.2:3001/api',
  },

  // Production
  PROD: {
    BASE_URL: 'https://greengo-production.up.railway.app/api',
  },
};

// Get current API URL based on environment and platform
export const getApiUrl = () => {
  if (__DEV__) {
    // Auto-detect platform
    if (Platform.OS === 'android') {
      return API_CONFIG.DEV.ANDROID;
    } else if (Platform.OS === 'ios') {
      // For iOS: Use simulator URL for simulator, device IP for physical devices
      // iOS Simulator-ზე გამოიყენება IOS_SIMULATOR (კომპიუტერის IP: 192.168.0.103)
      // Physical device-ზე გამოიყენება IOS_DEVICE (კომპიუტერის IP)
      // შენიშვნა: iOS simulator-ში უკეთესია კომპიუტერის IP-ის გამოყენება 127.0.0.1-ის ნაცვლად
      return API_CONFIG.DEV.IOS_SIMULATOR;
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

