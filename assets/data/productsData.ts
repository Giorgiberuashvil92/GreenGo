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

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  heroImage: string;
  ingredients: Ingredient[];
  drinks: Drink[];
  restaurant: string;
  category: string;
}

export const productsData: Product[] = [
  {
    id: "1",
    name: "მაკ შაურმა - საშუალო",
    price: 25.0,
    description:
      "ლავაში, ღორის ხორცი, სალათის ფურცელი, ხახვი, წიწაკის წნილი, კეტჩუპი, მაიონეზი",
    image:
      "https://images.unsplash.com/photo-1565299585323-38174c4a5eae?w=400&h=300&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1565299585323-38174c4a5eae?w=800&h=600&fit=crop",
    restaurant: "მაკშაუ",
    category: "შაურმა",
    ingredients: [
      {
        id: "1",
        name: "კეჩუპი (გარეშე)",
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
        isDefault: false,
      },
    ],
    drinks: [
      {
        id: "1",
        name: "კოლა 0.33ლ",
        price: 3.5,
        image:
          "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=200&h=200&fit=crop",
      },
      {
        id: "2",
        name: "წყალი 0.5ლ",
        price: 2.0,
        image:
          "https://images.unsplash.com/photo-1548839140-6c7b2a6d4b3b?w=200&h=200&fit=crop",
      },
      {
        id: "3",
        name: "ფანტა 0.33ლ",
        price: 3.5,
        image:
          "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=200&h=200&fit=crop",
      },
    ],
  },
  {
    id: "2",
    name: "პიცა პეპერონი",
    price: 25.0,
    description:
      "საფირმო პიცის ცომი, ყველი მოცარელა, პეპერონი, პიცის სპეც სოუსი, ორეგანო",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop",
    restaurant: "მაგნოლია",
    category: "პიცა",
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
        isDefault: false,
      },
    ],
    drinks: [
      {
        id: "1",
        name: "კოლა 0.33ლ",
        price: 3.5,
        image:
          "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=200&h=200&fit=crop",
      },
      {
        id: "2",
        name: "წყალი 0.5ლ",
        price: 2.0,
        image:
          "https://images.unsplash.com/photo-1548839140-6c7b2a6d4b3b?w=200&h=200&fit=crop",
      },
    ],
  },
  {
    id: "3",
    name: "ბურგერი კლასიკური",
    price: 22.0,
    description: "ქათმის ხორცი, სალათი, პომიდორი, ბეკონი, საფირმო სოუსი",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
    restaurant: "მადაგონი",
    category: "ბურგერი",
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
        isDefault: false,
      },
    ],
    drinks: [
      {
        id: "1",
        name: "კოლა 0.33ლ",
        price: 3.5,
        image:
          "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=200&h=200&fit=crop",
      },
      {
        id: "2",
        name: "წყალი 0.5ლ",
        price: 2.0,
        image:
          "https://images.unsplash.com/photo-1548839140-6c7b2a6d4b3b?w=200&h=200&fit=crop",
      },
    ],
  },
];
