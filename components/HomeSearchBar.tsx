import { fontFamily } from "@/constants/fonts";
import Feather from "@expo/vector-icons/build/Feather";
import { useRouter } from "expo-router";
import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import FilterIcon from "./icons/FilterIcon";

interface HomeSearchBarProps {
  onFilterPress?: () => void;
  searchBarStyle?: StyleProp<ViewStyle>;
}

export default function HomeSearchBar({
  onFilterPress,
  searchBarStyle,
}: HomeSearchBarProps) {
  const router = useRouter();

  return (
    <View style={[styles.searchInputContainer, searchBarStyle]}>
      <TouchableOpacity
        style={styles.searchTapArea}
        onPress={() => router.push("/screens/search")}
        activeOpacity={0.85}
      >
        <Feather name="search" size={16} color="#1D4045" />
        <Text style={styles.searchPlaceholder} numberOfLines={1}>
          რესტორნები, მაღაზიები, ხელნაკეთი ნივ...
        </Text>
      </TouchableOpacity>
      {onFilterPress ? (
        <TouchableOpacity
          style={styles.filterButton}
          onPress={onFilterPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="ფილტრი"
        >
          <FilterIcon size={20} color="#1D4045" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
  },
  searchTapArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 4,
    fontSize: 12,
    lineHeight: 16,
    color: "#9B9B9B",
    fontFamily: fontFamily.regular,
  },
  filterButton: {
    padding: 4,
    marginLeft: 4,
  },
});
