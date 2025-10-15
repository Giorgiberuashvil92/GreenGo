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

// Order history data for profile screen
export interface OrderHistoryItem {
  id: string;
  restaurantName: string;
  items: string[];
  totalAmount: number;
  orderDate: string;
  status: "delivered" | "cancelled" | "refunded";
}

export const orderHistory: OrderHistoryItem[] = [
  {
    id: "1",
    restaurantName: "მაგნოლია",
    items: ["პიცა პეპერონი", "კოკა-კოლა"],
    totalAmount: 25.5,
    orderDate: "2024-01-15",
    status: "delivered",
  },
  {
    id: "2",
    restaurantName: "KFC",
    items: ["ცივილკი", "ფრი"],
    totalAmount: 18.9,
    orderDate: "2024-01-14",
    status: "delivered",
  },
  {
    id: "3",
    restaurantName: "მაგნოლია",
    items: ["ლობიანი", "წყალი"],
    totalAmount: 12.3,
    orderDate: "2024-01-13",
    status: "delivered",
  },
  {
    id: "4",
    restaurantName: "პეპერონი",
    items: ["პასტა კარბონარა"],
    totalAmount: 22.0,
    orderDate: "2024-01-12",
    status: "delivered",
  },
  {
    id: "5",
    restaurantName: "მაგნოლია",
    items: ["პიცა მარგარიტა", "ფანტა"],
    totalAmount: 20.8,
    orderDate: "2024-01-11",
    status: "delivered",
  },
  {
    id: "6",
    restaurantName: "KFC",
    items: ["ბიგ მაკი", "ფრი", "კოკა-კოლა"],
    totalAmount: 28.5,
    orderDate: "2024-01-10",
    status: "delivered",
  },
  {
    id: "7",
    restaurantName: "პეპერონი",
    items: ["რისოტო", "წყალი"],
    totalAmount: 19.9,
    orderDate: "2024-01-09",
    status: "delivered",
  },
  {
    id: "8",
    restaurantName: "მაგნოლია",
    items: ["პიცა ოთხი ყველი", "ფანტა"],
    totalAmount: 24.2,
    orderDate: "2024-01-08",
    status: "delivered",
  },
  {
    id: "9",
    restaurantName: "KFC",
    items: ["ცივილკი ბაკეტი"],
    totalAmount: 35.0,
    orderDate: "2024-01-07",
    status: "delivered",
  },
  {
    id: "10",
    restaurantName: "პეპერონი",
    items: ["ლაზანია", "წყალი"],
    totalAmount: 26.5,
    orderDate: "2024-01-06",
    status: "delivered",
  },
  {
    id: "11",
    restaurantName: "მაგნოლია",
    items: ["პიცა პეპერონი", "კოკა-კოლა"],
    totalAmount: 25.5,
    orderDate: "2024-01-05",
    status: "delivered",
  },
  {
    id: "12",
    restaurantName: "KFC",
    items: ["ცივილკი", "ფრი", "ფანტა"],
    totalAmount: 22.8,
    orderDate: "2024-01-04",
    status: "delivered",
  },
  {
    id: "13",
    restaurantName: "პეპერონი",
    items: ["პასტა ბოლონეზე"],
    totalAmount: 23.0,
    orderDate: "2024-01-03",
    status: "delivered",
  },
  {
    id: "14",
    restaurantName: "მაგნოლია",
    items: ["ლობიანი", "წყალი"],
    totalAmount: 12.3,
    orderDate: "2024-01-02",
    status: "delivered",
  },
  {
    id: "15",
    restaurantName: "KFC",
    items: ["ცივილკი ბაკეტი", "კოკა-კოლა"],
    totalAmount: 38.5,
    orderDate: "2024-01-01",
    status: "delivered",
  },
  {
    id: "16",
    restaurantName: "პეპერონი",
    items: ["რისოტო", "ფანტა"],
    totalAmount: 22.9,
    orderDate: "2023-12-31",
    status: "delivered",
  },
];

// Get total order count
export const getTotalOrderCount = (): number => {
  return orderHistory.length;
};

// Get recent orders for profile screen (last 5 orders)
export const getRecentOrders = (): OrderHistoryItem[] => {
  return orderHistory.slice(0, 5);
};
