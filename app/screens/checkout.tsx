import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
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
  const [selectedTip, setSelectedTip] = useState<number>(3);
  const [comment, setComment] = useState<string>("");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">(
    "delivery"
  );
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'greengo_balance'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<{
    street: string;
    city: string;
    district?: string;
    postalCode?: string;
    coordinates: { lat: number; lng: number };
    instructions?: string;
  } | null>(null);

  // Listen for address selection from selectAddress screen
  useFocusEffect(
    useCallback(() => {
      const loadSelectedAddress = async () => {
        try {
          const addressJson = await AsyncStorage.getItem("@greengo:selected_address");
          if (addressJson) {
            const address = JSON.parse(addressJson);
            setDeliveryAddress(address);
            // Clear stored address after loading
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
  const deliveryFee = deliveryType === "delivery" ? (restaurant?.deliveryFee || 4.99) : 0;
  const total = subtotal + deliveryFee + selectedTip;

  const tipOptions = [0, 1, 3, 5];

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

      // Prepare order items
      const orderItems = restaurantCartItems.map((item) => ({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        specialInstructions: comment || undefined,
      }));

      // Calculate estimated delivery time (30-45 minutes)
      const estimatedDelivery = new Date();
      estimatedDelivery.setMinutes(estimatedDelivery.getMinutes() + 35);

      // Prepare delivery address - only include required fields for backend
      let finalDeliveryAddress: {
        street: string;
        city: string;
        coordinates: { lat: number; lng: number };
        instructions?: string;
      };
      
      if (deliveryType === "delivery" && deliveryAddress) {
        if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.coordinates) {
          throw new Error("მისამართის მონაცემები არასრულია");
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
      } else if (deliveryType === "delivery") {
        // Fallback address if not selected (should not happen due to validation)
        finalDeliveryAddress = {
          street: "მისამართი არ არის მითითებული",
          city: "თბილისი",
          coordinates: {
            lat: Number(restaurant.location?.latitude || 41.7151),
            lng: Number(restaurant.location?.longitude || 44.8271),
          },
          instructions: comment || undefined,
        };
      } else {
        // For pickup, use restaurant address
        finalDeliveryAddress = {
          street: restaurant.location?.address || restaurant.name || "რესტორანი",
          city: restaurant.location?.city || "თბილისი",
          coordinates: {
            lat: Number(restaurant.location?.latitude || 41.7151),
            lng: Number(restaurant.location?.longitude || 44.8271),
          },
          instructions: comment || undefined,
        };
      }

      // Create order
      const orderData = {
        userId: user.id,
        restaurantId: restaurant._id || restaurant.id || restaurantId,
        items: orderItems,
        totalAmount: Number(subtotal.toFixed(2)),
        deliveryFee: Number(deliveryFee.toFixed(2)),
        paymentMethod: paymentMethod,
        deliveryAddress: finalDeliveryAddress,
        estimatedDelivery: estimatedDelivery.toISOString(),
        notes: comment || undefined,
        tip: selectedTip,
        deliveryType: deliveryType,
      };

      console.log("Creating order with data:", JSON.stringify(orderData, null, 2));

      const response = await apiService.createOrder(orderData);
      
      console.log("Order response:", response);

      if (response.success) {
        // Clear cart for this restaurant
        restaurantCartItems.forEach((item) => {
          removeFromCart(item.id);
        });

        // Navigate to order success page
        router.push({
          pathname: "/screens/orderSuccess",
          params: { 
            restaurantId,
            orderId: (response.data as any)?._id || "",
          },
        });
      } else {
        Alert.alert(
          "შეცდომა",
          response.error?.details || "შეკვეთის შექმნა ვერ მოხერხდა"
        );
      }
    } catch (error: unknown) {
      Alert.alert(
        "შეცდომა",
        error instanceof Error ? error.message : "უცნობი შეცდომა"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{restaurant?.name || "შეკვეთა"}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Location Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.locationCard}
            onPress={() => {
              router.push({
                pathname: "/screens/selectAddress",
                params: {},
              });
            }}
          >
            <View style={styles.locationLeft}>
              <Ionicons name="location" size={20} color="#2E7D32" />
              <View style={styles.locationText}>
                <Text style={styles.addressText}>
                  {deliveryAddress?.street || "აირჩიეთ მისამართი"}
                </Text>
                <Text style={styles.detailsText}>
                  {deliveryAddress?.city || "დააჭირეთ მისამართის ასარჩევად"}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </TouchableOpacity>
        </View>

        {/* Delivery/Pickup Options */}
        <View style={styles.section}>
          <View style={styles.deliveryOptions}>
            <TouchableOpacity
              style={[
                styles.deliveryOption,
                deliveryType === "delivery" && styles.deliveryOptionSelected,
              ]}
              onPress={() => setDeliveryType("delivery")}
            >
              <Ionicons
                name="car"
                size={24}
                color={deliveryType === "delivery" ? "#FFFFFF" : "#666666"}
              />
              <Text
                style={[
                  styles.deliveryOptionText,
                  deliveryType === "delivery" &&
                    styles.deliveryOptionTextSelected,
                ]}
              >
                მიწოდება
              </Text>
              <Text
                style={[
                  styles.deliveryOptionSubtext,
                  deliveryType === "delivery" &&
                    styles.deliveryOptionSubtextSelected,
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
                size={24}
                color={deliveryType === "pickup" ? "#FFFFFF" : "#666666"}
              />
              <Text
                style={[
                  styles.deliveryOptionText,
                  deliveryType === "pickup" &&
                    styles.deliveryOptionTextSelected,
                ]}
              >
                გატანა
              </Text>
              <Text
                style={[
                  styles.deliveryOptionSubtext,
                  deliveryType === "pickup" &&
                    styles.deliveryOptionSubtextSelected,
                ]}
              >
                კურიერი მოიტანს თქვენს მისამართზე
              </Text>
            </TouchableOpacity>
          </View>
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
              <Image source={item.image} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productModification}>ხახვის გარეშე</Text>
                <Text style={styles.productPrice}>
                  {item.price.toFixed(2)}₾
                </Text>
              </View>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    handleQuantityChange(item.id, item.quantity - 1)
                  }
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    handleQuantityChange(item.id, item.quantity + 1)
                  }
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Comment Section */}
        <View style={styles.section}>
          <TextInput
            style={styles.commentInput}
            placeholder="დატოვეთ კომენტარი.."
            value={comment}
            onChangeText={setComment}
            multiline
          />
        </View>

        {/* Voucher Section */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.voucherCard}>
            <View style={styles.voucherLeft}>
              <View style={styles.voucherIcon}>
                <Ionicons name="pricetag" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.voucherText}>დაამატეთ ვაუჩერი</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </TouchableOpacity>
        </View>

        {/* Tip Section */}
        <View style={styles.section}>
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <View style={styles.tipIcon}>
                <Ionicons name="card" size={20} color="#2E7D32" />
              </View>
              <View style={styles.tipText}>
                <Text style={styles.tipTitle}>
                  დატოვებთ კურიერს დამატებით თიფს?
                </Text>
                <Text style={styles.tipSubtitle}>
                  კურიერი იღებს თიფის 100%-ს.
                </Text>
              </View>
            </View>
            <View style={styles.tipOptions}>
              {tipOptions.map((tip) => (
                <TouchableOpacity
                  key={tip}
                  style={[
                    styles.tipButton,
                    selectedTip === tip && styles.tipButtonSelected,
                  ]}
                  onPress={() => setSelectedTip(tip)}
                >
                  <Text
                    style={[
                      styles.tipButtonText,
                      selectedTip === tip && styles.tipButtonTextSelected,
                    ]}
                  >
                    {tip}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>გადახდის მეთოდი</Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.paymentMethodCard,
                paymentMethod === "card" && styles.paymentMethodCardSelected,
              ]}
              onPress={() => setPaymentMethod("card")}
            >
              <Ionicons
                name="card"
                size={24}
                color={paymentMethod === "card" ? "#FFFFFF" : "#666666"}
              />
              <Text
                style={[
                  styles.paymentMethodText,
                  paymentMethod === "card" && styles.paymentMethodTextSelected,
                ]}
              >
                ბარათი
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentMethodCard,
                paymentMethod === "cash" && styles.paymentMethodCardSelected,
              ]}
              onPress={() => setPaymentMethod("cash")}
            >
              <Ionicons
                name="cash"
                size={24}
                color={paymentMethod === "cash" ? "#FFFFFF" : "#666666"}
              />
              <Text
                style={[
                  styles.paymentMethodText,
                  paymentMethod === "cash" && styles.paymentMethodTextSelected,
                ]}
              >
                ნაღდი
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentMethodCard,
                paymentMethod === "greengo_balance" && styles.paymentMethodCardSelected,
              ]}
              onPress={() => setPaymentMethod("greengo_balance")}
            >
              <Ionicons
                name="wallet"
                size={24}
                color={paymentMethod === "greengo_balance" ? "#FFFFFF" : "#666666"}
              />
              <Text
                style={[
                  styles.paymentMethodText,
                  paymentMethod === "greengo_balance" && styles.paymentMethodTextSelected,
                ]}
              >
                GreenGo ბალანსი
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Confirm Order Button */}
      <View style={styles.confirmButtonContainer}>
        <TouchableOpacity
          style={[styles.confirmButton, isSubmitting && styles.confirmButtonDisabled]}
          onPress={handleConfirmOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmButtonText}>დაადასტურე შეკვეთა</Text>
          )}
        </TouchableOpacity>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>სულ</Text>
          <Text style={styles.totalAmount}>{total.toFixed(2)}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#2E7D32",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  locationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    marginLeft: 12,
  },
  addressText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  detailsText: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  deliveryOptions: {
    flexDirection: "row",
    gap: 12,
  },
  deliveryOption: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  deliveryOptionSelected: {
    backgroundColor: "#2E7D32",
  },
  deliveryOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginTop: 8,
  },
  deliveryOptionTextSelected: {
    color: "#FFFFFF",
  },
  deliveryOptionSubtext: {
    fontSize: 12,
    color: "#666666",
    textAlign: "center",
    marginTop: 4,
  },
  deliveryOptionSubtextSelected: {
    color: "#FFFFFF",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  addMoreText: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "600",
  },
  productItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  productModification: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginTop: 4,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginHorizontal: 12,
  },
  commentInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#000000",
    minHeight: 60,
    textAlignVertical: "top",
  },
  voucherCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  voucherLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  voucherIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  voucherText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginLeft: 12,
  },
  tipCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8F5E8",
    justifyContent: "center",
    alignItems: "center",
  },
  tipText: {
    marginLeft: 12,
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  tipSubtitle: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  tipOptions: {
    flexDirection: "row",
    gap: 12,
  },
  tipButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  tipButtonSelected: {
    backgroundColor: "#2E7D32",
  },
  tipButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  tipButtonTextSelected: {
    color: "#FFFFFF",
  },
  paymentMethods: {
    flexDirection: "row",
    gap: 12,
  },
  paymentMethodCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  paymentMethodCardSelected: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    marginTop: 8,
  },
  paymentMethodTextSelected: {
    color: "#FFFFFF",
  },
  bottomSpacing: {
    height: 100,
  },
  confirmButtonContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  confirmButton: {
    backgroundColor: "#2E7D32",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
});
