import AddLocationMapIcon from "@/components/icons/AddLocationMapIcon";
import ListScreenLayout from "@/components/layout/ListScreenLayout";
import { BRAND_GREEN, LIST_ACCENT_GREEN } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
import { BORDER_LIGHT } from "@/constants/formStyles";
import {
  CURRENT_LOCATION_ID,
  getCurrentLocationAddress,
  getSelectedAddressId,
  loadDeliveryAddress,
  loadSavedAddresses,
  SavedAddress,
  selectDeliveryAddress,
} from "@/utils/address";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type CurrentLocation = {
  street: string;
  subtitle: string;
  coordinates: { lat: number; lng: number };
};

export default function LocationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] =
    useState<CurrentLocation | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [saved, active, detected] = await Promise.all([
        loadSavedAddresses(),
        loadDeliveryAddress(),
        getCurrentLocationAddress(),
      ]);

      setSavedAddresses(saved);

      const currentStreet =
        detected?.street?.trim() || active?.street?.trim() || "";
      const currentCoords =
        detected?.coordinates || active?.coordinates || null;

      if (currentStreet && currentCoords) {
        setCurrentLocation({
          street: currentStreet,
          subtitle:
            detected?.district?.trim() || detected?.city?.trim() || "თბილისი",
          coordinates: currentCoords,
        });
      } else {
        setCurrentLocation(null);
      }

      let sel = await getSelectedAddressId();
      if (!sel && active?.street?.trim()) {
        const match = saved.find((a) => a.street === active.street);
        sel = match?.id ?? CURRENT_LOCATION_ID;
      }
      setSelectedId(sel);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const handleSelectCurrent = async () => {
    if (!currentLocation) return;
    await selectDeliveryAddress(
      {
        street: currentLocation.street,
        city: currentLocation.subtitle,
        coordinates: currentLocation.coordinates,
      },
      CURRENT_LOCATION_ID,
    );
    setSelectedId(CURRENT_LOCATION_ID);
    router.back();
  };

  const handleSelectSaved = async (item: SavedAddress) => {
    await selectDeliveryAddress(item, item.id);
    setSelectedId(item.id);
    router.back();
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <ListScreenLayout title="ლოკაცია">
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={BRAND_GREEN} />
          </View>
        ) : (
          <View style={styles.list}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push("/screens/addAddress")}
              activeOpacity={0.7}
            >
              <View style={styles.addIconWrap}>
                <AddLocationMapIcon size={24} />
              </View>
              <Text style={styles.addLabel}>ახალი ლოკაციის დამატება</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={LIST_ACCENT_GREEN}
              />
            </TouchableOpacity>

            {currentLocation ? (
              <TouchableOpacity
                style={styles.row}
                onPress={handleSelectCurrent}
                activeOpacity={0.7}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name="navigate-outline" size={20} color="#9CA3AF" />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>ამჟამინდელი ლოკაცია</Text>
                  <Text style={styles.rowSubtitle} numberOfLines={1}>
                    {currentLocation.street}
                  </Text>
                </View>
                {selectedId === CURRENT_LOCATION_ID ? (
                  <Ionicons
                    name="checkmark"
                    size={22}
                    color={LIST_ACCENT_GREEN}
                  />
                ) : (
                  <View style={styles.checkPlaceholder} />
                )}
              </TouchableOpacity>
            ) : null}

            {savedAddresses.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.row}
                onPress={() => handleSelectSaved(item)}
                activeOpacity={0.7}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name="location-outline" size={20} color="#9CA3AF" />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle} numberOfLines={2}>
                    {item.street}
                  </Text>
                </View>
                {selectedId === item.id ? (
                  <Ionicons
                    name="checkmark"
                    size={22}
                    color={LIST_ACCENT_GREEN}
                  />
                ) : (
                  <View style={styles.checkPlaceholder} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ListScreenLayout>
    </>
  );
}

const styles = StyleSheet.create({
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  list: {
    paddingTop: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER_LIGHT,
    gap: 12,
  },
  addIconWrap: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  addLabel: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: "#00592D",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 22,
    color: "#111827",
  },
  rowSubtitle: {
    marginTop: 2,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
  },
  checkPlaceholder: {
    width: 22,
  },
});
