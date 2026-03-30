// API Configuration for GreenGo
//
// iOS (რეალური მოწყობილობა / TestFlight / App Store): HTTP ხშირად იბლოკება (ATS).
// გამოიყენეთ მხოლოდ https:// Railway domain ან EXPO_PUBLIC_API_URL.
//
// EAS build: დაამატეთ .env ან eas.json env-ში:
//   EXPO_PUBLIC_API_URL=https://თქვენი-სერვისი.up.railway.app/api

import { Platform } from "react-native";

/**
 * true  → ქვემოთ მითითებული DEV/LOCAL URL (იგივე რაც Railway remote-ზე ტესტისთვის)
 * false → API_CONFIG.PROD (რეკომენდებული production აპისთვის)
 */
const USE_DEV_URL = true;

/** Railway public URL — Dashboard → Settings → Networking → Public URL (HTTPS) */
const RAILWAY_API_HTTPS = "https://greengo-production.up.railway.app/api";

/** თუ admin/dashboard იყენებს სხვა ჰოსტს, აქ ჩასვით იგივე + /api */
// const RAILWAY_API_HTTPS = "https://greengo.up.railway.app/api";

const LOCAL_API = {
  ANDROID_EMULATOR: RAILWAY_API_HTTPS,
  IOS_SIMULATOR: RAILWAY_API_HTTPS,
} as const;

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

/**
 * პრიორიტეტი: EXPO_PUBLIC_API_URL (EAS / .env) → შემდეგ USE_DEV_URL + პლატფორმა → PROD
 */
export const getApiUrl = (): string => {
  const fromEnv =
    typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL
      ? stripTrailingSlash(String(process.env.EXPO_PUBLIC_API_URL))
      : "";

  if (fromEnv) {
    return fromEnv;
  }

  const raw = USE_DEV_URL
    ? Platform.OS === "android"
      ? LOCAL_API.ANDROID_EMULATOR
      : LOCAL_API.IOS_SIMULATOR
    : API_CONFIG.PROD.BASE_URL;

  return stripTrailingSlash(raw);
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
    fromEnv: !!(
      typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL
    ),
  };
};
