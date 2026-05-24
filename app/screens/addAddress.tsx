import BackCircleIcon from "@/components/icons/BackCircleIcon";
import { BRAND_GREEN } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
import {
  addSavedAddress,
  fetchAddressFromCoords,
  selectDeliveryAddress,
  type DeliveryAddress,
} from "@/utils/address";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MARKER_COLOR = "#3B82F6";
const DEFAULT_REGION: Region = {
  latitude: 41.7151,
  longitude: 44.8271,
  latitudeDelta: 0.008,
  longitudeDelta: 0.008,
};

export default function AddAddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [address, setAddress] = useState<DeliveryAddress | null>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const applyCoords = async (latitude: number, longitude: number) => {
    setLoading(true);
    try {
      const resolved = await fetchAddressFromCoords(
        latitude,
        longitude,
        address?.street,
      );
      setAddress(resolved);
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "წვდომა უარყოფილია",
            "გთხოვთ ჩართოთ ლოკაცია, რომ მიმდინარე მდებარეობა გამოჩნდეს რუკაზე",
          );
          if (!cancelled) setLoading(false);
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;
        const { latitude, longitude } = position.coords;
        await applyCoords(latitude, longitude);
      } catch {
        if (!cancelled) setLoading(false);
      }
    };

    void init();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMapPress = (event: {
    nativeEvent: { coordinate: { latitude: number; longitude: number } };
  }) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    void applyCoords(latitude, longitude);
  };

  const handleGetCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "წვდომა უარყოფილია",
          "გთხოვთ ჩართოთ ლოკაცია, რომ მიმდინარე მდებარეობა გამოჩნდეს რუკაზე",
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = position.coords;
      await applyCoords(latitude, longitude);
    } catch {
      Alert.alert("შეცდომა", "ლოკაციის მიღება ვერ მოხერხდა");
    }
  };

  const handleSave = async () => {
    if (!address?.street?.trim()) {
      Alert.alert("შეცდომა", "გთხოვთ აირჩიოთ მისამართი რუკაზე");
      return;
    }

    setSaving(true);
    try {
      const saved = await addSavedAddress(address);
      await selectDeliveryAddress(saved, saved.id);
      router.back();
    } catch {
      Alert.alert("შეცდომა", "მისამართის დამატება ვერ მოხერხდა");
    } finally {
      setSaving(false);
    }
  };

  const streetLine = address?.street?.trim() || "მისამართის განსაზღვრა...";

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.mapSection}>
        <MapView
          style={StyleSheet.absoluteFill}
          region={region}
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {address ? (
            <Marker
              coordinate={{
                latitude: address.coordinates.lat,
                longitude: address.coordinates.lng,
              }}
              anchor={{ x: 0.5, y: 1 }}
            >
              <Ionicons name="location" size={44} color={MARKER_COLOR} />
            </Marker>
          ) : null}
        </MapView>

        <TouchableOpacity
          style={[styles.backBtn, { top: insets.top + 8 }]}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <BackCircleIcon size={32} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.locateFab}
          onPress={() => void handleGetCurrentLocation()}
          activeOpacity={0.9}
          disabled={loading}
          accessibilityLabel="ჩემი ლოკაცია"
        >
          <Ionicons name="locate" size={22} color={BRAND_GREEN} />
        </TouchableOpacity>

        {loading ? (
          <View style={styles.mapLoader}>
            <ActivityIndicator size="large" color={BRAND_GREEN} />
          </View>
        ) : null}
      </View>

      <View
        style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <Text style={styles.sheetTitle}>მიუთითეთ მისამართი</Text>

        <View style={styles.addressField}>
          <Ionicons name="location-outline" size={20} color="#9CA3AF" />
          <Text style={styles.addressText} numberOfLines={2}>
            {streetLine}
          </Text>
        </View>

        <Text style={styles.hint}>
          მიუთითეთ თქვენი მისამართი სწორად, რათა ჩვენმა კურიერმა მარტივად
          გიპოვოთ.
        </Text>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving || loading}
          activeOpacity={0.9}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>მისამართის დამატება</Text>
          )}
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
  mapSection: {
    flex: 1,
    backgroundColor: "#E5E7EB",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    zIndex: 10,
  },
  locateFab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  mapLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    marginTop: -12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  sheetTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    lineHeight: 24,
    color: "#111827",
    marginBottom: 16,
  },
  addressField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  addressText: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 20,
    color: "#111827",
  },
  hint: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
    marginBottom: 20,
  },
  saveBtn: {
    backgroundColor: BRAND_GREEN,
    borderRadius: 28,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 20,
    color: "#FFFFFF",
  },
});
