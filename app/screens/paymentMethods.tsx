import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PaymentCard {
  id: string;
  type: "amex" | "mastercard" | "visa";
  lastFour: string;
  maskedNumber: string;
}

const paymentCards: PaymentCard[] = [
  {
    id: "1",
    type: "amex",
    lastFour: "1234",
    maskedNumber: "1234 56** **** 1234",
  },
  {
    id: "2",
    type: "mastercard",
    lastFour: "1234",
    maskedNumber: "1234 56** **** 1234",
  },
  {
    id: "3",
    type: "visa",
    lastFour: "1234",
    maskedNumber: "1234 56** **** 1234",
  },
];

export default function PaymentMethodsScreen() {
  const [primaryCardId, setPrimaryCardId] = useState<string>("1"); // Default to first card
  const [showCardModal, setShowCardModal] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<PaymentCard | null>(null);

  const handleGreenGoBalancePress = () => {
    // Navigate to GreenGo balance management screen
    console.log("GreenGo balance pressed");
  };

  const handleCardPress = (card: PaymentCard) => {
    setSelectedCard(card);
    setShowCardModal(true);
  };

  const handleMakePrimary = () => {
    if (selectedCard) {
      setPrimaryCardId(selectedCard.id);
      setShowCardModal(false);
      console.log("Made primary:", selectedCard.id);
    }
  };

  const handleDeleteCard = () => {
    if (selectedCard) {
      // Here you would typically delete the card
      console.log("Deleted card:", selectedCard.id);
      setShowCardModal(false);
    }
  };

  const handleAddCardPress = () => {
    // Navigate to add new card screen
    router.push("/screens/addCard");
  };

  const handleCashPaymentPress = () => {
    // Navigate to cash payment settings
    console.log("Cash payment pressed");
  };

  const getCardIcon = (type: string) => {
    switch (type) {
      case "amex":
        return "💳";
      case "mastercard":
        return "💳";
      case "visa":
        return "💳";
      default:
        return "💳";
    }
  };

  const getCardName = (type: string) => {
    switch (type) {
      case "amex":
        return "American Express";
      case "mastercard":
        return "Mastercard";
      case "visa":
        return "Visa";
      default:
        return "Card";
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>გადახდის მეთოდები</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* GreenGo Balance Section */}
        <TouchableOpacity
          style={styles.balanceSection}
          onPress={handleGreenGoBalancePress}
        >
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceTitle}>GreenGo ბალანსი</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </View>
          <Text style={styles.balanceAmount}>0.00 ₾</Text>
          <Text style={styles.balanceQuestion}>რა არის GreenGo ბალანსი?</Text>
        </TouchableOpacity>

        {/* Saved Payment Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>შენახული ბარათები</Text>
          {paymentCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={styles.cardItem}
              onPress={() => handleCardPress(card)}
            >
              <View style={styles.cardInfo}>
                {primaryCardId === card.id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#00C851"
                    style={styles.checkmark}
                  />
                )}
                <Text style={styles.cardIcon}>{getCardIcon(card.type)}</Text>
                <View style={styles.cardDetails}>
                  <Text style={styles.cardName}>{getCardName(card.type)}</Text>
                  <Text style={styles.cardNumber}>{card.maskedNumber}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => handleCardPress(card)}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#666" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Other Payment Methods */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.paymentItem}
            onPress={handleCashPaymentPress}
          >
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentIcon}>🌿</Text>
              <Text style={styles.paymentName}>ნაღდი ანგარიშსწორება</Text>
            </View>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={handleCashPaymentPress}
            >
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Add New Card Button */}
        <TouchableOpacity
          style={styles.addCardButton}
          onPress={handleAddCardPress}
        >
          <Ionicons name="add" size={20} color="#000" />
          <Text style={styles.addCardText}>ახალი ბარათის დამატება</Text>
        </TouchableOpacity>
      </View>

      {/* Card Options Modal */}
      <Modal
        visible={showCardModal}
        transparent={true}
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
    </View>
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  balanceSection: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceTitle: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#00C851",
    marginBottom: 8,
  },
  balanceQuestion: {
    fontSize: 14,
    color: "#00C851",
    fontWeight: "500",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardDetails: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    marginBottom: 2,
  },
  cardNumber: {
    fontSize: 14,
    color: "#666",
  },
  paymentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  paymentName: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  infoButton: {
    padding: 4,
  },
  addCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E8",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  addCardText: {
    fontSize: 16,
    color: "#00C851",
    fontWeight: "500",
    marginLeft: 8,
  },
  checkmark: {
    marginRight: 8,
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
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  modalOption: {
    paddingVertical: 16,
    alignItems: "center",
  },
  makePrimaryText: {
    fontSize: 16,
    color: "#00C851",
    fontWeight: "500",
  },
  deleteText: {
    fontSize: 16,
    color: "#FF4444",
    fontWeight: "500",
  },
  cancelText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
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
