export interface FoodItem {
  id: string;
  name: string;
  restaurant: string;
  price: number;
  deliveryTime: string;
  rating: number;
  image: any;
  isFavorite: boolean;
}

export const foodItems: FoodItem[] = [
  {
    id: "1",
    name: "პიცა",
    restaurant: "მაგნოლია",
    price: 4.99,
    deliveryTime: "20-30 წუთი",
    rating: 4.6,
    image: require("../images/eskizi.png"),
    isFavorite: false,
  },
  {
    id: "2",
    name: "ხინკალი",
    restaurant: "მადაგონი",
    price: 4.99,
    deliveryTime: "20-30 წუთი",
    rating: 4.6,
    image: require("../images/magnolia.png"),
    isFavorite: false,
  },
  {
    id: "3",
    name: "ხაჩაპური",
    restaurant: "ბაზარი",
    price: 4.99,
    deliveryTime: "20-30 წუთი",
    rating: 4.6,
    image: require("../images/kfc.png"),
    isFavorite: false,
  },
];
