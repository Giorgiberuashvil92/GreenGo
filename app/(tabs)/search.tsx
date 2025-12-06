import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRestaurants } from "../../hooks/useRestaurants";

export default function SearchTabScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { restaurants, loading, error, refetch } = useRestaurants({
    search: query || undefined,
    limit: 50,
  });

  // Filter active restaurants
  const filteredRestaurants = restaurants.filter((r) => r.isActive);

  return (
    <SafeAreaView style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#9CA3AF"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="ძიება რესტორნის სახელით, მისამართით ან სამზარეულოთი..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results list */}
      {loading && query.length > 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>ძიება...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRestaurants}
          keyExtractor={(item) => item._id || item.id || ""}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>რეზულტატი არ მოიძებნა</Text>
              <Text style={styles.emptyText}>
                {query.length > 0
                  ? "სცადე სხვა ключური სიტყვა ან შეამოკლე ძიების ტექსტი."
                  : "დაიწყე ძიება რესტორნის სახელით, მისამართით ან სამზარეულოთი."}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: "/screens/restaurant",
                  params: { restaurantId: item._id || item.id },
                })
              }
            >
              <Image
                source={
                  typeof item.image === "string"
                    ? { uri: item.image }
                    : item.image || require("../../assets/images/magnolia.png")
                }
                style={styles.image}
              />

            <View style={styles.infoContainer}>
              <View style={styles.headerRow}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.priceRange}>{item.priceRange}</Text>
              </View>

              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  ⭐ {item.rating.toFixed(1)} ({item.reviewCount})
                </Text>
                <Text style={styles.metaText}>⏱ {item.deliveryTime} წთ</Text>
                <Text style={styles.metaText}>
                  🚚 {item.deliveryFee.toFixed(2)} ₾
                </Text>
              </View>

              <View style={styles.footerRow}>
                <Text style={styles.address} numberOfLines={1}>
                  {item.location?.address}, {item.location?.city}
                </Text>
                {item.cuisine && item.cuisine.length > 0 && (
                  <Text style={styles.cuisine} numberOfLines={1}>
                    {item.cuisine.join(" • ")}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: "#F5F5F5",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    paddingVertical: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  image: {
    width: "100%",
    height: 140,
    resizeMode: "cover",
  },
  infoContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  priceRange: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  description: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  metaText: {
    fontSize: 12,
    color: "#4B5563",
  },
  footerRow: {
    marginTop: 6,
    gap: 2,
  },
  address: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  cuisine: {
    fontSize: 12,
    color: "#6B7280",
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
});
