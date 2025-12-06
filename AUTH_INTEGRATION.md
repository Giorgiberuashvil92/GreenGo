# 🔐 Authentication Integration - GreenGo

## ✅ რა გაკეთდა

### Backend (NestJS)
1. ✅ JWT Authentication დაყენებულია
2. ✅ Auth endpoints:
   - `POST /api/auth/send-verification-code` - SMS code გაგზავნა
   - `POST /api/auth/verify-code` - Code verification და login
   - `GET /api/auth/profile` - User profile (protected)
   - `POST /api/auth/verify-token` - Token verification (protected)

### Mobile App (React Native)
1. ✅ AuthContext განახლებულია:
   - Token storage (AsyncStorage)
   - User state management
   - Login/logout functions
   - sendVerificationCode function

2. ✅ Login Screen:
   - API integration
   - Loading states
   - Error handling

3. ✅ Verification Screen:
   - Code verification via API
   - Auto-login after verification
   - Resend code functionality

4. ✅ API Service:
   - Token management
   - Automatic token injection in requests
   - Auth endpoints

## 🚀 Usage

### Login Flow

```typescript
// 1. Send verification code
const { sendVerificationCode } = useAuth();
const code = await sendVerificationCode("555123456", "+995");

// 2. Verify code and login
const { login } = useAuth();
await login("555123456", "1234");

// 3. Access user data
const { user, isAuthenticated, token } = useAuth();
```

### Protected API Calls

API service ავტომატურად იყენებს token-ს:

```typescript
// Token automatically added to headers
const restaurants = await apiService.getRestaurants();
const orders = await apiService.getOrders({ userId: user.id });
```

## 📡 API Endpoints

### Send Verification Code
```typescript
POST /api/auth/send-verification-code
Body: { phoneNumber: "+995555123456", countryCode: "+995" }
Response: { success: true, code: "1234", message: "..." }
```

### Verify Code & Login
```typescript
POST /api/auth/verify-code
Body: { phoneNumber: "+995555123456", verificationCode: "1234" }
Response: {
  success: true,
  access_token: "jwt_token_here",
  user: { id: "...", phoneNumber: "...", name: "..." }
}
```

### Get Profile (Protected)
```typescript
GET /api/auth/profile
Headers: { Authorization: "Bearer <token>" }
Response: { success: true, data: { ...user } }
```

## 🔧 Configuration

### Backend (.env)
```env
JWT_SECRET=93b778f4d6d1ee088ee2478e97b53a2e2cb8b165bca9203f84fcd2bcd11e16b0
JWT_EXPIRES_IN=7d
```

### Mobile App (apiConfig.ts)
```typescript
DEV: {
  BASE_URL: 'http://10.0.2.2:3001/api', // Android Emulator
}
```

## 📝 Next Steps

1. ✅ Authentication მზადაა
2. 🔄 Add SMS service integration (Twilio)
3. 🔄 Add code storage in Redis/database
4. 🔄 Add refresh tokens
5. 🔄 Protect orders/create endpoint

## ⚠️ Development Notes

- Verification code ახლა return-დება response-ში (development-ისთვის)
- Production-ში არ დაბრუნდეს code response-ში
- Code validation ახლა არ არის (accepts any 4-digit code)
- Production-ში დაამატეთ code validation database-ში

