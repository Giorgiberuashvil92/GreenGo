import { BRAND_GREEN, INPUT_ACTIVE_BORDER } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
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

const VerificationScreen = () => {
  const [code, setCode] = useState(["", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const { login, sendVerificationCode } = useAuth();
  const { from, phoneNumber } = useLocalSearchParams<{
    from?: string;
    phoneNumber?: string;
  }>();

  const displayPhone = phoneNumber ?? "";

  useEffect(() => {
    const t = setTimeout(() => inputRefs.current[0]?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

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
    const digits = text.replace(/\D/g, "");
    if (digits.length > 1) {
      const chars = digits.slice(0, 4).split("");
      const newCode: string[] = ["", "", "", ""];
      for (let i = 0; i < 4; i++) newCode[i] = chars[i] ?? "";
      setCode(newCode);
      const nextEmpty = newCode.findIndex((c) => !c);
      const focusAt = nextEmpty >= 0 ? nextEmpty : 3;
      inputRefs.current[focusAt]?.focus();
      return;
    }

    const digit = digits.slice(-1) ?? "";
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 4) {
      Alert.alert("შეცდომა", "გთხოვთ შეიყვანოთ 4-ნიშნიანი კოდი");
      return;
    }

    try {
      setLoading(true);

      if (from === "editPhone") {
        router.replace("/screens/phoneUpdateSuccess");
      } else {
        const phone = phoneNumber || "";
        const result = await login(phone, fullCode);

        if (result.isNewUser) {
          router.replace({
            pathname: "/screens/registration",
            params: { phoneNumber: phone },
          });
        } else {
          router.replace("/(tabs)");
        }
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "ვერიფიკაცია ვერ მოხერხდა";
      Alert.alert("შეცდომა", message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      if (!phoneNumber) {
        Alert.alert("შეცდომა", "ტელეფონის ნომერი არ არის მითითებული");
        return;
      }

      await sendVerificationCode(phoneNumber, "+995");
      setTimeLeft(60);
      Alert.alert("წარმატება", "ვერიფიკაციის კოდი გამოიგზავნა");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "ვერ მოვახერხეთ კოდის გაგზავნა";
      Alert.alert("შეცდომა", message);
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
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>დაადასტურე ტელეფონის ნომერი</Text>
          <Text style={styles.subtitle}>
            ვერიფიკაციის კოდი გაგზავნილია ნომერზე +995{displayPhone}
          </Text>

          <View style={styles.codeContainer}>
            {code.map((digit, index) => {
              const active = focusedIndex === index || digit.length > 0;
              return (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[styles.codeInput, active && styles.codeInputActive]}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleKeyPress(nativeEvent.key, index)
                  }
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() =>
                    setFocusedIndex((cur) => (cur === index ? null : cur))
                  }
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus
                  editable={!loading}
                />
              );
            })}
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
                ? `კოდის ხელახლა გაგზავნა (${timeLeft}წმ)`
                : "კოდის ხელახლა გაგზავნა"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              loading && styles.continueButtonDisabled,
            ]}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.continueButtonText}>დადასტურება</Text>
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
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingHorizontal: 12,
    paddingTop: 50,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    alignSelf: "stretch",
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: 20,
    lineHeight: 24,
    color: "#000000",
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: "#666666",
    marginBottom: 28,
  },
  codeContainer: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 24,
    alignSelf: "stretch",
    justifyContent: "space-between",
  },
  codeInput: {
    width: 74,
    height: 56,
    borderWidth: 2,
    borderColor: "#E8E8E8",
    borderRadius: 12,
    fontFamily: fontFamily.bold,
    fontSize: 22,
    color: "#333333",
    backgroundColor: "#F5F5F5",
    padding: 0,
  },
  codeInputActive: {
    borderColor: INPUT_ACTIVE_BORDER,
  },
  resendButton: {
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  resendText: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: BRAND_GREEN,
  },
  resendTextDisabled: {
    color: "#999999",
  },
  spacer: {
    flexGrow: 1,
    minHeight: 24,
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

export default VerificationScreen;
