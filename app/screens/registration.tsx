// import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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

const RegistrationScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { completeRegistration } = useAuth();
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber?: string }>();

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCompleteRegistration = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("შეცდომა", "გთხოვთ შეიყვანოთ სახელი და გვარი");
      return;
    }

    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      Alert.alert("შეცდომა", "სახელი და გვარი უნდა იყოს მინიმუმ 2 სიმბოლო");
      return;
    }

    if (!email.trim()) {
      Alert.alert("შეცდომა", "გთხოვთ შეიყვანოთ ელ. ფოსტა");
      return;
    }

    if (!isValidEmail(email.trim())) {
      Alert.alert("შეცდომა", "გთხოვთ შეიყვანოთ სწორი ელ. ფოსტის მისამართი");
      return;
    }

    try {
      setLoading(true);
      await completeRegistration(firstName.trim(), lastName.trim(), email.trim());
      
      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("შეცდომა", error.message || "რეგისტრაცია ვერ მოხერხდა");
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
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
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

          <View style={styles.registrationSection}>
            <Text style={styles.title}>რეგისტრაცია</Text>
            <Text style={styles.subtitle}>
              გთხოვთ შეიყვანოთ თქვენი სახელი, გვარი და ელ. ფოსტა
            </Text>

            {/* Phone Number Display */}
            {phoneNumber && (
              <View style={styles.phoneDisplayContainer}>
                <Text style={styles.phoneDisplayLabel}>ტელეფონის ნომერი:</Text>
                <Text style={styles.phoneDisplayNumber}>+995 {phoneNumber}</Text>
              </View>
            )}

            {/* First Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>სახელი *</Text>
              <TextInput
                style={styles.input}
                placeholder="შეიყვანეთ სახელი"
                placeholderTextColor="#999"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

            {/* Last Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>გვარი *</Text>
              <TextInput
                style={styles.input}
                placeholder="შეიყვანეთ გვარი"
                placeholderTextColor="#999"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>ელ. ფოსტა *</Text>
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[styles.continueButton, loading && styles.continueButtonDisabled]}
            onPress={handleCompleteRegistration}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.continueButtonText}>დასრულება</Text>
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
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
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
    width: 60,
    height: 60,
    backgroundColor: "#F0F8F0",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  logoIconText: {
    fontSize: 24,
  },
  lightningIcon: {
    position: "absolute",
    top: 6,
    right: 6,
    fontSize: 12,
  },
  logoText: {
    flexDirection: "row",
    marginBottom: 6,
  },
  greenText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  yellowText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFC107",
  },
  deliveryText: {
    fontSize: 14,
    color: "#FFC107",
    fontWeight: "500",
  },
  registrationSection: {
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  phoneDisplayContainer: {
    backgroundColor: "#F0F8F0",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0F2E0",
  },
  phoneDisplayLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  phoneDisplayNumber: {
    fontSize: 18,
    color: "#4CAF50",
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
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
  continueButtonDisabled: {
    opacity: 0.6,
  },
});

export default RegistrationScreen;

