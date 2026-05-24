import { fontFamily } from "@/constants/fonts";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FilterModal } from "../app/components";
import { useAuth } from "../contexts/AuthContext";
import HomeSearchBar from "./HomeSearchBar";

export default function GreetingSection() {
  const { user } = useAuth();
  const [showFilterModal, setShowFilterModal] = useState(false);

  const getUserName = () => {
    if (user?.name) {
      const nameParts = user.name.split(" ");
      return nameParts[0];
    }
    if (user?.firstName) {
      return user.firstName;
    }
    return "მომხმარებელო"; // Fallback
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
          გამარჯობა! <Text style={{ color: "#1D4045" }}>{getUserName()}</Text>
        </Text>
        <Text style={styles.waveText}>👋</Text>
      </View>
      <Text style={styles.subtitleText}>
        გშია? 🚀 შეუკვეთე GreenGo-დან და მოვალთ მალე!
      </Text>

      <View style={styles.searchContainer}>
        <HomeSearchBar onFilterPress={handleFilterPress} />
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
    fontSize: 16,
    fontFamily: fontFamily.bold,
    textTransform: "uppercase",
  },
  waveText: {
    fontSize: 20,
    marginLeft: 8,
    textTransform: "uppercase",
  },
  subtitleText: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    textTransform: "uppercase",
    color: "#666666",
    marginBottom: 12,
    lineHeight: 20,
  },
  searchContainer: {
    width: "100%",
  },
});
