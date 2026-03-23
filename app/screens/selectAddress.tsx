import { LIST_ACCENT_GREEN } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY_GREEN = "#1B5E37";
const INPUT_BORDER = "#E5E7EB";

interface Address {
  street: string;
  city: string;
  district?: string;
  postalCode?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  instructions?: string;
}

function buildCourierInstructions(
  floor: string,
  apartment: string,
  entrance: string,
  extra: string,
): string | undefined {
  const parts: string[] = [];
  if (floor.trim()) parts.push(`სართული: ${floor.trim()}`);
  if (apartment.trim()) parts.push(`ბინა: ${apartment.trim()}`);
  if (entrance.trim()) parts.push(`შესასვლელი/კიბე: ${entrance.trim()}`);
  if (extra.trim()) parts.push(extra.trim());
  const joined = parts.join("\n");
  return joined || undefined;
}

export default function SelectAddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [address, setAddress] = useState<Address>({
    street: "",
    city: "თბილისი",
    coordinates: {
      lat: 41.7151,
      lng: 44.8271,
    },
  });
  const [floor, setFloor] = useState("");
  const [apartment, setApartment] = useState("");
  const [entrance, setEntrance] = useState("");
  const [courierNote, setCourierNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 41.7151,
    longitude: 44.8271,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const applyCoords = async (latitude: number, longitude: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      );
      const data = await response.json();

      if (data?.address) {
        const addr = data.address;
        setAddress({
          street:
            `${addr.road || ""} ${addr.house_number || ""}`.trim() ||
            address.street ||
            "",
          city: addr.city || addr.town || addr.municipality || "თბილისი",
          district: addr.suburb || addr.quarter,
          postalCode: addr.postcode,
          coordinates: { lat: latitude, lng: longitude },
        });
      } else {
        setAddress((prev) => ({
          ...prev,
          coordinates: { lat: latitude, lng: longitude },
        }));
      }

      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error("Geocoding error:", error);
      setAddress((prev) => ({
        ...prev,
        coordinates: { lat: latitude, lng: longitude },
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = (event: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    void applyCoords(latitude, longitude);
  };

  const handleGetCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "წვდომა უარყოფილია",
          "გთხოვთ მიუთითოთ ლოკაციის წვდომა პარამეტრებში",
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      await applyCoords(latitude, longitude);
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("შეცდომა", "ლოკაციის მიღება ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const streetOk =
      address.street.trim() &&
      address.street.trim() !== "მისამართი";
    if (!streetOk) {
      Alert.alert("შეცდომა", "გთხოვთ მიუთითოთ მისამართი ან აირჩიოთ წერტილი რუკაზე");
      return;
    }

    const mergedInstructions = buildCourierInstructions(
      floor,
      apartment,
      entrance,
      courierNote,
    );

    const finalAddress: Address = {
      ...address,
      instructions: mergedInstructions,
    };

    try {
      await AsyncStorage.setItem(
        "@greengo:selected_address",
        JSON.stringify(finalAddress),
      );
      router.back();
    } catch (error) {
      console.error("Error saving address:", error);
      Alert.alert("შეცდომა", "მისამართის შენახვა ვერ მოხერხდა");
    }
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backCircle}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={24} color={LIST_ACCENT_GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          მისამართის შეცვლა
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={LIST_ACCENT_GREEN} />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      ) : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.mapSectionTitle}>
          ზუსტად სად მოვიდეს კურიერი?
        </Text>

        <View style={styles.mapWrap}>
          <MapView
            style={styles.map}
            region={mapRegion}
            onPress={handleMapPress}
            showsUserLocation
          >
            <Marker
              coordinate={{
                latitude: address.coordinates.lat,
                longitude: address.coordinates.lng,
              }}
              pinColor="red"
            />
          </MapView>
          <TouchableOpacity
            style={styles.locateFab}
            onPress={handleGetCurrentLocation}
            activeOpacity={0.9}
          >
            <Ionicons name="locate" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.formSectionTitle}>მისამართის დეტალები</Text>

        <TextInput
          style={styles.input}
          value={address.street}
          onChangeText={(text) => setAddress({ ...address, street: text })}
          placeholder="მისამართი"
          placeholderTextColor="#9CA3AF"
        />
        <TextInput
          style={styles.input}
          value={floor}
          onChangeText={setFloor}
          placeholder="სართული"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
        />
        <TextInput
          style={styles.input}
          value={apartment}
          onChangeText={setApartment}
          placeholder="ბინა"
          placeholderTextColor="#9CA3AF"
        />
        <TextInput
          style={styles.input}
          value={entrance}
          onChangeText={setEntrance}
          placeholder="შესასვლელი / კიბე"
          placeholderTextColor="#9CA3AF"
        />
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={courierNote}
          onChangeText={setCourierNote}
          placeholder="დამატებითი ინსტრუქცია კურიერისთვის"
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
        />
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 14) },
        ]}
      >
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.9}
        >
          <Text style={styles.saveBtnText}>შენახვა</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: INPUT_BORDER,
    backgroundColor: "#FFFFFF",
  },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontFamily: fontFamily.semiBold,
    color: "#111827",
    textAlign: "center",
    marginHorizontal: 8,
  },
  headerSpacer: {
    width: 44,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  mapSectionTitle: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    color: "#111827",
    marginBottom: 12,
  },
  mapWrap: {
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
    backgroundColor: "#E5E7EB",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  locateFab: {
    position: "absolute",
    bottom: 14,
    right: 14,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: LIST_ACCENT_GREEN,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  formSectionTitle: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    color: "#111827",
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: INPUT_BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: "#111827",
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: 14,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: INPUT_BORDER,
  },
  saveBtn: {
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: "#FFFFFF",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
    gap: 10,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: "#6B7280",
  },
});
