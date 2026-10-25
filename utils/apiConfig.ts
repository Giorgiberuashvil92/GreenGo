// API Configuration for GreenGo
//
// iOS (რეალური მოწყობილობა / TestFlight / App Store): HTTP ხშირად იბლოკება (ATS).
// გამოიყენეთ მხოლოდ https:// Railway domain ან EXPO_PUBLIC_API_URL.
//
// EAS build: დაამატეთ .env ან eas.json env-ში:
//   EXPO_PUBLIC_API_URL=https://თქვენი-სერვისი.up.railway.app/api

import { Platform } from "react-native";

// Shared HTTPS backend for installed builds and development by default.
const RAILWAY_API_HTTPS = "https://greengo-production.up.railway.app/api";

export const API_CONFIG = {
  DEV: {
    ANDROID: RAILWAY_API_HTTPS,
    IOS_SIMULATOR: RAILWAY_API_HTTPS,
    IOS_DEVICE: RAILWAY_API_HTTPS,
  },
  PROD: {
    BASE_URL: RAILWAY_API_HTTPS,
  },
};

function stripTrailingSlash(u: string): string {
  const t = u.trim();
  return t.endsWith("/") ? t.slice(0, -1) : t;
}

/** Local overrides apply only in development; release builds always use production. */
export const getApiUrl = (): string => {
  if (__DEV__) {
    const override = process.env.EXPO_PUBLIC_API_URL?.trim();
    if (override) return stripTrailingSlash(override);
  }
  return API_CONFIG.PROD.BASE_URL;
};

/** Nest: global prefix `api` → health არის /api/health */
export const getHealthUrl = (): string => `${getApiUrl()}/health`;

export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(getHealthUrl(), {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
};

export const getApiInfo = () => {
  return {
    platform: Platform.OS,
    url: getApiUrl(),
    healthUrl: getHealthUrl(),
    isDev: __DEV__,
    fromEnv: __DEV__ && !!(
      typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL
    ),
  };
};
