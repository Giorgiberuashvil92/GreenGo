export interface PromotionalBanner {
  id: number;
  title: string;
  oldPrice: string;
  newPrice: string;
  image: any;
  description?: string;
}

export const promotionalBanners: PromotionalBanner[] = [
  {
    id: 1,
    title: "KFC FEST",
    oldPrice: "24,35₾",
    newPrice: "14.95₾",
    image: require("../images/kfc.png"),
    description: "შეუკვეთე ახლავე",
  },
  {
    id: 2,
    title: "KFC FEST 2",
    oldPrice: "30,00₾",
    newPrice: "19.99₾",
    image: require("../images/burger.png"),
    description: "ახალი შეთავაზება",
  },
  {
    id: 3,
    title: "KFC FEST 3",
    oldPrice: "35,50₾",
    newPrice: "24.99₾",
    image: require("../images/snickers.png"),
    description: "ზამთრის აქცია",
  },
];
