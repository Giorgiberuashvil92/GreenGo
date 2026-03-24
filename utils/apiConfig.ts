// API Configuration for GreenGo
// შეცვალეთ ეს მნიშვნელობები თქვენი backend URL-ის მიხედვით

import { Platform } from "react-native";

/** დროებით true — ლოკალური Nest (`greengo-backend`); false — Railway */
const USE_LOCAL_BACKEND = true;

const LOCAL_API = {
  /** Android emulator → ჰოსტის localhost */
  ANDROID_EMULATOR: "http://greengo-production.up.railway.app/api",
  IOS_SIMULATOR: "http://greengo-production.up.railway.app/api",
} as const;

export const API_CONFIG = {
  // Development - NestJS Backend (Local)
  DEV: {
    ANDROID: "http://greengo-production.up.railway.app/api",
    IOS_SIMULATOR: "http://greengo-production.up.railway.app/api",
    // Physical Device-ისთვის (თქვენი კომპიუტერის IP):
    // შეცვალეთ ეს IP თქვენი კომპიუტერის IP-ით (იპოვეთ: ipconfig getifaddr en0 ან en1)
    IOS_DEVICE: "http://greengo-production.up.railway.app/api",
  },

  // Production - Railway Backend
  // შენიშვნა: თუ Railway-ზე აპლიკაცია არ არის დეპლოირებული, ეს URL 404-ს აბრუნებს
  // Railway Dashboard-ში შეამოწმეთ სწორი URL (Settings -> Domains)
  // ან გამოიყენეთ custom domain: https://api.greengo.ge/api
  PROD: {
    // Railway default URL (თუ არ არის custom domain)
    BASE_URL: "http://greengo-production.up.railway.app/api",
    // Custom domain (თუ დაყენებულია Railway-ზე)
    // BASE_URL: 'https://api.greengo.ge/api',
  },
};

// Get current API URL based on environment and platform
export const getApiUrl = () => {
  const raw = USE_LOCAL_BACKEND
    ? Platform.OS === "android"
      ? LOCAL_API.ANDROID_EMULATOR
      : LOCAL_API.IOS_SIMULATOR
    : API_CONFIG.PROD.BASE_URL;
  const url = raw.trim();
  return url.endsWith("/") ? url.slice(0, -1) : url;
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
