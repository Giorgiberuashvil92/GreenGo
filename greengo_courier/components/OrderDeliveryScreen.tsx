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
  userId: {
    name?: string;
    phoneNumber: string;
  };
  restaurantId?: {
    name?: string;
  };
  items?: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount?: number;
  deliveryFee?: number;
  tip?: number;
  paymentMethod?: string;
  deliveryAddress: {
    street: string;
    city: string;
    instructions?: string;
  };
  estimatedPickupAt?: string;
  estimatedDeliveryAt?: string;
  createdAt?: string;
}

interface OrderDeliveryScreenProps {
  order: Order | null;
  onDeliver: () => void;
  isLoading?: boolean;
}

function formatTime(value?: string, fallbackHour = 12, fallbackMinute = 45) {
  if (value) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
  }
  const d = new Date();
  d.setHours(fallbackHour, fallbackMinute, 0, 0);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export const OrderDeliveryScreen: React.FC<OrderDeliveryScreenProps> = ({
  order,
  onDeliver,
  isLoading = false,
}) => {
  if (!order) {
    return (
      <View>
        <Text style={styles.errorText}>შეკვეთის მონაცემები არ მოიძებნა</Text>
      </View>
    );
  }

  const customerName = order.userId?.name || "კლიენტი";
  const shortName = customerName.split(" ")[0] || customerName;
  const street = order.deliveryAddress?.street || "მისამართი არ არის";
  const cityLine = order.deliveryAddress?.city
    ? `${street}`
    : street;
  const instructions = order.deliveryAddress?.instructions;
  const items = order.items || [];
  const restaurantName = order.restaurantId?.name || "რესტორანი";
  const phone = order.userId?.phoneNumber;

  const pickupTime = formatTime(order.estimatedPickupAt, 12, 45);
  const deliveryTime = formatTime(order.estimatedDeliveryAt, 13, 0);

  const handleCall = async () => {
    if (!phone) {
      Alert.alert("შეცდომა", "ტელეფონის ნომერი არ მოიძებნა");
      return;
    }
    const url = `tel:${phone}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert("შეცდომა", "ზარის განხორციელება ვერ მოხერხდა");
    }
  };

  const handleMessage = async () => {
    if (!phone) {
      Alert.alert("შეცდომა", "ტელეფონის ნომერი არ მოიძებნა");
      return;
    }
    const url = `sms:${phone}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert("შეცდომა", "შეტყობინების გაგზავნა ვერ მოხერხდა");
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
        <Text style={styles.eyebrow}>შეკვეთა მიგაქვს</Text>
        <Text style={styles.heroTitle}>{customerName}</Text>
        <Text style={styles.heroSubtitle}>{cityLine}</Text>

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

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>შეკვეთის ვადები</Text>

          <View style={styles.timeline}>
            <View style={styles.timelineRow}>
              <Text style={styles.timelineTime}>{pickupTime}</Text>
              <View style={styles.timelineTrack}>
                <View style={styles.timelineDot}>
                  <Ionicons name="storefront" size={14} color={Colors.black} />
                </View>
                <View style={styles.timelineLine} />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>შეკვეთის აღება</Text>
                <Text style={styles.timelineSubtitle}>{restaurantName}</Text>
              </View>
            </View>

            <View style={styles.timelineRow}>
              <Text style={styles.timelineTime}>{deliveryTime}</Text>
              <View style={styles.timelineTrack}>
                <View style={[styles.timelineDot, styles.timelineDotGreen]}>
                  <Ionicons name="person" size={14} color={Colors.primary} />
                </View>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>მიწოდება</Text>
                <Text style={styles.timelineSubtitle}>{customerName}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.stickyFooter}>
        <ActionSlideButton
          label={isLoading ? "მუშავდება..." : "დასრულება"}
          onConfirm={onDeliver}
          disabled={isLoading}
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
  timeline: {
    marginTop: 8,
    gap: 0,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 56,
  },
  timelineTime: {
    width: 72,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.black,
    paddingTop: 6,
  },
  timelineTrack: {
    width: 28,
    alignItems: "center",
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineDotGreen: {
    backgroundColor: "#E8F5E9",
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    backgroundColor: "#E5E5E5",
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 10,
    paddingTop: 4,
    paddingBottom: 12,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
  },
  timelineSubtitle: {
    fontSize: 13,
    color: Colors.gray.medium,
    marginTop: 2,
  },
  errorText: {
    fontSize: 16,
    color: Colors.gray.medium,
    textAlign: "center",
    padding: Dims.padding.large,
  },
});
