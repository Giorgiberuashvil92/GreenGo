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
}

export const restaurantsData: Restaurant[] = [
  {
    id: "1",
    name: "რესტორანი მაგნოლია",
    description: "ქართული კულინარია და ევროპული კერძები",
    rating: 4.6,
    reviewCount: 29,
    deliveryFee: 4.99,
    deliveryTime: "20-30",
    image: require("../images/magnolia.png"),
    heroImage:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
    isLiked: true,
    menuItems: [
      {
        id: "1",
        name: "პიცა პეპერონი",
        description:
          "საფირმო პიცის ცომი, ყველი მოცარელა, პეპერონი, პიცის სპეც სოუსი, ორეგანო. ზომა: 33 სმ 6 ნაჭიანი",
        price: 25.0,
        image:
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
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
    name: "რესტორანი მადაგონი",
    description: "ევროპული და აზიური კულინარია",
    rating: 4.5,
    reviewCount: 42,
    image: require("../images/kfc.png"),
    deliveryFee: 3.99,
    deliveryTime: "25-35",
    heroImage:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
    isLiked: false,
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
    name: "რესტორანი ბაზარი",
    description: "აზიური და შუა აღმოსავლური კულინარია",
    rating: 4.7,
    reviewCount: 67,
    deliveryFee: 2.99,
    deliveryTime: "30-40",
    image: require("../images/eskizi.png"),
    heroImage:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
    isLiked: true,
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
