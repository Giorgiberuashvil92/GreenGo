import { ImageSourcePropType } from "react-native";

export type HomeCategory = {
  id: string;
  name: string;
  bgColor: string;
  icon?: ImageSourcePropType;
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

export function mapApiCategoryToHome(category: ApiHomeCategory): HomeCategory {
  const iconUrl = category.icon || category.image;
  return {
    id: category._id,
    name: category.name,
    bgColor: category.bgColor || "#F5F5F5",
    icon: iconUrl ? { uri: iconUrl } : undefined,
  };
}

export function buildHomeCategories(
  apiCategories: ApiHomeCategory[],
): HomeCategory[] {
  const mapped = apiCategories
    .filter((c) => c.isActive !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map(mapApiCategoryToHome);

  return mapped;
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
