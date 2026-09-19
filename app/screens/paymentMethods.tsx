import CardBrandIcon from "@/components/icons/CardBrandIcon";
import ListScreenLayout from "@/components/layout/ListScreenLayout";
import { BRAND_GREEN, LIST_ACCENT_GREEN } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
import apiService from "@/utils/api";
import {
  CheckoutPaymentSelection,
  loadCheckoutPayment,
  saveCheckoutPayment,
  SavedPaymentCard,
} from "@/utils/payment";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PaymentMethodsScreen() {
  const { select } = useLocalSearchParams<{ select?: string }>();
  const isSelectMode = select === "1";

  const [cards, setCards] = useState<SavedPaymentCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [checkoutSelection, setCheckoutSelection] =
    useState<CheckoutPaymentSelection | null>(null);
  const [showCardModal, setShowCardModal] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<SavedPaymentCard | null>(
    null,
  );

  const primaryCardId =
    cards.find((card) => card.isPrimary)?.id ?? cards[0]?.id ?? null;

  const fetchCards = useCallback(async () => {
    try {
      setLoadingCards(true);
      const response = await apiService.getPaymentCards();
      if (response.success && Array.isArray(response.data)) {
        setCards(response.data as SavedPaymentCard[]);
      } else {
        setCards([]);
      }
    } catch {
      setCards([]);
    } finally {
      setLoadingCards(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const load = async () => {
        await fetchCards();
        if (isSelectMode && !cancelled) {
          const saved = await loadCheckoutPayment();
          if (!cancelled) setCheckoutSelection(saved);
        }
      };
      void load();
      return () => {
        cancelled = true;
      };
    }, [fetchCards, isSelectMode]),
  );

  const selectCardForCheckout = async (card: SavedPaymentCard) => {
    await saveCheckoutPayment({
      method: "card",
      cardId: card.id,
      cardType: card.type,
      lastFour: card.lastFour,
    });
    router.back();
  };

  const selectMethodForCheckout = async (
    method: CheckoutPaymentSelection["method"],
  ) => {
    await saveCheckoutPayment({ method });
    router.back();
  };

  const handleCardPress = (card: SavedPaymentCard) => {
    if (isSelectMode) {
      void selectCardForCheckout(card);
      return;
    }
    setSelectedCard(card);
    setShowCardModal(true);
  };

  const handleFlittPaymentPress = () => {
    if (isSelectMode) {
      void selectMethodForCheckout("card");
    }
  };

  const handleCardOptionsPress = (card: SavedPaymentCard) => {
    if (isSelectMode) {
      void selectCardForCheckout(card);
      return;
    }
    setSelectedCard(card);
    setShowCardModal(true);
  };

  const handleMakePrimary = async () => {
    if (!selectedCard) return;
    try {
      const response = await apiService.setPrimaryPaymentCard(selectedCard.id);
      if (response.success && Array.isArray(response.data)) {
        setCards(response.data as SavedPaymentCard[]);
      } else {
        await fetchCards();
      }
      setShowCardModal(false);
    } catch {
      Alert.alert("შეცდომა", "ძირითადი ბარათის დაყენება ვერ მოხერხდა");
    }
  };

  const handleDeleteCard = async () => {
    if (!selectedCard) return;
    try {
      const response = await apiService.deletePaymentCard(selectedCard.id);
      if (response.success) {
        setCards((prev) => prev.filter((c) => c.id !== selectedCard.id));
      } else {
        await fetchCards();
      }
      setShowCardModal(false);
      setSelectedCard(null);
    } catch {
      Alert.alert("შეცდომა", "ბარათის წაშლა ვერ მოხერხდა");
    }
  };

  const handleAddCardPress = () => {
    router.push("/screens/addCard");
  };

  const handleCashPaymentPress = () => {
    if (isSelectMode) {
      void selectMethodForCheckout("cash");
      return;
    }
    console.log("Cash payment pressed");
  };

  const isCardSelected = (card: SavedPaymentCard) => {
    if (isSelectMode) {
      return (
        checkoutSelection?.method === "card" &&
        checkoutSelection.cardId === card.id
      );
    }
    return primaryCardId === card.id;
  };

  const isCashSelected = isSelectMode && checkoutSelection?.method === "cash";
  const isFlittSelected = isSelectMode && checkoutSelection?.method === "card";

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <ListScreenLayout
        title={isSelectMode ? "აირჩიეთ გადახდა" : "გადახდის მეთოდები"}
        titleStyle={styles.screenTitle}
        scrollable
      >
        <View style={styles.content}>
          <View style={styles.introBlock}>
            <View style={styles.introIcon}>
              <Ionicons name="wallet-outline" size={24} color={BRAND_GREEN} />
            </View>
            <View style={styles.introTextBlock}>
              <Text style={styles.introTitle}>აირჩიეთ სასურველი მეთოდი</Text>
              <Text style={styles.introText}>
                გადახდის მეთოდი ნებისმიერ დროს შეგიძლიათ შეცვალოთ
              </Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>გადახდის მეთოდები</Text>
          <View style={styles.methodsList}>
            {isSelectMode ? (
              <TouchableOpacity
                style={[styles.methodCard, isFlittSelected && styles.methodCardActive]}
                onPress={handleFlittPaymentPress}
                activeOpacity={0.82}
              >
                <View style={styles.methodIconCard}>
                  <Ionicons name="card-outline" size={28} color={BRAND_GREEN} />
                </View>
                <View style={styles.methodCopy}>
              <Text style={[styles.methodTitle, isFlittSelected && styles.methodTitleActive]}>
                ბარათით გადახდა
              </Text>
              <Text style={[styles.methodSubtitle, isFlittSelected && styles.methodSubtitleActive]}>
                უსაფრთხო გადახდა Flitt-ით
              </Text>
                </View>
                <Ionicons
                  name={isFlittSelected ? "checkmark-circle" : "ellipse-outline"}
                  size={25}
                  color={isFlittSelected ? LIST_ACCENT_GREEN : "#C8D2D0"}
                />
              </TouchableOpacity>
            ) : loadingCards ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="small" color={BRAND_GREEN} />
              </View>
            ) : (
              cards.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  style={[styles.methodCard, isCardSelected(card) && styles.methodCardActive]}
                  onPress={() => handleCardPress(card)}
                  activeOpacity={0.82}
                >
                  <View style={styles.methodIconCard}>
                    <CardBrandIcon type={card.type} width={32} height={21} />
                  </View>
                  <View style={styles.methodCopy}>
                    <Text style={styles.methodTitle}>
                      Card{card.isPrimary ? " · ძირითადი" : ""}
                    </Text>
                    <Text style={styles.methodSubtitle}>{card.maskedNumber}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleCardOptionsPress(card)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityLabel="ბარათის პარამეტრები"
                  >
                    <Ionicons name="ellipsis-horizontal" size={20} color="#71817E" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}

            <TouchableOpacity
              style={[styles.methodCard, isCashSelected && styles.methodCardActive]}
              onPress={handleCashPaymentPress}
              activeOpacity={0.82}
            >
              <View style={styles.methodIconCard}>
                <Ionicons name="cash-outline" size={28} color={BRAND_GREEN} />
              </View>
              <View style={styles.methodCopy}>
                <Text style={[styles.methodTitle, isCashSelected && styles.methodTitleActive]}>
                  ნაღდი ანგარიშსწორება
                </Text>
                <Text style={[styles.methodSubtitle, isCashSelected && styles.methodSubtitleActive]}>
                  გადახდა კურიერთან მიღებისას
                </Text>
              </View>
              <Ionicons
                name={isCashSelected ? "checkmark-circle" : "ellipse-outline"}
                size={25}
                color={isCashSelected ? LIST_ACCENT_GREEN : "#C8D2D0"}
              />
            </TouchableOpacity>
          </View>

          {!isSelectMode && !loadingCards ? (
            <TouchableOpacity
              style={styles.addCardButton}
              onPress={handleAddCardPress}
              activeOpacity={0.88}
            >
              <Ionicons name="add-circle-outline" size={20} color={BRAND_GREEN} />
              <Text style={styles.addCardText}>ახალი ბარათის დამატება</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ListScreenLayout>

      <Modal
        visible={showCardModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Card</Text>

            {selectedCard && !selectedCard.isPrimary ? (
              <>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => void handleMakePrimary()}
                >
                  <Text style={styles.makePrimaryText}>გახადე ძირითადი</Text>
                </TouchableOpacity>
                <View style={styles.modalSeparator} />
              </>
            ) : null}

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => void handleDeleteCard()}
            >
              <Text style={styles.deleteText}>წაშლა</Text>
            </TouchableOpacity>

            <View style={styles.modalSeparatorThick} />

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => setShowCardModal(false)}
            >
              <Text style={styles.cancelText}>გაუქმება</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: "#181B1A",
    textTransform: "uppercase",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  introBlock: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F7F6",
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#DCE6E3",
  },
  introIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginRight: 12,
  },
  introTextBlock: {
    flex: 1,
  },
  introTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: BRAND_GREEN,
    marginBottom: 3,
  },
  introText: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: fontFamily.regular,
    color: "#67807A",
  },
  sectionLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.semiBold,
    color: "#78908B",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  methodsList: {
    gap: 10,
    marginBottom: 18,
  },
  loadingWrap: {
    paddingVertical: 40,
    alignItems: "center",
  },
  methodCard: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5ECEA",
    shadowColor: "#123C35",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  methodCardActive: {
    borderColor: BRAND_GREEN,
    backgroundColor: BRAND_GREEN,
  },
  methodIconCard: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF8F5",
    marginRight: 14,
  },
  methodCopy: {
    flex: 1,
    marginRight: 10,
  },
  methodTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: "#181B1A",
    marginBottom: 3,
  },
  methodSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: fontFamily.regular,
    color: "#80908D",
  },
  methodTitleActive: {
    color: "#FFFFFF",
  },
  methodSubtitleActive: {
    color: "#D8E7E2",
  },
  cardsEmptyContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  emptyIcon: {
    marginBottom: 12,
  },
  emptyCardText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: "#181B1A",
    textAlign: "center",
    marginBottom: 4,
  },
  emptyCardHint: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.regular,
    color: "#666666",
    textAlign: "center",
    marginBottom: 16,
  },
  methodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    marginBottom: 9,
  },
  methodRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  methodRowLast: {
    marginBottom: 0,
    paddingBottom: 12,
  },
  methodRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  rowCheck: {
    marginRight: 8,
  },
  cardIconWrap: {
    width: 32,
    height: 21,
    marginRight: 12,
    justifyContent: "center",
  },
  cardTextBlock: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.regular,
    color: "#181B1A",
    marginBottom: 2,
  },
  cardNumber: {
    fontSize: 8,
    lineHeight: 12,
    fontFamily: fontFamily.regular,
    color: "#666666",
  },
  cashIcon: {
    width: 32,
    height: 16,
    marginRight: 12,
  },
  cashLabelWrap: {
    flex: 1,
    justifyContent: "center",
  },
  cashLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.regular,
    color: "#181B1A",
  },
  addCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D6E4E0",
    paddingVertical: 13,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  addCardButtonInEmpty: {
    alignSelf: "stretch",
    backgroundColor: "#F1F8F9",
    borderRadius: 8,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  addCardButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addCardTextInEmpty: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.semiBold,
    color: "#1D4045",
    textTransform: "uppercase",
  },
  addCardText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.semiBold,
    color: "#1D4045",
    textTransform: "uppercase",
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    color: "#333333",
    textAlign: "center",
    marginBottom: 20,
  },
  modalOption: {
    paddingVertical: 16,
    alignItems: "center",
  },
  makePrimaryText: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
    color: BRAND_GREEN,
  },
  deleteText: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
    color: "#FF4444",
  },
  cancelText: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
    color: "#007AFF",
  },
  modalSeparator: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  modalSeparatorThick: {
    height: 8,
    backgroundColor: "#E0E0E0",
    marginVertical: 8,
  },
});
