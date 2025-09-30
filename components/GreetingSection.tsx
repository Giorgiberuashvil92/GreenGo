import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "./ui/icon-symbol";

export default function GreetingSection() {
  return (
    <View style={styles.container}>
      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>გამარჯობა! დათო</Text>
        <Text style={styles.waveText}>👋</Text>
      </View>
      <Text style={styles.subtitleText}>
        გშია? 🚀 შეუკვეთე GreenGo-დან და მოვალთ მალე!
      </Text>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <IconSymbol name="magnifyingglass" size={20} color="#9E9E9E" />
          <TextInput
            style={styles.searchInput}
            placeholder="რესტორნები,მაღაზიები,ხელნაკეთი ნივ..."
            placeholderTextColor="#9E9E9E"
          />
          <TouchableOpacity style={styles.filterButton}>
            <IconSymbol
              name="line.3.horizontal.decrease"
              size={20}
              color="#9E9E9E"
            />
          </TouchableOpacity>
        </View>
      </View>
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
    fontWeight: "700",
    color: "#333333",
  },
  waveText: {
    fontSize: 20,
    marginLeft: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: "#333333",
    marginBottom: 16,
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
    marginLeft: 8,
    fontSize: 14,
    color: "#333333",
  },
  filterButton: {
    padding: 4,
  },
});
