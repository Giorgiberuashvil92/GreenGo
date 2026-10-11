import BackCircleIcon from "@/components/icons/BackCircleIcon";
import MapAddressPin from "@/components/MapAddressPin";
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
import MapView, { Region } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DEFAULT_REGION: Region = {
  latitude: 41.7151,
  longitude: 44.8271,
  latitudeDelta: 0.008,
  longitudeDelta: 0.008,
};

function createSessionToken() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const PIN_SIZE = 48;
const PIN_TIP_OFFSET = Math.round(PIN_SIZE * 1.22) + 6;

export default function AddAddressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const isProgrammaticMove = useRef(false);
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [address, setAddress] = useState<DeliveryAddress | null>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [loading, setLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [resolvingPlace, setResolvingPlace] = useState(false);
  const [sessionToken, setSessionToken] = useState(createSessionToken);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const hasGooglePlaces = Boolean(getGoogleMapsApiKey());
  const skipNextSearch = useRef(false);

  const moveMapTo = (latitude: number, longitude: number) => {
    const next: Region = {
      latitude,
      longitude,
      latitudeDelta: 0.008,
      longitudeDelta: 0.008,
    };
    isProgrammaticMove.current = true;
    setRegion(next);
    mapRef.current?.animateToRegion(next, 280);
    setTimeout(() => {
      isProgrammaticMove.current = false;
    }, 350);
  };

  const applyAddress = (next: DeliveryAddress, animateMap = true) => {
    setAddress(next);
    setQuery(next.street);
    setSuggestions([]);
    if (animateMap) {
      moveMapTo(next.coordinates.lat, next.coordinates.lng);
    } else {
      setRegion({
        latitude: next.coordinates.lat,
        longitude: next.coordinates.lng,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      });
    }
  };

  const applyCoords = async (
    latitude: number,
    longitude: number,
    options?: { blockMap?: boolean },
  ) => {
    const blockMap = options?.blockMap ?? false;
    if (blockMap) setLoading(true);
    else setGeocoding(true);
    try {
      const resolved = await fetchAddressFromCoords(
        latitude,
        longitude,
        query.trim(),
      );
      // რუკა უკვე ცენტრშია — მხოლოდ ტექსტი განახლდეს
      setAddress(resolved);
      skipNextSearch.current = true;
      setQuery(resolved.street);
      setSuggestions([]);
      setRegion({
        latitude: resolved.coordinates.lat,
        longitude: resolved.coordinates.lng,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      });
    } finally {
      if (blockMap) setLoading(false);
      else setGeocoding(false);
    }
  };

  const handleRegionChangeComplete = (next: Region) => {
    if (isProgrammaticMove.current) return;

    setRegion(next);

    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    geocodeTimer.current = setTimeout(() => {
      setSessionToken(createSessionToken());
      void applyCoords(next.latitude, next.longitude, { blockMap: false });
    }, 400);
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
        await applyCoords(latitude, longitude, { blockMap: true });
        if (!cancelled) moveMapTo(latitude, longitude);
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
      moveMapTo(latitude, longitude);
      await applyCoords(latitude, longitude, { blockMap: false });
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
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={region}
          onRegionChangeComplete={handleRegionChangeComplete}
          showsUserLocation
          showsMyLocationButton={false}
        />

        <View style={styles.centerPinOverlay} pointerEvents="none">
          <View style={{ marginBottom: PIN_TIP_OFFSET }}>
            <MapAddressPin size={PIN_SIZE} />
          </View>
        </View>

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
          {searching || geocoding || resolvingPlace ? (
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
            რუკა გადაადგილეთ პინის ქვეშ ან ჩაწერეთ მისამართი, რათა კურიერმა
            მარტივად გიპოვოთ.
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
  centerPinOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
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
