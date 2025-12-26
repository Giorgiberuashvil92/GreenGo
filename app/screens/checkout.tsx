import { getDistance } from "@/utils/restaurantUtils";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import MapView, { Marker } from "react-native-maps";
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
  const [tip, setTip] = useState<number>(3);
  const [mapRegion, setMapRegion] = useState({
    latitude: 41.7151,
    longitude: 44.8271,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Reset tip when switching to pickup
  const handleDeliveryTypeChange = (type: "delivery" | "pickup") => {
    setDeliveryType(type);
    if (type === "pickup") {
      setTip(0);
    }
  };

  // Update map region when restaurant location is available
  useEffect(() => {
    if (restaurant?.location) {
      setMapRegion({
        latitude: restaurant.location.latitude || 41.7151,
        longitude: restaurant.location.longitude || 44.8271,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [restaurant?.location]);

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
    return subtotal + serviceFee + deliveryFee + tip;
  }, [subtotal, serviceFee, deliveryFee, tip]);

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
        paymentMethod: "card" as const,
        deliveryAddress: finalDeliveryAddress,
        estimatedDelivery: estimatedDelivery.toISOString(),
        notes: comment || undefined,
        tip: tip,
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
        const errorMessage =
          (response as { error?: { details?: string } }).error?.details ||
          "შეკვეთის შექმნა ვერ მოხერხდა";
        Alert.alert("შეცდომა", errorMessage);
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
        {/* Delivery/Pickup Options */}
          <View style={styles.deliveryOptions}>
            <TouchableOpacity
              style={[
                styles.deliveryOption,
                deliveryType === "delivery" && styles.deliveryOptionSelected,
              ]}
            onPress={() => handleDeliveryTypeChange("delivery")}
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
            onPress={() => handleDeliveryTypeChange("pickup")}
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

        {/* Delivery-specific: Address Section */}
        {deliveryType === "delivery" && (
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
        )}

        {/* Pickup-specific: Preparation Time & Restaurant Info */}
        {deliveryType === "pickup" && (
          <>
            {/* Preparation Time */}
            <View style={styles.preparationTimeCard}>
              <Ionicons name="time-outline" size={20} color="#666666" />
              <Text style={styles.preparationTimeText}>
                დამზადდება 20-30 წუთი
              </Text>
            </View>

            {/* Restaurant Map */}
            <View style={styles.mapContainer}>
              <MapView
                style={styles.mapImage}
                region={mapRegion}
                onRegionChangeComplete={setMapRegion}
                showsUserLocation={false}
                showsMyLocationButton={true}
                showsCompass={true}
                showsScale={true}
                mapType="standard"
                scrollEnabled={true}
                zoomEnabled={true}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                {restaurant?.location && (
                  <Marker
                    coordinate={{
                      latitude: restaurant.location.latitude || 41.7151,
                      longitude: restaurant.location.longitude || 44.8271,
                    }}
                    title={restaurant.name || "რესტორანი"}
                    description={restaurant.location.address || ""}
                  >
                    <View style={styles.markerContainer}>
                      <View style={styles.marker}>
                        <Ionicons name="location" size={20} color="#FFFFFF" />
                      </View>
                    </View>
                  </Marker>
                )}
              </MapView>
            </View>

            {/* Restaurant Info */}
            <View style={styles.restaurantInfoCard}>
              <Text style={styles.restaurantInfoName}>
                {restaurant?.name || "რესტორანი"}
              </Text>
              <Text style={styles.restaurantInfoAddress}>
                {restaurant?.location?.address || "შანიძის 4ა"}
              </Text>
            </View>
          </>
        )}

        {/* Products Section - Only for delivery */}
        {deliveryType === "delivery" && (
          <>
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
                    <Text style={styles.productModification}>
                      ხახვის გარეშე 🌶️
                    </Text>
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
          </>
        )}

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

        {/* Tip Section - Only for delivery */}
        {deliveryType === "delivery" && (
          <View style={styles.tipCard}>
            {/* Left: Image */}
            <View style={styles.tipImageContainer}>
              <Image
                source={require("../../assets/images/tip.png")}
                style={styles.tipImage}
                resizeMode="contain"
              />
              </View>

            {/* Right: Text + Buttons */}
            <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>
                დატოვებთ კურიერს{"\n"}დამატებით თიფს?
                </Text>
              <Text style={styles.tipDescription}>
                კურიერი იღებს თიფის 100% - ს.
                </Text>
            <View style={styles.tipOptions}>
                {[0, 1, 3, 5].map((tipAmount) => (
                <TouchableOpacity
                    key={tipAmount}
                  style={[
                    styles.tipButton,
                      tip === tipAmount && styles.tipButtonSelected,
                  ]}
                    onPress={() => setTip(tipAmount)}
                >
                  <Text
                    style={[
                      styles.tipButtonText,
                        tip === tipAmount && styles.tipButtonTextSelected,
                    ]}
                  >
                      {tipAmount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        )}

        {/* Payment Card Section */}
        <TouchableOpacity style={styles.paymentCard}>
          <View style={styles.paymentLeft}>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>{savedCard.type}</Text>
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.cardNumber}>**** {savedCard.lastFour}</Text>
              <Text style={styles.cardAmount}>
                {subtotal.toFixed(2).replace(".", ",")} ₾
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
          {deliveryType === "pickup" && (
            <Text style={styles.summarySectionTitle}>შეჯამება</Text>
          )}
            <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>ჯამი</Text>
            <Text style={styles.summaryValue}>
              {subtotal.toFixed(2).replace(".", ",")}
            </Text>
            </View>
            {deliveryType === "delivery" && (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>მომსახურების საფასური</Text>
                <Text style={styles.summaryValue}>
                  {serviceFee.toFixed(2).replace(".", ",")}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>მიტანის საფასური (500მ)</Text>
                <Text style={styles.summaryValue}>
                  {deliveryFee.toFixed(2).replace(".", ",")}
                </Text>
              </View>
              {tip > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>თიფი</Text>
                  <Text style={styles.summaryValue}>
                    {tip.toFixed(2).replace(".", ",")}
                  </Text>
              </View>
            )}
            </>
          )}
          <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>სულ</Text>
            <Text style={styles.summaryTotalValue}>
              {deliveryType === "pickup"
                ? subtotal.toFixed(2).replace(".", ",")
                : total.toFixed(2).replace(".", ",")}
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
  // Pickup-specific styles
  preparationTimeCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  preparationTimeText: {
    fontSize: 15,
    color: "#666666",
  },
  mapContainer: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  mapImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E53935",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  restaurantInfoCard: {
    marginBottom: 16,
  },
  restaurantInfoName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  restaurantInfoAddress: {
    fontSize: 14,
    color: "#666666",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  tipImageContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  tipImage: {
    width: 120,
    height: 120,
  },
  tipContent: {
    flex: 1,
    marginLeft: 8,
    justifyContent: "center",
  },
  tipTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
    lineHeight: 28,
  },
  tipDescription: {
    fontSize: 14,
    color: "#999999",
    lineHeight: 20,
    marginBottom: 16,
  },
  tipOptions: {
    flexDirection: "row",
    gap: 5,
  },
  tipButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  tipButtonSelected: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  tipButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  tipButtonTextSelected: {
    color: "#FFFFFF",
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
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
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
  summarySectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 16,
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
