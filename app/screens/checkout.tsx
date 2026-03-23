import { LIST_ACCENT_GREEN } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
import { getDistance } from "@/utils/restaurantUtils";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageSourcePropType,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useRestaurant } from "../../hooks/useRestaurants";
import { apiService } from "../../utils/api";

const PRIMARY_GREEN = "#1B5E37";
const QTY_BG = "#DCFCE7";
const SCREEN_BG = "#F5F5F5";

function formatGel(n: number): string {
  return `${n.toFixed(2).replace(".", ",")} ₾`;
}

function cartImageSource(image: unknown): ImageSourcePropType {
  if (typeof image === "string") {
    return { uri: image };
  }
  if (image) {
    return image as ImageSourcePropType;
  }
  return require("../../assets/images/magnolia.png");
}

export default function CheckoutScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const { restaurant, loading: restaurantLoading } = useRestaurant(
    restaurantId || "",
  );
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

  // Calculate delivery fee based on distance
  const deliveryFee = useMemo(() => {
    if (deliveryType !== "delivery" || !deliveryAddress || !restaurant?.location) {
      return 0;
    }

    const baseFee = restaurant.deliveryFee || 4.99;
    
    // Calculate distance between restaurant and delivery address
    const distanceKm = getDistance(
      restaurant.location.latitude,
      restaurant.location.longitude,
      deliveryAddress.coordinates.lat,
      deliveryAddress.coordinates.lng
    );

    // If distance > 10 km, add 1.20 GEL per additional kilometer
    if (distanceKm <= 10) {
      return baseFee;
    }

    const additionalKm = distanceKm - 10;
    const additionalFee = additionalKm * 1.20;
    return baseFee + additionalFee;
  }, [deliveryType, deliveryAddress, restaurant?.location, restaurant?.deliveryFee]);

  const total = useMemo(() => {
    return subtotal + deliveryFee + selectedTip;
  }, [subtotal, deliveryFee, selectedTip]);

  const tipOptions = [0, 1, 3, 5];

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleConfirmOrder = async () => {
    console.log("🔵 handleConfirmOrder called");
    console.log("User:", user?.id);
    console.log("Restaurant:", restaurant?._id);
    console.log("Cart items:", restaurantCartItems.length);

    if (!user?.id || !restaurant?._id) {
      console.log("❌ Missing user or restaurant");
      Alert.alert("შეცდომა", "გთხოვთ დალოგინდეთ და სცადეთ თავიდან");
      return;
    }

    if (restaurantCartItems.length === 0) {
      console.log("❌ Cart is empty");
      Alert.alert("შეცდომა", "კალათა ცარიელია");
      return;
    }

    try {
      console.log("🟢 Starting order creation...");
      setIsSubmitting(true);

      // Prepare order items
      const orderItems = restaurantCartItems.map((item) => ({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        specialInstructions: comment || undefined,
      }));

      // Calculate estimated delivery time based on distance
      let estimatedMinutes = 20; // Base preparation time
      
      if (deliveryType === "delivery" && deliveryAddress && restaurant?.location) {
        // Calculate distance between restaurant and delivery address
        const distanceKm = getDistance(
          restaurant.location.latitude,
          restaurant.location.longitude,
          deliveryAddress.coordinates.lat,
          deliveryAddress.coordinates.lng
        );
        
        // Calculate delivery time:
        // - Preparation time: 15-20 minutes
        // - Travel time: distance / average speed (30 km/h in city = 0.5 km/min)
        // - Add buffer: 5-10 minutes
        const travelTimeMinutes = Math.ceil(distanceKm / 0.5); // ~30 km/h average speed
        estimatedMinutes = 20 + travelTimeMinutes + 5; // Base + travel + buffer
        
        // Minimum 25 minutes, maximum 60 minutes
        estimatedMinutes = Math.max(25, Math.min(60, estimatedMinutes));
        
        console.log(`📍 Distance: ${distanceKm.toFixed(2)} km, Estimated time: ${estimatedMinutes} minutes`);
      } else if (deliveryType === "pickup") {
        // Pickup orders are faster - just preparation time
        estimatedMinutes = 15;
      }
      
      const estimatedDelivery = new Date();
      estimatedDelivery.setMinutes(estimatedDelivery.getMinutes() + estimatedMinutes);

      // Prepare delivery address - only include required fields for backend
      let finalDeliveryAddress: {
        street: string;
        city: string;
        coordinates: { lat: number; lng: number };
        instructions?: string;
      };
      
      if (deliveryType === "delivery") {
        if (!deliveryAddress) {
          console.log("❌ Delivery address is required for delivery orders");
          Alert.alert(
            "შეცდომა",
            "გთხოვთ აირჩიოთ მიტანის მისამართი"
          );
          setIsSubmitting(false);
          return;
        }
        
        if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.coordinates) {
          console.log("❌ Delivery address data is incomplete");
          Alert.alert(
            "შეცდომა",
            "მისამართის მონაცემები არასრულია. გთხოვთ აირჩიოთ მისამართი თავიდან"
          );
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
        console.log("✅ Delivery address prepared:", finalDeliveryAddress);
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
        totalAmount: Number(total.toFixed(2)), // Include subtotal + deliveryFee + tip
        deliveryFee: Number(deliveryFee.toFixed(2)),
        paymentMethod: paymentMethod,
        deliveryAddress: finalDeliveryAddress,
        estimatedDelivery: estimatedDelivery.toISOString(),
        notes: comment || undefined,
        tip: selectedTip,
        deliveryType: deliveryType,
      };

      console.log("📦 Creating order with data:", JSON.stringify(orderData, null, 2));

      const response = await apiService.createOrder(orderData);
      
      console.log("📥 Order response:", JSON.stringify(response, null, 2));

      if (response.success) {
        console.log("✅ Order created successfully!");
        // Clear cart for this restaurant
        restaurantCartItems.forEach((item) => {
          removeFromCart(item.id);
        });

        // Navigate to order success page
        console.log("🔄 Navigating to order success page...");
        router.push({
          pathname: "/screens/orderSuccess",
          params: { 
            restaurantId,
            orderId: (response.data as any)?._id || (response.data as any)?.id || "",
          },
        });
      } else {
        console.error("❌ Order creation failed:", response.error);
        Alert.alert(
          "შეცდომა",
          response.error?.details || "შეკვეთის შექმნა ვერ მოხერხდა"
        );
      }
    } catch (error: unknown) {
      console.error("❌ Exception in handleConfirmOrder:", error);
      const errorMessage = error instanceof Error ? error.message : "უცნობი შეცდომა";
      console.error("Error message:", errorMessage);
      Alert.alert(
        "შეცდომა",
        errorMessage
      );
    } finally {
      console.log("🏁 handleConfirmOrder finished");
      setIsSubmitting(false);
    }
  };

  const openPaymentPicker = () => {
    Alert.alert("გადახდის მეთოდი", undefined, [
      { text: "ბარათი", onPress: () => setPaymentMethod("card") },
      { text: "ნაღდი ფული", onPress: () => setPaymentMethod("cash") },
      {
        text: "GreenGo ბალანსი",
        onPress: () => setPaymentMethod("greengo_balance"),
      },
      { text: "გაუქმება", style: "cancel" },
    ]);
  };

  const paymentTitle =
    paymentMethod === "card"
      ? "ბარათი"
      : paymentMethod === "cash"
        ? "ნაღდი ფული"
        : "GreenGo ბალანსი";
  const paymentSubtitle =
    paymentMethod === "card"
      ? "**** 7729"
      : paymentMethod === "cash"
        ? "გადახდა მიტანისას"
        : "ბალანსიდან ჩამოჭრა";

  const goAddMore = () => {
    router.push({
      pathname: "/screens/restaurant",
      params: { restaurantId: restaurantId || "" },
    });
  };

  if (restaurantLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={LIST_ACCENT_GREEN} />
          <Text style={styles.loadingText}>იტვირთება...</Text>
        </View>
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>რესტორნი ვერ მოიძებნა</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>უკან დაბრუნება</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.headerBack}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={24} color={LIST_ACCENT_GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {restaurant?.name || "შეკვეთა"}
        </Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollInner,
          { paddingBottom: 24 + insets.bottom + 88 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={() =>
            router.push({ pathname: "/screens/selectAddress", params: {} })
          }
        >
          <View style={styles.cardRow}>
            <Ionicons name="location" size={22} color={LIST_ACCENT_GREEN} />
            <View style={styles.cardTextCol}>
              <Text style={styles.addressMain}>
                {deliveryAddress?.street || "აირჩიეთ მისამართი"}
              </Text>
              <Text style={styles.addressSub}>
                {deliveryAddress
                  ? deliveryAddress.instructions ||
                    deliveryAddress.city ||
                    "დამატებითი დეტალები"
                  : "დააჭირეთ მისამართის ასარჩევად"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        <View style={styles.deliveryRow}>
          <TouchableOpacity
            style={[
              styles.deliveryCard,
              deliveryType === "delivery" && styles.deliveryCardOn,
            ]}
            onPress={() => setDeliveryType("delivery")}
            activeOpacity={0.88}
          >
            <Ionicons
              name="bicycle-outline"
              size={26}
              color={deliveryType === "delivery" ? "#FFFFFF" : "#4B5563"}
            />
            <Text
              style={[
                styles.deliveryTitle,
                deliveryType === "delivery" && styles.deliveryTitleOn,
              ]}
            >
              მიტანა
            </Text>
            <Text
              style={[
                styles.deliverySub,
                deliveryType === "delivery" && styles.deliverySubOn,
              ]}
              numberOfLines={2}
            >
              კურიერი მოიტანს თქვენს მისამართზე
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.deliveryCard,
              deliveryType === "pickup" && styles.deliveryCardOn,
            ]}
            onPress={() => setDeliveryType("pickup")}
            activeOpacity={0.88}
          >
            <Ionicons
              name="walk-outline"
              size={26}
              color={deliveryType === "pickup" ? "#FFFFFF" : "#4B5563"}
            />
            <Text
              style={[
                styles.deliveryTitle,
                deliveryType === "pickup" && styles.deliveryTitleOn,
              ]}
            >
              თვითაღება
            </Text>
            <Text
              style={[
                styles.deliverySub,
                deliveryType === "pickup" && styles.deliverySubOn,
              ]}
              numberOfLines={2}
            >
              თვით აკრიფეთ რესტორნიდან
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionGap}>
          <View style={styles.sectionHead}>
            <Text style={styles.blockTitle}>პროდუქტები</Text>
            <TouchableOpacity onPress={goAddMore} hitSlop={8}>
              <Text style={styles.addMoreLink}>დაამატე მეტი</Text>
            </TouchableOpacity>
          </View>

          {restaurantCartItems.map((item) => (
            <View key={item.id} style={styles.productCard}>
              <Image
                source={cartImageSource(item.image)}
                style={styles.productThumb}
              />
              <View style={styles.productMid}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.productLinePrice}>
                  {formatGel(item.price * item.quantity)}
                </Text>
              </View>
              <View style={styles.qtyPill}>
                <TouchableOpacity
                  style={styles.qtyHit}
                  onPress={() =>
                    handleQuantityChange(item.id, item.quantity - 1)
                  }
                  hitSlop={6}
                >
                  <Ionicons name="remove" size={20} color={PRIMARY_GREEN} />
                </TouchableOpacity>
                <Text style={styles.qtyNum}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyHit}
                  onPress={() =>
                    handleQuantityChange(item.id, item.quantity + 1)
                  }
                  hitSlop={6}
                >
                  <Ionicons name="add" size={20} color={PRIMARY_GREEN} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <TextInput
          style={styles.commentBox}
          placeholder="დატოვეთ კომენტარი.."
          placeholderTextColor="#9CA3AF"
          value={comment}
          onChangeText={setComment}
          multiline
        />

        <TouchableOpacity style={styles.card} activeOpacity={0.85}>
          <View style={styles.cardRow}>
            <View style={styles.voucherBadge}>
              <Text style={styles.voucherPct}>%</Text>
            </View>
            <Text style={styles.voucherLabel}>დაამატეთ ვაუჩერი</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        <View style={[styles.card, styles.tipCard]}>
          <View style={styles.tipHeadRow}>
            <View style={styles.tipIconBg}>
              <Ionicons name="wallet-outline" size={20} color={PRIMARY_GREEN} />
            </View>
            <View style={styles.tipHeadText}>
              <Text style={styles.tipHeadTitle}>
                დატოვებთ კურიერს დამატებით თიფს?
              </Text>
              <Text style={styles.tipHeadSub}>
                კურიერი იღებს თიფის 100%-ს.
              </Text>
            </View>
          </View>
          <View style={styles.tipChips}>
            {tipOptions.map((tip) => (
              <TouchableOpacity
                key={tip}
                style={[
                  styles.tipChip,
                  selectedTip === tip && styles.tipChipOn,
                ]}
                onPress={() => setSelectedTip(tip)}
              >
                <Text
                  style={[
                    styles.tipChipText,
                    selectedTip === tip && styles.tipChipTextOn,
                  ]}
                >
                  {tip === 0 ? "0" : `${tip} ₾`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={openPaymentPicker}
        >
          <View style={styles.cardRow}>
            <View style={styles.payBrand}>
              <Ionicons
                name={
                  paymentMethod === "card"
                    ? "card-outline"
                    : paymentMethod === "cash"
                      ? "cash-outline"
                      : "wallet-outline"
                }
                size={22}
                color={PRIMARY_GREEN}
              />
            </View>
            <View style={styles.cardTextCol}>
              <Text style={styles.payTitle}>{paymentTitle}</Text>
              <Text style={styles.paySub}>{paymentSubtitle}</Text>
            </View>
            <Text style={styles.payTotal}>{formatGel(total)}</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        <View style={[styles.card, styles.summaryCard]}>
          <Text style={styles.summaryHeading}>შეკვეთის დეტალები</Text>
          <View style={styles.summaryLine}>
            <Text style={styles.summaryMuted}>პროდუქტების ჯამი</Text>
            <Text style={styles.summaryVal}>{formatGel(subtotal)}</Text>
          </View>
          {deliveryType === "delivery" ? (
            <View style={styles.summaryLine}>
              <Text style={styles.summaryMuted}>მიტანის საფასური</Text>
              <Text style={styles.summaryVal}>{formatGel(deliveryFee)}</Text>
            </View>
          ) : null}
          {selectedTip > 0 ? (
            <View style={styles.summaryLine}>
              <Text style={styles.summaryMuted}>თიფი</Text>
              <Text style={styles.summaryVal}>{formatGel(selectedTip)}</Text>
            </View>
          ) : null}
          <View style={[styles.summaryLine, styles.summaryLineTotal]}>
            <Text style={styles.summaryTotalLab}>სულ</Text>
            <Text style={styles.summaryTotalNum}>{formatGel(total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(insets.bottom, 14),
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.confirmBtn,
            isSubmitting && styles.confirmBtnDisabled,
          ]}
          onPress={() => {
            console.log("🔘 Confirm button pressed");
            handleConfirmOrder();
          }}
          disabled={isSubmitting}
          activeOpacity={0.88}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmBtnText}>დაადასტურე შეკვეთა</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  headerBack: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontFamily: fontFamily.bold,
    color: "#111827",
    textAlign: "center",
    marginHorizontal: 8,
  },
  headerRightSpacer: {
    width: 44,
  },
  scroll: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardTextCol: {
    flex: 1,
    minWidth: 0,
  },
  addressMain: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: "#111827",
  },
  addressSub: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: "#6B7280",
    marginTop: 2,
  },
  deliveryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  deliveryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  deliveryCardOn: {
    backgroundColor: PRIMARY_GREEN,
    borderColor: PRIMARY_GREEN,
  },
  deliveryTitle: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: "#111827",
    marginTop: 8,
  },
  deliveryTitleOn: {
    color: "#FFFFFF",
  },
  deliverySub: {
    fontSize: 11,
    fontFamily: fontFamily.regular,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 15,
  },
  deliverySubOn: {
    color: "rgba(255,255,255,0.9)",
  },
  sectionGap: {
    marginTop: 8,
    marginBottom: 4,
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  blockTitle: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    color: "#111827",
  },
  addMoreLink: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: LIST_ACCENT_GREEN,
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  productThumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  productMid: {
    flex: 1,
    minWidth: 0,
  },
  productName: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: "#111827",
    marginBottom: 4,
  },
  productLinePrice: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: LIST_ACCENT_GREEN,
  },
  qtyPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: QTY_BG,
    borderRadius: 999,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  qtyHit: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyNum: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: "#111827",
    minWidth: 22,
    textAlign: "center",
  },
  commentBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: fontFamily.regular,
    color: "#111827",
    minHeight: 88,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  voucherBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  voucherPct: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    color: "#FFFFFF",
  },
  voucherLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: "#111827",
  },
  tipCard: {
    paddingVertical: 16,
  },
  tipHeadRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
  },
  tipIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: QTY_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  tipHeadText: {
    flex: 1,
  },
  tipHeadTitle: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: "#111827",
  },
  tipHeadSub: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 18,
  },
  tipChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tipChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  tipChipOn: {
    backgroundColor: PRIMARY_GREEN,
  },
  tipChipText: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: "#374151",
  },
  tipChipTextOn: {
    color: "#FFFFFF",
  },
  payBrand: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: QTY_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  payTitle: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: "#111827",
  },
  paySub: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: "#6B7280",
    marginTop: 2,
  },
  payTotal: {
    fontSize: 15,
    fontFamily: fontFamily.bold,
    color: LIST_ACCENT_GREEN,
    marginRight: 4,
  },
  summaryCard: {
    marginBottom: 8,
  },
  summaryHeading: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: "#111827",
    marginBottom: 10,
  },
  summaryLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  summaryMuted: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: "#6B7280",
  },
  summaryVal: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    color: "#111827",
  },
  summaryLineTotal: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
  },
  summaryTotalLab: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: "#111827",
  },
  summaryTotalNum: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: LIST_ACCENT_GREEN,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
  },
  confirmBtn: {
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnDisabled: {
    opacity: 0.55,
  },
  confirmBtnText: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    fontFamily: fontFamily.regular,
    color: "#EF4444",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: LIST_ACCENT_GREEN,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
  },
});
