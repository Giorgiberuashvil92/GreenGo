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
    title: "Burger Day",
    oldPrice: "30,00₾",
    newPrice: "19.99₾",
    image: require("../images/burger.png"),
    description: "ახალი შეთავაზება",
  },
  {
    id: 3,
    title: "Sweet Deal",
    oldPrice: "35,50₾",
    newPrice: "24.99₾",
    image: require("../images/snickers.png"),
    description: "ზამთრის აქცია",
  },
  {
    id: 4,
    title: "Combo Offer",
    oldPrice: "28,00₾",
    newPrice: "18.50₾",
    image: require("../images/kfc.png"),
    description: "კომბო შეთავაზება",
  },
  {
    id: 5,
    title: "Family Pack",
    oldPrice: "45,00₾",
    newPrice: "32.99₾",
    image: require("../images/burger.png"),
    description: "საოჯახო პაკეტი",
  },
  {
    id: 6,
    title: "Lunch Special",
    oldPrice: "22,00₾",
    newPrice: "14.99₾",
    image: require("../images/snickers.png"),
    description: "სადილის სპეციალი",
  },
  {
    id: 7,
    title: "Weekend Deal",
    oldPrice: "38,00₾",
    newPrice: "25.99₾",
    image: require("../images/kfc.png"),
    description: "შაბათ-კვირის აქცია",
  },
  {
    id: 8,
    title: "Student Offer",
    oldPrice: "20,00₾",
    newPrice: "12.99₾",
    image: require("../images/burger.png"),
    description: "სტუდენტური ფასი",
  },
  {
    id: 9,
    title: "Night Special",
    oldPrice: "32,00₾",
    newPrice: "21.99₾",
    image: require("../images/snickers.png"),
    description: "ღამის აქცია",
  },
];
