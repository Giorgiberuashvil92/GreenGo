// import { Ionicons } from "@expo/vector-icons";
import { BRAND_GREEN, INPUT_ACTIVE_BORDER } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
import { Image } from "expo-image";
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
  const [phoneFocused, setPhoneFocused] = useState(false);
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
          [{ text: "OK", style: "default" }],
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
      if (
        errorMessage.includes("timed out") ||
        errorMessage.includes("not responding")
      ) {
        const apiInfo = getApiInfo();
        Alert.alert(
          "Backend Connection Error",
          `${errorMessage}\n\n` +
            `Platform: ${Platform.OS}\n` +
            `API URL: ${apiInfo.url}\n\n` +
            `გთხოვთ დარწმუნდეთ რომ backend გაშვებულია: cd greengo-backend && npm run start:dev`,
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
          <Image
            source={require("../../assets/images/green-logo.png")}
            style={styles.brandLogo}
            contentFit="contain"
            accessibilityLabel="GreenGo"
          />
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
            <View
              style={[
                styles.phoneInputOuter,
                phoneFocused && styles.phoneInputOuterFocused,
              ]}
            >
              <TextInput
                style={styles.phoneInput}
                placeholder="ტელეფონის ნომერი"
                placeholderTextColor="#999"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => setPhoneFocused(false)}
                keyboardType="phone-pad"
                maxLength={9}
                editable={true}
              />
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />

        {/* Continue Button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              loading && styles.continueButtonDisabled,
            ]}
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
    paddingTop: 44,
    paddingBottom: 8,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sendButtonText: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    color: BRAND_GREEN,
  },
  logoSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 70,
  },
  brandLogo: {
    width: 250,
    height: 205,
  },
  chevronIcon: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: "#666",
  },
  inputSection: {
    paddingHorizontal: 20,
    marginTop: 80,
    marginBottom: 16,
  },
  bottomSpacer: {
    flexGrow: 1,
    minHeight: 16,
  },
  phoneInputContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
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
    fontFamily: fontFamily.regular,
    fontSize: 12,
  },
  countryCode: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    color: "#333",
  },
  phoneInputOuter: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#F5F5F5",
    overflow: "hidden",
  },
  phoneInputOuterFocused: {
    borderColor: INPUT_ACTIVE_BORDER,
  },
  phoneInput: {
    fontFamily: fontFamily.regular,
    flex: 1,
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#333",
  },
  helperText: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    lineHeight: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  buttonSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: BRAND_GREEN,
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: "#FFFFFF",
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
});

export default LoginScreen;
