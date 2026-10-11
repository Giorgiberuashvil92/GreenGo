// API Configuration for GreenGo Courier App
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const API_CONFIG = {
  // Development - NestJS Backend
  DEV: {
    // Android Emulator-ისთვის host machine-ის localhost არის 10.0.2.2.
    ANDROID: 'http://10.0.2.2:3001/api',
    // iOS Simulator host machine-ის localhost-ს პირდაპირ ხედავს.
    IOS_SIMULATOR: 'http://localhost:3001/api',
    // ფიზიკური მოწყობილობისთვის გამოიყენე EXPO_PUBLIC_API_URL,
    // მაგალითად: http://192.168.1.15:3001/api
    IOS_DEVICE: 'http://localhost:3001/api',
  },

  // Production
  PROD: {
    BASE_URL: 'https://greengo-production.up.railway.app/api',
  },
};

// Get current API URL based on environment and platform
export const getApiUrl = () => {
  // EXPO_PUBLIC_API_URL overrides every other setting. This is required for
  // a physical phone because localhost would point to the phone itself.
  const explicitUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (explicitUrl) {
    return explicitUrl.replace(/\/$/, '');
  }

  // Use Railway for production builds, while keeping local development local.
  // EXPO_PUBLIC_API_MODE=production can force Railway during a dev build.
  if (!__DEV__ || process.env.EXPO_PUBLIC_API_MODE === 'production') {
    return API_CONFIG.PROD.BASE_URL;
  }

  if (Platform.OS === 'android') {
    return API_CONFIG.DEV.ANDROID;
  }

  if (Platform.OS === 'ios') {
    return Constants.isDevice
      ? API_CONFIG.DEV.IOS_DEVICE
      : API_CONFIG.DEV.IOS_SIMULATOR;
  }

  return API_CONFIG.DEV.IOS_SIMULATOR;
};

// Get platform info for debugging
export const getApiInfo = () => {
  const url = getApiUrl();
  return {
    platform: Platform.OS,
    url: url,
    isDev: __DEV__,
    isDevice: Constants.isDevice,
    // Additional debugging info
    config: {
      iosSimulator: API_CONFIG.DEV.IOS_SIMULATOR,
      iosDevice: API_CONFIG.DEV.IOS_DEVICE,
      android: API_CONFIG.DEV.ANDROID,
    },
  };
};
