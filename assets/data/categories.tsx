import { ImageSourcePropType } from "react-native";

export type HomeCategory = {
  id: string;
  name: string;
  bgColor: string;
  icon: ImageSourcePropType;
  link?: string;
};

export type ApiHomeCategory = {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  image?: string;
  bgColor?: string;
  order?: number;
  isActive?: boolean;
};

const FALLBACK_ICON = require("@/assets/images/categories/all.png");

/** „ყველა“ ყოველთვის ლოკალურად იდება პირველად — ფილტრი არ არის */
export const ALL_HOME_CATEGORY: HomeCategory = {
  id: "all",
  name: "ყველა",
  bgColor: "#EDF4FD",
  icon: FALLBACK_ICON,
};

/** Fallback თუ API ცარიელია */
export const homeCategories: HomeCategory[] = [
  ALL_HOME_CATEGORY,
  {
    id: "food",
    name: "კვება",
    bgColor: "#FCF5ED",
    icon: require("@/assets/images/categories/food.png"),
  },
  {
    id: "flowers",
    name: "ყვავილები",
    bgColor: "#FDECED",
    icon: require("@/assets/images/categories/flowers.png"),
  },
];

export function mapApiCategoryToHome(category: ApiHomeCategory): HomeCategory {
  const iconUrl = category.icon || category.image;
  return {
    id: category._id,
    name: category.name,
    bgColor: category.bgColor || "#F5F5F5",
    icon: iconUrl ? { uri: iconUrl } : resolveCategoryIcon(category.name),
  };
}

export function buildHomeCategories(
  apiCategories: ApiHomeCategory[],
): HomeCategory[] {
  const mapped = apiCategories
    .filter((c) => c.isActive !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(mapApiCategoryToHome);

  return [ALL_HOME_CATEGORY, ...mapped];
}

/** რესტორნის კატეგორია ემთხვევა ჰოუმ კატეგორიის სახელს (ადმინიდან მინიჭებული) */
export function restaurantMatchesHomeCategory(
  restaurant: { categories?: string[]; cuisine?: string[] },
  categoryName: string,
): boolean {
  const normalized = categoryName.trim().toLocaleLowerCase("ka");
  if (!normalized || normalized === "ყველა") return true;

  const values = [...(restaurant.categories ?? []), ...(restaurant.cuisine ?? [])];
  return values.some(
    (value) => value.trim().toLocaleLowerCase("ka") === normalized,
  );
}

export function getRestaurantsRouteForCategory(category: HomeCategory) {
  if (category.name === "ყველა" || category.id === "all") {
    return "/(tabs)/restaurants" as const;
  }

  return {
    pathname: "/(tabs)/restaurants" as const,
    params: { category: category.name },
  };
}

export function resolveCategoryIcon(
  categoryName: string,
  remoteUrl?: string,
): ImageSourcePropType {
  if (remoteUrl) {
    return { uri: remoteUrl };
  }

  const nameLower = categoryName.toLowerCase();
  if (nameLower.includes("კვება") || nameLower.includes("food")) {
    return require("@/assets/images/categories/food.png");
  }
  if (nameLower.includes("ყვავილ") || nameLower.includes("flower")) {
    return require("@/assets/images/categories/flowers.png");
  }
  if (
    nameLower.includes("ზოო") ||
    nameLower.includes("zoo") ||
    nameLower.includes("pet")
  ) {
    return FALLBACK_ICON;
  }
  if (nameLower.includes("ყველა") || nameLower === "all") {
    return FALLBACK_ICON;
  }

  return FALLBACK_ICON;
}

export function getHomeCategoryBgColor(categoryName: string): string {
  if (categoryName === "ყველა") return ALL_HOME_CATEGORY.bgColor;
  return "#F5F5F5";
}
