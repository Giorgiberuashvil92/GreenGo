export interface OrderItem {
  id: string;
  name: string;
  restaurant: string;
  price: number;
  image: string;
  status: "current" | "previous";
  orderDate?: string;
  deliveryDate?: string;
}

export const currentOrders: OrderItem[] = [
  {
    id: "1",
    name: "პიცა პეპერონი",
    restaurant: "მაგნოლია",
    price: 21.8,
    image: require("../images/burger.png"),
    status: "current",
    orderDate: "2024-01-15",
    deliveryDate: "2024-01-15",
  },
  {
    id: "2",
    name: "ლობიანი",
    restaurant: "მაგნოლია",
    price: 21.8,
    image: require("../images/burger.png"),
    status: "current",
    orderDate: "2024-01-15",
    deliveryDate: "2024-01-15",
  },
  {
    id: "3",
    name: "პიცა პეპერონი",
    restaurant: "მაგნოლია",
    price: 21.8,
    image: require("../images/burger.png"),
    status: "current",
    orderDate: "2024-01-15",
    deliveryDate: "2024-01-15",
  },
];

export const previousOrders: OrderItem[] = [
  {
    id: "4",
    name: "პიცა პეპერონი",
    restaurant: "მაგნოლია",
    price: 21.8,
    image: require("../images/burger.png"),
    status: "previous",
    orderDate: "2024-01-14",
    deliveryDate: "2024-01-14",
  },
  {
    id: "5",
    name: "პიცა პეპერონი",
    restaurant: "მაგნოლია",
    price: 21.8,
    image: require("../images/burger.png"),
    status: "previous",
    orderDate: "2024-01-13",
    deliveryDate: "2024-01-13",
  },
  {
    id: "6",
    name: "პიცა პეპერონი",
    restaurant: "მაგნოლია",
    price: 21.8,
    image: require("../images/burger.png"),
    status: "previous",
    orderDate: "2024-01-12",
    deliveryDate: "2024-01-12",
  },
];

export const allOrders = [...currentOrders, ...previousOrders];
