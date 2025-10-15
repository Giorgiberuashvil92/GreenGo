import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function PromoCodesScreen() {
  const [promoCode, setPromoCode] = useState("");

  const handleActivate = () => {
    // Here you would typically validate and activate the promo code
    console.log("Activating promo code:", promoCode);
    // For now, just show success message
    alert("პრომო კოდი წარმატებით გააქტიურდა!");
    setPromoCode("");
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
        <Text style={styles.headerTitle}>პრომო კოდები</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.personIllustration}>
            {/* Person with megaphone */}
            <View style={styles.person}>
              <View style={styles.head} />
              <View style={styles.bun} />
              <View style={styles.body} />
              <View style={styles.pants} />
              <View style={styles.shoes} />
              <View style={styles.megaphone} />
            </View>

            {/* Floating promotional icons */}
            <View style={styles.floatingIcons}>
              <View style={[styles.icon, styles.speechBubble]}>
                <Ionicons name="chatbubble" size={12} color="#00C851" />
                <Ionicons name="musical-notes" size={8} color="#00C851" />
              </View>
              <View style={[styles.icon, styles.paperPlane]}>
                <Ionicons name="paper-plane" size={12} color="#00C851" />
              </View>
              <View style={[styles.icon, styles.playButton]}>
                <Ionicons name="play" size={12} color="#00C851" />
              </View>
              <View style={[styles.icon, styles.calendar]}>
                <Ionicons name="calendar" size={12} color="#00C851" />
              </View>
              <View style={[styles.icon, styles.percentage]}>
                <Text style={styles.percentageText}>%</Text>
              </View>
              <View style={[styles.icon, styles.cart]}>
                <Ionicons name="cart" size={12} color="#00C851" />
              </View>
              <View style={[styles.icon, styles.dollar]}>
                <Text style={styles.dollarText}>$</Text>
              </View>
              <View style={[styles.icon, styles.gift]}>
                <Ionicons name="gift" size={12} color="#00C851" />
              </View>
            </View>
          </View>
        </View>

        {/* Input Field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={promoCode}
            onChangeText={setPromoCode}
            placeholder="პრომო კოდი"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Activate Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.activateButton}
          onPress={handleActivate}
        >
          <Text style={styles.activateButtonText}>გააქტიურება</Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 40,
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: 60,
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
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#333",
  },
  bun: {
    position: "absolute",
    right: -5,
    top: 5,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: "#333",
  },
  body: {
    position: "absolute",
    top: 30,
    left: 5,
    width: 20,
    height: 40,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#333",
  },
  pants: {
    position: "absolute",
    top: 70,
    left: 5,
    width: 20,
    height: 25,
    backgroundColor: "#333",
  },
  shoes: {
    position: "absolute",
    top: 95,
    left: 0,
    width: 30,
    height: 10,
    backgroundColor: "#333",
  },
  megaphone: {
    position: "absolute",
    top: 20,
    left: -20,
    width: 40,
    height: 20,
    backgroundColor: "#00C851",
    borderRadius: 10,
  },
  floatingIcons: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  icon: {
    position: "absolute",
    width: 25,
    height: 25,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  speechBubble: {
    top: 20,
    left: 20,
  },
  paperPlane: {
    top: 60,
    right: 30,
  },
  playButton: {
    top: 100,
    left: 10,
  },
  calendar: {
    top: 140,
    right: 20,
  },
  percentage: {
    top: 20,
    right: 60,
  },
  cart: {
    top: 80,
    right: 10,
  },
  dollar: {
    top: 120,
    left: 40,
  },
  gift: {
    top: 160,
    left: 20,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#00C851",
  },
  dollarText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#00C851",
  },
  inputContainer: {
    marginBottom: 40,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  activateButton: {
    backgroundColor: "#00C851",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  activateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
