export interface FlowerShop {
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

export const flowersData: FlowerShop[] = [
  {
    id: "flower-1",
    name: "ფლორა",
    description: "ყვავილების მაღაზია ნებისმიერი შემთხვევისთვის",
    rating: 4.8,
    reviewCount: 156,
    deliveryFee: 5.99,
    deliveryTime: "30-45",
    image: require("../images/magnolia.png"),
    isActive: true,
    category: "ყვავილები",
  },
  {
    id: "flower-2",
    name: "როზა",
    description: "ვარდების სპეციალისტი",
    rating: 4.9,
    reviewCount: 234,
    deliveryFee: 4.99,
    deliveryTime: "25-40",
    image: require("../images/burger.png"),
    isActive: true,
    category: "ყვავილები",
  },
  {
    id: "flower-3",
    name: "ბუკეტი",
    description: "უნიკალური თაიგულები",
    rating: 4.7,
    reviewCount: 89,
    deliveryFee: 6.99,
    deliveryTime: "40-55",
    image: require("../images/snickers.png"),
    isActive: true,
    category: "ყვავილები",
  },
  {
    id: "flower-4",
    name: "გარდენია",
    description: "ბაღის ყვავილები და მცენარეები",
    rating: 4.6,
    reviewCount: 67,
    deliveryFee: 3.99,
    deliveryTime: "35-50",
    image: require("../images/magnolia.png"),
    isActive: true,
    category: "ყვავილები",
  },
  {
    id: "flower-5",
    name: "ორქიდეა",
    description: "ეგზოტიკური ყვავილები",
    rating: 4.5,
    reviewCount: 45,
    deliveryFee: 7.99,
    deliveryTime: "45-60",
    image: require("../images/burger.png"),
    isActive: true,
    category: "ყვავილები",
  },
];

