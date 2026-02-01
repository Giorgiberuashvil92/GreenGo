import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RecentOrders from "../../components/RecentOrders";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../utils/api";

interface Order {
  _id: string;
  restaurantId: {
    name: string;
  };
  items: {
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function ProfileScreen() {
  const { logout, user, refreshUser } = useAuth();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [balance, setBalance] = useState(0);
  const [primaryCard, setPrimaryCard] = useState<{ maskedNumber: string; type: string } | null>(null);
  
  const fetchUserBalance = async () => {
    // Balance არ არის backend-ში, ასე რომ დავტოვოთ 0.00
    // თუ მომავალში დაემატება balance endpoint, აქ უნდა გავაკეთოთ API call
    setBalance(0);
  };

  const fetchPrimaryCard = async () => {
    // Payment cards არ არის backend-ში, ასე რომ დავტოვოთ null
    // თუ მომავალში დაემატება payment cards endpoint, აქ უნდა გავაკეთოთ API call
    setPrimaryCard(null);
  };

  useEffect(() => {
    // Only refresh user once on mount, not on every render
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserOrders();
      fetchUserBalance();
      fetchPrimaryCard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUserOrders = async () => {
    if (!user?.id && !(user as any)?._id) return;
    
    try {
      setLoadingOrders(true);
      const userId = user?.id || (user as any)?._id;
      const response = await apiService.getOrders({
        userId: userId,
        limit: 100,
        page: 1,
      });
      
      if (response.success && response.data) {
        const orders = (response.data as any).orders || (Array.isArray(response.data) ? response.data : []);
        setTotalOrders(orders.length);
        
        // Get recent 5 orders
        const recent = orders
          .filter((order: Order) => order.status === 'delivered')
          .slice(0, 5)
          .map((order: Order) => ({
            id: order._id,
            restaurantName: order.restaurantId?.name || 'რესტორანი',
            items: order.items.map((item: any) => item.name),
            totalAmount: order.totalAmount,
            orderDate: new Date(order.createdAt).toISOString().split('T')[0],
            status: 'delivered' as const,
          }));
        
        setRecentOrders(recent);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Get user display name
  const getUserDisplayName = () => {
    console.log('👤 Profile getUserDisplayName - User object:', JSON.stringify(user, null, 2));
    if (user?.name) {
      return user.name;
    }
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    console.log('⚠️ No user name found, returning default');
    return "მომხმარებელი";
  };
  
  const getUserPhone = () => {
    if (user?.phoneNumber) {
      // Format: +995555123456 -> +995 555 12 34 56
      const phone = user.phoneNumber.replace('+995', '');
      if (phone.length === 9) {
        return `+995 ${phone.slice(0, 3)} ${phone.slice(3, 5)} ${phone.slice(5, 7)} ${phone.slice(7, 9)}`;
      }
      return user.phoneNumber;
    }
    return "+995 -- -- -- --";
  };
  
  const getUserEmail = () => {
    return user?.email || "";
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
            გამარჯობა {getUserDisplayName().split(' ')[0]}! 👋
          </Text>
        </View>

        {/* GreenGo Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>GreenGo ბალანსი</Text>
          <Text style={styles.balanceAmount}>{balance.toFixed(2)} ₾</Text>

          <View style={styles.cardSeparator} />

          {primaryCard ? (
            <View style={styles.cardInfo}>
              <View style={styles.cardDetails}>
                <Ionicons name="card" size={20} color="#666" />
                <Text style={styles.cardText}>ბარათი</Text>
                <Text style={styles.cardNumber}>{primaryCard.maskedNumber}</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/screens/paymentMethods")}
              >
                <Text style={styles.changeText}>შეცვლა</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cardInfo}>
              <View style={styles.cardDetails}>
                <Ionicons name="card-outline" size={20} color="#999" />
                <Text style={styles.cardText}>ბარათი არ არის დამატებული</Text>
              </View>
            </View>
          )}

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
            <Text style={styles.infoText}>{getUserDisplayName()}</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => router.push("/screens/editPhone")}
          >
            <Ionicons name="call-outline" size={20} color="#333" />
            <Text style={styles.infoText}>{getUserPhone()}</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => router.push("/screens/editEmail")}
          >
            <Ionicons name="mail-outline" size={20} color="#333" />
            <Text style={styles.infoText}>{getUserEmail() || "ელფოსტა არ არის დამატებული"}</Text>
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
