import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRestaurants } from "../../hooks/useRestaurants";

const RestaurantsScreen = () => {
  const router = useRouter();
  const { restaurants, loading, error, refetch } = useRestaurants();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleImageError = (item: any) => {
    // Fallback to default image if API image fails
    return { uri: item.image || "https://via.placeholder.com/400x300" };
  };

  if (loading && restaurants.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>რესტორნები</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && restaurants.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>რესტორნები</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refetch}
          >
            <Text style={styles.retryButtonText}>ხელახლა ცდა</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>რესტორნები</Text>

      <FlatList
        data={restaurants.filter((r) => r.isActive)}
        keyExtractor={(item) => item.id || item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/restaurant",
                params: { restaurantId: item.id || item._id },
              })
            }
          >
            <Image
              source={
                typeof item.image === "string"
                  ? { uri: item.image }
                  : item.image
              }
              style={styles.image}
              defaultSource={require("../../assets/images/magnolia.png")}
            />

            <View style={styles.infoContainer}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  ⭐ {item.rating.toFixed(1)} ({item.reviewCount})
                </Text>
                <Text style={styles.metaText}>⏱ {item.deliveryTime} წთ</Text>
                {typeof item.deliveryFee === "number" && (
                  <Text style={styles.metaText}>
                    🚚 {item.deliveryFee.toFixed(2)} ₾
                  </Text>
                )}
              </View>

              <View style={styles.actionsRow}>
                <Text style={styles.address} numberOfLines={1}>
                  {item.location.address}, {item.location.city}
                </Text>

                <View style={styles.mapBadge}>
                  <Text style={styles.mapBadgeText}>რუკაზე ნახვა</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    color: "#111827",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  infoContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  description: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  metaText: {
    fontSize: 12,
    color: "#4B5563",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  address: {
    flex: 1,
    fontSize: 12,
    color: "#9CA3AF",
    marginRight: 8,
  },
  mapBadge: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  mapBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default RestaurantsScreen;
