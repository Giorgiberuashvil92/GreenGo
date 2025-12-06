import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { useRestaurant } from "../../hooks/useRestaurants";

export default function RestaurantDetailsScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const router = useRouter();
  const { restaurant, loading, error } = useRestaurant(restaurantId || "");

  // Map region (centered initially on restaurant)
  const [region, setRegion] = useState({
    latitude: 41.7151,
    longitude: 44.8271,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Simple delivery simulation state
  const [isSimulatingDelivery, setIsSimulatingDelivery] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0); // 0 → 1

  // Fixed "user" location for simulation (could be current user in the future)
  const simulatedUserLocation = useMemo(
    () => ({
      latitude: region.latitude + 0.01,
      longitude: region.longitude + 0.01,
    }),
    [region.latitude, region.longitude]
  );

  const deliveryMarkerPosition = useMemo(() => {
    if (!restaurant || !restaurant.location) {
      return null;
    }

    const startLat = restaurant.location.latitude;
    const startLng = restaurant.location.longitude;
    const endLat = simulatedUserLocation.latitude;
    const endLng = simulatedUserLocation.longitude;

    const lat = startLat + (endLat - startLat) * simulationProgress;
    const lng = startLng + (endLng - startLng) * simulationProgress;

    return { latitude: lat, longitude: lng };
  }, [restaurant, simulatedUserLocation, simulationProgress]);

  // Location states for future use
  // const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  // const [locationPermission, setLocationPermission] = useState<boolean>(false);

  useEffect(() => {
    if (restaurant && restaurant.location) {
      // Set restaurant location on map
      setRegion({
        latitude: restaurant.location.latitude || 41.7151,
        longitude: restaurant.location.longitude || 44.8271,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [restaurant]);

  // Very simple timer-based simulation (no real GPS)
  useEffect(() => {
    if (!isSimulatingDelivery) {
      return;
    }

    setSimulationProgress(0);
    const start = Date.now();
    const durationMs = 15000; // ~15 წამი რესტორნიდან "კლიენტამდე"

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / durationMs);
      setSimulationProgress(progress);

      if (progress >= 1) {
        clearInterval(interval);
        setIsSimulatingDelivery(false);
        Alert.alert("მიტანა დასრულდა", "შეკვეთა ადგილზეა (სიმულაცია) 🛵");
      }
    }, 300);

    return () => clearInterval(interval);
  }, [isSimulatingDelivery]);

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || "რესტორნი ვერ მოიძებნა"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>უკან დაბრუნება</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleViewOnMap = () => {
    if (!restaurant.location) return;
    const { latitude, longitude } = restaurant.location;
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    Linking.openURL(url).catch(() => {
      Alert.alert("შეცდომა", "ვერ მოვახერხეთ რუკის გახსნა");
    });
  };

  const handleContact = () => {
    const contactInfo = restaurant.contact || {};
    Alert.alert(
      "კონტაქტი",
      `ტელეფონი: ${contactInfo.phone || "არ არის მითითებული"}\nელ-ფოსტა: ${
        contactInfo.email || "არ არის მითითებული"
      }\nვებ-საიტი: ${contactInfo.website || "არ არის მითითებული"}`,
      [{ text: "კარგი" }]
    );
  };

  // Format working hours for display
  const workingHours = restaurant.workingHours
    ? Object.entries(restaurant.workingHours).map(([day, hours]) => {
        const dayNames: { [key: string]: string } = {
          monday: "ორშაბათი",
          tuesday: "სამშაბათი",
          wednesday: "ოთხშაბათი",
          thursday: "ხუთშაბათი",
          friday: "პარასკევი",
          saturday: "შაბათი",
          sunday: "კვირა",
        };
        return {
          day: dayNames[day.toLowerCase()] || day,
          hours: hours as string,
        };
      })
    : [];
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
            {restaurant.location && (
              <Marker
                coordinate={{
                  latitude: restaurant.location.latitude,
                  longitude: restaurant.location.longitude,
                }}
                title={restaurant.name}
                description={restaurant.location.address}
              />
            )}

            {/* Simulated user location marker */}
            <Marker
              coordinate={simulatedUserLocation}
              pinColor="#3B82F6"
              title="კლიენტის ლოკაცია (სიმულაცია)"
            />

            {/* Delivery in-progress marker */}
            {deliveryMarkerPosition && (
              <Marker
                coordinate={deliveryMarkerPosition}
                pinColor="#F97316"
                title="კურიერი გზაშია (სიმულაცია)"
                description="ეს არის ვიზუალური დემო მიტანისთვის"
              />
            )}
          </MapView>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.mapBackButton}
            onPress={() => {
              // Try to go back to restaurant screen, or just go back
              if (restaurantId) {
                router.push({
                  pathname: "/screens/restaurant",
                  params: { restaurantId },
                });
              } else {
                router.back();
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* Restaurant Information Card */}
        <View style={styles.infoCard}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>

          {restaurant.location && (
            <View style={styles.addressContainer}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.address}>
                {restaurant.location.address}, {restaurant.location.city}
              </Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.viewOnMapButton, { flex: 1, marginRight: 8 }]}
              onPress={handleViewOnMap}
            >
              <Text style={styles.viewOnMapText}>რუკაზე ნახვა</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuButton, { flex: 1, marginLeft: 8 }]}
              onPress={() => {
                if (restaurantId) {
                  router.push({
                    pathname: "/screens/restaurant",
                    params: { restaurantId },
                  });
                }
              }}
            >
              <Text style={styles.menuButtonText}>მენიუ</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.simulationButton,
              isSimulatingDelivery && styles.simulationButtonDisabled,
            ]}
            activeOpacity={0.8}
            onPress={() => {
              if (!isSimulatingDelivery) {
                setIsSimulatingDelivery(true);
              }
            }}
          >
            <Text style={styles.simulationButtonText}>
              {isSimulatingDelivery
                ? "მიტანა მიმდინარეობს..."
                : "მიტანის სიმულაცია"}
            </Text>
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
  buttonRow: {
    flexDirection: "row",
    marginBottom: 12,
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
  menuButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  menuButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  simulationButton: {
    marginTop: 12,
    backgroundColor: "#22C55E",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  simulationButtonDisabled: {
    backgroundColor: "#BBF7D0",
  },
  simulationButtonText: {
    color: "#FFFFFF",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
