// API Configuration for GreenGo
// შეცვალეთ ეს მნიშვნელობები თქვენი backend URL-ის მიხედვით

import { Platform } from "react-native";

export const API_CONFIG = {
  // Development - NestJS Backend
  DEV: {
    // Android Emulator-ისთვის:
    ANDROID: "http://10.0.2.2:3001/api",
    // iOS Simulator-ისთვის:
    IOS_SIMULATOR: "http://172.20.10.13:3001/api",
    // Physical Device-ისთვის (თქვენი კომპიუტერის IP):
    // შეცვალეთ ეს IP თქვენი კომპიუტერის IP-ით (იპოვეთ: ipconfig getifaddr en0 ან en1)
    IOS_DEVICE: "http://172.20.10.4:3001/api",
  },

  // Production
  PROD: {
    BASE_URL: "https://greengo-production.up.railway.app/api",
  },
};
// Get current API URL based on environment and platform
export const getApiUrl = () => {
  if (__DEV__) {
    let url: string;

    // Auto-detect platform
    if (Platform.OS === "android") {
      url = API_CONFIG.DEV.ANDROID;
    } else if (Platform.OS === "ios") {
      // For iOS: iOS Simulator-ზე 127.0.0.1 მუშაობს
      url = API_CONFIG.DEV.IOS_SIMULATOR; // იყენებს 127.0.0.1:3001
    } else {
      // Fallback to Android (most common)
      url = API_CONFIG.DEV.ANDROID;
    }

    // Debug logging
    console.log(`🌐 [API Config] Platform: ${Platform.OS}, URL: ${url}`);

    return url;
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
