import BackCircleIcon from "@/components/icons/BackCircleIcon";
import { BRAND_GREEN } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
import {
  addSavedAddress,
  fetchAddressFromCoords,
  selectDeliveryAddress,
  type DeliveryAddress,
} from "@/utils/address";
import {
  fetchPlaceDetails,
  fetchPlaceSuggestions,
  getGoogleMapsApiKey,
  type PlaceSuggestion,
} from "@/utils/googlePlaces";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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

function createSessionToken() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function AddAddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [address, setAddress] = useState<DeliveryAddress | null>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [resolvingPlace, setResolvingPlace] = useState(false);
  const [sessionToken, setSessionToken] = useState(createSessionToken);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const hasGooglePlaces = Boolean(getGoogleMapsApiKey());
  const skipNextSearch = useRef(false);

  const applyAddress = (next: DeliveryAddress) => {
    setAddress(next);
    setQuery(next.street);
    setRegion({
      latitude: next.coordinates.lat,
      longitude: next.coordinates.lng,
      latitudeDelta: 0.008,
      longitudeDelta: 0.008,
    });
    setSuggestions([]);
  };

  const applyCoords = async (latitude: number, longitude: number) => {
    setLoading(true);
    try {
      const resolved = await fetchAddressFromCoords(
        latitude,
        longitude,
        query.trim(),
      );
      applyAddress(resolved);
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

  useEffect(() => {
    if (!hasGooglePlaces) {
      setSuggestions([]);
      return;
    }

    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(() => {
      void fetchPlaceSuggestions(trimmed, sessionToken)
        .then((results) => setSuggestions(results))
        .catch(() => setSuggestions([]))
        .finally(() => setSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query, sessionToken, hasGooglePlaces]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleMapPress = (event: {
    nativeEvent: { coordinate: { latitude: number; longitude: number } };
  }) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSessionToken(createSessionToken());
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
      setSessionToken(createSessionToken());
      const { latitude, longitude } = position.coords;
      await applyCoords(latitude, longitude);
    } catch {
      Alert.alert("შეცდომა", "ლოკაციის მიღება ვერ მოხერხდა");
    }
  };

  const handleSelectSuggestion = async (suggestion: PlaceSuggestion) => {
    Keyboard.dismiss();
    setResolvingPlace(true);
    setSuggestions([]);

    try {
      const resolved = await fetchPlaceDetails(
        suggestion.placeId,
        sessionToken,
      );
      setSessionToken(createSessionToken());

      if (resolved) {
        skipNextSearch.current = true;
        applyAddress({
          ...resolved,
          street: resolved.street || suggestion.mainText,
        });
        return;
      }

      Alert.alert("შეცდომა", "მისამართის დეტალები ვერ მოიძებნა");
    } catch {
      Alert.alert("შეცდომა", "მისამართის დეტალები ვერ მოიძებნა");
    } finally {
      setResolvingPlace(false);
    }
  };

  const handleSave = async () => {
    const street = query.trim() || address?.street?.trim() || "";
    if (!street) {
      Alert.alert("შეცდომა", "გთხოვთ აირჩიოთ ან ჩაწეროთ მისამართი");
      return;
    }

    const payload: DeliveryAddress = {
      ...(address ?? {
        city: "საქართველო",
        coordinates: {
          lat: region.latitude,
          lng: region.longitude,
        },
      }),
      street,
    };

    setSaving(true);
    try {
      const saved = await addSavedAddress(payload);
      await selectDeliveryAddress(saved, saved.id);
      router.back();
    } catch {
      Alert.alert("შეცდომა", "მისამართის დამატება ვერ მოხერხდა");
    } finally {
      setSaving(false);
    }
  };

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

        {loading || resolvingPlace ? (
          <View style={styles.mapLoader}>
            <ActivityIndicator size="large" color={BRAND_GREEN} />
          </View>
        ) : null}
      </View>

      <View
        style={[
          styles.sheet,
          {
            bottom: keyboardHeight,
            paddingBottom: keyboardHeight > 0 ? 12 : Math.max(insets.bottom, 16),
          },
        ]}
      >
        <Text style={styles.sheetTitle}>მიუთითეთ მისამართი</Text>

        <View style={styles.addressField}>
          <Ionicons name="location-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.addressInput}
            value={query}
            onChangeText={setQuery}
            placeholder="ჩაწერეთ ქუჩა, ბინა, ქალაქი..."
            placeholderTextColor="#9CA3AF"
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searching ? (
            <ActivityIndicator size="small" color={BRAND_GREEN} />
          ) : null}
        </View>

        {!hasGooglePlaces ? (
          <Text style={styles.apiHint}>
            Google Places API გასაღები არ არის დაყენებული. დაამატე
            EXPO_PUBLIC_GOOGLE_MAPS_API_KEY .env ფაილში.
          </Text>
        ) : null}

        {suggestions.length > 0 ? (
          <View style={styles.suggestionsBox}>
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.placeId}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              style={styles.suggestionsList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionRow}
                  onPress={() => void handleSelectSuggestion(item)}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name="location-outline"
                    size={18}
                    color="#6B7280"
                    style={styles.suggestionIcon}
                  />
                  <View style={styles.suggestionTextWrap}>
                    <Text style={styles.suggestionMain} numberOfLines={1}>
                      {item.mainText}
                    </Text>
                    {item.secondaryText ? (
                      <Text style={styles.suggestionSecondary} numberOfLines={1}>
                        {item.secondaryText}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        ) : null}

        {keyboardHeight === 0 ? (
          <Text style={styles.hint}>
            მიუთითეთ თქვენი მისამართი სწორად, რათა ჩვენმა კურიერმა მარტივად
            გიპოვოთ.
          </Text>
        ) : null}

        {keyboardHeight === 0 ? (
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving || loading || resolvingPlace}
            activeOpacity={0.9}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>მისამართის დამატება</Text>
            )}
          </TouchableOpacity>
        ) : null}
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
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    marginTop: -12,
    zIndex: 20,
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
    paddingVertical: 10,
    marginBottom: 8,
  },
  addressInput: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 20,
    color: "#111827",
    paddingVertical: 4,
  },
  apiHint: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: "#B45309",
    marginBottom: 8,
  },
  suggestionsBox: {
    maxHeight: 260,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    overflow: "hidden",
  },
  suggestionsList: {
    flexGrow: 0,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F3F4F6",
  },
  suggestionIcon: {
    marginTop: 2,
  },
  suggestionTextWrap: {
    flex: 1,
    marginLeft: 10,
  },
  suggestionMain: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 18,
    color: "#111827",
  },
  suggestionSecondary: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: "#6B7280",
    marginTop: 2,
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
