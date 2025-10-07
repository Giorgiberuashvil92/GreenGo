// import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function ProfileScreen() {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("გასვლა", "ნამდვილად გსურთ გასვლა?", [
      {
        text: "გაუქმება",
        style: "cancel",
      },
      {
        text: "გასვლა",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/screens/login");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ანგარიში</Text>
      </View>

      {/* Profile Content */}
      <View style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.profileName}>მომხმარებელი</Text>
          <Text style={styles.profileEmail}>user@example.com</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>👤</Text>
            <Text style={styles.menuText}>პროფილის რედაქტირება</Text>
            <Text style={styles.chevronIcon}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📍</Text>
            <Text style={styles.menuText}>მისამართები</Text>
            <Text style={styles.chevronIcon}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>💳</Text>
            <Text style={styles.menuText}>გადახდის მეთოდები</Text>
            <Text style={styles.chevronIcon}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🔔</Text>
            <Text style={styles.menuText}>შეტყობინებები</Text>
            <Text style={styles.chevronIcon}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>❓</Text>
            <Text style={styles.menuText}>დახმარება</Text>
            <Text style={styles.chevronIcon}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>გასვლა</Text>
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F0F8F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 60,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: "#666",
  },
  menuSection: {
    paddingVertical: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  menuIcon: {
    fontSize: 24,
    width: 24,
    textAlign: "center",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 16,
  },
  chevronIcon: {
    fontSize: 20,
    color: "#999",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#FF4444",
    borderRadius: 12,
    backgroundColor: "#FFF5F5",
  },
  logoutIcon: {
    fontSize: 24,
  },
  logoutText: {
    fontSize: 16,
    color: "#FF4444",
    fontWeight: "600",
    marginLeft: 8,
  },
});
