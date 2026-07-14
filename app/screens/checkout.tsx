import BackCircleIcon from "@/components/icons/BackCircleIcon";
import CardBrandIcon from "@/components/icons/CardBrandIcon";
import CourierTipIcon from "@/components/icons/CourierTipIcon";
import PencilIcon from "@/components/icons/PencilIcon";
import VoucherIcon from "@/components/icons/VoucherIcon";
import { LIST_ACCENT_GREEN } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
import { useDeliveryAddress } from "@/hooks/useDeliveryAddress";
import { formatAddressStreetLine, formatAddressSubLine } from "@/utils/address";
import {
  calculateDeliveryPricing,
  DEFAULT_SERVICE_FEE,
  formatDeliveryDistance,
} from "@/utils/deliveryFee";
import {
  calculateCheckoutTotal,
  calculatePromoSavings,
  formatPromoDiscountLabel,
  type ValidatedPromoCode,
} from "@/utils/promoCode";
import {
  CheckoutPaymentSelection,
  getPaymentDisplayLine,
  loadCheckoutPayment,
} from "@/utils/payment";
import { getDistance } from "@/utils/restaurantUtils";
import { getDeliveryFixedDiscount } from "@/utils/restaurantOffers";
import type { RestaurantOffer } from "@/utils/restaurantOffers";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageSourcePropType,
  Modal,
  Pressable,
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

const PRIMARY_GREEN = "#1D4045";
const QTY_BG = "#EFFBF5";
const SCREEN_BG = "#FFFFFF";
const TIP_MIN = 1;
const TIP_MAX = 50;

type TipOptionKey = "none" | "1" | "3" | "5" | "custom";

const TIP_PRESETS: { key: TipOptionKey; amount: number; label: string }[] = [
  { key: "none", amount: 0, label: "თიფსის გარეშე" },
  { key: "1", amount: 1, label: "1₾" },
  { key: "3", amount: 3, label: "3₾" },
  { key: "5", amount: 5, label: "5₾" },
];

function formatGel(n: number): string {
  return `${n.toFixed(2).replace(".", ",")} ₾`;
}

