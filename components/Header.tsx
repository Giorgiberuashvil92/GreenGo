import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Header() {
  return (
    <View style={styles.container}>
      <View style={styles.locationContainer}>
        <FontAwesome6 name="location-dot" size={20} color="#00592D" />
        <View style={styles.locationTextContainer}>
          <Text style={styles.streetText}>4 შანიძის ქუჩა</Text>
          <Text style={styles.cityText}>წყალტუბო</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.cartButton}>
        <AntDesign name="shopping-cart" size={24} color="#00592D" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationTextContainer: {
    marginLeft: 8,
  },
  streetText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  cityText: {
    fontSize: 14,
    color: "#9E9E9E",
    marginTop: 2,
  },

  cartButton: {
    padding: 8,
  },
});
