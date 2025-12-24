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

export default function PaymentsAndPricesScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>გადახდები და ფასები</Text>

        {/* Menu Options */}
        <View style={styles.menuList}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/screens/activatePromoCode")}
          >
            <Text style={styles.menuText}>როგორ გავააქტიუროთ პრომო კოდი</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/screens/priceCalculation")}
          >
            <Text style={styles.menuText}>ფასის გამოთვლა</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/screens/aboutCardPayment")}
          >
            <Text style={styles.menuText}>ბარათით ანგარიშსწორების შესახებ</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/screens/greengoBalance")}
          >
            <Text style={styles.menuText}>Greengo-ის ბალანსი</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/screens/aboutPromotions")}
          >
            <Text style={styles.menuText}>აქციების შესახებ</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/screens/moreMoneyDeducted")}
          >
            <Text style={styles.menuText}>მოსალოდნელზე მეტი თანხა ჩამომეჭრა</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/screens/checkCompensationStatus")}
          >
            <Text style={styles.menuText}>მინდა ჩემი კომპენსაციის სტატუსის შემოწმება</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={() => router.push("/screens/helpContact")}
        >
          <Text style={styles.contactButtonText}>ჩათი მხარდაჭერ გუნდთან</Text>
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
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
  },
  menuList: {
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    lineHeight: 22,
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  contactButton: {
    backgroundColor: "#E8F5E8",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  contactButtonText: {
    fontSize: 16,
    color: "#00C851",
    fontWeight: "600",
  },
});

