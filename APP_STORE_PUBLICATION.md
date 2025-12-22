# App Store-ში გამოქვეყნების ინსტრუქცია

## წინაპირობები

1. **Apple Developer Account** - საჭიროა გადახდილი Apple Developer Program-ის წევრობა ($99/წელიწადში)
   - დარეგისტრირდით: https://developer.apple.com/programs/

2. **EAS Build** - Expo-ს რეკომენდებული build სერვისი
   - დააინსტალირეთ: `npm install -g eas-cli`
   - დალოგინდით: `eas login`

## ნაბიჯ-ნაბიჯ ინსტრუქცია

### 1. app.json-ის განახლება

განაახლეთ `app.json` ფაილი შემდეგი ინფორმაციით:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.GreenGo",  // შეცვალეთ თქვენი კომპანიის სახელით
      "buildNumber": "1",
      "supportsTablet": true
    }
  }
}
```

**მნიშვნელოვანი:**
- `bundleIdentifier` უნდა იყოს უნიკალური (მაგ: `com.yourcompany.greengo`)
- ეს ID უნდა ემთხვეოდეს Apple Developer Portal-ში შექმნილ App ID-ს

### 2. EAS Build-ის კონფიგურაცია

პროექტის root დირექტორიაში შექმენით `eas.json` ფაილი:

```bash
eas build:configure
```

ეს შექმნის `eas.json` ფაილს. შემდეგ განაახლეთ იგი:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "ios": {
        "bundleIdentifier": "com.yourcompany.GreenGo"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-email@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-team-id"
      }
    }
  }
}
```

### 3. iOS Build-ის შექმნა

Production build-ის შექმნა:

```bash
eas build --platform ios --profile production
```

ეს პროცესი:
- შექმნის iOS build-ს Expo-ს cloud სერვერზე
- დროის მიხედვით 10-20 წუთს წაიღებს
- მოგცემთ build-ის ლინკს

### 4. App Store Connect-ში აპლიკაციის შექმნა

1. გადადით https://appstoreconnect.apple.com
2. დააჭირეთ **"My Apps"** → **"+"** → **"New App"**
3. შეავსეთ ინფორმაცია:
   - **Platform**: iOS
   - **Name**: GreenGo
   - **Primary Language**: აირჩიეთ ენა
   - **Bundle ID**: აირჩიეთ ის Bundle ID რომელიც app.json-ში გაქვთ
   - **SKU**: უნიკალური იდენტიფიკატორი (მაგ: greengo-ios-001)

### 5. App Store Connect-ის მეტადატის შევსება

1. **App Information**:
   - App Name
   - Subtitle
   - Category
   - Privacy Policy URL (საჭიროა)

2. **Pricing and Availability**:
   - ფასი (თუ უფასოა, აირჩიეთ "Free")

3. **App Privacy**:
   - შეავსეთ პრივატულობის პოლიტიკა
   - მიუთითეთ რა მონაცემებს აგროვებთ

### 6. Screenshots და App Preview-ების ატვირთვა

საჭიროა screenshots შემდეგი ზომებისთვის:
- iPhone 6.7" Display (iPhone 14 Pro Max, 15 Pro Max)
- iPhone 6.5" Display (iPhone 11 Pro Max, XS Max)
- iPhone 5.5" Display (iPhone 8 Plus)
- iPad Pro (12.9-inch)
- iPad Pro (11-inch)

მინიმუმ 3 screenshot-ი საჭიროა თითოეული ზომისთვის.

### 7. Build-ის App Store Connect-ში ატვირთვა

**ვარიანტი 1: EAS Submit (რეკომენდებული)**

```bash
eas submit --platform ios --profile production
```

ეს ავტომატურად ატვირთავს build-ს App Store Connect-ში.

**ვარიანტი 2: ხელით**

1. EAS Build-ის დასრულების შემდეგ, ჩამოტვირთეთ `.ipa` ფაილი
2. გამოიყენეთ **Transporter** აპლიკაცია (Mac App Store-დან) build-ის ასატვირთად

### 8. App Review-ისთვის გაგზავნა

1. App Store Connect-ში გადადით **"App Store"** ტაბში
2. შეავსეთ:
   - **What's New in This Version** (Release Notes)
   - **App Review Information**:
     - Contact Information
     - Demo Account (თუ საჭიროა)
     - Notes (დამატებითი ინფორმაცია review-ისთვის)
3. დააჭირეთ **"Submit for Review"**

### 9. Review პროცესი

- Apple-ი review-ს ატარებს 1-3 დღეში
- შეგიძლიათ შეამოწმოთ სტატუსი App Store Connect-ში
- თუ rejection მოხდა, Apple-ი მოგცემთ დეტალურ ინფორმაციას

## სასარგებლო ბრძანებები

```bash
# EAS-ში დალოგინება
eas login

# Build სტატუსის შემოწმება
eas build:list

# Build-ის ლოგების ნახვა
eas build:view [BUILD_ID]

# App Store Connect-ის კონფიგურაცია
eas submit:configure

# Build და Submit ერთად
eas build --platform ios --profile production --auto-submit
```

## მნიშვნელოვანი შენიშვნები

1. **Bundle Identifier**: უნდა იყოს უნიკალური და არ შეიძლება შეიცვალოს გამოქვეყნების შემდეგ

2. **Version Number**: ყოველ ახალ build-ზე უნდა გაზარდოთ `app.json`-ში `version` ველი

3. **Build Number**: iOS-ზე `buildNumber` უნდა იყოს უნიკალური ყოველ build-ზე

4. **TestFlight**: შეგიძლიათ გამოიყენოთ TestFlight beta testing-ისთვის build-ის გაგზავნამდე

5. **Privacy Policy**: App Store-ისთვის საჭიროა Privacy Policy URL

## დამატებითი რესურსები

- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

## დახმარება

თუ პრობლემა გაქვთ, შეგიძლიათ:
- Expo Discord-ზე დაკავშირდეთ
- Expo Forums-ზე დაწეროთ
- Apple Developer Support-ს დაუკავშირდეთ


