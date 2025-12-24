import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Location {
  id: string;
  street: string;
  city?: string;
  isCurrent?: boolean;
  isSelected?: boolean;
}

const locations: Location[] = [
  {
    id: "1",
    street: "შანიძის 4",
    city: "თბილისი",
    isCurrent: true,
    isSelected: true,
  },
  {
    id: "2",
    street: "4 ტაბიძის ქუჩა",
    city: "თბილისი",
  },
  {
    id: "3",
    street: "13 ავალიანის ქუჩა",
    city: "თბილისი",
  },
];

export default function SelectLocationScreen() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<string>(
    locations.find((loc) => loc.isSelected)?.id || locations[0].id
  );

  const handleSelectLocation = (locationId: string) => {
    setSelectedLocation(locationId);
    // TODO: Save selected location to state/context
    // After selection, can navigate back or show confirmation
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ლოკაცია</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Add New Location */}
        <TouchableOpacity
          style={styles.locationItem}
          onPress={() => {
            // Navigate to add new location screen
            router.push("/screens/selectAddress");
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="map-outline" size={24} color="#2E7D32" />
          <Text style={styles.addLocationText}>ახალი ლოკაციის დამატება</Text>
          <Ionicons name="chevron-forward" size={20} color="#000000" />
        </TouchableOpacity>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Current Location */}
        {locations
          .filter((loc) => loc.isCurrent)
          .map((location) => (
            <TouchableOpacity
              key={location.id}
              style={styles.locationItem}
              onPress={() => handleSelectLocation(location.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="paper-plane-outline" size={24} color="#666666" />
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationStreet}>
                  {location.isCurrent ? "ამჟამინდელი ლოკაცია" : location.street}
                </Text>
                {location.isCurrent && (
                  <Text style={styles.locationCity}>{location.street}</Text>
                )}
              </View>
              {selectedLocation === location.id && (
                <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
              )}
            </TouchableOpacity>
          ))}

        {/* Other Locations */}
        {locations
          .filter((loc) => !loc.isCurrent)
          .map((location) => (
            <React.Fragment key={location.id}>
              <View style={styles.separator} />
              <TouchableOpacity
                style={styles.locationItem}
                onPress={() => handleSelectLocation(location.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="location-outline" size={24} color="#666666" />
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationStreet}>{location.street}</Text>
                </View>
                {selectedLocation === location.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
                )}
              </TouchableOpacity>
            </React.Fragment>
          ))}
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  addLocationText: {
    flex: 1,
    fontSize: 16,
    color: "#2E7D32",
    fontWeight: "400",
  },
  locationStreet: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "400",
  },
  locationCity: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginLeft: 20,
  },
});

