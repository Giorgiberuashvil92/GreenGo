import { BRAND_GREEN } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
import { useGreenGoBalance } from "@/hooks/useGreenGoBalance";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

type ProfileRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  showChevron?: boolean;
};

function ProfileRow({
  icon,
  label,
  onPress,
  showChevron = true,
}: ProfileRowProps) {
  return (
    <TouchableOpacity
      style={styles.menuRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.menuRowLeft}>
        <Ionicons name={icon} size={16} color="#666666" />
        <Text style={styles.menuRowLabel}>{label}</Text>
      </View>
      {showChevron ? (
        <Ionicons name="chevron-forward" size={20} color="#9B9B9B" />
      ) : null}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { logout, user } = useAuth();
  const { formattedBalance } = useGreenGoBalance();
  const [totalOrders, setTotalOrders] = useState(0);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [primaryCard, setPrimaryCard] = useState<{
    maskedNumber: string;
    type: string;
  } | null>(null);

  const fetchPrimaryCard = async () => {
    try {
      const response = await apiService.getPaymentCards();
      if (response.success && Array.isArray(response.data)) {
        const cards = response.data as {
          maskedNumber: string;
          type: string;
          isPrimary?: boolean;
        }[];
        const primary =
          cards.find((card) => card.isPrimary) || cards[0] || null;
        setPrimaryCard(
          primary
            ? { maskedNumber: primary.maskedNumber, type: primary.type }
            : null,
        );
      } else {
        setPrimaryCard(null);
      }
    } catch {
      setPrimaryCard(null);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserOrders();
      fetchPrimaryCard();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    if (!user?.id && !(user as { _id?: string })?._id) return;

    try {
      setLoadingOrders(true);
      const userId = user?.id || (user as { _id?: string })?._id;
      const response = await apiService.getOrders({
        userId: userId,
        limit: 100,
        page: 1,
      });

      if (response.success && response.data) {
        const orders =
          (response.data as { orders?: Order[] }).orders ||
          (Array.isArray(response.data) ? response.data : []);
        setTotalOrders(orders.length);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) return user.firstName;
    return "მომხმარებელი";
  };

  const getGreetingName = () => getUserDisplayName().split(" ")[0];

  const handleLogout = () => {
    Alert.alert("გასვლა", "ნამდვილად გსურთ გასვლა?", [
      { text: "გაუქმება", style: "cancel" },
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
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetingRow}>
          <Text style={styles.greetingText}>
            <Text style={styles.greetingPrefix}>გამარჯობა, </Text>
            <Text style={styles.greetingName}>
              {getGreetingName()}! <Text style={styles.greetingWave}>👋</Text>
            </Text>
          </Text>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceTitle}>GreenGo ბალანსი</Text>
            <Text style={styles.balanceAmount}>{formattedBalance}</Text>
          </View>

          <View style={styles.cardRow}>
            <View style={styles.cardRowLeft}>
              <Ionicons name="card-outline" size={21} color="#181B1A" />
              {primaryCard ? (
                <View style={styles.cardTextBlock}>
                  <Text style={styles.cardLabel}>Card</Text>
                  <Text style={styles.cardNumber}>
                    {primaryCard.maskedNumber}
                  </Text>
                </View>
              ) : (
                <Text style={styles.emptyCardMessage}>
                  ბარათი არ გაქვთ დამატებული
                </Text>
              )}
            </View>
            {primaryCard ? (
              <TouchableOpacity
                onPress={() => router.push("/screens/paymentMethods")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.changeText}>შეცვლა</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.addCardButton}
            onPress={() => router.push("/screens/addCard")}
            activeOpacity={0.88}
          >
            <Ionicons name="add" size={16} color={BRAND_GREEN} />
            <Text style={styles.addCardText}>ახალი ბარათის დამატება</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionsWrap}>
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>პროფილი</Text>
            <View style={styles.menuCard}>
              <ProfileRow
                icon="person-outline"
                label="სახელი გვარი"
                onPress={() => router.push("/screens/editName")}
              />
              <ProfileRow
                icon="call-outline"
                label="მობილურის ნომერი"
                onPress={() => router.push("/screens/editPhone")}
              />
              <ProfileRow
                icon="mail-outline"
                label="ელ.ფოსტა"
                onPress={() => router.push("/screens/editEmail")}
              />
              <ProfileRow
                icon="location-outline"
                label="საქართველო"
                onPress={() => router.push("/screens/selectCountry")}
              />
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionLabel}>სხვა</Text>
            <View style={styles.menuCard}>
              <ProfileRow
                icon="card-outline"
                label="ბარათები"
                onPress={() => router.push("/screens/paymentMethods")}
              />
              <ProfileRow
                icon="pricetag-outline"
                label="პრომო კოდები"
                onPress={() => router.push("/screens/promoCodes")}
              />
              <ProfileRow
                icon="settings-outline"
                label="პარამეტრები"
                onPress={() => router.push("/screens/settings")}
              />
              <ProfileRow
                icon="help-circle-outline"
                label="მხარდაჭერა"
                onPress={() => router.push("/screens/support")}
              />
            </View>
          </View>
        </View>

        <View style={styles.ordersSection}>
          <Text style={styles.ordersSectionTitle}>შეკვეთები</Text>
          <TouchableOpacity
            style={styles.ordersCard}
            activeOpacity={0.85}
            onPress={() => router.push("/screens/orderHistory")}
          >
            <View>
              <Text style={styles.ordersCardTitle}>შეკვეთების ისტორია</Text>
              <Text style={styles.ordersCardSub}>
                {loadingOrders ? "..." : `${totalOrders}+ შეკვეთა`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9B9B9B" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>გასვლა</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 16,
    // backgroundColor: "#FFFFFF",
  },
  greetingText: {
    flex: 1,
    flexShrink: 1,
    fontSize: 24,
    lineHeight: 30,
    color: "#181B1A",
    marginRight: 8,
  },
  greetingPrefix: {
    fontFamily: fontFamily.bold,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  greetingName: {
    fontFamily: fontFamily.bold,
    textTransform: "uppercase",
  },
  greetingWave: {
    fontSize: 24,
    lineHeight: 30,
    flexShrink: 0,
  },
  balanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  balanceHeader: {
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#003E20",
  },
  balanceTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.regular,
    color: "#666666",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: fontFamily.bold,
    color: "#003E20",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  cardTextBlock: {
    marginLeft: 12,
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.bold,
    color: "#181B1A",
    marginBottom: 2,
  },
  cardNumber: {
    fontSize: 8,
    lineHeight: 12,
    fontFamily: fontFamily.regular,
    color: "#666666",
  },
  emptyCardMessage: {
    marginLeft: 12,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.regular,
    color: "#666666",
  },
  changeText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.regular,
    color: "#181B1A",
  },
  addCardButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F8F9",
    borderRadius: 60,
    paddingVertical: 8,
    height: 36,
    gap: 8,
  },
  addCardText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.semiBold,
    color: "#1D4045",
    textTransform: "uppercase",
  },
  sectionsWrap: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: "#181B1A",
    marginBottom: 8,
    alignSelf: "flex-start",
    textAlign: "center",
    textTransform: "uppercase",
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 4,
  },
  menuRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuRowLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.regular,
    color: "#666666",
    marginLeft: 8,
  },
  ordersSection: {
    backgroundColor: "#FFFFFF",
    paddingTop: 7,
    paddingBottom: 8,
  },
  ordersSectionTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: fontFamily.bold,
    color: "#181B1A",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  ordersCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#F5F5F5",
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
  },
  ordersCardTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.regular,
    color: "#181B1A",
    marginBottom: 2,
  },
  ordersCardSub: {
    fontSize: 8,
    lineHeight: 12,
    fontFamily: fontFamily.regular,
    color: "#666666",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
  },
  logoutText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: "#EF4444",
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 24,
  },
});
