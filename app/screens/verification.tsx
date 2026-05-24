import FormScreenLayout, {
  PrimaryFooterButton,
} from "@/components/layout/FormScreenLayout";
import { BRAND_GREEN } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
import { INPUT_BG, TEXT_MUTED } from "@/constants/formStyles";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
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
    <>
      <StatusBar style="dark" />
      <FormScreenLayout
        title="შეიყვანეთ კოდი"
        contentStyle={styles.content}
        footer={
          <PrimaryFooterButton
            label="დადასტურება"
            onPress={handleVerify}
            loading={loading}
          />
        }
      >
        <Text style={styles.title}>დაადასტურე</Text>
        <Text style={styles.subtitle1}>ტელეფონის ნომერი</Text>
        <Text style={styles.subtitle}>
          ვერიფიკაციის კოდი გამოგზავნილია ნომერზე +995{displayPhone}
        </Text>

        <View style={styles.codeRow}>
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
          style={styles.resendBtn}
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
      </FormScreenLayout>
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: TEXT_MUTED,
    marginBottom: 24,
  },
  codeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  codeInput: {
    width: 72,
    height: 56,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    fontFamily: fontFamily.bold,
    fontSize: 22,
    color: "#111827",
    backgroundColor: INPUT_BG,
  },
  codeInputActive: {
    backgroundColor: "#FFFFFF",
    borderColor: BRAND_GREEN,
  },
  resendBtn: {
    alignSelf: "flex-start",
    paddingVertical: 8,
  },
  resendText: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: BRAND_GREEN,
  },
  resendTextDisabled: {
    color: "#9CA3AF",
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: "#111827",
    lineHeight: 24,
    textTransform: "uppercase",
  },
  subtitle1: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: "#111827",
    marginBottom: 24,
    lineHeight: 20,
  },
});

export default VerificationScreen;
