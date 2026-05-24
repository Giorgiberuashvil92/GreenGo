export interface PromotionalBanner {
  id: number;
  title: string;
  image: number;
  description?: string;
}

export const promotionalBanners: PromotionalBanner[] = [
  {
    id: 1,
    title: "GreenGo",
    image: require("../images/greengo.png"),
    description: "მიტანა საქართველოში",
  },
  {
    id: 2,
    title: "KFC FEST",
    image: require("../images/kfc.png"),
    description: "ფესტ ბოქსი ზინგერით",
  },
  {
    id: 3,
    title: "Snickers McFlurry",
    image: require("../images/snickers.png"),
    description: "გაუსინჯე გემო სნიკერსის სიგრილეს",
  },
];
