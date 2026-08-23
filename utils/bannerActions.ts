import { parseMongoId } from "./mongoId";

export function getBannerRestaurantId(banner: {
  restaurantId?: unknown;
}): string | undefined {
  return parseMongoId(banner.restaurantId);
}

export function hasBannerAction(banner: {
  restaurantId?: string;
  link?: string;
  isClickable?: boolean;
}): boolean {
  if (banner.isClickable === false) return false;
  return Boolean(getBannerRestaurantId(banner) || banner.link?.trim());
}
