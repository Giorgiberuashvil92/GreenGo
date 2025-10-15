# 🚀 GreenGo FullStack Backend Specification

## 📱 Project Overview

GreenGo არის food delivery მობილური აპლიკაცია React Native/Expo-ზე, რომელიც საჭიროებს სრულ backend API-ს ყველა ფუნქციონალისთვის.

## 🔐 Authentication & User Management System

### Phone Verification System

```typescript
// API Endpoints
POST /api/auth/send-verification-code
{
  "phoneNumber": "+995XXXXXXXXX",
  "countryCode": "+995"
}

POST /api/auth/verify-code
{
  "phoneNumber": "+995XXXXXXXXX",
  "verificationCode": "1234"
}

// Response
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "phoneNumber": "+995XXXXXXXXX",
    "isNewUser": true/false
  }
}
```

### User Profile Management

```typescript
// User Data Model
interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  profileImage?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  preferences: {
    language: "ka" | "en";
    notifications: boolean;
  };
}

// API Endpoints
GET / api / user / profile;
PUT / api / user / profile;
PUT / api / user / phone - number;
PUT / api / user / email;
DELETE / api / user / account;
```

## 🍕 Restaurant & Food Management System

### Restaurant Data Model

```typescript
interface Restaurant {
  id: string;
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  deliveryFee: number;
  deliveryTime: string; // "20-30"
  image: string;
  heroImage: string;
  isActive: boolean;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  categories: string[];
  isLiked?: boolean; // per user
}

interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isPopular: boolean;
  isAvailable: boolean;
  ingredients?: string[];
  allergens?: string[];
}
```

### API Endpoints

```typescript
// Restaurants
GET /api/restaurants
GET /api/restaurants/:id
GET /api/restaurants/search?query=...
GET /api/restaurants/category/:category
POST /api/restaurants/:id/like
DELETE /api/restaurants/:id/like

// Menu Items
GET /api/restaurants/:id/menu
GET /api/menu-items/:id
GET /api/menu-items/search?query=...
GET /api/menu-items/popular
```

## 🛒 Order Management System

### Order Data Model

```typescript
interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryFee: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivering"
    | "delivered"
    | "cancelled";
  paymentMethod: "card" | "cash" | "greengo_balance";
  deliveryAddress: {
    street: string;
    city: string;
    coordinates: { lat: number; lng: number };
    instructions?: string;
  };
  orderDate: Date;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  promoCode?: string;
  notes?: string;
}

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
}
```

### API Endpoints

```typescript
// Orders
POST /api/orders
GET /api/orders
GET /api/orders/:id
PUT /api/orders/:id/status
DELETE /api/orders/:id

// Order History
GET /api/orders/history
GET /api/orders/current
```

## 💳 Payment System

### Payment Data Model

```typescript
interface PaymentMethod {
  id: string;
  userId: string;
  type: "card" | "cash" | "greengo_balance";
  cardDetails?: {
    lastFour: string;
    brand: "visa" | "mastercard" | "amex";
    expiryMonth: number;
    expiryYear: number;
  };
  isPrimary: boolean;
  isActive: boolean;
}

interface GreenGoBalance {
  userId: string;
  balance: number;
  transactions: BalanceTransaction[];
}

interface BalanceTransaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  orderId?: string;
  date: Date;
}
```

### API Endpoints

```typescript
// Payment Methods
GET /api/payment-methods
POST /api/payment-methods
PUT /api/payment-methods/:id
DELETE /api/payment-methods/:id
PUT /api/payment-methods/:id/primary

// GreenGo Balance
GET /api/balance
POST /api/balance/top-up
GET /api/balance/transactions

// Payment Processing
POST /api/payments/process
POST /api/payments/refund
```

## 🎟️ Promo Codes System

### Promo Code Data Model

```typescript
interface PromoCode {
  id: string;
  code: string;
  type: "percentage" | "fixed_amount" | "free_delivery";
  value: number; // percentage or amount
  minOrderAmount?: number;
  maxDiscount?: number;
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  applicableRestaurants?: string[]; // restaurant IDs
}
```

### API Endpoints

```typescript
GET / api / promo - codes;
POST / api / promo - codes / validate;
GET / api / promo - codes / user - available;
```

## 📍 Location & Delivery System

### Location Services

```typescript
interface DeliveryZone {
  id: string;
  name: string;
  coordinates: GeoJSON.Polygon;
  deliveryFee: number;
  estimatedTime: string;
}

// API Endpoints
GET / api / delivery - zones;
POST / api / delivery / calculate - fee;
POST / api / delivery / estimate - time;
```

## 🔔 Notification System

### Push Notifications

```typescript
interface Notification {
  id: string;
  userId: string;
  type: "order_update" | "promo" | "general";
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

// API Endpoints
GET /api/notifications
PUT /api/notifications/:id/read
POST /api/notifications/send
```

