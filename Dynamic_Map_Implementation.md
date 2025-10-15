# 🗺️ Dynamic Map Implementation for GreenGo

## 📱 Overview

ეს დოკუმენტაცია ახსნის როგორ მუშაობს დინამიური map ფუნქციონალი GreenGo აპლიკაციაში, სადაც ყოველი რესტორანისთვის გამოჩნდება მისი ნამდვილი ლოკაცია map-ზე.

## 🏗️ Architecture

### 1. **Data Structure**

```typescript
interface Restaurant {
  id: string;
  name: string;
  // ... other properties
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}
```

### 2. **Navigation Flow**

```
Restaurant List → Restaurant Details → Restaurant Details with Map
     ↓                    ↓                        ↓
PopularObjects.tsx → restaurant.tsx → restaurantDetails.tsx
```

## 🔧 Implementation Details

### **Step 1: Data Enhancement**

რესტორანის მონაცემებს დაემატა `location` ობიექტი:

```typescript
location: {
  latitude: 41.7151,    // რესტორანის ლატიტუდა
  longitude: 44.8271,   // რესტორანის ლონგიტუდა
  address: "1 ზაქარია ფალიაშვილის ქუჩა, თბილისი"
}
```

### **Step 2: New Screen Creation**

შეიქმნა ახალი გვერდი `app/screens/restaurantDetails.tsx` რომელიც შეიცავს:

- **Interactive Map** (react-native-maps)
- **Restaurant Information Card**
- **Working Hours**
- **Contact Information**

### **Step 3: Map Integration**

```typescript
// Map component with dynamic location
<MapView
  style={styles.map}
  region={region} // დინამიური რეგიონი
  showsUserLocation={true}
  showsMyLocationButton={true}
>
  <Marker
    coordinate={{
      latitude: restaurant.location?.latitude || 41.7151,
      longitude: restaurant.location?.longitude || 44.8271,
    }}
    title={restaurant.name}
    description={restaurant.location?.address}
  />
</MapView>
```

### **Step 4: Dynamic Region Setting**

```typescript
useEffect(() => {
  if (restaurant) {
    setRegion({
      latitude: restaurant.location?.latitude || 41.7151,
      longitude: restaurant.location?.longitude || 44.8271,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }
}, [restaurant]);
```

## 🎯 Key Features

### **1. Dynamic Location Display**

- ყოველი რესტორანისთვის გამოჩნდება მისი ნამდვილი ლოკაცია
- Map ავტომატურად ცენტრირდება რესტორანის კოორდინატებზე
- Marker აჩვენებს რესტორანის სახელს და მისამართს

### **2. Interactive Map Features**

- **User Location**: აჩვენებს მომხმარებლის მდებარეობას
- **My Location Button**: სწრაფი ნავიგაცია მომხმარებლის ლოკაციაზე
- **External Map Integration**: "რუკაზე ნახვა" ღილაკი გახსნის Google Maps-ში

### **3. Responsive Design**

- Map ავტომატურად ირგება ეკრანის ზომას
- Touch gestures (zoom, pan) მხარს უჭერს
- Smooth animations რეგიონის შეცვლისას

## 📍 Location Data

### **Current Restaurant Locations**

```typescript
// რესტორანი მაგნოლია
latitude: 41.7151, longitude: 44.8271
address: "1 ზაქარია ფალიაშვილის ქუჩა, თბილისი"

// რესტორანი მადაგონი
latitude: 41.7200, longitude: 44.8300
address: "15 რუსთაველის გამზირი, თბილისი"

// რესტორანი ბაზარი
latitude: 41.7100, longitude: 44.8200
address: "8 აღმაშენებლის გამზირი, თბილისი"
```

## 🚀 Usage Instructions

### **For Users:**

1. აირჩიეთ რესტორანი სიიდან
2. დააჭირეთ "დეტალური ინფორმაცია" ღილაკს
3. ნახეთ რესტორანის ლოკაცია map-ზე
4. გამოიყენეთ "რუკაზე ნახვა" Google Maps-ში გასახსნელად

### **For Developers:**

1. ახალი რესტორანის დასამატებლად, უბრალოდ დაამატეთ `location` ობიექტი
2. კოორდინატების მისაღებად გამოიყენეთ Google Maps ან სხვა mapping service
3. Map ავტომატურად გამოიყენებს ახალ მონაცემებს

## 🔧 Technical Requirements

### **Dependencies Added:**

```json
{
  "react-native-maps": "1.18.0"
}
```

### **Permissions Required:**

```xml
<!-- Android (android/app/src/main/AndroidManifest.xml) -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- iOS (ios/GreenGo/Info.plist) -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs access to location to show restaurant locations on map</string>
```

## 🎨 UI/UX Features

### **Visual Elements:**

- **Clean Card Design**: თეთრი ბარათები მრგვალი კუთხეებით
- **Green Accent Color**: #4CAF50 ღილაკებისთვის
- **Shadow Effects**: Card-ებზე subtle shadows
- **Responsive Layout**: მორგებული ყველა ეკრანის ზომას

### **Interactive Elements:**

- **Back Navigation**: მარტივი უკან დაბრუნება
- **Map Integration**: External map opening
- **Contact Button**: მომავალი კონტაქტის ფუნქციონალისთვის

## 🔮 Future Enhancements

### **Planned Features:**

1. **Real-time Location**: GPS-ით მომხმარებლის ლოკაციის ავტომატური გამოვლენა
2. **Route Planning**: რესტორანამდე მისვლის მარშრუტი
3. **Delivery Tracking**: შეკვეთის მიტანის real-time tracking
4. **Multiple Markers**: ყველა რესტორანის ერთ map-ზე ჩვენება
5. **Search Integration**: Map-ზე რესტორანების ძიება

### **Backend Integration:**

```typescript
// API endpoint for restaurant locations
GET /api/restaurants/:id/location
{
  "latitude": 41.7151,
  "longitude": 44.8271,
  "address": "1 ზაქარია ფალიაშვილის ქუჩა, თბილისი",
  "deliveryRadius": 5.0, // km
  "isDelivering": true
}
```

## 📱 Testing

### **Test Cases:**

1. ✅ Map loads with correct restaurant location
2. ✅ Marker shows restaurant name and address
3. ✅ "View on Map" opens external map application
4. ✅ Back navigation works correctly
5. ✅ Different restaurants show different locations
6. ✅ Map responds to touch gestures
7. ✅ User location permission handling

### **Device Testing:**

- **iOS**: iPhone 12+, iOS 14+
- **Android**: Android 8+, API level 26+
- **Screen Sizes**: 4.7" - 6.7" displays

---

**Note**: ეს implementation უზრუნველყოფს სრულ დინამიურ map ფუნქციონალს, სადაც ყოველი რესტორანისთვის გამოჩნდება მისი ნამდვილი ლოკაცია და მომხმარებელს შეუძლია მარტივად ნავიგაცია და კონტაქტი რესტორანთან.
