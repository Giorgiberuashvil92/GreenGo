import BackCircleIcon from "@/components/icons/BackCircleIcon";
import { fontFamily } from "@/constants/fonts";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRestaurant } from "../../hooks/useRestaurants";

const DETAILS_TEXT_COLOR = "#1D4045";
const MAP_HEIGHT = Math.round(Dimensions.get("window").height * 0.34);

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const DAY_NAMES_KA: Record<string, string> = {
  monday: "ორშაბათი",
  tuesday: "სამშაბათი",
  wednesday: "ოთხშაბათი",
  thursday: "ხუთშაბათი",
  friday: "პარასკევი",
  saturday: "შაბათი",
  sunday: "კვირა",
};

const DEFAULT_HOURS = "09:00 - 23:00";

const ALLERGY_NOTICE =
  "ალერგიის შემთხვევაში გთხოვთ წინასწარ დაუკავშირდეთ რესტორანს, რათა თქვენი შეკვეთა იყოს უსაფრთხო და თქვენზე მორგებული.";

function formatRestaurantTitle(name: string) {
  const trimmed = name.trim();
  if (trimmed.toLowerCase().startsWith("რესტორანი")) {
    return trimmed;
  }
  return `რესტორანი ${trimmed}`;
}

export default function RestaurantDetailsScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { restaurant, loading, error } = useRestaurant(restaurantId || "");

  const [region, setRegion] = useState({
    latitude: 41.7151,
    longitude: 44.8271,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  });

  useEffect(() => {
    if (restaurant?.location) {
      setRegion({
        latitude: restaurant.location.latitude || 41.7151,
        longitude: restaurant.location.longitude || 44.8271,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      });
    }
  }, [restaurant]);

  const workingHoursRows = useMemo(() => {
    const hours = restaurant?.workingHours;
    if (hours && Object.keys(hours).length > 0) {
      return DAY_ORDER.map((key) => {
        const matchKey = Object.keys(hours).find(
          (k) => k.toLowerCase() === key,
        );
        return {
          day: DAY_NAMES_KA[key],
          hours: matchKey ? String(hours[matchKey]) : DEFAULT_HOURS,
        };
      });
    }
    return DAY_ORDER.map((key) => ({
      day: DAY_NAMES_KA[key],
      hours: DEFAULT_HOURS,
    }));
  }, [restaurant?.workingHours]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={DETAILS_TEXT_COLOR} />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      </View>
    );
  }

  if (error || !restaurant) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            {error || "რესტორნი ვერ მოიძებნა"}
          </Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.retryBtnText}>უკან დაბრუნება</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const addressLine =
    restaurant.location?.address ||
    [restaurant.location?.city, restaurant.location?.district]
      .filter(Boolean)
      .join(", ") ||
    "მისამართი არ არის მითითებული";

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
        Alert.alert("შეცდომა", "ვერ მოვახერხეთ დარეკვა");
      });
      return;
    }
    Alert.alert(
      "კონტაქტი",
      restaurant.contact?.email
        ? `ელ-ფოსტა: ${restaurant.contact.email}`
        : "საკონტაქტო ინფორმაცია არ არის მითითებული",
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.mapWrap, { height: MAP_HEIGHT }]}>
          <MapView
            style={styles.map}
            region={region}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            showsUserLocation={false}
            showsMyLocationButton={false}
          >
            {restaurant.location ? (
              <Marker
                coordinate={{
                  latitude: restaurant.location.latitude,
                  longitude: restaurant.location.longitude,
                }}
                title={restaurant.name}
                description={addressLine}
              />
            ) : null}
          </MapView>

          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 8 }]}
            onPress={() => router.back()}
            activeOpacity={0.85}
            accessibilityLabel="უკან"
          >
            <BackCircleIcon size={32} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <Text style={styles.restaurantName}>
            {formatRestaurantTitle(restaurant.name)}
          </Text>

          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={18} color="#6B7280" />
            <Text style={styles.addressText}>{addressLine}</Text>
          </View>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleViewOnMap}
            activeOpacity={0.88}
          >
            <Text style={styles.secondaryBtnText}>რუკაზე ნახვა</Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>სამუშაო საათები</Text>
            {workingHoursRows.map((row) => (
              <View key={row.day} style={styles.hoursRow}>
                <Text style={styles.hoursDay}>{row.day}</Text>
                <Text style={styles.hoursTime}>{row.hours}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>კონტაქტი</Text>
            <Text style={styles.contactBody}>{ALLERGY_NOTICE}</Text>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={handleContact}
              activeOpacity={0.88}
            >
              <Text style={styles.secondaryBtnText}>დაგვიკავშირდით</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 32,
  },
  mapWrap: {
    width: "100%",
    backgroundColor: "#E5E7EB",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    zIndex: 2,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 20,
  },
  restaurantName: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: fontFamily.extraBold,
    color: "#111827",
    textTransform: "uppercase",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: -8,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.medium,
    color: "#6B7280",
  },
  secondaryBtn: {
    alignSelf: "stretch",
    paddingVertical: 12,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F8F9",
    borderRadius: 60,
  },
  secondaryBtnText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: "#1D4045",
    textAlign: "center",
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: fontFamily.bold,
    color: "#111827",
    textTransform: "uppercase",
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },
  hoursDay: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.regular,
    color: "#6B7280",
    textTransform: "uppercase",
  },
  hoursTime: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.regular,
    color: "#6B7280",
    textTransform: "uppercase",
  },
  contactBody: {
    fontSize: 12,
    lineHeight: 20,
    fontFamily: fontFamily.regular,
    color: "#6B7280",
    textTransform: "uppercase",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.medium,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.medium,
    color: "#EF4444",
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: DETAILS_TEXT_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryBtnText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: "#FFFFFF",
  },
});
