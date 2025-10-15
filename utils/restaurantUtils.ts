import { Restaurant } from "../assets/data/restaurantsData";

// Working hours mapping
export const dayNames = {
  monday: "ორშაბათი",
  tuesday: "სამშაბათი",
  wednesday: "ოთხშაბათი",
  thursday: "ხუთშაბათი",
  friday: "პარასკევი",
  saturday: "შაბათი",
  sunday: "კვირა",
};

// Get formatted working hours
export const getWorkingHours = (restaurant: Restaurant) => {
  return Object.entries(restaurant.workingHours).map(([day, hours]) => ({
    day: dayNames[day as keyof typeof dayNames] || day,
    hours,
  }));
};

// Get current day working hours
export const getCurrentDayHours = (restaurant: Restaurant) => {
  const today = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  return restaurant.workingHours[today] || "დახურულია";
};

// Check if restaurant is currently open
export const isRestaurantOpen = (restaurant: Restaurant) => {
  const now = new Date();
  const currentTime = now.getHours() * 100 + now.getMinutes();
  const today = now
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const todayHours = restaurant.workingHours[today];

  if (!todayHours || todayHours === "დახურულია") return false;

  const [openTime, closeTime] = todayHours.split(" - ");
  const [openHour, openMin] = openTime.split(":").map(Number);
  const [closeHour, closeMin] = closeTime.split(":").map(Number);

  const openMinutes = openHour * 100 + openMin;
  const closeMinutes = closeHour * 100 + closeMin;

  return currentTime >= openMinutes && currentTime <= closeMinutes;
};

// Get distance between two coordinates (in km)
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

// Get restaurants within radius
export const getRestaurantsInRadius = (
  restaurants: Restaurant[],
  userLat: number,
  userLon: number,
  radiusKm: number = 10
): Restaurant[] => {
  return restaurants.filter((restaurant) => {
    const distance = getDistance(
      userLat,
      userLon,
      restaurant.location.latitude,
      restaurant.location.longitude
    );
    return distance <= radiusKm;
  });
};

// Get restaurants by category
export const getRestaurantsByCategory = (
  restaurants: Restaurant[],
  category: string
): Restaurant[] => {
  return restaurants.filter(
    (restaurant) =>
      restaurant.categories.includes(category) ||
      restaurant.cuisine.includes(category)
  );
};

// Get restaurants by price range
export const getRestaurantsByPriceRange = (
  restaurants: Restaurant[],
  priceRange: string
): Restaurant[] => {
  return restaurants.filter(
    (restaurant) => restaurant.priceRange === priceRange
  );
};

// Get restaurants with specific features
export const getRestaurantsWithFeatures = (
  restaurants: Restaurant[],
  features: Partial<Restaurant["features"]>
): Restaurant[] => {
  return restaurants.filter((restaurant) => {
    return Object.entries(features).every(
      ([key, value]) =>
        restaurant.features[key as keyof Restaurant["features"]] === value
    );
  });
};

// Sort restaurants by distance
export const sortRestaurantsByDistance = (
  restaurants: Restaurant[],
  userLat: number,
  userLon: number
): Restaurant[] => {
  return [...restaurants].sort((a, b) => {
    const distanceA = getDistance(
      userLat,
      userLon,
      a.location.latitude,
      a.location.longitude
    );
    const distanceB = getDistance(
      userLat,
      userLon,
      b.location.latitude,
      b.location.longitude
    );
    return distanceA - distanceB;
  });
};

// Get restaurant statistics
export const getRestaurantStats = (restaurant: Restaurant) => {
  return {
    totalMenuItems: restaurant.menuItems.length,
    popularItems: restaurant.menuItems.filter((item) => item.isPopular).length,
    averagePrice:
      restaurant.menuItems.reduce((sum, item) => sum + item.price, 0) /
      restaurant.menuItems.length,
    isOpen: isRestaurantOpen(restaurant),
    currentDayHours: getCurrentDayHours(restaurant),
  };
};

// Format address
export const formatAddress = (restaurant: Restaurant): string => {
  const { address, city, district, postalCode } = restaurant.location;
  return `${address}, ${district ? district + ", " : ""}${city}${
    postalCode ? ", " + postalCode : ""
  }`;
};

// Get contact info
export const getContactInfo = (restaurant: Restaurant) => {
  return {
    phone: restaurant.contact.phone,
    email: restaurant.contact.email,
    website: restaurant.contact.website,
    fullAddress: formatAddress(restaurant),
  };
};

// Search restaurants
export const searchRestaurants = (
  restaurants: Restaurant[],
  query: string
): Restaurant[] => {
  const lowercaseQuery = query.toLowerCase();
  return restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(lowercaseQuery) ||
      restaurant.description.toLowerCase().includes(lowercaseQuery) ||
      restaurant.categories.some((cat) =>
        cat.toLowerCase().includes(lowercaseQuery)
      ) ||
      restaurant.cuisine.some((cuisine) =>
        cuisine.toLowerCase().includes(lowercaseQuery)
      ) ||
      restaurant.location.address.toLowerCase().includes(lowercaseQuery) ||
      restaurant.location.district?.toLowerCase().includes(lowercaseQuery)
  );
};
