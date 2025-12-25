export interface HandmadeShop {
  id: string;
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  deliveryFee: number;
  deliveryTime: string;
  image: any;
  isActive: boolean;
  category: string;
}

export const handmadeData: HandmadeShop[] = [
  {
    id: "handmade-1",
    name: "არტ სტუდიო",
    description: "ხელნაკეთი სამკაულები და აქსესუარები",
    rating: 4.9,
    reviewCount: 178,
    deliveryFee: 4.99,
    deliveryTime: "1-2 დღე",
    image: require("../images/magnolia.png"),
    isActive: true,
    category: "ხელნაკეთი",
  },
  {
    id: "handmade-2",
    name: "კერამიკა",
    description: "ხელნაკეთი კერამიკული ნივთები",
    rating: 4.7,
    reviewCount: 123,
    deliveryFee: 6.99,
    deliveryTime: "2-3 დღე",
    image: require("../images/burger.png"),
    isActive: true,
    category: "ხელნაკეთი",
  },
  {
    id: "handmade-3",
    name: "ქსოვა",
    description: "ხელით ნაქსოვი ტანსაცმელი",
    rating: 4.8,
    reviewCount: 95,
    deliveryFee: 5.99,
    deliveryTime: "3-5 დღე",
    image: require("../images/snickers.png"),
    isActive: true,
    category: "ხელნაკეთი",
  },
  {
    id: "handmade-4",
    name: "ხის ნაკეთობები",
    description: "ხელნაკეთი ხის დეკორაციები",
    rating: 4.6,
    reviewCount: 67,
    deliveryFee: 8.99,
    deliveryTime: "2-4 დღე",
    image: require("../images/magnolia.png"),
    isActive: true,
    category: "ხელნაკეთი",
  },
  {
    id: "handmade-5",
    name: "სანთლები",
    description: "არომატული ხელნაკეთი სანთლები",
    rating: 4.5,
    reviewCount: 89,
    deliveryFee: 3.99,
    deliveryTime: "1-2 დღე",
    image: require("../images/burger.png"),
    isActive: true,
    category: "ხელნაკეთი",
  },
];

