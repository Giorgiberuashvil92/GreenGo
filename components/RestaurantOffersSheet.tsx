import { fontFamily } from "@/constants/fonts";
import type {
  RestaurantOffer,
  RestaurantOfferMenuItem,
} from "@/utils/restaurantOffers";
import {
  getItemOfferPricing,
  getOfferMenuItems,
  offerSubtitle,
} from "@/utils/restaurantOffers";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DiscountPercentBadge from "./icons/DiscountPercentBadge";

function formatPriceGel(n: number): string {
  return `${n.toFixed(2).replace(".", ",")} ₾`;
}

type ViewMode = "list" | "detail";

export default function RestaurantOffersSheet({
  visible,
  offers,
  menuCatalog = [],
  initialOfferId,
  onClose,
  onSelectProduct,
}: {
  visible: boolean;
  offers: RestaurantOffer[];
  /** რესტორნის მენიუ — თუ API არ არის populate-ებული */
  menuCatalog?: Array<{
    _id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    heroImage?: string;
    category?: string;
  }>;
  initialOfferId?: string | null;
  onClose: () => void;
  onSelectProduct: (menuItemId: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<ViewMode>("list");
  const [selectedOffer, setSelectedOffer] = useState<RestaurantOffer | null>(
    null,
  );

  useEffect(() => {
    if (!visible) {
      setMode("list");
      setSelectedOffer(null);
      return;
    }

    if (initialOfferId) {
      const offer = offers.find((o) => o._id === initialOfferId) ?? null;
      if (offer) {
        setSelectedOffer(offer);
        setMode("detail");
        return;
      }
    }

    setMode("list");
    setSelectedOffer(null);
  }, [visible, initialOfferId, offers]);

  const openDetail = (offer: RestaurantOffer) => {
    setSelectedOffer(offer);
    setMode("detail");
  };

  const backToList = () => {
    setMode("list");
    setSelectedOffer(null);
  };

  const products: RestaurantOfferMenuItem[] = selectedOffer
    ? getOfferMenuItems(selectedOffer, menuCatalog)
    : [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            {mode === "detail" ? (
              <TouchableOpacity
                onPress={backToList}
                hitSlop={12}
                accessibilityLabel="უკან"
              >
                <Ionicons name="chevron-back" size={24} color="#181B1A" />
              </TouchableOpacity>
            ) : (
              <View style={styles.headerSpacer} />
            )}
            <Text style={styles.headerTitle}>თქვენი შეთავაზებები</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={12}
              accessibilityLabel="დახურვა"
            >
              <Ionicons name="close" size={24} color="#181B1A" />
            </TouchableOpacity>
          </View>

          {mode === "list" ? (
            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sectionLabel}>ხელმისაწვდომი</Text>
              {offers.length === 0 ? (
                <Text style={styles.empty}>შეთავაზებები არ არის</Text>
              ) : (
                offers.map((offer) => (
                  <TouchableOpacity
                    key={offer._id}
                    style={styles.offerRow}
                    activeOpacity={0.75}
                    onPress={() => openDetail(offer)}
                  >
                    <DiscountPercentBadge size={40} tone="pink" />
                    <View style={styles.offerText}>
                      <Text style={styles.offerTitle} numberOfLines={2}>
                        {offer.title}
                      </Text>
                      <Text style={styles.offerSub} numberOfLines={2}>
                        {offerSubtitle(offer)}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          ) : selectedOffer ? (
            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.detailHeadline}>{selectedOffer.title}</Text>
              {selectedOffer.description ? (
                <Text style={styles.detailDesc}>
                  {selectedOffer.description}
                </Text>
              ) : null}

              {selectedOffer.discountType === "delivery_fixed" ? (
                <Text style={styles.deliveryNote}>
                  {offerSubtitle(selectedOffer)}
                </Text>
              ) : products.length === 0 ? (
                <Text style={styles.empty}>პროდუქტები ვერ მოიძებნა</Text>
              ) : (
                products.map((item, index) => {
                  const pricing = getItemOfferPricing(
                    offers,
                    item._id,
                    item.price,
                  );
                  return (
                  <TouchableOpacity
                    key={item._id}
                    style={[
                      styles.productRow,
                      index < products.length - 1 && styles.productRowBorder,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => {
                      onClose();
                      onSelectProduct(item._id);
                    }}
                  >
                    <View style={styles.productText}>
                      <Text style={styles.productName}>{item.name}</Text>
                      {item.description ? (
                        <Text style={styles.productDesc} numberOfLines={3}>
                          {item.description}
                        </Text>
                      ) : null}
                      <View style={styles.priceRow}>
                        <Text style={styles.productPrice}>
                          {formatPriceGel(pricing.final)}
                        </Text>
                        {pricing.percent != null ? (
                          <Text style={styles.productOriginal}>
                            {formatPriceGel(pricing.original)}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    {item.image || item.heroImage ? (
                      <Image
                        source={{ uri: item.image || item.heroImage }}
                        style={styles.productThumb}
                      />
                    ) : (
                      <View style={styles.productThumb} />
                    )}
                  </TouchableOpacity>
                );
                })
              )}
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "88%",
    minHeight: 320,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
  },
  headerSpacer: {
    width: 24,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    lineHeight: 22,
    color: "#181B1A",
  },
  body: {
    flexGrow: 0,
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: "#181B1A",
    marginBottom: 12,
  },
  empty: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: "#666666",
    paddingVertical: 12,
  },
  offerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F0F0F0",
  },
  offerText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  offerTitle: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: "#181B1A",
  },
  offerSub: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: "#666666",
  },
  detailHeadline: {
    fontFamily: fontFamily.semiBold,
    fontSize: 18,
    lineHeight: 24,
    color: "#181B1A",
    marginTop: 8,
    marginBottom: 16,
  },
  detailDesc: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: "#666666",
    marginBottom: 16,
  },
  deliveryNote: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: "#1D4045",
    marginTop: 8,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  productRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F5F5F5",
  },
  productText: {
    flex: 1,
    minWidth: 0,
    marginRight: 12,
    gap: 4,
  },
  productName: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: "#181B1A",
  },
  productDesc: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    lineHeight: 14,
    color: "#666666",
  },
  productPrice: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    lineHeight: 20,
    color: "#1D4045",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  productOriginal: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: "#C41018",
    textDecorationLine: "line-through",
  },
  productThumb: {
    width: 90,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
});
