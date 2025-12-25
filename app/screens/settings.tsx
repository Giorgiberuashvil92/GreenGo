import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  const handleLanguagePress = () => {
    router.push("/screens/languageSelection");
  };

  const handleNotificationsPress = () => {
    router.push("/screens/notificationsSettings");
  };

  const handleDeleteAccountPress = () => {
    router.push("/screens/deleteAccount");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>პარამეტრები</Text>
      </View>

      {/* Settings Options */}
      <View style={styles.settingsList}>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={handleLanguagePress}
        >
          <Text style={styles.settingText}>ენა</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={handleNotificationsPress}
        >
          <Text style={styles.settingText}>მარკეტინგული შეტყობინებები</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={handleDeleteAccountPress}
        >
          <Text style={styles.deleteAccountText}>ანგარიშის წაშლა</Text>
          <Ionicons name="chevron-forward" size={20} color="#FF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  settingsList: {
    paddingTop: 20,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  settingText: {
    fontSize: 16,
    color: "#333",
  },
  deleteAccountText: {
    fontSize: 16,
    color: "#FF4444",
    fontWeight: "500",
  },
});
