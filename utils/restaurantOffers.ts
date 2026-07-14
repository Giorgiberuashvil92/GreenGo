export type RestaurantOfferDiscountType = "percentage" | "delivery_fixed";

export type RestaurantOfferMenuItem = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  heroImage?: string;
  category?: string;
};

export type RestaurantOffer = {
  _id: string;
  restaurantId: string;
  title: string;
  description?: string;
  discountType: RestaurantOfferDiscountType;
  discountValue: number;
  menuItemIds: Array<string | RestaurantOfferMenuItem>;
  isActive: boolean;
  sortOrder?: number;
  startsAt?: string;
  expiresAt?: string;
};

export function getOfferMenuItems(
  offer: RestaurantOffer,
): RestaurantOfferMenuItem[] {
  return (offer.menuItemIds || []).filter(
    (item): item is RestaurantOfferMenuItem =>
      typeof item === "object" && item != null && "_id" in item && "name" in item,
  );
}

export function getOfferEligibleCount(offer: RestaurantOffer): number {
  return getOfferMenuItems(offer).length || (offer.menuItemIds || []).length;
}

export function offerSubtitle(offer: RestaurantOffer): string {
  if (offer.discountType === "delivery_fixed") {
    return `მიიღე ${offer.discountValue.toFixed(2).replace(".", ",")}₾ ფასდაკლება მიტანის ფასზე`;
  }
  const count = getOfferEligibleCount(offer);
  return `${count} დასაშვები პროდუქტი`;
}
