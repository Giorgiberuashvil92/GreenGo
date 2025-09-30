import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "./ui/icon-symbol";

const popularObjects = [
  {
    id: 1,
    name: "მაგნოლია",
    logo: require("@/assets/images/magnolia.png"),
    rating: 4.6,
    deliveryFee: "4,99₾",
    deliveryTime: "20-30 წუთი",
    isDark: false,
  },
  {
    id: 2,
    name: "იმერული ესკიზი",
    logo: require("@/assets/images/eskizi.png"),
    rating: 4.5,
    deliveryFee: "4,99₾",
    deliveryTime: "20-30 წუთი",
    isDark: true,
  },
];

export default function PopularObjects() {
  return (
    <View style={styles.popularContainer}>
      <View style={styles.popularHeader}>
        <Text style={styles.popularTitle}>პოპულარული ობიექტები</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>სრულად {">"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.popularScrollContent}
      >
        {popularObjects.map((object) => (
          <TouchableOpacity key={object.id} style={styles.popularCard}>
            <View
              style={[
                styles.cardTopSection,
                object.isDark && styles.cardTopSectionDark,
              ]}
            >
              <View style={styles.logoContainer}>
                <Image source={object.logo} style={styles.cardLogo} />
                <Text
                  style={[
                    styles.logoText,
                    object.isDark && styles.logoTextGreen,
                  ]}
                >
                  {object.isDark ? object.name : "MAGNOLIA"}
                </Text>
                <Text
                  style={[
                    styles.logoSubtext,
                    object.isDark && styles.logoSubtextGreen,
                  ]}
                >
                  {object.isDark ? "ქართული რესტორანი" : "RESTAURANT"}
                </Text>
              </View>
              <View style={styles.ratingBadge}>
                <IconSymbol name="star.fill" size={12} color="#FFD700" />
                <Text style={styles.ratingText}>{object.rating}</Text>
              </View>
            </View>
            <View style={styles.cardBottomSection}>
              <Text style={styles.restaurantName}>{object.name}</Text>
              <View style={styles.dashedLine} />
              <View style={styles.deliveryInfo}>
                <View style={styles.deliveryItem}>
                  <IconSymbol name="truck.fill" size={12} color="#9B9B9B" />
                  <Text style={styles.deliveryText}>{object.deliveryFee}</Text>
                </View>
                <View style={styles.deliveryItem}>
                  <IconSymbol name="clock.fill" size={12} color="#9B9B9B" />
                  <Text style={styles.deliveryText}>{object.deliveryTime}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  popularContainer: {
    marginBottom: 20,
  },
  popularHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  popularTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  seeAllText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },
  popularScrollContent: {
    paddingHorizontal: 20,
  },
  popularCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginRight: 12,
    width: 160,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTopSection: {
    backgroundColor: "#F5F5DC",
    padding: 16,
    paddingBottom: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    position: "relative",
    height: 100,
  },
  cardTopSectionDark: {
    backgroundColor: "#2C2C2C",
  },
  logoContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  cardLogo: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    marginBottom: 8,
  },
  logoText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8B4513",
    textAlign: "center",
    marginBottom: 2,
  },
  logoTextGreen: {
    color: "#90EE90",
  },
  logoSubtext: {
    fontSize: 8,
    color: "#A0522D",
    textAlign: "center",
  },
  logoSubtextGreen: {
    color: "#98FB98",
  },
  ratingBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#333333",
    marginLeft: 2,
  },
  cardBottomSection: {
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  dashedLine: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginBottom: 8,
    borderStyle: "dashed",
  },
  deliveryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  deliveryItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryText: {
    fontSize: 10,
    color: "#9B9B9B",
    marginLeft: 4,
  },
});
