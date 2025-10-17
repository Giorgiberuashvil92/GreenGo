export interface Ingredient {
  id: string;
  name: string;
  icon: string;
  canRemove: boolean;
  isDefault: boolean;
}

export interface Drink {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: any; // Can be either a require() object or URL string
  category: string;
  isPopular?: boolean;
  heroImage?: any; // For detailed product view
  ingredients?: Ingredient[];
  drinks?: Drink[];
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
  heroImage: any; // Can be either a require() object or URL string
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
        isPopular: true,
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
      {
        id: "6",
        name: "ხაჭაპური იმერული",
        description: "ტრადიციული იმერული ხაჭაპური, ყველითა და კვერცხით",
        price: 16.0,
        image:
          "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop",
        category: "ცომეული",
        isPopular: false,
      },
      {
        id: "7",
        name: "კაპარი",
        description: "ქართული ტრადიციული კაპარი, ხორცითა და ბოსტნეულით",
        price: 14.0,
        image:
          "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop",
        category: "ცივი კერძები",
        isPopular: false,
      },
      {
        id: "8",
        name: "პასტრამა",
        description: "ქართული პასტრამა, ხორცითა და სანელებლებით",
        price: 22.0,
        image:
          "https://images.unsplash.com/photo-1565299585323-38174c4a5eae?w=400&h=300&fit=crop",
        category: "ცივი კერძები",
        isPopular: false,
      },
      {
        id: "9",
        name: "ყველი სულუგუნი",
        description: "ქართული ყველი სულუგუნი, ტრადიციული მეთოდით",
        price: 18.0,
        image:
          "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop",
        category: "ცივი კერძები",
        isPopular: false,
      },
      {
        id: "10",
        name: "ხარჩო",
        description: "ქართული ტრადიციული ხარჩო, ხორცითა და ბოსტნეულით",
        price: 20.0,
        image:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
        category: "წვნიანი",
        isPopular: false,
      },
      {
        id: "11",
        name: "წვნიანი ქათმის",
        description: "ქათმის ხორცის წვნიანი, ბოსტნეულითა და სანელებლებით",
        price: 16.0,
        image:
          "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=300&fit=crop",
        category: "წვნიანი",
        isPopular: false,
      },
      {
        id: "12",
        name: "წვნიანი ღორის",
        description: "ღორის ხორცის წვნიანი, ბოსტნეულითა და სანელებლებით",
        price: 18.0,
        image:
          "https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400&h=300&fit=crop",
        category: "წვნიანი",
        isPopular: false,
      },
      {
        id: "13",
        name: "სალათი ქართული",
        description: "ტრადიციული ქართული სალათი, ბოსტნეულითა და ყველით",
        price: 12.0,
        image:
          "https://images.unsplash.com/photo-1565299585323-38174c4a5eae?w=400&h=300&fit=crop",
        category: "სალათი",
        isPopular: false,
      },
      {
        id: "14",
        name: "სალათი ბერძნული",
        description: "ბერძნული სალათი, პომიდორით, კიტრითა და ყველით",
        price: 14.0,
        image:
          "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop",
        category: "სალათი",
        isPopular: false,
      },
      {
        id: "15",
        name: "სალათი ცეზარი",
        description: "კლასიკური ცეზარი სალათი, ყველითა და სპეციალური სოუსით",
        price: 16.0,
        image:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
        category: "სალათი",
        isPopular: false,
      },
      {
        id: "16",
        name: "პასტა კარბონარა",
        description: "სპაგეტი, ბეკონი, კვერცხი, პარმეზანი, ნაღები, სანელებლები",
        price: 22.0,
        image:
          "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
        heroImage:
          "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop",
        category: "პასტა",
        isPopular: false,
        ingredients: [
          {
            id: "1",
            name: "ბეკონი (გარეშე)",
            icon: "bacon",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "2",
            name: "პარმეზანი (გარეშე)",
            icon: "cheese",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "3",
            name: "ნაღები (გარეშე)",
            icon: "cream",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "4",
            name: "შავი პილპილი",
            icon: "pepper",
            canRemove: true,
            isDefault: false,
          },
          {
            id: "5",
            name: "მარილი",
            icon: "salt",
            canRemove: true,
            isDefault: false,
          },
        ],
        drinks: [
          {
            id: "1",
            name: "წითელი ღვინო 0.75ლ",
            price: 25.0,
            image:
              "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=300&fit=crop",
          },
          {
            id: "2",
            name: "თეთრი ღვინო 0.75ლ",
            price: 22.0,
            image:
              "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=300&fit=crop",
          },
          {
            id: "3",
            name: "წყალი 0.5ლ",
            price: 2.0,
            image:
              "https://images.unsplash.com/photo-1548839140-5a7d3a1b1b1b?w=400&h=300&fit=crop",
          },
        ],
      },
      {
        id: "17",
        name: "ყველის ფირფიტა",
        description:
          "ქართული ყველების ასორტი, ყურძენი, თხილის ნაყოფი, ღვინისთვის",
        price: 18.0,
        image:
          "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=300&fit=crop",
        heroImage:
          "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&h=600&fit=crop",
        category: "ცივი კერძები",
        isPopular: false,
        ingredients: [
          {
            id: "1",
            name: "სულუგუნი (გარეშე)",
            icon: "cheese",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "2",
            name: "იმერული ყველი (გარეშე)",
            icon: "cheese",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "3",
            name: "ყურძენი (გარეშე)",
            icon: "grape",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "4",
            name: "თხილის ნაყოფი (გარეშე)",
            icon: "nuts",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "5",
            name: "თაფლი",
            icon: "honey",
            canRemove: true,
            isDefault: false,
          },
        ],
        drinks: [
          {
            id: "1",
            name: "წითელი ღვინო 0.75ლ",
            price: 25.0,
            image:
              "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=300&fit=crop",
          },
          {
            id: "2",
            name: "თეთრი ღვინო 0.75ლ",
            price: 22.0,
            image:
              "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=300&fit=crop",
          },
          {
            id: "3",
            name: "ჩაი ქართული",
            price: 5.0,
            image:
              "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop",
          },
        ],
      },
      {
        id: "18",
        name: "პიცა პეპერონი",
        description:
          "საფირმო პიცის ცომი, ყველი მოცარელა, პეპერონი, პიცის სპეც სოუსი, ორეგანო",
        price: 25.0,
        image:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
        heroImage:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop",
        category: "პიცა",
        isPopular: false,
        ingredients: [
          {
            id: "1",
            name: "პეპერონი (გარეშე)",
            icon: "pepperoni",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "2",
            name: "მოცარელა (გარეშე)",
            icon: "cheese",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "3",
            name: "ორეგანო (გარეშე)",
            icon: "herbs",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "4",
            name: "პიცის სოუსი (გარეშე)",
            icon: "sauce",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "5",
            name: "ყველაფრით",
            icon: "",
            canRemove: false,
            isDefault: true,
          },
        ],
        drinks: [
          {
            id: "1",
            name: "კოლა 0.33ლ",
            price: 3.5,
            image:
              "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop",
          },
          {
            id: "2",
            name: "წყალი 0.5ლ",
            price: 2.0,
            image:
              "https://images.unsplash.com/photo-1548839140-5a7d3a1b1b1b?w=400&h=300&fit=crop",
          },
        ],
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
  {
    id: "4",
    name: "მაკ შაურმა",
    description: "სწრაფი კვება",
    rating: 4.9,
    reviewCount: 29,
    deliveryFee: 4.99,
    deliveryTime: "20-30",
    image: require("../images/makshaurma.png"),
    heroImage: require("../images/makshaurma.png"),
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
        name: "მაკ შაურმა სტანდარტული",
        description:
          "ლავაში, ღორის ხორცი, სალათის ფურცელი, ხახვი, წიწაკის წნილი, კეტჩუპი, მაიონეზი",
        price: 14.0,
        image: require("../images/shaurma.png"),
        heroImage: require("../images/shaurma.png"),
        category: "ყველაზე პოპულარული",
        isPopular: true,
        ingredients: [
          {
            id: "1",
            name: "კეტჩუპი (გარეშე)",
            icon: "ketchup",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "2",
            name: "მაიონეზი (გარეშე)",
            icon: "mayo",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "3",
            name: "ხახვი (გარეშე)",
            icon: "onion",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "4",
            name: "წიწაკის წნილი (გარეშე)",
            icon: "pepper",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "5",
            name: "სალათის ფურცელი",
            icon: "lettuce",
            canRemove: true,
            isDefault: true,
          },
        ],
        drinks: [
          {
            id: "1",
            name: "კოკა-კოლა 0.5ლ",
            price: 3.0,
            image:
              "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop",
          },
          {
            id: "2",
            name: "ფანტა 0.5ლ",
            price: 3.0,
            image:
              "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop",
          },
          {
            id: "3",
            name: "ლუდი 0.5ლ",
            price: 4.0,
            image:
              "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop",
          },
        ],
      },
      {
        id: "2",
        name: "მაკ შაურმა პატარა",
        description:
          "ლავაში, ქათმის ხორცი, სალათის ფურცელი, ხახვი, წიწაკის წნილი, კეტჩუპი, მაიონეზი",
        price: 12.0,
        image: require("../images/shaurma.png"),
        heroImage: require("../images/shaurma.png"),
        category: "ყველაზე პოპულარული",
        isPopular: true,
        ingredients: [
          {
            id: "1",
            name: "კეტჩუპი (გარეშე)",
            icon: "ketchup",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "2",
            name: "მაიონეზი (გარეშე)",
            icon: "mayo",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "3",
            name: "ხახვი (გარეშე)",
            icon: "onion",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "4",
            name: "წიწაკის წნილი (გარეშე)",
            icon: "pepper",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "5",
            name: "სალათის ფურცელი",
            icon: "lettuce",
            canRemove: true,
            isDefault: true,
          },
        ],
        drinks: [
          {
            id: "1",
            name: "კოკა-კოლა 0.5ლ",
            price: 3.0,
            image:
              "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop",
          },
          {
            id: "2",
            name: "ფანტა 0.5ლ",
            price: 3.0,
            image:
              "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop",
          },
          {
            id: "3",
            name: "ლუდი 0.5ლ",
            price: 4.0,
            image:
              "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop",
          },
        ],
      },
      {
        id: "3",
        name: "მაკ შაურმა დიდი",
        description:
          "ლავაში, ღორის ხორცი, სალათის ფურცელი, ხახვი, წიწაკის წნილი, კეტჩუპი, მაიონეზი, ყველი",
        price: 16.0,
        image: require("../images/shaurma.png"),
        heroImage: require("../images/shaurma.png"),
        category: "შაურმა",
        isPopular: false,
        ingredients: [
          {
            id: "1",
            name: "კეტჩუპი (გარეშე)",
            icon: "ketchup",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "2",
            name: "მაიონეზი (გარეშე)",
            icon: "mayo",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "3",
            name: "ხახვი (გარეშე)",
            icon: "onion",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "4",
            name: "წიწაკის წნილი (გარეშე)",
            icon: "pepper",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "5",
            name: "სალათის ფურცელი",
            icon: "lettuce",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "6",
            name: "ყველი",
            icon: "cheese",
            canRemove: true,
            isDefault: false,
          },
        ],
        drinks: [
          {
            id: "1",
            name: "კოკა-კოლა 0.5ლ",
            price: 3.0,
            image:
              "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop",
          },
          {
            id: "2",
            name: "ფანტა 0.5ლ",
            price: 3.0,
            image:
              "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop",
          },
          {
            id: "3",
            name: "ლუდი 0.5ლ",
            price: 4.0,
            image:
              "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop",
          },
        ],
      },
      {
        id: "4",
        name: "ბურგერი კლასიკური",
        description:
          "ბურგერის ბუნი, ღორის ხორცი, სალათი, პომიდორი, ბეკონი, საფირმო სოუსი",
        price: 18.0,
        image: require("../images/shaurma.png"),
        heroImage: require("../images/shaurma.png"),
        category: "ბურგერი",
        isPopular: false,
        ingredients: [
          {
            id: "1",
            name: "სალათი (გარეშე)",
            icon: "lettuce",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "2",
            name: "პომიდორი (გარეშე)",
            icon: "tomato",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "3",
            name: "ბეკონი (გარეშე)",
            icon: "bacon",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "4",
            name: "საფირმო სოუსი (გარეშე)",
            icon: "sauce",
            canRemove: true,
            isDefault: true,
          },
        ],
        drinks: [
          {
            id: "1",
            name: "კოკა-კოლა 0.5ლ",
            price: 3.0,
            image:
              "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop",
          },
          {
            id: "2",
            name: "ლუდი 0.5ლ",
            price: 4.0,
            image:
              "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop",
          },
        ],
      },
      {
        id: "5",
        name: "ფრი და სტო",
        description: "კარტოფილის ფრი, სტო, კეტჩუპი",
        price: 8.0,
        image: require("../images/shaurma.png"),
        heroImage: require("../images/shaurma.png"),
        category: "ფრი და სტო",
        isPopular: false,
        ingredients: [
          {
            id: "1",
            name: "კეტჩუპი (გარეშე)",
            icon: "ketchup",
            canRemove: true,
            isDefault: true,
          },
        ],
        drinks: [
          {
            id: "1",
            name: "კოკა-კოლა 0.5ლ",
            price: 3.0,
            image:
              "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop",
          },
          {
            id: "2",
            name: "ლუდი 0.5ლ",
            price: 4.0,
            image:
              "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop",
          },
        ],
      },
      {
        id: "6",
        name: "მაკ შაურმა სპეციალური",
        description:
          "ლავაში, ღორის ხორცი, სალათის ფურცელი, ხახვი, წიწაკის წნილი, კეტჩუპი, მაიონეზი, ყველი, ბეკონი",
        price: 20.0,
        image: require("../images/shaurma.png"),
        heroImage: require("../images/shaurma.png"),
        category: "შაურმა",
        isPopular: false,
        ingredients: [
          {
            id: "1",
            name: "კეტჩუპი (გარეშე)",
            icon: "ketchup",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "2",
            name: "მაიონეზი (გარეშე)",
            icon: "mayo",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "3",
            name: "ხახვი (გარეშე)",
            icon: "onion",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "4",
            name: "წიწაკის წნილი (გარეშე)",
            icon: "pepper",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "5",
            name: "სალათის ფურცელი",
            icon: "lettuce",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "6",
            name: "ყველი",
            icon: "cheese",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "7",
            name: "ბეკონი",
            icon: "bacon",
            canRemove: true,
            isDefault: false,
          },
        ],
        drinks: [
          {
            id: "1",
            name: "კოკა-კოლა 0.5ლ",
            price: 3.0,
            image:
              "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop",
          },
          {
            id: "2",
            name: "ფანტა 0.5ლ",
            price: 3.0,
            image:
              "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop",
          },
          {
            id: "3",
            name: "ლუდი 0.5ლ",
            price: 4.0,
            image:
              "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop",
          },
        ],
      },
      {
        id: "7",
        name: "მაკ შაურმა - საშუალო",
        description:
          "ლავაში, ღორის ხორცი, სალათის ფურცელი, ხახვი, წიწაკის წნილი, კეტჩუპი, მაიონეზი",
        price: 25.0,
        image:
          "https://images.unsplash.com/photo-1565299585323-38174c4a5eae?w=400&h=300&fit=crop",
        heroImage:
          "https://images.unsplash.com/photo-1565299585323-38174c4a5eae?w=800&h=600&fit=crop",
        category: "შაურმა",
        isPopular: false,
        ingredients: [
          {
            id: "1",
            name: "კეტჩუპი (გარეშე)",
            icon: "ketchup",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "2",
            name: "მაიონეზი (გარეშე)",
            icon: "mayonnaise",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "3",
            name: "ხახვი (გარეშე)",
            icon: "onion",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "4",
            name: "სალათი (გარეშე)",
            icon: "lettuce",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "5",
            name: "წიწაკა (გარეშე)",
            icon: "chili",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "6",
            name: "ყველაფრით",
            icon: "",
            canRemove: false,
            isDefault: true,
          },
        ],
        drinks: [
          {
            id: "1",
            name: "კოლა 0.33ლ",
            price: 3.5,
            image:
              "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop",
          },
          {
            id: "2",
            name: "წყალი 0.5ლ",
            price: 2.0,
            image:
              "https://images.unsplash.com/photo-1548839140-5a7d3a1b1b1b?w=400&h=300&fit=crop",
          },
          {
            id: "3",
            name: "ფანტა 0.33ლ",
            price: 3.5,
            image:
              "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop",
          },
        ],
      },
      {
        id: "8",
        name: "ბურგერი კლასიკური",
        description: "ქათმის ხორცი, სალათი, პომიდორი, ბეკონი, საფირმო სოუსი",
        price: 22.0,
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
        heroImage:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
        category: "ბურგერი",
        isPopular: false,
        ingredients: [
          {
            id: "1",
            name: "ბეკონი (გარეშე)",
            icon: "bacon",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "2",
            name: "პომიდორი (გარეშე)",
            icon: "tomato",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "3",
            name: "სალათი (გარეშე)",
            icon: "lettuce",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "4",
            name: "საფირმო სოუსი (გარეშე)",
            icon: "sauce",
            canRemove: true,
            isDefault: true,
          },
          {
            id: "5",
            name: "ყველაფრით",
            icon: "",
            canRemove: false,
            isDefault: true,
          },
        ],
        drinks: [
          {
            id: "1",
            name: "კოლა 0.33ლ",
            price: 3.5,
            image:
              "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop",
          },
          {
            id: "2",
            name: "წყალი 0.5ლ",
            price: 2.0,
            image:
              "https://images.unsplash.com/photo-1548839140-5a7d3a1b1b1b?w=400&h=300&fit=crop",
          },
        ],
      },
    ],
  },
];
