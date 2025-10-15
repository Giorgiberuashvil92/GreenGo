import Feather from "@expo/vector-icons/build/Feather";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FilterModal } from "../app/components";
import { IconSymbol } from "./ui/icon-symbol";

export default function GreetingSection() {
  const router = useRouter();
  const [showFilterModal, setShowFilterModal] = useState(false);

  const handleSearchPress = () => {
    router.push("/screens/search");
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  const handleCloseFilter = () => {
    setShowFilterModal(false);
  };

  const handleApplyFilters = (filters: any) => {
    console.log("Applied filters:", filters);
    // Here you can implement the actual filtering logic
  };

  return (
    <View style={styles.container}>
      <View style={styles.greetingContainer}>
        <Text style={[styles.greetingText, { color: "#2F80ED" }]}>
          გამარჯობა! <Text style={{ color: "#00592D" }}>დათო</Text>
        </Text>
        <Text style={styles.waveText}>👋</Text>
      </View>
      <Text style={styles.subtitleText}>
        გშია? 🚀 შეუკვეთე GreenGo-დან და მოვალთ მალე!
      </Text>

      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={styles.searchInputContainer}
          onPress={handleSearchPress}
        >
          <Feather name="search" size={22} color="#4A8F70" />
          <Text style={styles.searchPlaceholder}>
            რესტორნები, მაღაზიები, ხელნა...
          </Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={handleFilterPress}
          >
            <IconSymbol
              name="line.3.horizontal.decrease"
              size={22}
              color="#4A8F70"
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      <FilterModal
        visible={showFilterModal}
        onClose={handleCloseFilter}
        onApplyFilters={handleApplyFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F7FDFA",
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  greetingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  waveText: {
    fontSize: 20,
    marginLeft: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 12,
    lineHeight: 20,
  },
  searchContainer: {
    width: "100%",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 2,
    fontSize: 14,
    color: "#333333",
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 2,
    fontSize: 14,
    color: "#9E9E9E",
  },
  filterButton: {
    padding: 4,
  },
});
