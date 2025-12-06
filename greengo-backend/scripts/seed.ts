// Seed script to populate MongoDB with initial data
// Run: npm run seed

import mongoose from 'mongoose';
import { Restaurant, RestaurantSchema } from '../src/restaurants/schemas/restaurant.schema';
import { MenuItem, MenuItemSchema } from '../src/menu-items/schemas/menu-item.schema';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://GreenGo:Berobero12!@greengi.doampnw.mongodb.net/greengo?retryWrites=true&w=majority&appName=GreenGi';

const restaurantsData = [
  {
    name: 'მაგნოლია',
    description: 'ქართული კულინარია და ევროპული კერძები',
    rating: 4.6,
    reviewCount: 29,
    deliveryFee: 4.99,
    deliveryTime: '20-30',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    isActive: true,
    location: {
      latitude: 41.7151,
      longitude: 44.8271,
      address: '1 ზაქარია ფალიაშვილის ქუჩა',
      city: 'თბილისი',
      district: 'ცენტრი',
      postalCode: '0108',
    },
    contact: {
      phone: '+995 32 2 123 456',
      email: 'info@magnolia.ge',
      website: 'www.magnolia.ge',
    },
    workingHours: {
      monday: '09:00 - 23:00',
      tuesday: '09:00 - 23:00',
      wednesday: '09:00 - 23:00',
      thursday: '09:00 - 23:00',
      friday: '09:00 - 24:00',
      saturday: '10:00 - 24:00',
      sunday: '10:00 - 22:00',
    },
    features: {
      hasDelivery: true,
      hasPickup: true,
      hasDineIn: true,
      acceptsOnlineOrders: true,
      hasParking: true,
      isWheelchairAccessible: true,
    },
    categories: ['ქართული', 'ევროპული', 'პიცა'],
    priceRange: '€€',
    cuisine: ['ქართული', 'იტალიური', 'ევროპული'],
    allergens: ['გლუტენი', 'ლაქტოზი', 'ხახვი'],
    paymentMethods: ['ნაღდი', 'ბარათი', 'GreenGo ბალანსი'],
  },
  {
    name: 'მაკ შაურმა',
    description: 'სწრაფი კვება',
    rating: 4.9,
    reviewCount: 29,
    deliveryFee: 4.99,
    deliveryTime: '20-30',
    image: 'https://images.unsplash.com/photo-1565299585323-38174c4a5eae?w=800&h=600&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1565299585323-38174c4a5eae?w=800&h=600&fit=crop',
    isActive: true,
    location: {
      latitude: 41.7151,
      longitude: 44.8271,
      address: '1 ზაქარია ფალიაშვილის ქუჩა',
      city: 'თბილისი',
      district: 'ცენტრი',
      postalCode: '0108',
    },
    contact: {
      phone: '+995 32 2 123 456',
      email: 'info@makshaurma.ge',
      website: 'www.makshaurma.ge',
    },
    workingHours: {
      monday: '09:00 - 23:00',
      tuesday: '09:00 - 23:00',
      wednesday: '09:00 - 23:00',
      thursday: '09:00 - 23:00',
      friday: '09:00 - 24:00',
      saturday: '10:00 - 24:00',
      sunday: '10:00 - 22:00',
    },
    features: {
      hasDelivery: true,
      hasPickup: true,
      hasDineIn: true,
      acceptsOnlineOrders: true,
      hasParking: true,
      isWheelchairAccessible: true,
    },
    categories: ['ქართული', 'ფასტ-ფუდი', 'შაურმა'],
    priceRange: '€€',
    cuisine: ['ქართული', 'ფასტ-ფუდი'],
    allergens: ['გლუტენი', 'ლაქტოზი', 'ხახვი'],
    paymentMethods: ['ნაღდი', 'ბარათი', 'GreenGo ბალანსი'],
  },
];

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const RestaurantModel = mongoose.model('Restaurant', RestaurantSchema);
    const MenuItemModel = mongoose.model('MenuItem', MenuItemSchema);

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await RestaurantModel.deleteMany({});
    await MenuItemModel.deleteMany({});
    console.log('✅ Cleared existing data');

    // Insert restaurants
    console.log('📝 Inserting restaurants...');
    const insertedRestaurants = await RestaurantModel.insertMany(restaurantsData);
    console.log(`✅ Inserted ${insertedRestaurants.length} restaurants`);

    // Insert menu items
    console.log('📝 Inserting menu items...');
    const menuItemsData = [
      {
        restaurantId: insertedRestaurants[0]._id,
        name: 'პიცა პეპერონი',
        description:
          'საფირმო პიცის ცომი, ყველი მოცარელა, პეპერონი, პიცის სპეც სოუსი, ორეგანო',
        price: 25.0,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        heroImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
        category: 'ყველაზე პოპულარული',
        isPopular: true,
        isAvailable: true,
      },
      {
        restaurantId: insertedRestaurants[1]._id,
        name: 'მაკ შაურმა სტანდარტული',
        description:
          'ლავაში, ღორის ხორცი, სალათის ფურცელი, ხახვი, წიწაკის წნილი, კეტჩუპი, მაიონეზი',
        price: 14.0,
        image: 'https://images.unsplash.com/photo-1565299585323-38174c4a5eae?w=400&h=300&fit=crop',
        heroImage: 'https://images.unsplash.com/photo-1565299585323-38174c4a5eae?w=800&h=600&fit=crop',
        category: 'ყველაზე პოპულარული',
        isPopular: true,
        isAvailable: true,
      },
    ];

    await MenuItemModel.insertMany(menuItemsData);
    console.log(`✅ Inserted ${menuItemsData.length} menu items`);

    console.log('🎉 Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();

