# App Store Deployment Guide

## ⚠️ IMPORTANT: App Review Issues & Resolutions

### Latest Submission Status (Build 4 - Rejected)
**Submission ID**: 22111edd-4c55-44b6-a471-834e479b6cd2  
**Review Date**: May 29, 2026  
**Status**: ❌ Rejected  
**Next Build**: 5 (in preparation)

**Issues Identified**:
1. ✅ **Guideline 2.1(a)** - App crashed on iPad when navigating to profile - **FIXED**
2. ⚠️ **Guideline 2.3.8** - App icons appear to be placeholders - **NEEDS REVIEW**
3. ⚠️ **Guideline 3.2** - Clarification needed on business model - **RESPONSE PREPARED**

**See `APPLE_REVIEW_RESPONSE.md` for complete details and responses.**

---

## Pre-deployment Checklist

### 1. App Configuration
- ✅ App name: greengo_courier
- ✅ Version: 1.0.3
- ✅ Build Number: 5 (incremented after Build 4 rejection)
- ✅ iOS Bundle ID: greengocourierios
- ✅ Android Package: com.herrra.greengocourier
- ✅ EAS Project ID: 36007ae3-b941-4b26-a447-ea07a3890a23

### 2. Build Configuration
- ✅ EAS build configured in `eas.json`
- ✅ Production build profile ready
- ✅ iOS: App Store build (not simulator)
- ✅ Android: AAB format for Play Store

### 3. Required Steps

#### iOS App Store

1. **Build the app:**
   ```bash
   eas build --platform ios --profile production
   ```

2. **Submit to App Store:**
   ```bash
   eas submit --platform ios --profile production
   ```

3. **App Store Connect Requirements:**
   - App Store Connect account
   - App information (description, screenshots, keywords)
   - Privacy policy URL
   - Support URL
   - Age rating
   - App review information

#### Android Play Store

1. **Build the app:**
   ```bash
   eas build --platform android --profile production
   ```

2. **Submit to Play Store:**
   ```bash
   eas submit --platform android --profile production
   ```

3. **Play Store Requirements:**
   - Google Play Console account
   - App listing (description, screenshots, feature graphic)
   - Privacy policy URL
   - Content rating questionnaire
   - Store listing details

### 4. Important Notes

- **First Time Setup:**
  - EAS will automatically create certificates and provisioning profiles
  - You'll need to authenticate with your Apple Developer account
  - You'll need to authenticate with your Google Play account

- **App Store Review:**
  - iOS: Usually takes 24-48 hours
  - Android: Usually takes a few hours to 1 day

- **Version Updates:**
  - Update `version` in `app.json` for each release
  - Update `buildNumber` for iOS in `app.json`
  - Update `versionCode` for Android (auto-incremented by EAS)

### 5. Environment Variables (if needed)

If you have environment variables, create `.env.production`:
```bash
# Add any production environment variables here
```

### 6. Build Commands

**For iOS:**
```bash
# Build for iOS App Store
eas build --platform ios --profile production

# Submit to App Store (after build completes)
eas submit --platform ios --profile production
```

**For Android:**
```bash
# Build for Android Play Store
eas build --platform android --profile production

# Submit to Play Store (after build completes)
eas submit --platform android --profile production
```

**For Both:**
```bash
# Build for both platforms
eas build --platform all --profile production

# Submit both (after builds complete)
eas submit --platform all --profile production
```

### 7. iOS Privacy Purpose Strings (Guideline 5.1.1)

Location permission text is defined in `app.json` (`expo-location` plugin and `ios.infoPlist`). It must explain **why** location is used and include a **concrete example** (e.g. customer tracking during delivery). After changing these strings, create a **new iOS build** (`buildNumber` incremented) before resubmitting.

### 8. App Review Test Account (SMS bypass)

Use these credentials in **App Store Connect** and **Play Console** review notes:

| Field | Value |
|-------|-------|
| Phone | `557422635` (country: Georgia `+995`) |
| OTP code | `1234` |

SMS is not sent for this number; enter the code on the OTP screen.

### 9. Testing Before Release

Before submitting to stores, test:
- ✅ All screens work correctly
- ✅ SafeAreaView works on Android and iOS
- ✅ **iPad Testing**: Test on iPad Air 11-inch or similar (REQUIRED)
  - Test hamburger menu navigation
  - Test profile screen (previously crashed)
  - Test all form inputs and scrolling
- ✅ Image upload to Cloudinary works
- ✅ API calls work correctly
- ✅ Navigation works smoothly
- ✅ All features are functional

**iPad Specific Tests** (after Build 4 crash fix):
```bash
# Run on iPad simulator
npx expo run:ios --device "iPad Air 11-inch (M3)"
```

Test sequence:
1. Launch app
2. Login with demo account
3. Tap hamburger menu
4. Tap profile - should NOT crash
5. Test form inputs and scrolling
6. Navigate back successfully

### 10. Post-Deployment

After successful deployment:
- Monitor app analytics
- Check for crash reports
- Monitor user reviews
- Plan for updates based on feedback
