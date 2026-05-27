// API URL
//
// ლოკალური (npm run dev):
//   backend → http://localhost:3001/api
//
// Vercel production:
//   ბრაუზერი → /api-proxy/... (იგივე დომენი, CORS არ სჭირდება)
//   Next.js rewrite → BACKEND_API_URL/api/...
//
// Vercel env: BACKEND_API_URL=https://<თქვენი-railway-დომენი>

const LOCAL_API = 'http://localhost:3001/api';
const VERCEL_PROXY_API = '/api-proxy';

function normalizeApiBase(url: string) {
  return url.trim().replace(/\/$/, '');
}

export const getApiUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return normalizeApiBase(process.env.NEXT_PUBLIC_API_URL);
  }

  const mode = process.env.NEXT_PUBLIC_API_MODE?.toLowerCase();
  if (mode === 'local') {
    return LOCAL_API;
  }
  // ლოკალურად production API პირდაპირ (მხოლოდ ტესტისთვის)
  if (mode === 'production' || mode === 'prod') {
    const direct =
      process.env.NEXT_PUBLIC_RAILWAY_API_URL ??
      'https://greengo-production.up.railway.app/api';
    return normalizeApiBase(direct);
  }

  if (process.env.NODE_ENV === 'development') {
    return LOCAL_API;
  }

  // Vercel / production build — same-origin proxy (no CORS)
  return VERCEL_PROXY_API;
};

export const API_BASE_URL = getApiUrl();
