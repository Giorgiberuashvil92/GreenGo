import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getRecentOrders,
  getTotalOrderCount,
} from "../../assets/data/ordersData";
import RecentOrders from "../../components/RecentOrders";
import { useAuth } from "../../contexts/AuthContext";

export default function ProfileScreen() {
  const { logout } = useAuth();
  const totalOrders = getTotalOrderCount();
  const recentOrders = getRecentOrders();

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
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>გამარჯობა დავით! 👋</Text>
        </View>

        {/* GreenGo Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>GreenGo ბალანსი</Text>
          <Text style={styles.balanceAmount}>0.00 ₾</Text>

          <View style={styles.cardSeparator} />

          <View style={styles.cardInfo}>
            <View style={styles.cardDetails}>
              <Ionicons name="card" size={20} color="#666" />
              <Text style={styles.cardText}>Card</Text>
              <Text style={styles.cardNumber}>1234 56** **** 1234</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/screens/paymentMethods")}
            >
              <Text style={styles.changeText}>შეცვლა</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.addCardButton}
            onPress={() => router.push("/screens/paymentMethods")}
          >
            <Ionicons name="add" size={20} color="#000" />
            <Text style={styles.addCardText}>ახალი ბარათის დამატება</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>პროფილი</Text>

          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => router.push("/screens/editName")}
          >
            <Ionicons name="person-outline" size={20} color="#333" />
            <Text style={styles.infoText}>Dato Avaliani</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => router.push("/screens/editPhone")}
          >
            <Ionicons name="call-outline" size={20} color="#333" />
            <Text style={styles.infoText}>+995 123 12 12 12</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => router.push("/screens/editEmail")}
          >
            <Ionicons name="mail-outline" size={20} color="#333" />
            <Text style={styles.infoText}>greengodelivery@gmail.com</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => router.push("/screens/selectCountry")}
          >
            <Ionicons name="globe-outline" size={20} color="#333" />
            <Text style={styles.infoText}>საქართველო</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Additional Options Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => router.push("/screens/promoCodes")}
          >
            <Ionicons name="pricetag-outline" size={20} color="#333" />
            <Text style={styles.infoText}>პრომო კოდები</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => router.push("/screens/settings")}
          >
            <Ionicons name="settings-outline" size={20} color="#333" />
            <Text style={styles.infoText}>პარამეტრები</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoItem}>
            <Ionicons name="help-circle-outline" size={20} color="#333" />
            <Text style={styles.infoText}>მხარდაჭერა</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Recent Orders Section */}
        <RecentOrders orders={recentOrders} totalCount={totalOrders} />

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF4444" />
          <Text style={styles.logoutText}>გასვლა</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  greetingSection: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  balanceCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 20,
  },
  balanceTitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#00C851",
    marginBottom: 16,
  },
  cardSeparator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginBottom: 16,
  },
  cardInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  cardNumber: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  changeText: {
    fontSize: 16,
    color: "#00C851",
    fontWeight: "500",
  },
  addCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E8",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  addCardText: {
    fontSize: 16,
    color: "#00C851",
    fontWeight: "500",
    marginLeft: 8,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#FF4444",
    borderRadius: 12,
    backgroundColor: "#FFF5F5",
  },
  logoutText: {
    fontSize: 16,
    color: "#FF4444",
    fontWeight: "600",
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 30,
  },
});
