// import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSendCode = () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      Alert.alert("შეცდომა", "გთხოვთ შეიყვანოთ სწორი ტელეფონის ნომერი");
      return;
    }

    // Navigate to verification screen
    router.push("/screens/verification");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.sendButtonText}>გამოტოვება</Text>
          </TouchableOpacity>
        </View>

        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoIconText}>📍</Text>
              <Text style={styles.lightningIcon}>⚡</Text>
            </View>
            <View style={styles.logoText}>
              <Text style={styles.greenText}>Green</Text>
              <Text style={styles.yellowText}>Go</Text>
            </View>
            <Text style={styles.deliveryText}>Delivery</Text>
          </View>
        </View>

        {/* Phone Input Section */}
        <View style={styles.inputSection}>
          <View style={styles.phoneInputContainer}>
            {/* Country Code Selector */}
            <View style={styles.countryCodeContainer}>
              <View style={styles.flagIcon}>
                <Text style={styles.flagText}>🇬🇪</Text>
              </View>
              <Text style={styles.countryCode}>+995</Text>
              <Text style={styles.chevronIcon}>▼</Text>
            </View>

            {/* Phone Number Input */}
            <TextInput
              style={styles.phoneInput}
              placeholder="ტელეფონის ნომერი"
              placeholderTextColor="#999"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={9}
              editable={true}
            />
          </View>

          <Text style={styles.helperText}>
            ვერიფიკაციის კოდი გამოიგზავნება SMS-ით
          </Text>
        </View>

        {/* Continue Button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleSendCode}
          >
            <Text style={styles.continueButtonText}>გაგრძელება</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sendButtonText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "500",
  },
  logoSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: "center",
  },
  logoIcon: {
    width: 80,
    height: 80,
    backgroundColor: "#F0F8F0",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  logoIconText: {
    fontSize: 32,
  },
  lightningIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    fontSize: 16,
  },
  chevronIcon: {
    fontSize: 16,
    color: "#666",
  },
  logoText: {
    flexDirection: "row",
    marginBottom: 8,
  },
  greenText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  yellowText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFC107",
  },
  deliveryText: {
    fontSize: 16,
    color: "#FFC107",
    fontWeight: "500",
  },
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  phoneInputContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  countryCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minWidth: 100,
    gap: 8,
  },
  flagIcon: {
    width: 20,
    height: 15,
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  flagText: {
    fontSize: 12,
  },
  countryCode: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#333",
  },
  helperText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  buttonSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default LoginScreen;
