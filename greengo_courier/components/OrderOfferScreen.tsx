import React from "react";
import {
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
      latitude: number;
      longitude: number;
    };
  };
  deliveryAddress: {
    coordinates: { lat: number; lng: number };
  };
  deliveryFee: number;
  preparationMinutes?: number;
  estimatedReadyAt?: string;
}

interface OrderOfferScreenProps {
  order: Order | null;
  distance?: number;
  onConfirm: () => void;
  onReject?: () => void;
  isLoading?: boolean;
}

export const OrderOfferScreen: React.FC<OrderOfferScreenProps> = ({
  order,
  distance,
  onConfirm,
  onReject,
  isLoading = false,
}) => {
  if (!order) {
    return (
      <View>
        <Text style={styles.errorText}>შეკვეთის მონაცემები არ მოიძებნა</Text>
      </View>
    );
  }

  const earnings = order.deliveryFee || 0;
  const distanceText = distance ? `${distance.toFixed(1)} კმ` : "—";

  const remainingFromReadyAt = order.estimatedReadyAt
    ? Math.ceil(
        (new Date(order.estimatedReadyAt).getTime() - Date.now()) / 60000,
      )
    : null;
  const prepMinutes =
    remainingFromReadyAt != null && remainingFromReadyAt > 0
      ? remainingFromReadyAt
      : order.preparationMinutes && order.preparationMinutes > 0
        ? order.preparationMinutes
        : null;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        bounces={false}
      >
        <View style={styles.earningsContainer}>
          <Text style={styles.earningsText}>+ {earnings.toFixed(2)} ₾</Text>
          <Text style={styles.earningsSubtext}>
            დაამატეთ თქვენს მიმდინარე ანგარიშს
          </Text>
        </View>

        <View style={styles.orderInfoContainer}>
          <Text style={styles.orderLabel}>შეკვეთა</Text>
          <Text style={styles.restaurantName}>
            {order.restaurantId?.name || "რესტორანი"}
          </Text>
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceLabel}>მარშრუტის მანძილი</Text>
            <Text style={styles.distanceValue}>{distanceText}</Text>
          </View>
          {/* {prepMinutes != null ? (
            <View style={styles.distanceContainer}>
              <Text style={styles.distanceLabel}>რესტორნის მზადების დრო</Text>
              <Text style={styles.distanceValue}>≈ {prepMinutes} წთ</Text>
            </View>
          ) : null} */}
        </View>
      </ScrollView>

      <View style={styles.stickyFooter}>
        <ActionSlideButton
          label={isLoading ? "მუშავდება..." : "შეკვეთის დადასტურება"}
          onConfirm={onConfirm}
          disabled={isLoading}
          style={styles.slideNoMargin}
        />
        {onReject && (
          <TouchableOpacity
            style={[
              styles.rejectButton,
              isLoading && styles.rejectButtonDisabled,
            ]}
            onPress={onReject}
            disabled={isLoading}
          >
            <Text style={styles.rejectButtonText}>გაუქმება</Text>
          </TouchableOpacity>
        )}
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
    gap: Dims.padding.small,
    paddingTop: Dims.padding.small,
    backgroundColor: "rgba(255, 255, 255, 1)",
  },
  slideNoMargin: {
    marginTop: 0,
  },
  earningsContainer: {
    marginBottom: Dims.padding.screen,
  },
  earningsText: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 4,
  },
  earningsSubtext: {
    fontSize: 14,
    color: Colors.gray.medium,
  },
  orderInfoContainer: {
    marginBottom: Dims.padding.small,
  },
  orderLabel: {
    fontSize: 14,
    color: Colors.gray.medium,
    marginBottom: Dims.padding.small,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.secondary,
    marginBottom: Dims.padding.medium,
  },
  distanceContainer: {
    marginTop: Dims.padding.medium,
    paddingTop: Dims.padding.medium,
    borderTopWidth: 1,
    borderTopColor: Colors.gray.light,
  },
  distanceLabel: {
    fontSize: 14,
    color: Colors.gray.medium,
    marginBottom: 4,
  },
  distanceValue: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
  },
  rejectButton: {
    backgroundColor: Colors.error,
    paddingVertical: 16,
    borderRadius: Dims.borderRadius.round,
    alignItems: "center",
  },
  rejectButtonDisabled: {
    opacity: 0.6,
  },
  rejectButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 16,
    color: Colors.gray.medium,
    textAlign: "center",
    padding: Dims.padding.large,
  },
});
