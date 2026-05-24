import CardBrandIcon from "@/components/icons/CardBrandIcon";
import ListScreenLayout from "@/components/layout/ListScreenLayout";
import { BRAND_GREEN, LIST_ACCENT_GREEN } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
import { useGreenGoBalance } from "@/hooks/useGreenGoBalance";
import {
  CheckoutPaymentSelection,
  loadCheckoutPayment,
  PAYMENT_CARDS,
  saveCheckoutPayment,
  SavedPaymentCard,
} from "@/utils/payment";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const bogCashIcon = require("@/assets/images/bog-cash-payment.png");

export default function PaymentMethodsScreen() {
  const { select } = useLocalSearchParams<{ select?: string }>();
  const isSelectMode = select === "1";
  const { formattedBalance } = useGreenGoBalance();

  const [primaryCardId, setPrimaryCardId] = useState<string>("1");
  const [checkoutSelection, setCheckoutSelection] =
    useState<CheckoutPaymentSelection | null>(null);
  const [showCardModal, setShowCardModal] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<SavedPaymentCard | null>(
    null,
  );

  useFocusEffect(
    useCallback(() => {
      if (!isSelectMode) return;
      let cancelled = false;
      const load = async () => {
        const saved = await loadCheckoutPayment();
        if (!cancelled) setCheckoutSelection(saved);
      };
      void load();
      return () => {
        cancelled = true;
      };
    }, [isSelectMode]),
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

  const handleGreenGoBalancePress = () => {
    if (isSelectMode) {
      void selectMethodForCheckout("greengo_balance");
      return;
    }
    console.log("GreenGo balance pressed");
  };

  const handleCardPress = (card: SavedPaymentCard) => {
    if (isSelectMode) {
      void selectCardForCheckout(card);
      return;
    }
    setSelectedCard(card);
    setShowCardModal(true);
  };

  const handleCardOptionsPress = (card: SavedPaymentCard) => {
    if (isSelectMode) {
      void selectCardForCheckout(card);
      return;
    }
    setSelectedCard(card);
    setShowCardModal(true);
  };

  const handleMakePrimary = () => {
    if (selectedCard) {
      setPrimaryCardId(selectedCard.id);
      setShowCardModal(false);
    }
  };

  const handleDeleteCard = () => {
    if (selectedCard) {
      setShowCardModal(false);
    }
  };

  const handleAddCardPress = () => {
    console.log("ბარათის დამატება შესაძლებელი იქნება ფლიტის მიერ");
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
  const isBalanceSelected =
    isSelectMode && checkoutSelection?.method === "greengo_balance";

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <ListScreenLayout
        title={isSelectMode ? "აირჩიეთ გადახდა" : "გადახდის მეთოდები"}
        titleStyle={styles.screenTitle}
        scrollable
      >
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.balanceSection}
            onPress={handleGreenGoBalancePress}
            activeOpacity={0.85}
          >
            <View style={styles.balanceTop}>
              <Text style={styles.balanceTitle}>GreenGo ბალანსი</Text>
              <Text style={styles.balanceAmount}>{formattedBalance}</Text>
            </View>
            {!isSelectMode ? (
              <Text style={styles.balanceQuestion}>
                რა არის GreenGo ბალანსი?
              </Text>
            ) : isBalanceSelected ? (
              <View style={styles.balanceCheck}>
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={LIST_ACCENT_GREEN}
                />
              </View>
            ) : null}
          </TouchableOpacity>

          <View style={styles.methodsList}>
            {PAYMENT_CARDS.map((card, index) => (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.methodRow,
                  index < PAYMENT_CARDS.length - 1 && styles.methodRowBorder,
                ]}
                onPress={() => handleCardPress(card)}
                activeOpacity={0.75}
              >
                <View style={styles.methodRowLeft}>
                  {isSelectMode && isCardSelected(card) ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={LIST_ACCENT_GREEN}
                      style={styles.rowCheck}
                    />
                  ) : null}
                  <View style={styles.cardIconWrap}>
                    <CardBrandIcon type={card.type} width={32} height={21} />
                  </View>
                  <View style={styles.cardTextBlock}>
                    <Text style={styles.cardLabel}>Card</Text>
                    <Text style={styles.cardNumber}>{card.maskedNumber}</Text>
                  </View>
                </View>
                {!isSelectMode ? (
                  <TouchableOpacity
                    onPress={() => handleCardOptionsPress(card)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name="ellipsis-vertical"
                      size={20}
                      color="#666666"
                    />
                  </TouchableOpacity>
                ) : null}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.methodRow, styles.methodRowLast]}
              onPress={handleCashPaymentPress}
              activeOpacity={0.75}
            >
              <View style={styles.methodRowLeft}>
                {isCashSelected ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={LIST_ACCENT_GREEN}
                    style={styles.rowCheck}
                  />
                ) : null}
                <Image
                  source={bogCashIcon}
                  style={styles.cashIcon}
                  resizeMode="contain"
                />
                <View style={styles.cashLabelWrap}>
                  <Text style={styles.cashLabel}>ნაღდი ანგარიშსწორება</Text>
                </View>
              </View>
              {!isSelectMode ? (
                <TouchableOpacity
                  onPress={handleCashPaymentPress}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#666666"
                  />
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>
          </View>

          {!isSelectMode ? (
            <TouchableOpacity
              style={styles.addCardButton}
              onPress={handleAddCardPress}
              activeOpacity={0.88}
            >
              <Ionicons name="add" size={16} color="#1D4045" />
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

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleMakePrimary}
            >
              <Text style={styles.makePrimaryText}>გახადე ძირითადი</Text>
            </TouchableOpacity>

            <View style={styles.modalSeparator} />

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleDeleteCard}
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
    paddingTop: 12,
    paddingBottom: 32,
  },
  balanceSection: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingVertical: 16,
    paddingRight: 16,
    marginBottom: 24,
  },
  balanceTop: {
    paddingBottom: 12,
    marginBottom: 8,
    marginLeft: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  balanceTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.regular,
    color: "#666666",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: fontFamily.bold,
    color: "#003E20",
  },
  balanceQuestion: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.regular,
    color: "#181B1A",
    marginLeft: 16,
  },
  balanceCheck: {
    marginLeft: 16,
    marginTop: 4,
  },
  methodsList: {
    marginBottom: 19,
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
    backgroundColor: "#F1F8F9",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    height: 36,
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
