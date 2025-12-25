import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

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
          style={styles.pinIcon}
        />
        <View style={styles.locationTextContainer}>
          {!loading && isAuthenticated ? (
            <>
          <Text style={styles.streetText}>4 შანიძის ქუჩა</Text>
          <Text style={styles.cityText}>წყალტუბო</Text>
            </>
          ) : (
            <Text style={styles.placeholderText}>შეიყვანეთ მისამართი</Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pinIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#F5F5F5",
    padding: 7,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  locationTextContainer: {
    marginLeft: 8,
    justifyContent: "center",
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
  placeholderText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#9E9E9E",
  },
  cartButton: {
    padding: 8,
  },
});
