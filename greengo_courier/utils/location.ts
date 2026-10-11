import { Location } from "../types";

/**
 * Generate a random location near a base location within a specified radius
 */
export const generateRandomNearbyLocation = (
  baseLocation: Location,
  radiusKm: number = 2
): Location => {
  // Convert km to degrees (approximately)
  const radiusInDegrees = radiusKm / 111;
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radiusInDegrees;

  return {
    latitude: baseLocation.latitude + distance * Math.cos(angle),
    longitude: baseLocation.longitude + distance * Math.sin(angle),
  };
};

/**
 * Generate smooth route coordinates between multiple points
 */
export const generateSmoothRoute = (
  points: Location[],
  stepsPerSegment: number = 10
): Location[] => {
  if (points.length < 2) return [];

  const route: Location[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];

    for (let j = 0; j <= stepsPerSegment; j++) {
      const t = j / stepsPerSegment;
      route.push({
        latitude: start.latitude + (end.latitude - start.latitude) * t,
        longitude: start.longitude + (end.longitude - start.longitude) * t,
      });
    }
  }

  return route;
};

export const DEFAULT_LOCATION: Location = {
  latitude: 41.7151, // Tbilisi
  longitude: 44.8271,
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

