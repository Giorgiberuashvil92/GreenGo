import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/colors";
import { Dimensions as Dims } from "../constants/dimensions";
import { ActionSlideButton } from "./ActionSlideButton";

interface Order {
  _id: string;
  restaurantId: {
    name: string;
    location?: {
      address?: string;
      city?: string;
    };
  };
  userId?: {
    name?: string;
    phoneNumber?: string;
  };
  deliveryAddress: {
    street: string;
    city: string;
    instructions?: string;
  };
  status: string;
  items?: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount?: number;
  deliveryFee?: number;
  tip?: number;
  paymentMethod?: string;
}

interface OrderPickupScreenProps {
  order: Order | null;
  preparationTime: number;
  isReady: boolean;
  onPickup: () => void;
}

export const OrderPickupScreen: React.FC<OrderPickupScreenProps> = ({
  order,
  preparationTime,
  isReady,
  onPickup,
}) => {
  if (!order) {
    return (
      <View>
        <Text style={styles.errorText}>შეკვეთის მონაცემები არ მოიძებნა</Text>
      </View>
    );
  }

  const restaurantName = order.restaurantId?.name || "რესტორანი";
  const restaurantAddress =
    order.restaurantId?.location?.address ||
    order.restaurantId?.location?.city ||
    "მისამართი არ არის მითითებული";
  const street = order.deliveryAddress?.street || "—";
  const instructions = order.deliveryAddress?.instructions;
  const items = order.items || [];
  const customerName = order.userId?.name || "კლიენტი";
  const shortName = customerName.split(" ")[0] || customerName;
  const phone = order.userId?.phoneNumber;
  const ready = order.status === "ready" || isReady;

  const statusLabel = ready
    ? "შეკვეთა მზადაა"
    : preparationTime > 0
      ? `მზადდება · ≈ ${preparationTime} წთ`
      : "შეკვეთა მზადდება";

  const handleCall = async () => {
    if (!phone) {
      Alert.alert("შეცდომა", "ტელეფონის ნომერი არ მოიძებნა");
      return;
    }
    const url = `tel:${phone}`;
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
    }
  };

  const handleMessage = async () => {
    if (!phone) {
      Alert.alert("შეცდომა", "ტელეფონის ნომერი არ მოიძებნა");
      return;
    }
    const url = `sms:${phone}`;
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        bounces={false}
      >
        <Text style={styles.eyebrow}>შეკვეთის აღება</Text>
        <Text style={styles.heroTitle}>{restaurantName}</Text>
        <Text style={styles.heroSubtitle}>{restaurantAddress}</Text>

        <View style={[styles.statusBadge, ready && styles.statusBadgeReady]}>
          <Text style={styles.statusBadgeText}>{statusLabel}</Text>
        </View>

        {/* {!ready && preparationTime > 0 ? (
          <View style={styles.prepTimeCard}>
            <Text style={styles.prepTimeLabel}>რესტორნის მზადების დრო</Text>
            <Text style={styles.prepTimeValue}>≈ {preparationTime} წთ</Text>
          </View>
        ) : null} */}

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>მისამართის დეტალები</Text>
          <Text style={styles.sectionValue}>{street}</Text>
        </View>

        <View style={styles.divider} />

        {instructions ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>შენიშვნა</Text>
              <Text style={styles.sectionValue}>{instructions}</Text>
            </View>
            <View style={styles.divider} />
          </>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>შეკვეთის დეტალები</Text>
          <View style={styles.customerRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={16} color={Colors.primary} />
            </View>
            <Text style={styles.customerShort}>{shortName}</Text>
          </View>
          {items.length > 0 ? (
            items.map((item, index) => (
              <Text key={index} style={styles.itemLine}>
                {item.quantity} x {item.name}
              </Text>
            ))
          ) : (
            <Text style={styles.sectionValue}>პროდუქტები არ არის</Text>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            მიტანისას პრობლემები შეგექმნათ?
          </Text>
          <View style={styles.supportRow}>
            <TouchableOpacity style={styles.phoneButton} onPress={handleCall}>
              <Ionicons name="call" size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.messageButton}
              onPress={handleMessage}
            >
              <Ionicons
                name="chatbubble-ellipses"
                size={18}
                color={Colors.secondary}
              />
              <Text style={styles.messageButtonText}>
                გააგზავნეთ შეტყობინება
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Sticky — ჩანს დახურულ მდგომარეობაშიც */}
      <View style={styles.stickyFooter}>
        <ActionSlideButton
          label="ავიღე კერძი"
          onConfirm={onPickup}
          disabled={!ready}
          style={styles.slideNoMargin}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Dims.padding.medium,
  },
  stickyFooter: {
    paddingTop: Dims.padding.small,
    backgroundColor: "rgba(255, 255, 255, 1)",
  },
  slideNoMargin: {
    marginTop: 0,
  },
  eyebrow: {
    fontSize: 13,
    color: Colors.gray.medium,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 15,
    color: Colors.gray.medium,
    marginBottom: Dims.padding.medium,
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 4,
  },
  statusBadgeReady: {
    backgroundColor: Colors.primary,
  },
  statusBadgeText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  prepTimeCard: {
    marginTop: Dims.padding.medium,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#F5F7F5",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  prepTimeLabel: {
    fontSize: 14,
    color: Colors.gray.medium,
    fontWeight: "500",
  },
  prepTimeValue: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.secondary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E5E5",
    marginVertical: Dims.padding.medium,
  },
  section: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 4,
  },
  sectionValue: {
    fontSize: 15,
    color: Colors.gray.medium,
    lineHeight: 22,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  customerShort: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.black,
  },
  itemLine: {
    fontSize: 15,
    color: Colors.gray.medium,
    marginBottom: 2,
  },
  supportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
  },
  phoneButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  messageButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#E3F2FD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  messageButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.secondary,
  },
  errorText: {
    fontSize: 16,
    color: Colors.gray.medium,
    textAlign: "center",
    padding: Dims.padding.large,
  },
});
