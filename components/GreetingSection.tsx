import { fontFamily } from "@/constants/fonts";
import Feather from "@expo/vector-icons/build/Feather";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FilterModal } from "../app/components";
import { useAuth } from "../contexts/AuthContext";

export default function GreetingSection() {
  const router = useRouter();
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
          გამარჯობა! <Text style={{ color: "#00592D" }}></Text>
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
          <Feather name="search" size={16} color="#4A8F70" />
          <Text style={styles.searchPlaceholder}>
            რესტორნები, მაღაზიები, ხელნა...
          </Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={handleFilterPress}
          >
            <Image
              source={require("../assets/images/filter-modern-square.png")}
              style={styles.filterIcon}
              resizeMode="contain"
              accessibilityLabel="ფილტრი"
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
    fontSize: 16,
    fontFamily: fontFamily.bold,
  },
  waveText: {
    fontSize: 20,
    marginLeft: 8,
  },
  subtitleText: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
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
    marginLeft: 4,
    marginRight: 4,
    fontSize: 14,
    color: "#9E9E9E",
    fontFamily: fontFamily.regular,
  },
  filterButton: {
    padding: 4,
  },
  filterIcon: {
    width: 20,
    height: 20,
    tintColor: "#4A8F70",
  },
});
