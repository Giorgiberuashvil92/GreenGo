// Mock Data Service for GreenGo
// ეს ფაილი გამოიყენება როცა backend მიუწვდომელია
// სამომავლოდ ბექენდ დეველოპერს მხოლოდ USE_MOCK_DATA = false უნდა დააყენოს

import { restaurantsData } from "../assets/data/restaurantsData";
import { categories } from "../assets/data/categories";
import { promotionalBanners } from "../assets/data/promotionalBanners";
import { orderHistory, currentOrders as localCurrentOrders, previousOrders as localPreviousOrders } from "../assets/data/ordersData";

// ===== CONFIGURATION =====
// შეცვალეთ false-ზე როცა backend მზად იქნება
export const USE_MOCK_DATA = true;

// ===== MOCK USER DATA =====
export interface MockUser {
  _id: string;
  id: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const mockUser: MockUser = {
  _id: "mock-user-001",
  id: "mock-user-001",
  phoneNumber: "+995555123456",
  firstName: "გიორგი",
  lastName: "მამუჩაშვილი",
  name: "გიორგი მამუჩაშვილი",
  email: "giorgi@example.com",
  isVerified: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: new Date().toISOString(),
};

// ===== MOCK RESTAURANTS =====
export interface MockRestaurant {
  _id: string;
  id: string;
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  deliveryFee: number;
  discountedDeliveryFee?: number; // ფასდაკლებული მიტანის ფასი
  deliveryTime: string;
  image: any;
  heroImage: any;
  isActive: boolean;
  isLiked: boolean;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    district?: string;
    postalCode?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  workingHours?: {
    [key: string]: string;
  };
  features?: {
    hasDelivery: boolean;
    hasPickup: boolean;
    hasDineIn: boolean;
    acceptsOnlineOrders: boolean;
    hasParking: boolean;
    isWheelchairAccessible: boolean;
  };
  categories: string[];
  priceRange?: "€" | "€€" | "€€€" | "€€€€";
  cuisine?: string[];
  allergens?: string[];
  paymentMethods?: string[];
}

// Transform local restaurants to mock format
// ზოგიერთ რესტორანს აქვს ფასდაკლება მიტანაზე
const discountMap: { [key: string]: number } = {
  "1": 0, // მაგნოლია - უფასო მიტანა
  "2": 1.99, // მადაგონი - ფასდაკლება
  "3": 0, // ბაზარი - უფასო მიტანა
};

export const mockRestaurants: MockRestaurant[] = restaurantsData.map((restaurant) => ({
  _id: `restaurant-${restaurant.id}`,
  id: restaurant.id,
  name: restaurant.name,
  description: restaurant.description,
  rating: restaurant.rating,
  reviewCount: restaurant.reviewCount,
  deliveryFee: restaurant.deliveryFee,
  discountedDeliveryFee: discountMap[restaurant.id], // ფასდაკლებული ფასი თუ არსებობს
  deliveryTime: restaurant.deliveryTime,
  image: restaurant.image,
  heroImage: restaurant.heroImage,
  isActive: true,
  isLiked: restaurant.isLiked,
  location: restaurant.location,
  contact: restaurant.contact,
  workingHours: restaurant.workingHours,
  features: restaurant.features,
  categories: restaurant.categories,
  priceRange: restaurant.priceRange,
  cuisine: restaurant.cuisine,
  allergens: restaurant.allergens,
  paymentMethods: restaurant.paymentMethods,
}));

// ===== MOCK MENU ITEMS =====
export interface MockMenuItem {
  _id: string;
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: any;
  heroImage?: any;
  category: string;
  isPopular?: boolean;
  restaurantId: string;
  ingredients?: {
    id: string;
    name: string;
    icon: string;
    canRemove: boolean;
    isDefault: boolean;
  }[];
  drinks?: {
    id: string;
    name: string;
    price: number;
    image: string;
  }[];
  isActive: boolean;
}

// Generate menu items from all restaurants
export const mockMenuItems: MockMenuItem[] = restaurantsData.flatMap((restaurant) =>
  restaurant.menuItems.map((item) => ({
    _id: `menu-item-${restaurant.id}-${item.id}`,
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    image: item.image,
    heroImage: item.heroImage,
    category: item.category,
    isPopular: item.isPopular,
    restaurantId: `restaurant-${restaurant.id}`,
    ingredients: item.ingredients,
    drinks: item.drinks,
    isActive: true,
  }))
);

// ===== MOCK ORDERS =====
export interface MockOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}

