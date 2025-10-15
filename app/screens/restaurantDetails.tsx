import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { restaurantsData } from "../../assets/data/restaurantsData";
import { getContactInfo, getWorkingHours } from "../../utils/restaurantUtils";

export default function RestaurantDetailsScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const router = useRouter();
  const restaurant = restaurantsData.find((r) => r.id === restaurantId);

  const [region, setRegion] = useState({
    latitude: 41.7151,
    longitude: 44.8271,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Location states for future use
  // const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  // const [locationPermission, setLocationPermission] = useState<boolean>(false);

  useEffect(() => {
    if (restaurant) {
      // Set restaurant location on map
      setRegion({
        latitude: restaurant.location?.latitude || 41.7151,
        longitude: restaurant.location?.longitude || 44.8271,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [restaurant]);

  // Location functions for future use
  // const getCurrentLocation = useCallback(async () => {
  //   try {
  //     const location = await Location.getCurrentPositionAsync({});
  //     setUserLocation(location);
  //   } catch (error) {
  //     console.log("Get location error:", error);
  //   }
  // }, []);

  // const getLocationPermission = useCallback(async () => {
  //   try {
  //     const { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status === "granted") {
  //       setLocationPermission(true);
  //       getCurrentLocation();
  //     } else {
  //       setLocationPermission(false);
  //     }
  //   } catch (error) {
  //     console.log("Location permission error:", error);
  //   }
  // }, [getCurrentLocation]);

  // useEffect(() => {
  //   getLocationPermission();
  // }, [getLocationPermission]);

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Restaurant not found</Text>
      </SafeAreaView>
    );
  }

  const handleViewOnMap = () => {
    const { latitude, longitude } = restaurant.location;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    Linking.openURL(url).catch(() => {
      Alert.alert("შეცდომა", "ვერ მოვახერხეთ რუკის გახსნა");
    });
  };

  const handleContact = () => {
    const contactInfo = getContactInfo(restaurant);
    Alert.alert(
      "კონტაქტი",
      `ტელეფონი: ${contactInfo.phone || "არ არის მითითებული"}\nელ-ფოსტა: ${
        contactInfo.email || "არ არის მითითებული"
      }\nვებ-საიტი: ${contactInfo.website || "არ არის მითითებული"}`,
      [{ text: "კარგი" }]
    );
  };

  // const handleCall = () => {
  //   if (restaurant.contact.phone) {
  //     Linking.openURL(`tel:${restaurant.contact.phone}`).catch(() => {
  //       Alert.alert("შეცდომა", "ვერ მოვახერხეთ ზარის გაკეთება");
  //     });
  //   } else {
  //     Alert.alert("შეცდომა", "ტელეფონის ნომერი არ არის მითითებული");
  //   }
  // };

  const workingHours = getWorkingHours(restaurant);
  // const isOpen = isRestaurantOpen(restaurant);
  // const currentDayHours = getCurrentDayHours(restaurant);
  // const fullAddress = formatAddress(restaurant);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Interactive Map Section */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={region}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass={false}
            showsScale={false}
            mapType="standard"
            onRegionChangeComplete={setRegion}
          >
            {/* Restaurant Marker */}
            <Marker
              coordinate={{
                latitude: restaurant.location.latitude,
                longitude: restaurant.location.longitude,
              }}
              title={restaurant.name}
              description={restaurant.location.address}
            />
          </MapView>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.mapBackButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* Restaurant Information Card */}
        <View style={styles.infoCard}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>

          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.address}>{restaurant.location.address}</Text>
          </View>

          <TouchableOpacity
            style={styles.viewOnMapButton}
            onPress={handleViewOnMap}
          >
            <Text style={styles.viewOnMapText}>რუკაზე ნახვა</Text>
          </TouchableOpacity>
        </View>

        {/* Working Hours Card */}
        <View style={styles.hoursCard}>
          <Text style={styles.cardTitle}>სამუშაო საათები</Text>
          {workingHours.map((item, index) => (
            <View key={index} style={styles.hoursRow}>
              <Text style={styles.dayText}>{item.day}</Text>
              <Text style={styles.hoursText}>{item.hours}</Text>
            </View>
          ))}
        </View>

        {/* Contact Card */}
        <View style={styles.contactCard}>
          <Text style={styles.cardTitle}>კონტაქტი</Text>
          <Text style={styles.contactText}>
            თუ გაქვთ ალერგია, გთხოვთ წინასწარ დაუკავშირდეთ რესტორანს, რათა
            თქვენი შეკვეთა იყოს უსაფრთხო და სრულად თქვენს მოთხოვნებზე მორგებული.
          </Text>

          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContact}
          >
            <Text style={styles.contactButtonText}>დაგვიკავშირდით</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  scrollView: {
    flex: 1,
  },
  mapContainer: {
    height: 280,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  mapBackButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  address: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  viewOnMapButton: {
    backgroundColor: "#E8F5E8",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  viewOnMapText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },
  hoursCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  dayText: {
    fontSize: 16,
    color: "#333",
  },
  hoursText: {
    fontSize: 16,
    color: "#333",
  },
  contactCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginBottom: 30,
  },
  contactText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 20,
  },
  contactButton: {
    backgroundColor: "#E8F5E8",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  contactButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },
});
