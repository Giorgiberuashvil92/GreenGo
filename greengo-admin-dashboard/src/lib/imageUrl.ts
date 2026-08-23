const BLOCKED_HOSTS = new Set([
  "www.google.com",
  "google.com",
  "www.bing.com",
  "bing.com",
]);

const NEXT_IMAGE_HOST_PATTERNS: RegExp[] = [
  /^encrypted-tbn0\.gstatic\.com$/,
  /^(.+\.)?gstatic\.com$/,
  /^localhost$/,
  /^172\.20\.10\.2$/,
  /^greengo-production\.up\.railway\.app$/,
  /^(.+\.)?up\.railway\.app$/,
  /^imageproxy\.wolt\.com$/,
  /^res\.cloudinary\.com$/,
];

const DIRECT_IMAGE_EXT = /\.(avif|bmp|gif|jpe?g|png|svg|webp)(\?.*)?$/i;

function parseUrl(url: string): URL | null {
  try {
    return new URL(url.trim());
  } catch {
    return null;
  }
}

export function isBlockedImageUrl(url: string): boolean {
  const parsed = parseUrl(url);
  if (!parsed) return true;
  if (!["http:", "https:"].includes(parsed.protocol)) return true;
  if (BLOCKED_HOSTS.has(parsed.hostname)) return true;
  if (parsed.hostname.endsWith(".google.com") && parsed.pathname.includes("/search")) {
    return true;
  }
  return false;
}

export function isNextImageAllowedUrl(url: string): boolean {
  const parsed = parseUrl(url);
  if (!parsed || isBlockedImageUrl(url)) return false;
  return NEXT_IMAGE_HOST_PATTERNS.some((pattern) => pattern.test(parsed.hostname));
}

export function isLikelyDirectImageUrl(url: string): boolean {
  const parsed = parseUrl(url);
  if (!parsed || isBlockedImageUrl(url)) return false;
  return DIRECT_IMAGE_EXT.test(parsed.pathname);
}

export function isDisplayableImageUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  return isNextImageAllowedUrl(url) || isLikelyDirectImageUrl(url);
}

export function getImageUrlValidationError(
  url: string,
  { required = false }: { required?: boolean } = {},
): string | null {
  const trimmed = url.trim();
  if (!trimmed) {
    return required ? "სურათის URL სავალდებულოა" : null;
  }

  const parsed = parseUrl(trimmed);
  if (!parsed) {
    return "არასწორი URL ფორმატი";
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return "სურათის URL უნდა იწყებოდეს http:// ან https://";
  }

  if (isBlockedImageUrl(trimmed)) {
    return "ეს ბმული სურათი არ არის. ჩასვით პირდაპირი სურათის ბმული (მაგ. .jpg, .png) ან CDN-ის URL";
  }

  if (!isDisplayableImageUrl(trimmed)) {
    return "სურათის ჰოსტი არ არის დაშვებული. გამოიყენეთ პირდაპირი სურათის ბმული";
  }

  return null;
}
