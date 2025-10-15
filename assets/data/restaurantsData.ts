export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  isPopular?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  deliveryFee: number;
  image: any;
  deliveryTime: string;
  heroImage: any;
  menuItems: MenuItem[];
  isLiked: boolean;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    district?: string;
    postalCode?: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  workingHours: {
    [key: string]: string; // "monday": "09:00 - 23:00"
  };
  features: {
    hasDelivery: boolean;
    hasPickup: boolean;
    hasDineIn: boolean;
    acceptsOnlineOrders: boolean;
    hasParking: boolean;
    isWheelchairAccessible: boolean;
  };
  categories: string[];
  priceRange: "€" | "€€" | "€€€" | "€€€€";
  cuisine: string[];
  allergens: string[];
  paymentMethods: string[];
}

export const restaurantsData: Restaurant[] = [
  {
    id: "1",
    name: "მაგნოლია",
    description: "ქართული კულინარია და ევროპული კერძები",
    rating: 4.6,
    reviewCount: 29,
    deliveryFee: 4.99,
    deliveryTime: "20-30",
    image: require("../images/magnolia.png"),
    heroImage:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
    isLiked: true,
    location: {
      latitude: 41.7151,
      longitude: 44.8271,
      address: "1 ზაქარია ფალიაშვილის ქუჩა",
      city: "თბილისი",
      district: "ცენტრი",
      postalCode: "0108",
    },
    contact: {
      phone: "+995 32 2 123 456",
      email: "info@magnolia.ge",
      website: "www.magnolia.ge",
    },
    workingHours: {
      monday: "09:00 - 23:00",
      tuesday: "09:00 - 23:00",
      wednesday: "09:00 - 23:00",
      thursday: "09:00 - 23:00",
      friday: "09:00 - 24:00",
      saturday: "10:00 - 24:00",
      sunday: "10:00 - 22:00",
    },
    features: {
      hasDelivery: true,
      hasPickup: true,
      hasDineIn: true,
      acceptsOnlineOrders: true,
      hasParking: true,
      isWheelchairAccessible: true,
    },
    categories: ["ქართული", "ევროპული", "პიცა"],
    priceRange: "€€",
    cuisine: ["ქართული", "იტალიური", "ევროპული"],
    allergens: ["გლუტენი", "ლაქტოზი", "ხახვი"],
    paymentMethods: ["ნაღდი", "ბარათი", "GreenGo ბალანსი"],
    menuItems: [
      {
        id: "1",
        name: "პიცა პეპერონი",
        description:
          "საფირმო პიცის ცომი, ყველი მოცარელა, პეპერონი, პიცის სპეც სოუსი, ორეგანო. ზომა: 33 სმ 6 ნაჭიანი",
        price: 25.0,
        image:
          "https://unsplash.com/photos/a-pepperoni-pizza-cut-into-slices-on-a-wooden-table-mIESW2fwM3s",
        category: "ყველაზე პოპულარული",
        isPopular: true,
      },
      {
        id: "2",
        name: "პიცა ოთხი ყველი",
        description:
          "საფირმო პიცის ცომი, მოცარელა, ღორმოს ყველი, პარმეზანი, როკფორი ყველი, პიცის სოუსი",
        price: 28.0,
        image:
          "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop",
        category: "ყველაზე პოპულარული",
        isPopular: true,
      },
      {
        id: "3",
        name: "ლობიანი",
        description:
          "ქართული ტრადიციული ლობიანი, ბოსტნეულით და ხორცით, ფუნთუშის ცომში",
        price: 12.5,
        image:
          "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop",
        category: "ცომეული",
        isPopular: false,
      },
      {
        id: "4",
        name: "ხაჩაპური აჭარული",
        description: "ტრადიციული აჭარული ხაჩაპური, ყველითა და კარაქით",
        price: 15.0,
        image:
          "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop",
        category: "ცომეული",
        isPopular: false,
      },
      {
        id: "5",
        name: "ხინკალი",
        description: "ტრადიციული ქართული ხინკალი, ხორცით და ბოსტნეულით",
        price: 18.0,
        image:
          "https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400&h=300&fit=crop",
        category: "ცომეული",
        isPopular: false,
      },
    ],
  },
  {
    id: "2",
    name: "მადაგონი",
    description: "ევროპული და აზიური კულინარია",
    rating: 4.5,
    reviewCount: 42,
    image: require("../images/kfc.png"),
    deliveryFee: 3.99,
    deliveryTime: "25-35",
    heroImage:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
    isLiked: false,
    location: {
      latitude: 41.72,
      longitude: 44.83,
      address: "15 რუსთაველის გამზირი",
      city: "თბილისი",
      district: "ვაკე",
      postalCode: "0179",
    },
    contact: {
      phone: "+995 32 2 234 567",
      email: "info@madagoni.ge",
      website: "www.madagoni.ge",
    },
    workingHours: {
      monday: "08:00 - 22:00",
      tuesday: "08:00 - 22:00",
      wednesday: "08:00 - 22:00",
      thursday: "08:00 - 22:00",
      friday: "08:00 - 23:00",
      saturday: "09:00 - 23:00",
      sunday: "09:00 - 21:00",
    },
    features: {
      hasDelivery: true,
      hasPickup: true,
      hasDineIn: true,
      acceptsOnlineOrders: true,
      hasParking: false,
      isWheelchairAccessible: false,
    },
    categories: ["ევროპული", "აზიური", "ფასტ-ფუდი"],
    priceRange: "€€€",
    cuisine: ["ევროპული", "ჩინური", "იაპონური"],
    allergens: ["გლუტენი", "ლაქტოზი", "სოია", "ხახვი"],
    paymentMethods: ["ნაღდი", "ბარათი", "GreenGo ბალანსი"],
    menuItems: [
      {
        id: "6",
        name: "ბურგერი კლასიკური",
        description: "ქათმის ხორცი, სალათი, პომიდორი, ბეკონი, საფირმო სოუსი",
        price: 22.0,
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
        category: "ყველაზე პოპულარული",
        isPopular: true,
      },
      {
        id: "7",
        name: "პასტა კარბონარა",
        description: "სპაგეტი, ბეკონი, კვერცხი, პარმეზანი, ნაღები",
        price: 19.5,
        image:
          "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
        category: "ყველაზე პოპულარული",
        isPopular: true,
      },
    ],
  },
  {
    id: "3",
    name: "ბაზარი",
    description: "აზიური და შუა აღმოსავლური კულინარია",
    rating: 4.7,
    reviewCount: 67,
    deliveryFee: 2.99,
    deliveryTime: "30-40",
    image: require("../images/eskizi.png"),
    heroImage:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
    isLiked: true,
    location: {
      latitude: 41.71,
      longitude: 44.82,
      address: "8 აღმაშენებლის გამზირი",
      city: "თბილისი",
      district: "ისანი",
      postalCode: "0159",
    },
    contact: {
      phone: "+995 32 2 345 678",
      email: "info@bazari.ge",
      website: "www.bazari.ge",
    },
    workingHours: {
      monday: "10:00 - 22:00",
      tuesday: "10:00 - 22:00",
      wednesday: "10:00 - 22:00",
      thursday: "10:00 - 22:00",
      friday: "10:00 - 23:00",
      saturday: "11:00 - 23:00",
      sunday: "11:00 - 21:00",
    },
    features: {
      hasDelivery: true,
      hasPickup: true,
      hasDineIn: true,
      acceptsOnlineOrders: true,
      hasParking: true,
      isWheelchairAccessible: true,
    },
    categories: ["აზიური", "შუა აღმოსავლური", "ჰალალ"],
    priceRange: "€€",
    cuisine: ["თურქული", "არაბული", "პერსიული"],
    allergens: ["გლუტენი", "ხახვი", "ხახვი"],
    paymentMethods: ["ნაღდი", "ბარათი", "GreenGo ბალანსი"],
    menuItems: [
      {
        id: "8",
        name: "შაურმა",
        description: "ქათმის ხორცი, სალათი, პომიდორი, ბოლღარში, საფირმო სოუსი",
        price: 16.0,
        image:
          "https://images.unsplash.com/photo-1565299585323-38174c4a5eae?w=400&h=300&fit=crop",
        category: "ყველაზე პოპულარული",
        isPopular: true,
      },
    ],
  },
];