export interface MockOrder {
  _id: string;
  id: string;
  userId: string;
  restaurantId: {
    _id: string;
    name: string;
    image?: any;
  };
  items: MockOrderItem[];
  totalAmount: number;
  deliveryFee: number;
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivering" | "delivered" | "cancelled";
  paymentMethod: "card" | "cash" | "greengo_balance";
  deliveryAddress: {
    street: string;
    city: string;
    coordinates: { lat: number; lng: number };
    instructions?: string;
  };
  estimatedDelivery: string;
  createdAt: string;
  updatedAt: string;
}

// Generate mock orders based on existing order history
export const mockOrders: MockOrder[] = [
  // Current orders (active)
  {
    _id: "order-001",
    id: "order-001",
    userId: "mock-user-001",
    restaurantId: {
      _id: "restaurant-1",
      name: "მაგნოლია",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
    },
    items: [
      { menuItemId: "menu-item-1-1", name: "პიცა პეპერონი", price: 25.0, quantity: 1 },
      { menuItemId: "menu-item-1-2", name: "პიცა ოთხი ყველი", price: 28.0, quantity: 1 },
    ],
    totalAmount: 53.0,
    deliveryFee: 4.99,
    status: "preparing",
    paymentMethod: "card",
    deliveryAddress: {
      street: "რუსთაველის გამზირი 42",
      city: "თბილისი",
      coordinates: { lat: 41.7151, lng: 44.8271 },
      instructions: "მე-3 სართული",
    },
    estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "order-002",
    id: "order-002",
    userId: "mock-user-001",
    restaurantId: {
      _id: "restaurant-4",
      name: "მაკ შაურმა",
      image: require("../assets/images/makshaurma.png"),
    },
    items: [
      { menuItemId: "menu-item-4-1", name: "მაკ შაურმა სტანდარტული", price: 14.0, quantity: 2 },
    ],
    totalAmount: 28.0,
    deliveryFee: 4.99,
    status: "delivering",
    paymentMethod: "cash",
    deliveryAddress: {
      street: "პეკინის ქუჩა 15",
      city: "თბილისი",
      coordinates: { lat: 41.72, lng: 44.83 },
    },
    estimatedDelivery: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Previous orders (completed)
  {
    _id: "order-003",
    id: "order-003",
    userId: "mock-user-001",
    restaurantId: {
      _id: "restaurant-1",
      name: "მაგნოლია",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
    },
    items: [
      { menuItemId: "menu-item-1-3", name: "ლობიანი", price: 12.5, quantity: 2 },
      { menuItemId: "menu-item-1-4", name: "ხაჭაპური აჭარული", price: 15.0, quantity: 1 },
    ],
    totalAmount: 40.0,
    deliveryFee: 4.99,
    status: "delivered",
    paymentMethod: "card",
    deliveryAddress: {
      street: "წერეთლის გამზირი 120",
      city: "თბილისი",
      coordinates: { lat: 41.71, lng: 44.82 },
    },
    estimatedDelivery: "2024-12-23T14:30:00.000Z",
    createdAt: "2024-12-23T13:00:00.000Z",
    updatedAt: "2024-12-23T14:25:00.000Z",
  },
  {
    _id: "order-004",
    id: "order-004",
    userId: "mock-user-001",
    restaurantId: {
      _id: "restaurant-2",
      name: "მადაგონი",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
    },
    items: [
      { menuItemId: "menu-item-2-6", name: "ბურგერი კლასიკური", price: 22.0, quantity: 1 },
      { menuItemId: "menu-item-2-7", name: "პასტა კარბონარა", price: 19.5, quantity: 1 },
    ],
    totalAmount: 41.5,
    deliveryFee: 3.99,
    status: "delivered",
    paymentMethod: "greengo_balance",
    deliveryAddress: {
      street: "ჭავჭავაძის გამზირი 55",
      city: "თბილისი",
      coordinates: { lat: 41.715, lng: 44.825 },
    },
    estimatedDelivery: "2024-12-22T19:00:00.000Z",
    createdAt: "2024-12-22T18:00:00.000Z",
    updatedAt: "2024-12-22T18:55:00.000Z",
  },
  {
    _id: "order-005",
    id: "order-005",
    userId: "mock-user-001",
    restaurantId: {
      _id: "restaurant-3",
      name: "ბაზარი",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
    },
    items: [
      { menuItemId: "menu-item-3-8", name: "შაურმა", price: 16.0, quantity: 3 },
    ],
    totalAmount: 48.0,
    deliveryFee: 2.99,
    status: "delivered",
    paymentMethod: "card",
    deliveryAddress: {
      street: "კოსტავას ქუჩა 77",
      city: "თბილისი",
      coordinates: { lat: 41.718, lng: 44.829 },
    },
    estimatedDelivery: "2024-12-21T20:30:00.000Z",
    createdAt: "2024-12-21T19:30:00.000Z",
    updatedAt: "2024-12-21T20:25:00.000Z",
  },
  {
    _id: "order-006",
    id: "order-006",
    userId: "mock-user-001",
    restaurantId: {
      _id: "restaurant-4",
      name: "მაკ შაურმა",
      image: require("../assets/images/makshaurma.png"),
    },
    items: [
      { menuItemId: "menu-item-4-3", name: "მაკ შაურმა დიდი", price: 16.0, quantity: 1 },
      { menuItemId: "menu-item-4-5", name: "ფრი და სტო", price: 8.0, quantity: 1 },
    ],
    totalAmount: 24.0,
    deliveryFee: 4.99,
    status: "cancelled",
    paymentMethod: "cash",
    deliveryAddress: {
      street: "თამარ მეფის გამზირი 12",
      city: "თბილისი",
      coordinates: { lat: 41.7135, lng: 44.8265 },
    },
    estimatedDelivery: "2024-12-20T13:00:00.000Z",
    createdAt: "2024-12-20T12:00:00.000Z",
    updatedAt: "2024-12-20T12:30:00.000Z",
  },
];

// ===== MOCK COURIER =====
export interface MockCourier {
  _id: string;
  name: string;
  phoneNumber: string;
  status: "available" | "busy" | "offline";
  currentLocation: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  vehicleType: "bicycle" | "motorcycle" | "car";
}

export const mockCourier: MockCourier = {
  _id: "courier-001",
  name: "დავით კვარაცხელია",
  phoneNumber: "+995555987654",
  status: "busy",
  currentLocation: {
    type: "Point",
    coordinates: [44.825, 41.717], // near Tbilisi center
  },
  vehicleType: "motorcycle",
};

// ===== MOCK TRACKING DATA =====
export const getMockTrackingData = (orderId: string) => {
  const order = mockOrders.find((o) => o._id === orderId);
  if (!order) return null;

  const restaurant = mockRestaurants.find(
    (r) => r._id === order.restaurantId._id
  );

  return {
    order: {
      _id: order._id,
      status: order.status,
      estimatedDelivery: order.estimatedDelivery,
      deliveryAddress: order.deliveryAddress,
      items: order.items,
      totalAmount: order.totalAmount,
      deliveryFee: order.deliveryFee,
    },
    restaurant: restaurant
      ? {
          _id: restaurant._id,
          name: restaurant.name,
          location: restaurant.location,
          image: restaurant.image,
        }
      : null,
    courier:
      order.status === "delivering"
        ? mockCourier
        : null,
  };
};

// ===== MOCK API FUNCTIONS =====
export const mockApiService = {
  // Restaurants
  getRestaurants: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }) => {
    let filtered = [...mockRestaurants];

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(searchLower) ||
          r.description.toLowerCase().includes(searchLower)
      );
    }

    if (params?.category) {
      filtered = filtered.filter((r) =>
        r.categories.includes(params.category!)
      );
    }

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        data: paginatedData,
        total: filtered.length,
        page,
        limit,
      },
    };
  },

  getRestaurant: async (id: string) => {
    const restaurant = mockRestaurants.find(
      (r) => r._id === id || r.id === id || r._id === `restaurant-${id}`
    );
    return {
      success: !!restaurant,
      data: restaurant || null,
      error: restaurant ? undefined : { code: "NOT_FOUND", details: "რესტორნი ვერ მოიძებნა" },
    };
  },

  // Menu Items
  getMenuItems: async (params?: {
    restaurantId?: string;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    let filtered = [...mockMenuItems];

    if (params?.restaurantId) {
      const restaurantId = params.restaurantId;
      filtered = filtered.filter(
        (item) =>
          item.restaurantId === restaurantId ||
          item.restaurantId === `restaurant-${restaurantId}`
      );
    }

    if (params?.category) {
      filtered = filtered.filter((item) => item.category === params.category);
    }

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          (item.description && item.description.toLowerCase().includes(searchLower))
      );
    }

    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        data: paginatedData,
        total: filtered.length,
        page,
        limit,
      },
    };
  },

  getMenuItem: async (id: string) => {
    const item = mockMenuItems.find(
      (m) => m._id === id || m.id === id
    );
    return {
      success: !!item,
      data: item || null,
      error: item ? undefined : { code: "NOT_FOUND", details: "პროდუქტი ვერ მოიძებნა" },
    };
  },

  // Orders
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
  }) => {
    let filtered = [...mockOrders];

    if (params?.userId) {
      filtered = filtered.filter((o) => o.userId === params.userId || o.userId === "mock-user-001");
    }

    if (params?.status) {
      filtered = filtered.filter((o) => o.status === params.status);
    }

    // Sort by createdAt descending
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        data: paginatedData,
        total: filtered.length,
        page,
        limit,
      },
    };
  },

  getOrder: async (id: string) => {
    const order = mockOrders.find((o) => o._id === id || o.id === id);
    return {
      success: !!order,
      data: order || null,
      error: order ? undefined : { code: "NOT_FOUND", details: "შეკვეთა ვერ მოიძებნა" },
    };
  },

  createOrder: async (orderData: any) => {
    const newOrder: MockOrder = {
      _id: `order-${Date.now()}`,
      id: `order-${Date.now()}`,
      userId: orderData.userId || "mock-user-001",
      restaurantId: {
        _id: orderData.restaurantId,
        name: mockRestaurants.find((r) => r._id === orderData.restaurantId || r.id === orderData.restaurantId)?.name || "რესტორანი",
        image: mockRestaurants.find((r) => r._id === orderData.restaurantId || r.id === orderData.restaurantId)?.image,
      },
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      deliveryFee: orderData.deliveryFee,
      status: "pending",
      paymentMethod: orderData.paymentMethod,
      deliveryAddress: orderData.deliveryAddress,
      estimatedDelivery: orderData.estimatedDelivery || new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockOrders.unshift(newOrder);
    
    return {
      success: true,
      data: newOrder,
    };
  },

  updateOrderStatus: async (id: string, status: string) => {
    const orderIndex = mockOrders.findIndex((o) => o._id === id || o.id === id);
    if (orderIndex === -1) {
      return {
        success: false,
        error: { code: "NOT_FOUND", details: "შეკვეთა ვერ მოიძებნა" },
      };
    }
    
    mockOrders[orderIndex] = {
      ...mockOrders[orderIndex],
      status: status as MockOrder["status"],
      updatedAt: new Date().toISOString(),
    };
    
    return {
      success: true,
      data: mockOrders[orderIndex],
    };
  },

  getOrderTracking: async (id: string) => {
    const trackingData = getMockTrackingData(id);
    return {
      success: !!trackingData,
      data: trackingData,
      error: trackingData ? undefined : { code: "NOT_FOUND", details: "ტრეკინგის მონაცემები ვერ მოიძებნა" },
    };
  },

  assignCourierToOrder: async (orderId: string, _courierId?: string) => {
    const orderIndex = mockOrders.findIndex((o) => o._id === orderId);
    if (orderIndex === -1) {
      return {
        success: false,
        error: { code: "NOT_FOUND", details: "შეკვეთა ვერ მოიძებნა" },
      };
    }
    
    return {
      success: true,
      data: {
        order: mockOrders[orderIndex],
        courier: mockCourier,
      },
    };
  },

  // Auth
  sendVerificationCode: async (_phoneNumber: string, _countryCode: string) => {
    // Mock verification - always succeeds
    return {
      success: true,
      message: "კოდი გაიგზავნა",
      code: "1234", // For testing purposes
    };
  },

  verifyCode: async (phoneNumber: string, verificationCode: string) => {
    // Mock verification - accepts any code
    if (verificationCode.length >= 4) {
      return {
        success: true,
        access_token: "mock-jwt-token-" + Date.now(),
        user: {
          ...mockUser,
          phoneNumber,
        },
        isNewUser: false,
      };
    }
    throw new Error("არასწორი კოდი");
  },

  getProfile: async () => {
    return {
      success: true,
      data: mockUser,
    };
  },

  verifyToken: async () => {
    return {
      success: true,
      data: { valid: true, user: mockUser },
    };
  },

  completeRegistration: async (firstName: string, lastName: string, email: string) => {
    const updatedUser = {
      ...mockUser,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
    };
    return {
      success: true,
      data: updatedUser,
    };
  },

  // Categories
  getCategories: async () => {
    return {
      success: true,
      data: categories,
    };
  },

  // Promotional Banners
  getPromotionalBanners: async () => {
    return {
      success: true,
      data: promotionalBanners,
    };
  },
};

// ===== RECENTLY ORDERED RESTAURANTS =====
// რესტორნები რომლებზეც ბოლოს შეკვეთა გაკეთდა
export const getRecentlyOrderedRestaurants = (): MockRestaurant[] => {
  // მივიღოთ ბოლო შეკვეთებიდან unique restaurant IDs
  const recentOrderIds = mockOrders
    .filter((order) => ["delivered", "cancelled"].includes(order.status))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((order) => order.restaurantId._id)
    .filter((id, index, self) => self.indexOf(id) === index) // unique
    .slice(0, 5); // მაქსიმუმ 5 რესტორანი

  // მივიღოთ რესტორნები
  return recentOrderIds
    .map((id) => mockRestaurants.find((r) => r._id === id))
    .filter((r): r is MockRestaurant => r !== undefined);
};

// ===== EXPORT CATEGORIES AND BANNERS =====
export { categories, promotionalBanners };
export { orderHistory, localCurrentOrders as currentOrders, localPreviousOrders as previousOrders };

