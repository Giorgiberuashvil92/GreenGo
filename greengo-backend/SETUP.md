# 🚀 GreenGo Backend Setup Guide

## ✅ Quick Start

### 1. Install Dependencies

```bash
cd greengo-backend
npm install
```

### 2. Environment Configuration

`.env` ფაილი უკვე შექმნილია MongoDB Atlas connection string-ით:

```
MONGODB_URI=mongodb+srv://GreenGo:Berobero12!@greengi.doampnw.mongodb.net/greengo?retryWrites=true&w=majority&appName=GreenGi
PORT=3001
```

### 3. Seed Database (Optional)

თუ გსურთ საწყისი მონაცემების დამატება:

```bash
npm run seed
```

ეს შექმნის:
- 2 რესტორნს (მაგნოლია, მაკ შაურმა)
- 2 მენიუ აიტემს

### 4. Start Development Server

```bash
npm run start:dev
```

Backend API იქნება ხელმისაწვდომი: `http://localhost:3001/api`

### 5. Test API

```bash
# Health check
curl http://localhost:3001/api/health

# Get restaurants
curl http://localhost:3001/api/restaurants
```

## 📱 Mobile App Configuration

React Native აპლიკაციაში `utils/apiConfig.ts` უკვე კონფიგურირებულია:

```typescript
DEV: {
  BASE_URL: 'http://10.0.2.2:3001/api', // Android Emulator
  // BASE_URL: 'http://localhost:3001/api', // iOS Simulator
}
```

## 🔧 Troubleshooting

### Connection Error

თუ MongoDB Atlas-თან დაკავშირება არ მუშაობს:

1. შეამოწმეთ IP whitelist MongoDB Atlas-ში
2. დარწმუნდით რომ connection string სწორია
3. შეამოწმეთ network connection

### Port Already in Use

თუ port 3001 დაკავებულია:

```bash
# შეცვალეთ PORT .env ფაილში
PORT=3002
```

## 📊 API Endpoints

- `GET /api/health` - Health check
- `GET /api/restaurants` - ყველა რესტორნი
- `GET /api/restaurants/:id` - კონკრეტული რესტორნი
- `GET /api/orders` - ყველა შეკვეთა
- `GET /api/menu-items` - ყველა მენიუ აიტემი
- `GET /api/menu-items/restaurant/:restaurantId` - რესტორნის მენიუ

## 🎯 Next Steps

1. ✅ Backend API მზადაა
2. ✅ MongoDB Atlas კონფიგურირებულია
3. ✅ React Native app კონფიგურირებულია
4. 🔄 Seed database (npm run seed)
5. 🚀 Start backend (npm run start:dev)
6. 📱 Test with mobile app

