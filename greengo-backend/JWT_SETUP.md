# 🔐 JWT Authentication Setup

## ✅ რა გაკეთდა

1. **JWT Packages დაყენებულია:**
   - `@nestjs/jwt` - JWT module
   - `@nestjs/passport` - Passport integration
   - `passport-jwt` - JWT strategy
   - `bcryptjs` - Password hashing (for future use)

2. **JWT Secret გენერირებულია:**
   - Secret: `93b778f4d6d1ee088ee2478e97b53a2e2cb8b165bca9203f84fcd2bcd11e16b0`
   - დამატებულია `.env` ფაილში

3. **Auth Module შექმნილია:**
   - `AuthService` - Authentication logic
   - `AuthController` - API endpoints
   - `JwtStrategy` - JWT validation
   - `JwtAuthGuard` - Route protection

## 📡 API Endpoints

### Authentication

```typescript
// Send verification code
POST /api/auth/send-verification-code
Body: { phoneNumber: string, countryCode?: string }

// Verify code and login
POST /api/auth/verify-code
Body: { phoneNumber: string, verificationCode: string }
Response: { success: true, access_token: string, user: {...} }

// Get profile (protected)
GET /api/auth/profile
Headers: { Authorization: "Bearer <token>" }

// Verify token
POST /api/auth/verify-token
Headers: { Authorization: "Bearer <token>" }
```

## 🔒 Protected Routes

რომ დაცული იყოს route, გამოიყენეთ `@UseGuards(JwtAuthGuard)`:

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Get('protected-route')
getProtectedData() {
  return { message: 'This is protected' };
}
```

## 📱 Mobile App Usage

React Native აპლიკაციაში:

```typescript
// Login
const response = await fetch(`${API_URL}/auth/verify-code`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '+995XXXXXXXXX',
    verificationCode: '1234',
  }),
});

const { access_token, user } = await response.json();

// Save token
await AsyncStorage.setItem('auth_token', access_token);

// Use token in requests
const headers = {
  'Authorization': `Bearer ${access_token}`,
  'Content-Type': 'application/json',
};
```

## ⚙️ Configuration

`.env` ფაილში:

```env
JWT_SECRET=93b778f4d6d1ee088ee2478e97b53a2e2cb8b165bca9203f84fcd2bcd11e16b0
JWT_EXPIRES_IN=7d
```

**⚠️ Production-ში:**
- შეცვალეთ JWT_SECRET უფრო ძლიერი secret-ით
- გამოიყენეთ environment variables
- არ გააზიაროთ secret public repository-ში

## 🚀 Next Steps

1. ✅ JWT setup მზადაა
2. 🔄 Integrate SMS service (Twilio, etc.)
3. 🔄 Add refresh tokens
4. 🔄 Add password authentication
5. 🔄 Protect sensitive routes