## 🗄️ Database Schema Requirements

### Core Tables

```sql
-- Users
users (id, phone_number, name, email, profile_image, is_verified, created_at, updated_at)

-- Restaurants
restaurants (id, name, description, rating, review_count, delivery_fee, delivery_time, image, hero_image, location, is_active)

-- Menu Items
menu_items (id, restaurant_id, name, description, price, image, category, is_popular, is_available)

-- Orders
orders (id, user_id, restaurant_id, total_amount, delivery_fee, status, payment_method, delivery_address, order_date, estimated_delivery)

-- Order Items
order_items (id, order_id, menu_item_id, name, price, quantity, special_instructions)

-- Payment Methods
payment_methods (id, user_id, type, card_details, is_primary, is_active)

-- GreenGo Balance
user_balances (user_id, balance, updated_at)
balance_transactions (id, user_id, type, amount, description, order_id, date)

-- Promo Codes
promo_codes (id, code, type, value, min_order_amount, max_discount, valid_from, valid_until, usage_limit, used_count, is_active)

-- Notifications
notifications (id, user_id, type, title, message, data, is_read, created_at)
```

## 🔧 Technical Requirements

### Backend Stack Recommendations

- **Framework**: Node.js with Express.js ან NestJS
- **Database**: PostgreSQL ან MongoDB
- **Authentication**: JWT tokens
- **SMS Service**: Twilio ან local SMS provider
- **Payment Processing**: Stripe ან local payment gateway
- **File Storage**: AWS S3 ან local storage
- **Push Notifications**: Firebase Cloud Messaging
- **Caching**: Redis
- **API Documentation**: Swagger/OpenAPI

### Security Requirements

- JWT token authentication
- Rate limiting
- Input validation და sanitization
- CORS configuration
- HTTPS enforcement
- Data encryption at rest
- Phone number verification
- Payment data PCI compliance

### Performance Requirements

- API response time < 200ms
- Database query optimization
- Image compression და CDN
- Caching strategy
- Pagination for large datasets

## 📊 API Response Standards

### Standard Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    details: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Error Handling

```typescript
// Standard HTTP Status Codes
200 - Success
201 - Created
400 - Bad Request
401 - Unauthorized
403 - Forbidden
404 - Not Found
422 - Validation Error
500 - Internal Server Error
```

## 🌐 Environment Configuration

### Required Environment Variables

```env
# Database
DATABASE_URL=
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=

# SMS Service
SMS_API_KEY=
SMS_API_URL=

# Payment Gateway
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# File Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=
AWS_REGION=

# Push Notifications
FCM_SERVER_KEY=

# App Configuration
APP_URL=
API_VERSION=v1
```

## 📱 Mobile App Integration Points

### Required API Endpoints for Mobile App

1. **Authentication Flow**: Phone verification, login, logout
2. **User Management**: Profile CRUD, settings
3. **Restaurant Data**: List, search, details, menu
4. **Order Management**: Create, track, history
5. **Payment Processing**: Methods, balance, transactions
6. **Notifications**: Push notifications, in-app messages
7. **Location Services**: Delivery zones, fee calculation

## 🚀 Deployment Requirements

### Production Environment

- **Server**: Ubuntu 20.04+ ან Docker containers
- **Database**: PostgreSQL with backup strategy
- **Load Balancer**: Nginx ან AWS ALB
- **Monitoring**: Application logs, error tracking
- **Backup**: Daily database backups
- **SSL**: Let's Encrypt ან commercial certificate

## 📋 Implementation Priority

### Phase 1 (Core Features)

1. User authentication (phone verification)
2. Basic restaurant and menu data
3. Order creation and management
4. Basic payment processing

### Phase 2 (Enhanced Features)

1. Advanced payment methods
2. Promo codes system
3. Push notifications
4. User preferences and settings

### Phase 3 (Advanced Features)

1. Real-time order tracking
2. Advanced analytics
3. Restaurant management panel
4. Admin dashboard

## 🔍 Testing Requirements

### API Testing

- Unit tests for all endpoints
- Integration tests for complete flows
- Load testing for performance
- Security testing for vulnerabilities

### Data Validation

- Input validation for all API endpoints
- Phone number format validation
- Payment data validation
- File upload validation

## 📈 Monitoring & Analytics

### Required Metrics

- API response times
- Error rates
- User registration/conversion rates
- Order completion rates
- Payment success rates

### Logging

- Request/response logging
- Error logging with stack traces
- User action logging
- Payment transaction logging

---

**Note**: ეს სპეციფიკაცია მოიცავს ყველა საჭირო კომპონენტს GreenGo აპლიკაციისთვის. Backend developer-ს შეუძლია ამ მონაცემების საფუძველზე შექმნას სრული API სისტემა, რომელიც მხარს უჭერს ყველა frontend ფუნქციონალს.
