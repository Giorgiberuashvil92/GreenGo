import { getDistance } from "@/utils/restaurantUtils";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useRestaurant } from "../../hooks/useRestaurants";
import { apiService } from "../../utils/api";

export default function CheckoutScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const { restaurant } = useRestaurant(restaurantId || "");
  const [comment, setComment] = useState<string>("");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">(
    "delivery"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<{
    street: string;
    city: string;
    district?: string;
    postalCode?: string;
    coordinates: { lat: number; lng: number };
    instructions?: string;
  } | null>(null);

  // Payment card info (mock)
  const [savedCard] = useState({
    type: "AMEX",
    lastFour: "7729",
  });

  useFocusEffect(
    useCallback(() => {
      const loadSelectedAddress = async () => {
        try {
          const addressJson = await AsyncStorage.getItem(
            "@greengo:selected_address"
          );
          if (addressJson) {
            const address = JSON.parse(addressJson);
            setDeliveryAddress(address);
            await AsyncStorage.removeItem("@greengo:selected_address");
          }
        } catch (error) {
          console.error("Error loading address:", error);
        }
      };
      loadSelectedAddress();
    }, [])
  );

  const restaurantCartItems = cartItems.filter(
    (item) => item.restaurantId === restaurantId
  );

  const subtotal = restaurantCartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Service fee
  const serviceFee = 1.2;

  // Calculate delivery fee based on distance
  const deliveryFee = useMemo(() => {
    if (
      deliveryType !== "delivery" ||
      !deliveryAddress ||
      !restaurant?.location
    ) {
      return 0;
    }

    const baseFee = restaurant.deliveryFee || 2.7;

    const distanceKm = getDistance(
      restaurant.location.latitude,
      restaurant.location.longitude,
      deliveryAddress.coordinates.lat,
      deliveryAddress.coordinates.lng
    );

    if (distanceKm <= 10) {
      return baseFee;
    }

    const additionalKm = distanceKm - 10;
    const additionalFee = additionalKm * 1.2;
    return baseFee + additionalFee;
  }, [
    deliveryType,
    deliveryAddress,
    restaurant?.location,
    restaurant?.deliveryFee,
  ]);

  const total = useMemo(() => {
    return subtotal + serviceFee + deliveryFee;
  }, [subtotal, serviceFee, deliveryFee]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleConfirmOrder = async () => {
    if (!user?.id || !restaurant?._id) {
      Alert.alert("შეცდომა", "გთხოვთ დალოგინდეთ და სცადეთ თავიდან");
      return;
    }

    if (restaurantCartItems.length === 0) {
      Alert.alert("შეცდომა", "კალათა ცარიელია");
      return;
    }

    try {
      setIsSubmitting(true);

      const orderItems = restaurantCartItems.map((item) => ({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        specialInstructions: comment || undefined,
      }));

      let estimatedMinutes = 20;

      if (
        deliveryType === "delivery" &&
        deliveryAddress &&
        restaurant?.location
      ) {
        const distanceKm = getDistance(
          restaurant.location.latitude,
          restaurant.location.longitude,
          deliveryAddress.coordinates.lat,
          deliveryAddress.coordinates.lng
        );

        const travelTimeMinutes = Math.ceil(distanceKm / 0.5);
        estimatedMinutes = 20 + travelTimeMinutes + 5;
        estimatedMinutes = Math.max(25, Math.min(60, estimatedMinutes));
      } else if (deliveryType === "pickup") {
        estimatedMinutes = 15;
      }

      const estimatedDelivery = new Date();
      estimatedDelivery.setMinutes(
        estimatedDelivery.getMinutes() + estimatedMinutes
      );

      let finalDeliveryAddress: {
        street: string;
        city: string;
        coordinates: { lat: number; lng: number };
        instructions?: string;
      };

      if (deliveryType === "delivery") {
        if (!deliveryAddress) {
          Alert.alert("შეცდომა", "გთხოვთ აირჩიოთ მიტანის მისამართი");
          setIsSubmitting(false);
          return;
        }

        finalDeliveryAddress = {
          street: deliveryAddress.street,
          city: deliveryAddress.city,
          coordinates: {
            lat: Number(deliveryAddress.coordinates.lat),
            lng: Number(deliveryAddress.coordinates.lng),
          },
          instructions: deliveryAddress.instructions || comment || undefined,
        };
      } else {
        finalDeliveryAddress = {
          street:
            restaurant.location?.address || restaurant.name || "რესტორანი",
          city: restaurant.location?.city || "თბილისი",
          coordinates: {
            lat: Number(restaurant.location?.latitude || 41.7151),
            lng: Number(restaurant.location?.longitude || 44.8271),
          },
          instructions: comment || undefined,
        };
      }

      const orderData = {
        userId: user.id,
        restaurantId: restaurant._id || restaurant.id || restaurantId,
        items: orderItems,
        totalAmount: Number(total.toFixed(2)),
        deliveryFee: Number(deliveryFee.toFixed(2)),
        paymentMethod: "card",
        deliveryAddress: finalDeliveryAddress,
        estimatedDelivery: estimatedDelivery.toISOString(),
        notes: comment || undefined,
        tip: 0,
        deliveryType: deliveryType,
      };

      const response = await apiService.createOrder(orderData);

      if (response.success) {
        restaurantCartItems.forEach((item) => {
          removeFromCart(item.id);
        });

        router.push({
          pathname: "/screens/orderSuccess",
          params: {
            restaurantId,
            orderId:
              (response.data as any)?._id || (response.data as any)?.id || "",
          },
        });
      } else {
        Alert.alert(
          "შეცდომა",
          response.error?.details || "შეკვეთის შექმნა ვერ მოხერხდა"
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "უცნობი შეცდომა";
      Alert.alert("შეცდომა", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImageSource = (image: any) => {
    if (typeof image === "string") {
      return { uri: image };
    }
    return image;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{restaurant?.name || "შეკვეთა"}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Address Section */}
        <TouchableOpacity
          style={styles.addressCard}
          onPress={() => {
            router.push({
              pathname: "/screens/selectAddress",
              params: {},
            });
          }}
        >
          <View style={styles.addressLeft}>
            <View style={styles.addressIconContainer}>
              <Ionicons name="location" size={20} color="#2E7D32" />
            </View>
            <View style={styles.addressTextContainer}>
              <Text style={styles.addressTitle}>
                {deliveryAddress?.street || "4 ტაბიძის ქუჩა"}
              </Text>
              <Text style={styles.addressSubtitle}>დამატებითი დეტალები</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666666" />
        </TouchableOpacity>

        {/* Delivery/Pickup Options */}
        <View style={styles.deliveryOptions}>
          <TouchableOpacity
            style={[
              styles.deliveryOption,
              deliveryType === "delivery" && styles.deliveryOptionSelected,
            ]}
            onPress={() => setDeliveryType("delivery")}
          >
            <MaterialCommunityIcons
              name="moped"
              size={20}
              color={deliveryType === "delivery" ? "#FFFFFF" : "#1A1A1A"}
            />
            <Text
              style={[
                styles.deliveryOptionTitle,
                deliveryType === "delivery" &&
                  styles.deliveryOptionTitleSelected,
              ]}
            >
              მიწოდება
            </Text>
            <Text
              style={[
                styles.deliveryOptionSubtitle,
                deliveryType === "delivery" &&
                  styles.deliveryOptionSubtitleSelected,
              ]}
            >
              კურიერი მოიტანს თქვენს მისამართზე
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.deliveryOption,
              deliveryType === "pickup" && styles.deliveryOptionSelected,
            ]}
            onPress={() => setDeliveryType("pickup")}
          >
            <Ionicons
              name="walk"
              size={20}
              color={deliveryType === "pickup" ? "#FFFFFF" : "#1A1A1A"}
            />
            <Text
              style={[
                styles.deliveryOptionTitle,
                deliveryType === "pickup" && styles.deliveryOptionTitleSelected,
              ]}
            >
              გატანა
            </Text>
            <Text
              style={[
                styles.deliveryOptionSubtitle,
                deliveryType === "pickup" &&
                  styles.deliveryOptionSubtitleSelected,
              ]}
            >
              კურიერი მოიტანს თქვენს მისამართზე
            </Text>
          </TouchableOpacity>
        </View>

        {/* Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>პროდუქტები</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.addMoreText}>დაამატე მეტი</Text>
            </TouchableOpacity>
          </View>

          {restaurantCartItems.map((item) => (
            <View key={item.id} style={styles.productItem}>
              <Image
                source={getImageSource(item.image)}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productModification}>ხახვის გარეშე 🌶️</Text>
                <Text style={styles.productPrice}>
                  {item.price.toFixed(2).replace(".", ",")} ₾
                </Text>
              </View>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    handleQuantityChange(item.id, item.quantity - 1)
                  }
                >
                  <Ionicons name="remove" size={16} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    handleQuantityChange(item.id, item.quantity + 1)
                  }
                >
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Comment Section */}
        <View style={styles.commentContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="დატოვეთ კომენტარი.."
            placeholderTextColor="#999999"
            value={comment}
            onChangeText={setComment}
            multiline
          />
        </View>

        {/* Voucher Section */}
        <TouchableOpacity style={styles.voucherCard}>
          <View style={styles.voucherLeft}>
            <View style={styles.voucherIcon}>
              <MaterialCommunityIcons
                name="ticket-percent"
                size={18}
                color="#E53935"
              />
            </View>
            <Text style={styles.voucherText}>დაამატეთ ვაუჩერი</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666666" />
        </TouchableOpacity>

        {/* Tip Section */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconContainer}>
            <MaterialCommunityIcons name="moped" size={24} color="#2E7D32" />
          </View>
          <Text style={styles.tipTitle}>დატოვეთ კურიერს</Text>
        </View>

        {/* Payment Card Section */}
        <TouchableOpacity style={styles.paymentCard}>
          <View style={styles.paymentLeft}>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>{savedCard.type}</Text>
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.cardNumber}>**** {savedCard.lastFour}</Text>
              <Text style={styles.cardAmount}>
                {total.toFixed(2).replace(".", ",")} ₾
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666666" />
        </TouchableOpacity>

        {/* Confirm Order Button */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            isSubmitting && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmButtonText}>დაადასტურე შეკვეთა</Text>
          )}
        </TouchableOpacity>

        {/* Price Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>ჯამი</Text>
            <Text style={styles.summaryValue}>
              {subtotal.toFixed(2).replace(".", ",")}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>მომსახურების საფასური</Text>
            <Text style={styles.summaryValue}>
              {serviceFee.toFixed(2).replace(".", ",")}
            </Text>
          </View>
          {deliveryType === "delivery" && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>მიტანის საფასური (500მ)</Text>
              <Text style={styles.summaryValue}>
                {deliveryFee.toFixed(2).replace(".", ",")}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>სულ</Text>
            <Text style={styles.summaryTotalValue}>
              {total.toFixed(2).replace(".", ",")}
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  addressLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  addressIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  addressSubtitle: {
    fontSize: 13,
    color: "#999999",
    marginTop: 2,
  },
  deliveryOptions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  deliveryOption: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  deliveryOptionSelected: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  deliveryOptionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    marginTop: 8,
  },
  deliveryOptionTitleSelected: {
    color: "#FFFFFF",
  },
  deliveryOptionSubtitle: {
    fontSize: 11,
    color: "#999999",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 14,
  },
  deliveryOptionSubtitleSelected: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  addMoreText: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "500",
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  productModification: {
    fontSize: 13,
    color: "#999999",
    marginTop: 2,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2E7D32",
    marginTop: 4,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    borderRadius: 20,
    padding: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2E7D32",
    marginHorizontal: 12,
    minWidth: 16,
    textAlign: "center",
  },
  commentContainer: {
    marginTop: 16,
  },
  commentInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    minHeight: 50,
  },
  voucherCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  voucherLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  voucherIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FFEBEE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  voucherText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1A1A1A",
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1A1A1A",
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardBadge: {
    backgroundColor: "#1565C0",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardNumber: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1A1A1A",
  },
  cardAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2E7D32",
  },
  confirmButton: {
    backgroundColor: "#2E7D32",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  summarySection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#1A1A1A",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2E7D32",
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2E7D32",
  },
  bottomSpacing: {
    height: 40,
  },
});
