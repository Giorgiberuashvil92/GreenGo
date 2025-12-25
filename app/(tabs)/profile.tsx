import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
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
import { useAuth } from "../../contexts/AuthContext";
import { USE_MOCK_DATA } from "../../utils/mockData";

export default function ProfileScreen() {
  const { logout, user, refreshUser, isMockMode, isAuthenticated } = useAuth();
  const totalOrders = getTotalOrderCount();
  const recentOrders = getRecentOrders();

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isInMockMode = USE_MOCK_DATA || (isMockMode && isMockMode());

  // If user is not authenticated, show only auth and support options
  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.unauthContentContainer}
        >
          {/* Authorization Menu Item */}
          <TouchableOpacity
            style={styles.unauthMenuItem}
            onPress={() => router.push("/screens/login")}
            activeOpacity={0.7}
          >
            <Ionicons name="log-in-outline" size={24} color="#2E7D32" />
            <Text style={styles.unauthMenuItemText}>ავტორიზაცია</Text>
          </TouchableOpacity>

          {/* Support Menu Item */}
          <TouchableOpacity
            style={styles.unauthMenuItem}
            onPress={() => router.push("/screens/support")}
            activeOpacity={0.7}
          >
            <Ionicons name="help-circle-outline" size={24} color="#2E7D32" />
            <Text style={styles.unauthMenuItemText}>მხარდაჭერა</Text>
            <Ionicons name="chevron-forward" size={20} color="#2E7D32" />
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.name) {
      return user.name;
    }
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    return "მომხმარებელი";
  };

  const getUserPhone = () => {
    if (user?.phoneNumber) {
      // Format: +995555123456 -> +995 555 12 34 56
      const phone = user.phoneNumber.replace("+995", "");
      if (phone.length === 9) {
        return `+995 ${phone.slice(0, 3)} ${phone.slice(3, 5)} ${phone.slice(
          5,
          7
        )} ${phone.slice(7, 9)}`;
      }
      return user.phoneNumber;
    }
    return "+995 -- -- -- --";
  };

  const getUserEmail = () => {
    return user?.email || "email@example.com";
  };

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
          <Text style={styles.greetingText}>
            გამარჯობა {getUserDisplayName().split(" ")[0]}! 👋
          </Text>
          {isInMockMode && (
            <View style={styles.mockModeBadge}>
              <Ionicons name="flask-outline" size={14} color="#FF9800" />
              <Text style={styles.mockModeText}>Demo მოხმარება</Text>
            </View>
          )}
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

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardItem}
              onPress={() => router.push("/screens/editName")}
            >
              <Ionicons name="person-outline" size={22} color="#2E7D32" />
              <Text style={styles.cardItemText}>{getUserDisplayName()}</Text>
              <Ionicons name="chevron-forward" size={20} color="#2E7D32" />
            </TouchableOpacity>

            <View style={styles.cardDivider} />

            <TouchableOpacity
              style={styles.cardItem}
              onPress={() => router.push("/screens/editPhone")}
            >
              <Ionicons name="call-outline" size={22} color="#2E7D32" />
              <Text style={styles.cardItemText}>{getUserPhone()}</Text>
              <Ionicons name="chevron-forward" size={20} color="#2E7D32" />
            </TouchableOpacity>

            <View style={styles.cardDivider} />

            <TouchableOpacity
              style={styles.cardItem}
              onPress={() => router.push("/screens/editEmail")}
            >
              <Ionicons name="mail-outline" size={22} color="#2E7D32" />
              <Text style={styles.cardItemText}>{getUserEmail()}</Text>
              <Ionicons name="chevron-forward" size={20} color="#2E7D32" />
            </TouchableOpacity>

            <View style={styles.cardDivider} />

            <TouchableOpacity
              style={styles.cardItem}
              onPress={() => router.push("/screens/selectCountry")}
            >
              <Ionicons name="globe-outline" size={22} color="#2E7D32" />
              <Text style={styles.cardItemText}>საქართველო</Text>
              <Ionicons name="chevron-forward" size={20} color="#2E7D32" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Additional Options Section */}
        <View style={styles.section}>
          <View style={styles.singleCard}>
            <TouchableOpacity
              style={styles.cardItem}
              onPress={() => router.push("/screens/promoCodes")}
            >
              <Ionicons name="pricetag-outline" size={22} color="#2E7D32" />
              <Text style={styles.cardItemText}>პრომო კოდები</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.singleCard}>
            <TouchableOpacity
              style={styles.cardItem}
              onPress={() => router.push("/screens/settings")}
            >
              <Ionicons name="settings-outline" size={22} color="#2E7D32" />
              <Text style={styles.cardItemText}>პარამეტრები</Text>
              <Ionicons name="chevron-forward" size={20} color="#2E7D32" />
            </TouchableOpacity>
          </View>

          <View style={styles.singleCard}>
            <TouchableOpacity
              style={styles.cardItem}
              onPress={() => router.push("/screens/support")}
            >
              <Ionicons name="help-circle-outline" size={22} color="#2E7D32" />
              <Text style={styles.cardItemText}>მხარდაჭერა</Text>
              <Ionicons name="chevron-forward" size={20} color="#2E7D32" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Orders Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>შეკვეთები</Text>

          <View style={styles.singleCard}>
            <TouchableOpacity
              style={styles.cardItem}
              onPress={() => router.push("/orders")}
            >
              <View style={styles.orderHistoryContent}>
                <Text style={styles.orderHistoryTitle}>შეკვეთების ისტორია</Text>
                <Text style={styles.orderHistorySubtitle}>
                  {totalOrders}+ შეკვეთა
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#2E7D32" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Orders Section */}
        {/* <RecentOrders orders={recentOrders} totalCount={totalOrders} /> */}

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
  mockModeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  mockModeText: {
    fontSize: 12,
    color: "#FF9800",
    fontWeight: "500",
    marginLeft: 6,
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
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#181B1A",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F5F5F5",
    overflow: "hidden",
  },
  singleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F5F5F5",
    marginBottom: 12,
    overflow: "hidden",
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  cardItemText: {
    flex: 1,
    fontSize: 16,
    color: "#181B1A",
    marginLeft: 14,
    fontWeight: "500",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginHorizontal: 16,
  },
  orderHistoryContent: {
    flex: 1,
    marginLeft: 0,
  },
  orderHistoryTitle: {
    fontSize: 16,
    color: "#181B1A",
    fontWeight: "500",
  },
  orderHistorySubtitle: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#F5F5F5",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  logoutText: {
    fontSize: 16,
    color: "#FF4444",
    fontWeight: "500",
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 30,
  },
  // Unauthenticated styles
  unauthContentContainer: {
    flexGrow: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  unauthMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F5F5F5",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  unauthMenuItemText: {
    flex: 1,
    fontSize: 16,
    color: "#181B1A",
    fontWeight: "500",
    marginLeft: 14,
  },
});
