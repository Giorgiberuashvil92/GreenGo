import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

  const [region, setRegion] = useState({
    latitude: 41.7151,
    longitude: 44.8271,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    if (restaurant && restaurant.location) {
      setRegion({
        latitude: restaurant.location.latitude || 41.7151,
        longitude: restaurant.location.longitude || 44.8271,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [restaurant]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !restaurant) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
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
    const phone = restaurant.contact?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch(() => {
        Alert.alert("შეცდომა", "ვერ მოხერხდა დარეკვა");
      });
    } else {
      Alert.alert("ინფორმაცია", "ტელეფონის ნომერი არ არის მითითებული");
    }
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
    : [
        { day: "ორშაბათი", hours: "09:00 - 23:00" },
        { day: "სამშაბათი", hours: "09:00 - 23:00" },
        { day: "ოთხშაბათი", hours: "09:00 - 23:00" },
        { day: "ხუთშაბათი", hours: "09:00 - 23:00" },
        { day: "პარასკევი", hours: "09:00 - 23:00" },
        { day: "შაბათი", hours: "09:00 - 23:00" },
        { day: "კვირა", hours: "09:00 - 23:00" },
      ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Map Section */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={region}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass={false}
            showsScale={false}
            mapType="standard"
          >
            {restaurant.location && (
              <Marker
                coordinate={{
                  latitude: restaurant.location.latitude,
                  longitude: restaurant.location.longitude,
                }}
                title={restaurant.name}
                description={restaurant.location.address}
              >
                <View style={styles.markerContainer}>
                  <View style={styles.marker}>
                    <Ionicons name="location" size={20} color="#FFFFFF" />
                  </View>
                </View>
              </Marker>
            )}
          </MapView>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
        </View>

        {/* Restaurant Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>

          {restaurant.location && (
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={20} color="#666666" />
              <Text style={styles.addressText}>
                {restaurant.location.address}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.viewOnMapButton}
            onPress={handleViewOnMap}
          >
            <Text style={styles.viewOnMapText}>რუკაზე ნახვა</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Working Hours Card */}
        <View style={styles.hoursCard}>
          <Text style={styles.sectionTitle}>სამუშაო საათები</Text>
          {workingHours.map((item, index) => (
            <View key={index} style={styles.hoursRow}>
              <Text style={styles.dayText}>{item.day}</Text>
              <Text style={styles.hoursText}>{item.hours}</Text>
            </View>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Contact Card */}
        <View style={styles.contactCard}>
          <Text style={styles.sectionTitle}>კონტაქტი</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  mapContainer: {
    height: 220,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: "center",
  },
  marker: {
    backgroundColor: "#E53935",
    borderRadius: 20,
    padding: 8,
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  addressText: {
    fontSize: 15,
    color: "#666666",
    marginLeft: 8,
    flex: 1,
  },
  viewOnMapButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#2E7D32",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  viewOnMapText: {
    color: "#2E7D32",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    height: 8,
    backgroundColor: "#F5F5F5",
  },
  hoursCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  dayText: {
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "400",
  },
  hoursText: {
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "400",
  },
  contactCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  contactText: {
    fontSize: 15,
    color: "#666666",
    lineHeight: 22,
    marginBottom: 20,
  },
  contactButton: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  contactButtonText: {
    color: "#2E7D32",
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
    backgroundColor: "#2E7D32",
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
