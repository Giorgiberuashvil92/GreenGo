// API Configuration for GreenGo
// შეცვალეთ ეს მნიშვნელობები თქვენი backend URL-ის მიხედვით

import { Platform } from 'react-native';

export const API_CONFIG = {
  // Development - NestJS Backend (Local)
  DEV: {
    // Android Emulator-ისთვის:
    ANDROID: 'http://10.0.2.2:3001/api',
    // iOS Simulator-ისთვის (კომპიუტერის IP):
    IOS_SIMULATOR: 'http://192.168.0.100:3001/api',
    // Physical Device-ისთვის (თქვენი კომპიუტერის IP):
    // შეცვალეთ ეს IP თქვენი კომპიუტერის IP-ით (იპოვეთ: ipconfig getifaddr en0 ან en1)
    IOS_DEVICE: 'http://172.20.10.2:3001/api',
  },

  // Production - Railway Backend
  PROD: {
    BASE_URL: 'https://greengo.up.railway.app/api',
  },
};

// Get current API URL based on environment and platform
export const getApiUrl = () => {
  let url: string;
  if (__DEV__) {
    // Auto-detect platform
    if (Platform.OS === 'android') {
      // Android Emulator - 10.0.2.2 points to host machine's localhost
      url = API_CONFIG.DEV.ANDROID;
    } else if (Platform.OS === 'ios') {
      // iOS Simulator - can use localhost directly
      // iOS Simulator იზიარებს host machine-ის localhost-ს
      url = API_CONFIG.DEV.IOS_SIMULATOR;
      // Note: For physical iOS devices, you'll need to use IOS_DEVICE with your computer's IP
      // Uncomment and update IOS_DEVICE IP if testing on physical device:
      // url = API_CONFIG.DEV.IOS_DEVICE;
    } else {
      // Fallback to Android (most common)
      url = API_CONFIG.DEV.ANDROID;
    }
  } else {
    url = API_CONFIG.PROD.BASE_URL;
  }
  // Remove any leading/trailing spaces
  return url.trim();
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

