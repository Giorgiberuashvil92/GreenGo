import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Header() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.locationContainer}
        onPress={() => router.push("/screens/selectLocation")}
        activeOpacity={0.7}
      >
        <Image
          source={require("../assets/images/icons/pin.png")}
          width={36}
          height={36}
        />
        <View style={styles.locationTextContainer}>
          <Text style={styles.streetText}>4 შანიძის ქუჩა</Text>
          <Text style={styles.cityText}>წყალტუბო</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cartButton}>
        <Image
          source={require("../assets/images/icons/cart.png")}
          width={36}
          height={36}
        />
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
    color: "#181B1A",
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
