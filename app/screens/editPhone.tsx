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

export default function EditPhoneScreen() {
  const [phoneNumber, setPhoneNumber] = useState("123 12 12 12");
  const [countryCode, setCountryCode] = useState("+995");
  const [activeField, setActiveField] = useState<string | null>(null);

  const handleContinue = () => {
    // Here you would typically validate the phone number and send verification code
    console.log("Phone number:", { countryCode, phoneNumber });
    router.push("/screens/verification?from=editPhone");
  };

  const handleFieldFocus = (field: string) => {
    setActiveField(field);
  };

  const handleFieldBlur = () => {
    setActiveField(null);
  };

  const formatPhoneNumber = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, "");
    // Format as XXX XX XX XX
    const match = cleaned.match(/^(\d{3})(\d{2})(\d{2})(\d{2})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }
    return text;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
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
        <Text style={styles.headerTitle}>ტელეფონის ნომერი</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.phoneInputContainer}>
          {/* Country Code */}
          <View style={styles.countryCodeContainer}>
            <Text style={styles.label}>ქვეყანა</Text>
            <View style={styles.countryCodeInput}>
              <Text style={styles.flag}>🇬🇪</Text>
              <Text style={styles.countryCodeText}>{countryCode}</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.phoneNumberContainer}>
            <Text style={styles.label}>ნომერი</Text>
            <TextInput
              style={[
                styles.phoneNumberInput,
                activeField === "phoneNumber" && styles.inputFocused,
              ]}
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              onFocus={() => handleFieldFocus("phoneNumber")}
              onBlur={handleFieldBlur}
              placeholder="123 12 12 12"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>
        </View>
      </View>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>გაგრძელება</Text>
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
  form: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  phoneInputContainer: {
    flexDirection: "row",
    gap: 12,
  },
  countryCodeContainer: {
    flex: 1,
  },
  phoneNumberContainer: {
    flex: 2,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },
  countryCodeInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  flag: {
    fontSize: 16,
  },
  countryCodeText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    flex: 1,
    marginLeft: 8,
  },
  phoneNumberInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#333",
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputFocused: {
    backgroundColor: "#FFFFFF",
    borderColor: "#00C851",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
  },
  continueButton: {
    backgroundColor: "#00C851",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
