// import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { useAuth } from "../../contexts/AuthContext";
import { checkApiHealth, getApiInfo } from "../../utils/apiConfig";

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { sendVerificationCode } = useAuth();

  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      Alert.alert("შეცდომა", "გთხოვთ შეიყვანოთ სწორი ტელეფონის ნომერი");
      return;
    }

    try {
      setLoading(true);
      
      // Check if backend is available
      const isBackendAvailable = await checkApiHealth();
      if (!isBackendAvailable) {
        const apiInfo = getApiInfo();
        Alert.alert(
          "Backend არ არის გაშვებული",
          `გთხოვთ გაუშვით backend server:\n\n` +
          `cd greengo-backend\n` +
          `npm run start:dev\n\n` +
          `Platform: ${apiInfo.platform}\n` +
          `API URL: ${apiInfo.url}`,
          [
            { text: "OK", style: "default" },
          ]
        );
        setLoading(false);
        return;
      }
      
      await sendVerificationCode(phoneNumber, "+995");
      
      // Navigate to verification screen with phone number
      router.push({
        pathname: "/screens/verification",
        params: { phoneNumber },
      });
    } catch (error: any) {
      const errorMessage = error.message || "ვერ მოვახერხეთ კოდის გაგზავნა";
      
      // Check if it's a timeout/connection error
      if (errorMessage.includes('timed out') || errorMessage.includes('not responding')) {
        const apiInfo = getApiInfo();
        Alert.alert(
          "Backend Connection Error",
          `${errorMessage}\n\n` +
          `Platform: ${Platform.OS}\n` +
          `API URL: ${apiInfo.url}\n\n` +
          `გთხოვთ დარწმუნდეთ რომ backend გაშვებულია: cd greengo-backend && npm run start:dev`
        );
      } else {
        Alert.alert("შეცდომა", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <StatusBar style="dark" />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.sendButtonText}>გამოტოვება</Text>
          </TouchableOpacity>
        </View>

        {/* Centered Content: Logo and Input */}
        <View style={styles.centeredContent}>
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
        </View>

        {/* Continue Button at Bottom */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[styles.continueButton, loading && styles.continueButtonDisabled]}
            onPress={handleSendCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.continueButtonText}>გაგრძელება</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 40,
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
    width: "100%",
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
    paddingTop: 20,
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
  continueButtonDisabled: {
    opacity: 0.6,
  },
});

export default LoginScreen;
