# 🚀 GreenGo Backend API

NestJS-ზე დაფუძნებული Backend API GreenGo დელივერი აპლიკაციისთვის.

## 📋 Features

- ✅ Restaurants CRUD
- ✅ Orders Management
- ✅ Menu Items Management
- ✅ Users Management
- ✅ MongoDB Integration
- ✅ CORS enabled for mobile app
- ✅ Validation with class-validator
- ✅ TypeScript

## 🚀 Quick Start

### 1. Installation

```bash
npm install
```

### 2. Environment Setup

შექმენით `.env` ფაილი (ან გამოიყენეთ არსებული):

```env
MONGODB_URI=mongodb+srv://GreenGo:Berobero12!@greengi.doampnw.mongodb.net/greengo?retryWrites=true&w=majority&appName=GreenGi
PORT=3001
```

**შენიშვნა:** `.env` ფაილი უკვე შექმნილია MongoDB Atlas connection string-ით.

### 3. Start Server

**შენიშვნა:** MongoDB Atlas უკვე კონფიგურირებულია, არ არის საჭირო local MongoDB-ის გაშვება.

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

Server იქნება ხელმისაწვდომი: `http://localhost:3001/api`

## 📡 API Endpoints

### Restaurants

- `GET /api/restaurants` - ყველა რესტორნის მიღება
- `GET /api/restaurants/:id` - კონკრეტული რესტორნის მიღება
- `POST /api/restaurants` - ახალი რესტორნის შექმნა
- `PATCH /api/restaurants/:id` - რესტორნის განახლება
- `DELETE /api/restaurants/:id` - რესტორნის წაშლა

**Query Parameters:**
- `page` - გვერდის ნომერი (default: 1)
- `limit` - ელემენტების რაოდენობა (default: 10)
- `search` - ძიება სახელით ან აღწერით
- `category` - კატეგორიის ფილტრი
- `isActive` - აქტიური/არააქტიური

### Orders

- `GET /api/orders` - ყველა შეკვეთის მიღება
- `GET /api/orders/:id` - კონკრეტული შეკვეთის მიღება
- `POST /api/orders` - ახალი შეკვეთის შექმნა
- `PATCH /api/orders/:id/status` - შეკვეთის სტატუსის განახლება
- `DELETE /api/orders/:id` - შეკვეთის წაშლა

**Query Parameters:**
- `page`, `limit` - pagination
- `status` - სტატუსის ფილტრი
- `userId` - მომხმარებლის ID
- `restaurantId` - რესტორნის ID

### Menu Items

- `GET /api/menu-items` - ყველა მენიუ აიტემის მიღება
- `GET /api/menu-items/restaurant/:restaurantId` - რესტორნის მენიუ
- `GET /api/menu-items/:id` - კონკრეტული აიტემის მიღება
- `POST /api/menu-items` - ახალი აიტემის შექმნა
- `PATCH /api/menu-items/:id` - აიტემის განახლება
- `DELETE /api/menu-items/:id` - აიტემის წაშლა

### Users

- `GET /api/users` - ყველა მომხმარებლის მიღება
- `GET /api/users/:id` - კონკრეტული მომხმარებლის მიღება
- `POST /api/users` - ახალი მომხმარებლის შექმნა
- `PATCH /api/users/:id` - მომხმარებლის განახლება
- `DELETE /api/users/:id` - მომხმარებლის წაშლა

## 📱 Mobile App Integration

React Native აპლიკაციაში განაახლეთ `utils/apiConfig.ts`:

```typescript
export const API_CONFIG = {
  DEV: {
    // Android Emulator
    BASE_URL: 'http://10.0.2.2:3001/api',
    // iOS Simulator
    // BASE_URL: 'http://localhost:3001/api',
    // Physical Device (თქვენი კომპიუტერის IP)
    // BASE_URL: 'http://192.168.1.XXX:3001/api',
  },
  PROD: {
    BASE_URL: 'https://api.greengo.ge/api',
  },
};
```

## 🗄️ Database Schema

### Restaurants
- name, description, rating, reviewCount
- deliveryFee, deliveryTime
- location (latitude, longitude, address, city)
- contact (phone, email, website)
- workingHours, features, categories
- priceRange, cuisine, allergens, paymentMethods

### Orders
- userId, restaurantId
- items (menuItemId, name, price, quantity)
- totalAmount, deliveryFee
- status (pending, confirmed, preparing, ready, delivering, delivered, cancelled)
- paymentMethod, deliveryAddress
- orderDate, estimatedDelivery, actualDelivery

### Menu Items
- restaurantId, name, description, price
- image, heroImage
- category, isPopular, isAvailable
- ingredients, drinks

### Users
- phoneNumber, name, email, profileImage
- isVerified
- preferences (language, notifications)

## 🔧 Development

```bash
# Watch mode
npm run start:dev

# Build
npm run build

# Production mode
npm run start:prod

# Test
npm run test
```

## 📝 Notes

- CORS enabled for all origins (development)
- Global validation pipe enabled
- API prefix: `/api`
- Default port: `3001`

## 🚂 Railway Deployment

### 1. Railway-ზე პროექტის შექმნა

1. გადადით [Railway.app](https://railway.app)
2. შექმენით ახალი პროექტი
3. დააკავშირეთ GitHub repository
4. აირჩიეთ `greengo-backend` ფოლდერი

### 2. MongoDB Service-ის დამატება

1. Railway Dashboard-ში დაამატეთ **MongoDB** service
2. Railway ავტომატურად შექმნის `MONGODB_URI` environment variable-ს

### 3. Environment Variables-ის დაყენება

Railway Dashboard -> Your Project -> Variables -> Add Variable:

```env
PORT=3001
JWT_SECRET=<generate-strong-secret-key>
JWT_EXPIRES_IN=7d
```

**JWT_SECRET-ის გენერირება:**
```bash
openssl rand -base64 32
```

**შენიშვნა:** `MONGODB_URI` ავტომატურად დაემატება, როცა MongoDB service-ს დაამატებთ.

### 4. Build Settings

Railway Dashboard -> Your Project -> Settings -> Build:

**თუ `npm ci`-ს პრობლემა აქვს:**
- **Build Command:** `npm install --legacy-peer-deps && npm run build`
- **Start Command:** `npm run start:prod`

**ან სტანდარტული (თუ `npm ci` მუშაობს):**
- **Build Command:** `npm run build`
- **Start Command:** `npm run start:prod`

**შენიშვნა:** `railway.json` და `nixpacks.toml` ფაილები უკვე კონფიგურირებულია. თუ პრობლემა გაქვთ, Railway Dashboard-ში Build Settings-ში ხელით დააყენეთ build command.

### 5. Deploy

Railway ავტომატურად განაახლებს deployment-ს, როცა GitHub-ში push-ს გააკეთებთ.

### 6. Custom Domain (Optional)

Railway Dashboard -> Settings -> Domains -> Add Domain

მაგალითი: `api.greengo.ge`

## 🚀 Next Steps

1. Add JWT Authentication ✅
2. Add File Upload (images)
3. Add Real-time updates (WebSocket)
4. Add SMS verification
5. Add Payment processing
6. Add Push notifications