function formatSummaryAmount(n: number): string {
  return n.toFixed(2).replace(".", ",");
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
  const [tipAmount, setTipAmount] = useState<number>(3);
  const [activeTipKey, setActiveTipKey] = useState<TipOptionKey>("3");
  const [showTipModal, setShowTipModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [customTipInput, setCustomTipInput] = useState("");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<ValidatedPromoCode | null>(
    null,
  );
  const [restaurantOffers, setRestaurantOffers] = useState<RestaurantOffer[]>(
    [],
  );
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [comment, setComment] = useState<string>("");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">(
    "delivery",
  );
  const [paymentSelection, setPaymentSelection] =
    useState<CheckoutPaymentSelection>({
      method: "card",
      cardId: "1",
      cardType: "amex",
      lastFour: "7729",
    });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { address: deliveryAddress, loading: addressLoading } =
    useDeliveryAddress();

  const paymentMethod = paymentSelection.method;

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const loadPayment = async () => {
        const saved = await loadCheckoutPayment();
        if (!cancelled) setPaymentSelection(saved);
      };
      void loadPayment();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  useEffect(() => {
    let cancelled = false;
    const loadOffers = async () => {
      if (!restaurantId) {
        setRestaurantOffers([]);
        return;
      }
      try {
        const response = await apiService.getRestaurantOffers(
          restaurantId,
          true,
        );
        if (cancelled) return;
        if (response.success && response.data) {
          setRestaurantOffers(
            Array.isArray(response.data) ? response.data : [],
          );
        } else {
          setRestaurantOffers([]);
        }
      } catch {
        if (!cancelled) setRestaurantOffers([]);
      }
    };
    void loadOffers();
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  const restaurantCartItems = cartItems.filter(
    (item) => item.restaurantId === restaurantId,
  );

  const subtotal = restaurantCartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const deliveryPricing = useMemo(() => {
    const fallbackServiceFee =
      restaurantCartItems.length > 0 ? DEFAULT_SERVICE_FEE : 0;

    if (
      deliveryType !== "delivery" ||
      !deliveryAddress ||
      !restaurant?.location
    ) {
      return {
        distanceKm: 0,
        deliveryFee: 0,
        serviceFee: fallbackServiceFee,
        isShortDistanceBundle: false,
        distanceLabel: "",
      };
    }

    const result = calculateDeliveryPricing({
      baseFee: restaurant.deliveryFee || 4.99,
      restaurantLat: restaurant.location.latitude,
      restaurantLng: restaurant.location.longitude,
      deliveryLat: deliveryAddress.coordinates.lat,
      deliveryLng: deliveryAddress.coordinates.lng,
    });

    return {
      ...result,
      serviceFee: restaurantCartItems.length > 0 ? result.serviceFee : 0,
      distanceLabel: formatDeliveryDistance(result.distanceKm),
    };
  }, [
    deliveryType,
    deliveryAddress,
    restaurant?.location,
    restaurant?.deliveryFee,
    restaurantCartItems.length,
  ]);

  const deliveryFee = deliveryPricing.deliveryFee;
  const serviceFee = deliveryPricing.serviceFee;
  const offerDeliveryDiscount = getDeliveryFixedDiscount(restaurantOffers);
  const activeDeliveryFee =
    deliveryType === "delivery"
      ? Math.max(0, deliveryFee - offerDeliveryDiscount)
      : 0;

  const promoSavings = useMemo(() => {
    if (!appliedPromo) {
      return {
        productDiscount: 0,
        orderDiscount: 0,
        deliveryDiscount: 0,
        totalSavings: 0,
        effectiveDeliveryFee: activeDeliveryFee,
        freeDelivery: false,
      };
    }

    return calculatePromoSavings(appliedPromo, {
      subtotal,
      deliveryFee: activeDeliveryFee,
      serviceFee,
    });
  }, [appliedPromo, subtotal, activeDeliveryFee, serviceFee]);

  useEffect(() => {
    if (!appliedPromo) return;

    const minOrderAmount = appliedPromo.minOrderAmount ?? 0;
    if (subtotal < minOrderAmount) {
      setAppliedPromo(null);
      Alert.alert(
        "პრომო კოდი",
        `ამ კოდისთვის მინიმალური შეკვეთა არის ${minOrderAmount.toFixed(2).replace(".", ",")} ₾`,
      );
      return;
    }

    if (
      appliedPromo.discountType === "free_delivery" &&
      deliveryType === "pickup"
    ) {
      setAppliedPromo(null);
      Alert.alert(
        "პრომო კოდი",
        "უფასო მიტანის კოდი მხოლოდ მიტანის შეკვეთებისთვისაა",
      );
    }
  }, [subtotal, appliedPromo, deliveryType]);

  const total = useMemo(() => {
    return calculateCheckoutTotal(
      {
        subtotal,
        deliveryFee: activeDeliveryFee,
        serviceFee,
      },
      appliedPromo,
      tipAmount,
    );
  }, [
    subtotal,
    activeDeliveryFee,
    serviceFee,
    appliedPromo,
    tipAmount,
  ]);

  const openCustomTipModal = () => {
    setCustomTipInput(
      activeTipKey === "custom" ? tipAmount.toFixed(2).replace(".", ",") : "",
    );
    setShowTipModal(true);
  };

  const closeCustomTipModal = () => {
    setShowTipModal(false);
  };

  const saveCustomTip = () => {
    const normalized = customTipInput.replace(",", ".").trim();
    const value = parseFloat(normalized);

    if (Number.isNaN(value) || value < TIP_MIN || value > TIP_MAX) {
      Alert.alert(
        "არასწორი თანხა",
        `შეგიძლიათ დატოვოთ tip: ${formatGel(TIP_MIN)} - ${formatGel(TIP_MAX)}`,
      );
      return;
    }

    setTipAmount(value);
    setActiveTipKey("custom");
    setShowTipModal(false);
  };

  const openPromoModal = () => {
    setPromoCodeInput(appliedPromo?.code ?? "");
    setShowPromoModal(true);
  };

  const closePromoModal = () => {
    setShowPromoModal(false);
  };

  const applyPromoCode = async () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) {
      Alert.alert("შეცდომა", "გთხოვთ შეიყვანოთ პრომო კოდი");
      return;
    }

    setApplyingPromo(true);
    try {
      const response = await apiService.validatePromoCode(
        code,
        subtotal,
        activeDeliveryFee,
        serviceFee,
      );
      if (!response.success || !response.data) {
        Alert.alert(
          "შეცდომა",
          response.error?.details || "პრომო კოდი არასწორია",
        );
        return;
      }

      setAppliedPromo(response.data);
      setShowPromoModal(false);
    } catch {
      Alert.alert("შეცდომა", "პრომო კოდის შემოწმება ვერ მოხერხდა");
    } finally {
      setApplyingPromo(false);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoCodeInput("");
    setShowPromoModal(false);
  };

  const selectPresetTip = (key: TipOptionKey, amount: number) => {
    setActiveTipKey(key);
    setTipAmount(amount);
  };

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

    if (appliedPromo && promoSavings.totalSavings <= 0) {
      Alert.alert("შეცდომა", "პრომო კოდი ამ შეკვეთაზე ვერ გამოიყენება");
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

      if (
        deliveryType === "delivery" &&
        deliveryAddress &&
        restaurant?.location
      ) {
        // Calculate distance between restaurant and delivery address
        const distanceKm = getDistance(
          restaurant.location.latitude,
          restaurant.location.longitude,
          deliveryAddress.coordinates.lat,
          deliveryAddress.coordinates.lng,
        );

        // Calculate delivery time:
        // - Preparation time: 15-20 minutes
        // - Travel time: distance / average speed (30 km/h in city = 0.5 km/min)
        // - Add buffer: 5-10 minutes
        const travelTimeMinutes = Math.ceil(distanceKm / 0.5); // ~30 km/h average speed
        estimatedMinutes = 20 + travelTimeMinutes + 5; // Base + travel + buffer

        // Minimum 25 minutes, maximum 60 minutes
        estimatedMinutes = Math.max(25, Math.min(60, estimatedMinutes));

        console.log(
          `📍 Distance: ${distanceKm.toFixed(2)} km, Estimated time: ${estimatedMinutes} minutes`,
        );
      } else if (deliveryType === "pickup") {
        // Pickup orders are faster - just preparation time
        estimatedMinutes = 15;
      }

      const estimatedDelivery = new Date();
      estimatedDelivery.setMinutes(
        estimatedDelivery.getMinutes() + estimatedMinutes,
      );

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
          Alert.alert("შეცდომა", "გთხოვთ აირჩიოთ მიტანის მისამართი");
          setIsSubmitting(false);
          return;
        }

        if (
          !deliveryAddress.street ||
          !deliveryAddress.city ||
          !deliveryAddress.coordinates
        ) {
          console.log("❌ Delivery address data is incomplete");
          Alert.alert(
            "შეცდომა",
            "მისამართის მონაცემები არასრულია. გთხოვთ აირჩიოთ მისამართი თავიდან",
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

      // Create order
      const orderData = {
        userId: user.id,
        restaurantId: restaurant._id || restaurant.id || restaurantId,
        items: orderItems,
        totalAmount: Number(total.toFixed(2)),
        deliveryFee: Number(deliveryFee.toFixed(2)),
        paymentMethod: paymentMethod,
        deliveryAddress: finalDeliveryAddress,
        estimatedDelivery: estimatedDelivery.toISOString(),
        notes: comment || undefined,
        promoCode: appliedPromo?.code || undefined,
        tip: tipAmount,
        deliveryType: deliveryType,
      };

      console.log(
        "📦 Creating order with data:",
        JSON.stringify(orderData, null, 2),
      );

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
            orderId:
              (response.data as any)?._id || (response.data as any)?.id || "",
            deliveryFee: String(deliveryFee.toFixed(2)),
          },
        });
      } else {
        console.error("❌ Order creation failed:", response.error);
        Alert.alert(
          "შეცდომა",
          response.error?.details || "შეკვეთის შექმნა ვერ მოხერხდა",
        );
      }
    } catch (error: unknown) {
      console.error("❌ Exception in handleConfirmOrder:", error);
      const errorMessage =
        error instanceof Error ? error.message : "უცნობი შეცდომა";
      console.error("Error message:", errorMessage);
      Alert.alert("შეცდომა", errorMessage);
    } finally {
      console.log("🏁 handleConfirmOrder finished");
      setIsSubmitting(false);
    }
  };

  const openPaymentPicker = () => {
    router.push({
      pathname: "/screens/paymentMethods",
      params: { select: "1" },
    });
  };

  const paymentSubtitle = getPaymentDisplayLine(paymentSelection);
  const selectedCardType =
    paymentSelection.method === "card" ? paymentSelection.cardType : undefined;

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
          <BackCircleIcon size={32} />
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
          { paddingBottom: 24 + insets.bottom + 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={() =>
            router.push({ pathname: "/screens/locations", params: {} })
          }
        >
          <View style={styles.cardRow}>
            <Ionicons name="location" size={22} color={PRIMARY_GREEN} />
            <View style={styles.cardTextCol}>
              <Text style={styles.addressMain} numberOfLines={1}>
                {formatAddressStreetLine(deliveryAddress, addressLoading)}
              </Text>
              <Text style={styles.addressSub} numberOfLines={2}>
                {formatAddressSubLine(deliveryAddress, addressLoading)}
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
            <View style={styles.deliveryCardHead}>
              <Ionicons
                name="bicycle-outline"
                size={22}
                color={deliveryType === "delivery" ? "#FFFFFF" : "#4B5563"}
              />
              <Text
                style={[
                  styles.deliveryTitle,
                  deliveryType === "delivery" && styles.deliveryTitleOn,
                ]}
              >
                მიწოდება
              </Text>
            </View>
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
            <View style={styles.deliveryCardHead}>
              <Ionicons
                name="walk-outline"
                size={22}
                color={deliveryType === "pickup" ? "#FFFFFF" : "#4B5563"}
              />
              <Text
                style={[
                  styles.deliveryTitle,
                  deliveryType === "pickup" && styles.deliveryTitleOn,
                ]}
              >
                გატანა
              </Text>
            </View>
            <Text
              style={[
                styles.deliverySub,
                deliveryType === "pickup" && styles.deliverySubOn,
              ]}
              numberOfLines={2}
            >
              თავად მიაკითხავთ ობიექსს
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionGap}>
          <View style={styles.sectionHead}>
            <Text style={styles.blockTitle}>პროდუქტები</Text>
            <TouchableOpacity onPress={goAddMore} hitSlop={8}>
              <Text style={styles.addMoreLink}>დაამატეთ მეტი</Text>
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
                  {formatGel(item.price)}
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

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={openPromoModal}
        >
          <View style={styles.cardRow}>
            <View style={styles.voucherIconWrap}>
              <VoucherIcon size={20} />
            </View>
            <View style={styles.cardTextCol}>
              <Text style={styles.voucherLabel} numberOfLines={1}>
                {appliedPromo?.code ?? "დაამატეთ ვაუჩერი"}
              </Text>
              {appliedPromo ? (
                <Text style={styles.voucherAppliedSub} numberOfLines={1}>
                  {formatPromoDiscountLabel(appliedPromo)} ფასდაკლება
                </Text>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        <View style={styles.tipSection}>
          <View style={styles.tipMainRow}>
            <View style={styles.tipIconWrap}>
              <CourierTipIcon size={88} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipHeadTitle}>
                დაუტოვებთ კურიერს დამატებით თიფს?
              </Text>
              <Text style={styles.tipHeadSub}>
                კურიერი იღებს თიფის 100% - ს. თიფსის გაუქმებას მოგვიანებით
                შეძლებთ
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.tipChipsScroll}
            contentContainerStyle={styles.tipChips}
          >
            {TIP_PRESETS.map((tip) => {
              const isActive = activeTipKey === tip.key;
              return (
                <TouchableOpacity
                  key={tip.key}
                  style={[styles.tipChip, isActive && styles.tipChipOn]}
                  onPress={() => selectPresetTip(tip.key, tip.amount)}
                >
                  <Text
                    style={[
                      styles.tipChipText,
                      isActive && styles.tipChipTextOn,
                    ]}
                  >
                    {tip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[
                styles.tipChip,
                styles.tipChipIcon,
                activeTipKey === "custom" && styles.tipChipOn,
              ]}
              onPress={openCustomTipModal}
            >
              <PencilIcon
                size={12}
                color={activeTipKey === "custom" ? "#181B1A" : "#8C8C8C"}
              />
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>შეჯამება</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>ჯამი</Text>
            <Text style={styles.summaryValue}>
              {formatSummaryAmount(subtotal)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>მომსახურების საფასური</Text>
            <Text style={styles.summaryValue}>
              {formatSummaryAmount(serviceFee)}
            </Text>
          </View>

          {deliveryType === "delivery" ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                მიტანის საფასური ({deliveryPricing.distanceLabel})
              </Text>
              <Text style={styles.summaryValue}>
                {formatSummaryAmount(promoSavings.effectiveDeliveryFee)}
              </Text>
            </View>
          ) : null}

          {promoSavings.totalSavings > 0 ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryDiscountLabel}>
                {appliedPromo?.discountType === "free_delivery"
                  ? `უფასო მიტანა (${appliedPromo?.code})`
                  : `პრომო კოდი (${appliedPromo?.code})`}
              </Text>
              <Text style={styles.summaryDiscountValue}>
                -{formatSummaryAmount(promoSavings.totalSavings)}
              </Text>
            </View>
          ) : null}

          {tipAmount > 0 ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>თიფი</Text>
              <Text style={styles.summaryValue}>
                {formatSummaryAmount(tipAmount)}
              </Text>
            </View>
          ) : null}

          <View style={[styles.summaryRow, styles.summaryTotalRow]}>
            <Text style={styles.summaryTotalLabel}>სულ</Text>
            <Text style={styles.summaryTotalValue}>
              {formatSummaryAmount(total)}
            </Text>
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
          style={styles.footerPayRow}
          activeOpacity={0.85}
          onPress={openPaymentPicker}
        >
          <View style={styles.payBrand}>
            {selectedCardType ? (
              <CardBrandIcon type={selectedCardType} width={40} height={24} />
            ) : (
              <Ionicons
                name={
                  paymentSelection.method === "cash"
                    ? "cash-outline"
                    : "wallet-outline"
                }
                size={22}
                color={PRIMARY_GREEN}
              />
            )}
          </View>
          <View style={styles.footerPayText}>
            <Text style={styles.paySub}>{paymentSubtitle}</Text>
            <Text style={styles.footerPayAmount}>{formatGel(total)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

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
            <Text style={styles.confirmBtnText}>შეკვეთის დადასტურება</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showTipModal}
        transparent
        animationType="fade"
        onRequestClose={closeCustomTipModal}
      >
        <Pressable style={styles.tipModalOverlay} onPress={closeCustomTipModal}>
          <Pressable style={styles.tipModalCard} onPress={() => {}}>
            <Text style={styles.tipModalTitle}>შეიყვანეთ თიფსის ოდენობა</Text>
            <Text style={styles.tipModalSub}>შეგიძლიათ დატოვოთ tip:</Text>
            <Text style={styles.tipModalSub}>
              {formatGel(TIP_MIN)} - {formatGel(TIP_MAX)}
            </Text>
            <View style={styles.tipModalInputWrap}>
              <Text style={styles.tipModalInputLabel}>Tip-ის თანხა</Text>
              <TextInput
                style={styles.tipModalInput}
                value={customTipInput}
                onChangeText={setCustomTipInput}
                keyboardType="decimal-pad"
                placeholder="0,00"
                placeholderTextColor="#9B9B9B"
              />
            </View>

            <View style={styles.tipModalActions}>
              <TouchableOpacity
                style={styles.tipModalCancelBtn}
                onPress={closeCustomTipModal}
                activeOpacity={0.85}
              >
                <Text style={styles.tipModalCancelText}>გაუქმება</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tipModalSaveBtn}
                onPress={saveCustomTip}
                activeOpacity={0.85}
              >
                <Text style={styles.tipModalSaveText}>შენახვა</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={showPromoModal}
        transparent
        animationType="fade"
        onRequestClose={closePromoModal}
      >
        <Pressable style={styles.tipModalOverlay} onPress={closePromoModal}>
          <Pressable style={styles.tipModalCard} onPress={() => {}}>
            <Text style={styles.tipModalTitle}>პრომო კოდი</Text>
            <Text style={styles.tipModalSub}>შეიყვანეთ ვაუჩერის კოდი</Text>
            <View style={styles.tipModalInputWrap}>
              <Text style={styles.tipModalInputLabel}>პრომო კოდი</Text>
              <TextInput
                style={[styles.tipModalInput, styles.promoModalInput]}
                value={promoCodeInput}
                onChangeText={setPromoCodeInput}
                autoCapitalize="characters"
                autoCorrect={false}
                placeholder="მაგ: SAVE10"
                placeholderTextColor="#9B9B9B"
              />
            </View>

            {appliedPromo ? (
              <TouchableOpacity
                style={styles.promoRemoveBtn}
                onPress={removePromoCode}
                activeOpacity={0.85}
              >
                <Text style={styles.promoRemoveBtnText}>პრომო კოდის წაშლა</Text>
              </TouchableOpacity>
            ) : null}

            <View style={styles.tipModalActions}>
              <TouchableOpacity
                style={styles.tipModalCancelBtn}
                onPress={closePromoModal}
                activeOpacity={0.85}
                disabled={applyingPromo}
              >
                <Text style={styles.tipModalCancelText}>გაუქმება</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tipModalSaveBtn,
                  applyingPromo && styles.confirmBtnDisabled,
                ]}
                onPress={() => void applyPromoCode()}
                activeOpacity={0.85}
                disabled={applyingPromo}
              >
                {applyingPromo ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.tipModalSaveText}>გამოყენება</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: SCREEN_BG,
  },
  headerBack: {
    width: 32,
    height: 32,
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
    fontSize: 20,
    lineHeight: 26,
    fontFamily: fontFamily.extraBold,
    color: "#111827",
    textAlign: "center",
    marginHorizontal: 8,
  },
  headerRightSpacer: {
    width: 32,
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
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: "#111827",
  },
  addressSub: {
    fontSize: 14,
    lineHeight: 20,
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
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 6,
  },
  deliveryCardOn: {
    backgroundColor: PRIMARY_GREEN,
    borderColor: PRIMARY_GREEN,
  },
  deliveryCardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deliveryTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: "#111827",
  },
  deliveryTitleOn: {
    color: "#FFFFFF",
  },
  deliverySub: {
    fontSize: 11,
    fontFamily: fontFamily.regular,
    color: "#6B7280",
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
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fontFamily.extraBold,
    textTransform: "uppercase",
    color: "#111827",
  },
  addMoreLink: {
    fontSize: 12,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    textTransform: "uppercase",
    color: "#003E20",
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
    fontSize: 16,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: "#111827",
    marginBottom: 4,
  },
  productLinePrice: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.medium,
    color: "#111827",
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
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: PRIMARY_GREEN,
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
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.regular,
    color: "#111827",
    minHeight: 52,
    textAlignVertical: "center",
    marginBottom: 12,
  },
  voucherIconWrap: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  voucherLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: "#111827",
  },
  voucherAppliedSub: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.regular,
    color: LIST_ACCENT_GREEN,
  },
  promoModalInput: {
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 1,
  },
  promoRemoveBtn: {
    marginTop: 16,
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  promoRemoveBtnText: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: fontFamily.medium,
    color: "#EF4444",
  },
  tipSection: {
    marginBottom: 16,
    paddingVertical: 4,
  },
  tipMainRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  tipIconWrap: {
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
  },
  tipContent: {
    flex: 1,
    minWidth: 0,
  },
  tipHeadTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.bold,
    textTransform: "uppercase",
    color: "#181B1A",
  },
  tipHeadSub: {
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: "#9B9B9B",
    marginTop: 4,
    lineHeight: 18,
  },
  tipChipsScroll: {
    marginTop: 10,
    marginHorizontal: -16,
  },
  tipChips: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
    paddingHorizontal: 16,
  },
  tipChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  tipChipIcon: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tipChipOn: {
    borderWidth: 1.5,
    borderColor: "#181B1A",
    backgroundColor: "#FFFFFF",
  },
  tipChipText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.semiBold,
    color: "#757575",
  },
  tipChipTextOn: {
    color: "#181B1A",
    fontFamily: fontFamily.bold,
  },
  tipModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  tipModalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  tipModalTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: fontFamily.bold,
    textTransform: "uppercase",
    color: "#181B1A",
  },
  tipModalSub: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: fontFamily.medium,
    textTransform: "uppercase",
    color: "#9B9B9B",
  },
  tipModalInputWrap: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#181B1A",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
  },
  tipModalInputLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.regular,
    color: "#9B9B9B",
    marginBottom: 4,
  },
  tipModalInput: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: fontFamily.bold,
    color: "#181B1A",
    padding: 0,
  },
  tipModalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  tipModalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  tipModalCancelText: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: "#181B1A",
  },
  tipModalSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: PRIMARY_GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  tipModalSaveText: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: "#FFFFFF",
  },
  summarySection: {
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  summaryTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: fontFamily.bold,
    textTransform: "uppercase",
    color: "#181B1A",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.regular,
    textTransform: "uppercase",
    color: "#9B9B9B",
    flex: 1,
    marginRight: 12,
  },
  summaryValue: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.medium,
    color: "#181B1A",
  },
  summaryDiscountLabel: {
    flex: 1,
    marginRight: 12,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.medium,
    color: LIST_ACCENT_GREEN,
  },
  summaryDiscountValue: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: LIST_ACCENT_GREEN,
  },
  summaryTotalRow: {
    marginTop: 4,
    marginBottom: 0,
  },
  summaryTotalLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fontFamily.bold,
    color: "#181B1A",
  },
  summaryTotalValue: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: fontFamily.bold,
    color: "#181B1A",
  },
  payBrand: {
    minWidth: 48,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  paySub: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.medium,
    color: "#111827",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  footerPayRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  footerPayText: {
    flex: 1,
    gap: 2,
  },
  footerPayAmount: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.bold,
    color: "#181B1A",
  },
  confirmBtn: {
    backgroundColor: PRIMARY_GREEN,
    borderRadius: 26,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnDisabled: {
    opacity: 0.55,
  },
  confirmBtnText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
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
