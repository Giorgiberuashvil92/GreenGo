import { parseMongoId } from "./mongoId";

export function getBannerRestaurantId(banner: {
  restaurantId?: unknown;
}): string | undefined {
  return parseMongoId(banner.restaurantId);
}

export function hasBannerAction(banner: {
  restaurantId?: string;
  link?: string;
}): boolean {
  return Boolean(getBannerRestaurantId(banner) || banner.link?.trim());
}
