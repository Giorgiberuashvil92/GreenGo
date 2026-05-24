import { ImageSourcePropType } from "react-native";

export type HomeCategory = {
  id: string;
  name: string;
  bgColor: string;
  icon: ImageSourcePropType;
  link?: string;
};

/** მთავარი ეკრანის კატეგორიები — ლოკალური აიკონები assets/images/categories */
export const homeCategories: HomeCategory[] = [
  {
    id: "all",
    name: "ყველა",
    bgColor: "#EDF4FD",
    icon: require("@/assets/images/categories/all.png"),
  },
  {
    id: "food",
    name: "კვება",
    bgColor: "#FCF5ED",
    icon: require("@/assets/images/categories/food.png"),
    link: "/screens/food",
  },
  {
    id: "flowers",
    name: "ყვავილები",
    bgColor: "#FDECED",
    icon: require("@/assets/images/categories/flowers.png"),
  },
  {
    id: "zoo",
    name: "ზოომაღაზია",
    bgColor: "#EDF7F1",
    icon: require("@/assets/images/categories/all.png"),
  },
];

export function resolveCategoryIcon(
  categoryName: string,
  remoteUrl?: string,
): ImageSourcePropType {
  if (remoteUrl) {
    return { uri: remoteUrl };
  }

  const exact = homeCategories.find((c) => c.name === categoryName);
  if (exact) {
    return exact.icon;
  }

  const nameLower = categoryName.toLowerCase();
  if (nameLower.includes("კვება") || nameLower.includes("food")) {
    return require("@/assets/images/categories/food.png");
  }
  if (nameLower.includes("ყვავილ") || nameLower.includes("flower")) {
    return require("@/assets/images/categories/flowers.png");
  }
  if (nameLower.includes("ზოო") || nameLower.includes("zoo") || nameLower.includes("pet")) {
    return require("@/assets/images/categories/all.png");
  }
  if (nameLower.includes("ყველა") || nameLower === "all") {
    return require("@/assets/images/categories/all.png");
  }

  return require("@/assets/images/categories/all.png");
}

export function getHomeCategoryBgColor(categoryName: string): string {
  const exact = homeCategories.find((c) => c.name === categoryName);
  if (exact) {
    return exact.bgColor;
  }
  return "#F5F5F5";
}
