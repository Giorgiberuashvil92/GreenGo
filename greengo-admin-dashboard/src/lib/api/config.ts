// API Configuration for Admin Dashboard — direct backend URL (no Next.js proxy)

const DEFAULT_LOCAL_API = 'http://localhost:3001/api';
const DEFAULT_PROD_API = 'https://greengo.up.railway.app/api';

function normalizeApiBase(url: string) {
  return url.trim().replace(/\/$/, '');
}

/** Browser calls backend directly; set NEXT_PUBLIC_API_URL in Vercel to your Railway URL + /api */
export const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return normalizeApiBase(process.env.NEXT_PUBLIC_API_URL);
  }

  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    return DEFAULT_LOCAL_API;
  }

  return DEFAULT_PROD_API;
};

export const API_BASE_URL = getApiUrl();
