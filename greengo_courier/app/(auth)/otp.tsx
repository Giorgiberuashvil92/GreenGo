import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  isReviewOtp,
  isReviewPhone,
  REVIEW_COURIER_ID,
  REVIEW_PHONE,
} from "../../constants/reviewAuth";
import { useCourierAuth } from "../../hooks/useCourierAuth";
import { apiService } from "../../utils/api";

function extractCourierId(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const courier = (record.courier ?? record) as Record<string, unknown>;
  const id = courier._id ?? courier.id ?? record.courierId;
  return id ? String(id) : null;
}

function mapAuthError(message?: string): string {
  const raw = (message || "").toLowerCase();

  if (
    raw.includes("expired") ||
    raw.includes("not found") ||
    raw.includes("invalid")
  ) {
    return "კოდი არასწორია ან ვადა გაუვიდა. ხელახლა გააგზავნეთ კოდი.";
  }

  if (raw.includes("too many") || raw.includes("rate")) {
    return "ძალიან ბევრი მცდელობაა. ცოტა ხანში სცადეთ თავიდან.";
  }

  return message?.trim() || "OTP კოდი არასწორია";
}

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;
  const name = params.name as string | undefined;
  const mode = (params.mode as string) || "register";
  const { saveCourierData } = useCourierAuth();

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
      // Handle paste
      const pastedText = text.slice(0, 4);
      const newOtp = [...otp];
      for (let i = 0; i < pastedText.length && index + i < 4; i++) {
        newOtp[index + i] = pastedText[i];
      }
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedText.length, 3);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all fields are filled
    if (newOtp.every((digit) => digit !== "")) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const clearOtpInput = () => {
    setOtp(["", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const handleVerify = async (code: string) => {
    if (code.length !== 4) {
      return;
    }

    try {
      setLoading(true);
      console.log(`🔐 Verifying OTP (${mode}) for:`, phoneNumber);

      if (isReviewPhone(phoneNumber) && isReviewOtp(code)) {
        await saveCourierData(REVIEW_COURIER_ID, REVIEW_PHONE);
        router.replace("/(app)/home");
        return;
      }

      const response =
        mode === "login"
          ? await apiService.verifyVerificationCode(phoneNumber, code)
          : await apiService.registerCourier(phoneNumber, code, name);

      if (response.success && response.data) {
        const id = extractCourierId(response.data);
        console.log("✅ Auth success, courier ID:", id);

        if (id) {
          await saveCourierData(id, phoneNumber);
          router.replace("/(app)/home");
        } else {
          console.error("❌ Courier ID not found in response");
          Alert.alert("შეცდომა", "ავტორიზაცია წარმატებულია, მაგრამ ID ვერ მოიძებნა");
          clearOtpInput();
        }
      } else {
        const errorMessage = mapAuthError(response.error?.details);
        console.warn("OTP verification failed:", errorMessage);
        Alert.alert("შეცდომა", errorMessage);
        clearOtpInput();
      }
    } catch (error: unknown) {
      console.warn("Error verifying OTP:", error);
      const errorMessage = mapAuthError(
        error instanceof Error ? error.message : undefined,
      );
      Alert.alert("შეცდომა", errorMessage);
      clearOtpInput();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (isReviewPhone(phoneNumber)) {
      Alert.alert("ინფო", `რევიუს ანგარიშისთვის გამოიყენეთ კოდი: 1234`);
      return;
    }

    try {
      setLoading(true);
      const resendResponse = await apiService.sendVerificationCode(phoneNumber);
      if (resendResponse.success) {
        Alert.alert("წარმატება", "ახალი კოდი გაგზავნილია");
        clearOtpInput();
      } else {
        Alert.alert(
          "შეცდომა",
          resendResponse.error?.details || "კოდის ხელახალი გაგზავნა ვერ მოხერხდა"
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "უცნობი შეცდომა";
      Alert.alert("შეცდომა", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>დაადასტურე ტელეფონის ნომერი</Text>
          <Text style={styles.subtitle}>
            {isReviewPhone(phoneNumber)
              ? "შეიყვანეთ ვერიფიკაციის კოდი"
              : `ვერიფიკაციის კოდი გაგზავნილია ნომერზე ${phoneNumber}`}
          </Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  digit !== "" && styles.otpInputFilled,
                  loading && styles.otpInputDisabled,
                ]}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!loading}
              />
            ))}
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.loadingText}>ვერიფიკაცია...</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResend}
            disabled={loading}
          >
            <Text style={styles.resendText}>კოდის ხელახალი გაგზავნა</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  otpInput: {
    flex: 1,
    aspectRatio: 1,
    minWidth: 60,
    maxWidth: 80,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
  },
  otpInputFilled: {
    borderColor: "#4CAF50",
  },
  otpInputDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
  },
  resendButton: {
    marginTop: 32,
    alignSelf: "center",
    paddingVertical: 8,
  },
  resendText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "500",
  },
});
