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
import { SafeAreaView } from "react-native-safe-area-context";

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

export default function SelectAddressScreen() {
  const router = useRouter();
  const [address, setAddress] = useState<Address>({
    street: "",
    city: "თბილისი",
    coordinates: {
      lat: 41.7151,
      lng: 44.8271,
    },
  });
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 41.7151,
    longitude: 44.8271,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    setLoading(true);
    try {
      // Reverse geocoding to get address from coordinates
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const addr = data.address;
        setAddress({
          street: `${addr.road || ""} ${addr.house_number || ""}`.trim() || "მისამართი",
          city: addr.city || addr.town || addr.municipality || "თბილისი",
          district: addr.suburb || addr.quarter,
          postalCode: addr.postcode,
          coordinates: {
            lat: latitude,
            lng: longitude,
          },
        });
        
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } else {
        setAddress({
          street: "მისამართი",
          city: "თბილისი",
          coordinates: {
            lat: latitude,
            lng: longitude,
          },
        });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setAddress({
        street: "მისამართი",
        city: "თბილისი",
        coordinates: {
          lat: latitude,
          lng: longitude,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      setLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "წვდომა უარყოფილია",
          "გთხოვთ მიუთითოთ ლოკაციის წვდომა პარამეტრებში"
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.address) {
        const addr = data.address;
        setAddress({
          street: `${addr.road || ""} ${addr.house_number || ""}`.trim() || "მისამართი",
          city: addr.city || addr.town || addr.municipality || "თბილისი",
          district: addr.suburb || addr.quarter,
          postalCode: addr.postcode,
          coordinates: {
            lat: latitude,
            lng: longitude,
          },
        });

        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("შეცდომა", "ლოკაციის მიღება ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!address.street || address.street === "მისამართი") {
      Alert.alert("შეცდომა", "გთხოვთ აირჩიოთ ან შეიყვანოთ მისამართი");
      return;
    }

    const finalAddress: Address = {
      ...address,
      instructions: instructions.trim() || undefined,
    };

    // Store address in AsyncStorage so checkout can retrieve it
    try {
      await AsyncStorage.setItem("@greengo:selected_address", JSON.stringify(finalAddress));
      router.back();
    } catch (error) {
      console.error("Error saving address:", error);
      Alert.alert("შეცდომა", "მისამართის შენახვა ვერ მოხერხდა");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>მისამართის არჩევა</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      )}

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={mapRegion}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {address.coordinates.lat !== 41.7151 && (
            <Marker
              coordinate={{
                latitude: address.coordinates.lat,
                longitude: address.coordinates.lng,
              }}
              title={address.street}
            />
          )}
        </MapView>
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleGetCurrentLocation}
        >
          <Ionicons name="locate" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Address Form */}
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>ქუჩა *</Text>
          <TextInput
            style={styles.input}
            value={address.street}
            onChangeText={(text) =>
              setAddress({ ...address, street: text })
            }
            placeholder="მაგ: 4 ტაბიძის ქუჩა"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>ქალაქი *</Text>
          <TextInput
            style={styles.input}
            value={address.city}
            onChangeText={(text) =>
              setAddress({ ...address, city: text })
            }
            placeholder="თბილისი"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>რაიონი</Text>
          <TextInput
            style={styles.input}
            value={address.district || ""}
            onChangeText={(text) =>
              setAddress({ ...address, district: text })
            }
            placeholder="რაიონი (არასავალდებულო)"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>საფოსტო კოდი</Text>
          <TextInput
            style={styles.input}
            value={address.postalCode || ""}
            onChangeText={(text) =>
              setAddress({ ...address, postalCode: text })
            }
            placeholder="საფოსტო კოდი (არასავალდებულო)"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>დამატებითი ინსტრუქციები</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={instructions}
            onChangeText={setInstructions}
            placeholder="მაგ: კართან დატოვება, ზარი გამოიღოთ და ა.შ."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#4CAF50" />
          <Text style={styles.infoText}>
            დააჭირეთ რუკაზე ან გამოიყენეთ &quot;მიმდინარე ლოკაცია&quot; ღილაკი მისამართის ასარჩევად
          </Text>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>დადასტურება</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
  },
  headerSpacer: {
    width: 32,
  },
  mapContainer: {
    height: 300,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  currentLocationButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#E8F5E8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#2E7D32",
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
});

