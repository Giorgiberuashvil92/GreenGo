import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function SearchTabScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>ძიების ტაბი</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 18,
    color: "#333333",
  },
});
