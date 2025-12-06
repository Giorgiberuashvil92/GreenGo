# 🚀 Backend Start Guide

## ⚠️ Timeout Error Solution

თუ ხედავთ timeout error-ს, ეს ნიშნავს რომ backend არ არის გაშვებული.

## ✅ Backend-ის გაშვება

### 1. გადადით backend folder-ში:

```bash
cd /Users/gio/Desktop/GreenGo/greengo-backend
```

### 2. დააინსტალირეთ dependencies (თუ არ გაქვთ):

```bash
npm install
```

### 3. გაუშვით backend:

```bash
npm run start:dev
```

თქვენ უნდა ნახოთ:
```
🚀 GreenGo Backend is running on: http://localhost:3001/api
```

## 📱 Mobile App Configuration

Mobile app-ში API config უკვე კონფიგურირებულია:
- **Android Emulator**: `http://10.0.2.2:3001/api`
- **iOS Simulator**: `http://localhost:3001/api` (uncomment in apiConfig.ts)
- **Physical Device**: `http://YOUR_COMPUTER_IP:3001/api`

## 🔧 Troubleshooting

### Port 3001 დაკავებულია?

```bash
# შეცვალეთ PORT .env ფაილში
cd greengo-backend
echo "PORT=3002" >> .env
```

შემდეგ შეცვალეთ `apiConfig.ts`-ში:
```typescript
BASE_URL: 'http://10.0.2.2:3002/api',
```

### Backend არ იწყება?

1. შეამოწმეთ MongoDB connection string `.env` ფაილში
2. შეამოწმეთ რომ `node_modules` არსებობს: `npm install`
3. შეამოწმეთ TypeScript errors: `npm run build`

### Network Timeout?

1. დარწმუნდით რომ backend გაშვებულია
2. შეამოწმეთ API URL `apiConfig.ts`-ში
3. Physical device-ისთვის გამოიყენეთ კომპიუტერის IP address

## 🎯 Quick Start Script

შექმენით `start-backend.sh`:

```bash
#!/bin/bash
cd /Users/gio/Desktop/GreenGo/greengo-backend
npm run start:dev
```

გაუშვით:
```bash
chmod +x start-backend.sh
./start-backend.sh
```

