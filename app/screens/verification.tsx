import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
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
import { useAuth } from "../../contexts/AuthContext";

const VerificationScreen = () => {
  const [code, setCode] = useState(["", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRefs = useRef<TextInput[]>([]);
  const { login } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const fullCode = code.join("");
    if (fullCode.length !== 4) {
      Alert.alert("შეცდომა", "გთხოვთ შეიყვანოთ 4-ნიშნიანი კოდი");
      return;
    }

    // Accept any 4-digit code and navigate to main app
    login();
    router.replace("/(tabs)");
  };

  const handleResend = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTimeLeft(60);
      Alert.alert("წარმატება", "ვერიფიკაციის კოდი გამოიგზავნა");
    } catch (error) {
      Alert.alert("შეცდომა", "ვერ მოვახერხეთ კოდის გაგზავნა");
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
            <Ionicons name="arrow-back" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Ionicons name="location" size={32} color="#4CAF50" />
                <Ionicons
                  name="flash"
                  size={16}
                  color="#FFC107"
                  style={styles.lightningIcon}
                />
              </View>
              <View style={styles.logoText}>
                <Text style={styles.greenText}>Green</Text>
                <Text style={styles.yellowText}>Go</Text>
              </View>
              <Text style={styles.deliveryText}>Delivery</Text>
            </View>
          </View>

          <View style={styles.verificationSection}>
            <Text style={styles.title}>ვერიფიკაციის კოდი</Text>
            <Text style={styles.subtitle}>
              SMS-ით გამოგზავნილი 4-ნიშნიანი კოდი შეიყვანეთ
            </Text>

            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref!)}
                  style={styles.codeInput}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, index)
                  }
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  editable={true}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResend}
              disabled={timeLeft > 0}
            >
              <Text
                style={[
                  styles.resendText,
                  timeLeft > 0 && styles.resendTextDisabled,
                ]}
              >
                {timeLeft > 0
                  ? `კოდის გამოგზავნა (${timeLeft}წმ)`
                  : "კოდის გამოგზავნა"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Continue Button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleVerify}
          >
            <Text style={styles.continueButtonText}>ვერიფიკაცია</Text>
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
  lightningIcon: {
    position: "absolute",
    top: 6,
    right: 6,
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
  verificationSection: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  codeContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  codeInput: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    backgroundColor: "#F5F5F5",
  },
  resendButton: {
    paddingVertical: 8,
  },
  resendText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "500",
  },
  resendTextDisabled: {
    color: "#999",
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

export default VerificationScreen;
