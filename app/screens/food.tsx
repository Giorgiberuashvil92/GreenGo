// import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { foodItems } from "../../assets/data/foodItems";

const FoodScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/(tabs)")}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.addressContainer}>
          <Text style={styles.addressLine1}>4 შანიძის ქუჩა</Text>
          <Text style={styles.addressLine2}>წყალტუბო</Text>
        </View>

        <TouchableOpacity style={styles.cartButton}>
          <Text style={styles.cartButtonText}>🛍️</Text>
        </TouchableOpacity>
      </View>

      {/* Section Title */}
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>კვება</Text>
      </View>

      {/* Food Items List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {foodItems.map((item) => (
          <View key={item.id} style={styles.foodCard}>
            <Image source={item.image} style={styles.foodImage} />

            {/* Favorite Button */}
            <TouchableOpacity style={styles.favoriteButton}>
              <Text style={styles.favoriteButtonText}>♡</Text>
            </TouchableOpacity>

            <BlurView intensity={40} tint="dark" style={styles.infoOverlay}>
              <View style={styles.overlayDark} />
              <View style={styles.infoRow}>
                {/* სახელი */}
                <Text style={styles.restaurantName}>{item.restaurant}</Text>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {/* ფასი */}
                  <View style={styles.infoItem}>
                    <Text style={styles.infoIcon}>💰</Text>
                    <Text style={styles.infoText}>{item.price}₾</Text>
                  </View>

                  {/* დრო */}
                  <View style={styles.infoItem}>
                    <Text style={styles.infoIcon}>⏰</Text>
                    <Text style={styles.infoText}>{item.deliveryTime}</Text>
                  </View>

                  {/* რეიტინგი */}
                  <View style={styles.infoItem}>
                    <Text style={styles.infoIcon}>⭐</Text>
                    <Text style={styles.infoText}>{item.rating}</Text>
                  </View>
                </View>
              </View>
            </BlurView>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

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
    paddingBottom: 20,
    paddingTop: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  addressContainer: {
    flex: 1,
    alignItems: "center",
  },
  addressLine1: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  addressLine2: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  cartButton: {
    padding: 8,
  },
  cartButtonText: {
    fontSize: 24,
  },
  sectionTitleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  foodCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  foodImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 20,
    padding: 8,
  },
  favoriteButtonText: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  infoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 12,
    margin: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    overflow: "hidden", // overlay რომ სწორად დაჯდეს
  },
  overlayDark: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)", // მუქი ნახევრად გამჭვირვალე ფენა
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  infoText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
    marginLeft: 4,
  },
});

export default FoodScreen;
