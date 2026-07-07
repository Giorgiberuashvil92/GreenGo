import { getDistance } from "./restaurantUtils";

export const SHORT_DISTANCE_KM = 2;
export const SHORT_DISTANCE_BUNDLE_TOTAL = 4;
export const DEFAULT_SERVICE_FEE = 1.2;
export const SHORT_DISTANCE_DELIVERY_FEE =
  SHORT_DISTANCE_BUNDLE_TOTAL - DEFAULT_SERVICE_FEE;

export const DELIVERY_FEE_PER_KM_ABOVE_SHORT = 0.7;

export type DeliveryFeeInput = {
  baseFee: number;
  restaurantLat: number;
  restaurantLng: number;
  deliveryLat: number;
  deliveryLng: number;
};

export type DeliveryPricingResult = {
  distanceKm: number;
  deliveryFee: number;
  serviceFee: number;
  isShortDistanceBundle: boolean;
};

export function calculateDeliveryFeeFromDistance(
  _baseFee: number,
  distanceKm: number,
): number {
  if (distanceKm <= SHORT_DISTANCE_KM) {
    return SHORT_DISTANCE_DELIVERY_FEE;
  }

  const extraKm = distanceKm - SHORT_DISTANCE_KM;
  return SHORT_DISTANCE_DELIVERY_FEE + extraKm * DELIVERY_FEE_PER_KM_ABOVE_SHORT;
}

export function getDeliveryDistanceKm(
  restaurantLat: number,
  restaurantLng: number,
  deliveryLat: number,
  deliveryLng: number,
): number {
  return getDistance(restaurantLat, restaurantLng, deliveryLat, deliveryLng);
}

export function calculateDeliveryPricing(
  input: DeliveryFeeInput,
): DeliveryPricingResult {
  const distanceKm = getDeliveryDistanceKm(
    input.restaurantLat,
    input.restaurantLng,
    input.deliveryLat,
    input.deliveryLng,
  );

  const isShortDistanceBundle = distanceKm <= SHORT_DISTANCE_KM;
  const deliveryFee = calculateDeliveryFeeFromDistance(
    input.baseFee,
    distanceKm,
  );

  return {
    distanceKm,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    serviceFee: DEFAULT_SERVICE_FEE,
    isShortDistanceBundle,
  };
}

/** @deprecated Use calculateDeliveryPricing */
export function calculateDeliveryFee(
  input: DeliveryFeeInput,
): { distanceKm: number; fee: number } {
  const pricing = calculateDeliveryPricing(input);
  return {
    distanceKm: pricing.distanceKm,
    fee: pricing.deliveryFee,
  };
}

export function formatDeliveryDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.max(100, Math.round(distanceKm * 1000))}მ`;
  }

  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1).replace(".", ",")} კმ`;
  }

  return `${Math.round(distanceKm)} კმ`;
}
