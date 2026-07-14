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

function asMenuItemId(item: string | RestaurantOfferMenuItem): string {
  return typeof item === "string" ? item : item._id;
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
