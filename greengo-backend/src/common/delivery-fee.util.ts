export const SHORT_DISTANCE_KM = 2;
export const SHORT_DISTANCE_BUNDLE_TOTAL = 4;
export const DEFAULT_SERVICE_FEE = 1.2;
export const SHORT_DISTANCE_DELIVERY_FEE =
  SHORT_DISTANCE_BUNDLE_TOTAL - DEFAULT_SERVICE_FEE;

export const DELIVERY_FEE_PER_KM_ABOVE_SHORT = 0.7;

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

export function isShortDistanceBundle(distanceKm: number): boolean {
  return distanceKm <= SHORT_DISTANCE_KM;
}
