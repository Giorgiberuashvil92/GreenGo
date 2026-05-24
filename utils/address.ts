import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

export const DELIVERY_ADDRESS_KEY = "@greengo:delivery_address";
export const SELECTED_ADDRESS_KEY = "@greengo:selected_address";
export const SAVED_ADDRESSES_KEY = "@greengo:saved_addresses";

export const CURRENT_LOCATION_ID = "__current__";

export interface DeliveryAddress {
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

export type SavedAddress = DeliveryAddress & {
  id: string;
};

export async function loadDeliveryAddress(): Promise<DeliveryAddress | null> {
  try {
    const json = await AsyncStorage.getItem(DELIVERY_ADDRESS_KEY);
    if (!json) return null;
    return JSON.parse(json) as DeliveryAddress;
  } catch {
    return null;
  }
}

export async function saveDeliveryAddress(
  address: DeliveryAddress,
): Promise<void> {
  await AsyncStorage.setItem(DELIVERY_ADDRESS_KEY, JSON.stringify(address));
}

export async function loadSavedAddresses(): Promise<SavedAddress[]> {
  try {
    const json = await AsyncStorage.getItem(SAVED_ADDRESSES_KEY);
    if (!json) return [];
    const parsed = JSON.parse(json) as SavedAddress[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveSavedAddresses(
  addresses: SavedAddress[],
): Promise<void> {
  await AsyncStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(addresses));
}

export async function addSavedAddress(
  address: DeliveryAddress,
): Promise<SavedAddress> {
  const list = await loadSavedAddresses();
  const entry: SavedAddress = {
    ...address,
    id: `${Date.now()}`,
  };
  await saveSavedAddresses([entry, ...list]);
  return entry;
}

export async function getSelectedAddressId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(SELECTED_ADDRESS_KEY);
  } catch {
    return null;
  }
}

export async function setSelectedAddressId(id: string): Promise<void> {
  await AsyncStorage.setItem(SELECTED_ADDRESS_KEY, id);
}

export async function selectDeliveryAddress(
  address: DeliveryAddress,
  selectionId: string,
): Promise<void> {
  await saveDeliveryAddress(address);
  await setSelectedAddressId(selectionId);
}

export function formatAddressStreetLine(
  address: DeliveryAddress | null,
  loading = false,
): string {
  if (loading) return "მდებარეობის განსაზღვრა...";
  return address?.street?.trim() || "აირჩიეთ მისამართი";
}

export function formatAddressSubLine(
  address: DeliveryAddress | null,
  loading = false,
): string {
  if (loading) return "";
  if (!address?.street?.trim()) {
    return "დააჭირეთ მისამართის ასარჩევად";
  }
  if (address.instructions?.trim()) {
    const firstLine = address.instructions.trim().split("\n")[0];
    return firstLine || "დამატებითი დეტალები";
  }
  return (
    address.district?.trim() ||
    address.city?.trim() ||
    "დამატებითი დეტალები"
  );
}

export async function fetchAddressFromCoords(
  latitude: number,
  longitude: number,
  fallbackStreet = "",
): Promise<DeliveryAddress> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent": "GreenGo/1.0",
        },
      },
    );
    const data = await response.json();

    if (data?.address) {
      const addr = data.address;
      return {
        street:
          `${addr.road || ""} ${addr.house_number || ""}`.trim() ||
          fallbackStreet,
        city: addr.city || addr.town || addr.municipality || "თბილისი",
        district: addr.suburb || addr.quarter,
        postalCode: addr.postcode,
        coordinates: { lat: latitude, lng: longitude },
      };
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }

  return {
    street: fallbackStreet,
    city: "თბილისი",
    coordinates: { lat: latitude, lng: longitude },
  };
}

/** მიმდინარე GPS ლოკაცია — არ ინახავს ავტომატურად */
export async function getCurrentLocationAddress(): Promise<DeliveryAddress | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    return null;
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const { latitude, longitude } = location.coords;
  const address = await fetchAddressFromCoords(latitude, longitude);
  return address.street.trim() ? address : null;
}

export async function detectCurrentDeliveryAddress(): Promise<DeliveryAddress | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    return null;
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const { latitude, longitude } = location.coords;
  const address = await fetchAddressFromCoords(latitude, longitude);

  if (address.street.trim()) {
    await saveDeliveryAddress(address);
  }

  return address.street.trim() ? address : null;
}
