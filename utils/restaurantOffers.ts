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

export type ItemOfferPricing = {
  original: number;
  final: number;
  percent: number | null;
  offer: RestaurantOffer | null;
};

function asMenuItemId(item: string | RestaurantOfferMenuItem): string {
  return typeof item === "string" ? item : item._id;
}

export function getOfferItemIds(offer: RestaurantOffer): string[] {
  return (offer.menuItemIds || []).map(asMenuItemId);
}

export function getOfferMenuItems(
  offer: RestaurantOffer,
  catalog?: Array<{
    _id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    heroImage?: string;
    category?: string;
  }>,
): RestaurantOfferMenuItem[] {
  const populated = (offer.menuItemIds || []).filter(
    (item): item is RestaurantOfferMenuItem =>
      typeof item === "object" &&
      item != null &&
      "_id" in item &&
      "name" in item,
  );

  if (populated.length > 0) return populated;

  if (!catalog?.length) return [];

  const byId = new Map(catalog.map((item) => [item._id, item]));
  return (offer.menuItemIds || [])
    .map(asMenuItemId)
    .map((id) => byId.get(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({
      _id: item._id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      heroImage: item.heroImage,
      category: item.category,
    }));
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

/** უმაღლესი % შეთავაზება მოცემულ პროდუქტზე */
export function getPercentageOfferForItem(
  offers: RestaurantOffer[],
  menuItemId: string,
): RestaurantOffer | null {
  if (!menuItemId) return null;
  let best: RestaurantOffer | null = null;
  for (const offer of offers) {
    if (offer.discountType !== "percentage") continue;
    if (offer.isActive === false) continue;
    if (!getOfferItemIds(offer).includes(menuItemId)) continue;
    if (!best || offer.discountValue > best.discountValue) {
      best = offer;
    }
  }
  return best;
}

export function applyPercentage(price: number, percent: number): number {
  if (percent <= 0 || price <= 0) return price;
  return Math.round(price * (1 - percent / 100) * 100) / 100;
}

export function getItemOfferPricing(
  offers: RestaurantOffer[],
  menuItemId: string,
  basePrice: number,
): ItemOfferPricing {
  const offer = getPercentageOfferForItem(offers, menuItemId);
  if (!offer) {
    return { original: basePrice, final: basePrice, percent: null, offer: null };
  }
  return {
    original: basePrice,
    final: applyPercentage(basePrice, offer.discountValue),
    percent: offer.discountValue,
    offer,
  };
}

/** მიტანის ფიქსირებული ფასდაკლება (უმაღლესი) */
export function getDeliveryFixedDiscount(offers: RestaurantOffer[]): number {
  let best = 0;
  for (const offer of offers) {
    if (offer.discountType !== "delivery_fixed") continue;
    if (offer.isActive === false) continue;
    best = Math.max(best, offer.discountValue);
  }
  return best;
}
