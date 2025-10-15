import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddCardScreen() {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddCard = () => {
    // Here you would typically validate the card and add it
    console.log("Adding card");

    // Show success screen
    setShowSuccess(true);
  };

  const handleSuccessContinue = () => {
    // Navigate back to payment methods
    router.back();
  };

  if (showSuccess) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleSuccessContinue}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>დაამატე ბარათი</Text>
        </View>

        {/* Success Content */}
        <View style={styles.successContent}>
          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <View style={styles.personIllustration}>
              <View style={styles.person}>
                <View style={styles.head} />
                <View style={styles.body} />
                <View style={styles.arm} />
                <View style={styles.phone} />
                <View style={styles.card1} />
                <View style={styles.card2} />
              </View>
            </View>
          </View>

          {/* Success Message */}
          <Text style={styles.successMessage}>ბარათი წარმატებით დაემატა</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>დაამატე ბარათი</Text>
        <Text style={styles.headerSubtitle}>საკრედიტო / სადებეტო</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Input Section */}
        <View style={styles.cardInputSection}>
          <View style={styles.cardInputContainer}>
            <TextInput
              style={styles.cardNumberInput}
              placeholder="ბარათის ნომერი"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={19} // 16 digits + 3 spaces
            />

            <View style={styles.bottomInputsRow}>
              <TextInput
                style={styles.expiryInput}
                placeholder="ბარათის ვადა"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={5} // MM/YY
              />

              <TextInput
                style={styles.securityInput}
                placeholder="უსაფრთხოების..."
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          ამ ბარათის დასადასტურებლად, ბანკმა შესაძლოა ანგარიშზე მცირე თანხა
          დროებით დაიკავოს.
        </Text>

        {/* Add Card Button */}
        <TouchableOpacity style={styles.addCardButton} onPress={handleAddCard}>
          <Text style={styles.addCardButtonText}>ბარათის დამატება</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#999",
  },
  scrollView: {
    flex: 1,
  },
  cardInputSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    marginBottom: 20,
  },
  cardInputContainer: {
    backgroundColor: "#00C851",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardNumberInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#333",
    marginBottom: 12,
  },
  bottomInputsRow: {
    flexDirection: "row",
    gap: 12,
  },
  expiryInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#333",
  },
  securityInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#333",
  },
  disclaimer: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  addCardButton: {
    backgroundColor: "#00C851",
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    alignItems: "center",
    marginBottom: 40,
  },
  addCardButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  successContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  illustrationContainer: {
    marginBottom: 40,
  },
  personIllustration: {
    width: 200,
    height: 200,
    position: "relative",
  },
  person: {
    position: "absolute",
    left: 50,
    top: 50,
  },
  head: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#333",
    marginBottom: 10,
  },
  body: {
    width: 40,
    height: 60,
    backgroundColor: "#333",
    borderRadius: 20,
    marginLeft: -5,
  },
  arm: {
    position: "absolute",
    top: 20,
    right: -20,
    width: 30,
    height: 8,
    backgroundColor: "#333",
    borderRadius: 4,
  },
  phone: {
    position: "absolute",
    top: 15,
    right: -50,
    width: 60,
    height: 100,
    backgroundColor: "#333",
    borderRadius: 8,
  },
  card1: {
    position: "absolute",
    top: 25,
    right: -45,
    width: 50,
    height: 30,
    backgroundColor: "#00C851",
    borderRadius: 6,
  },
  card2: {
    position: "absolute",
    top: 35,
    right: -40,
    width: 40,
    height: 25,
    backgroundColor: "#00C851",
    borderRadius: 4,
  },
  successMessage: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00C851",
    textAlign: "center",
  },
});
