import FormScreenLayout from "@/components/layout/FormScreenLayout";
import { BRAND_GREEN } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
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
import { useAuth } from "../../contexts/AuthContext";

export default function EditPhoneScreen() {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneFocused, setPhoneFocused] = useState(false);

  React.useEffect(() => {
    if (user?.phoneNumber) {
      const digits = user.phoneNumber.replace(/\D/g, "").slice(-9);
      if (digits.length === 9) {
        setPhoneNumber(
          `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`,
        );
      }
    }
  }, [user?.phoneNumber]);

  const handleContinue = () => {
    const digits = phoneNumber.replace(/\D/g, "");
    router.push({
      pathname: "/screens/verification",
      params: { from: "editPhone", phoneNumber: digits },
    });
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 9);
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 5) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    }
    if (cleaned.length <= 7) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5)}`;
    }
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)}`;
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <FormScreenLayout
        title="ტელეფონის ნომერი"
        titleStyle={styles.screenTitle}
        contentStyle={styles.formContent}
        footer={
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={handleContinue}
            activeOpacity={0.88}
          >
            <Text style={styles.continueBtnText}>გაგრძელება</Text>
          </TouchableOpacity>
        }
      >
        <View style={styles.row}>
          <View style={styles.countryCol}>
            <Text style={styles.fieldLabel}>ქვეყანა</Text>
            <TouchableOpacity
              style={styles.countryBox}
              activeOpacity={0.85}
              onPress={() => router.push("/screens/selectCountry")}
            >
              <View style={styles.countryRow}>
                <Text style={styles.flag}>🇬🇪</Text>
                <Text style={styles.countryCode}>+995</Text>
                <Ionicons name="chevron-down" size={12} color="#11141A" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.phoneCol}>
            <Text style={styles.fieldLabel}>ნომერი</Text>
            <View
              style={[styles.phoneBox, phoneFocused && styles.phoneBoxFocused]}
            >
              <TextInput
                style={styles.phoneInput}
                value={phoneNumber}
                onChangeText={(t) => setPhoneNumber(formatPhoneNumber(t))}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => setPhoneFocused(false)}
                placeholder="123 12 12 12"
                placeholderTextColor="#9B9B9B"
                keyboardType="phone-pad"
                maxLength={14}
              />
            </View>
          </View>
        </View>
      </FormScreenLayout>
    </>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: fontFamily.semiBold,
    color: "#181B1A",
    textTransform: "uppercase",
  },
  formContent: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  countryCol: {
    marginRight: 16,
  },
  phoneCol: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 8,
    lineHeight: 12,
    fontFamily: fontFamily.regular,
    color: "#666666",
    marginBottom: 4,
  },
  countryBox: {
    backgroundColor: "#F5F5F5",
    borderColor: "#F5F5F5",
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 16,
    minWidth: 120,
    justifyContent: "center",
    minHeight: 44,
  },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  flag: {
    fontSize: 18,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.regular,
    color: "#11141A",
    marginRight: 12,
  },
  phoneBox: {
    borderColor: BRAND_GREEN,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 44,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  phoneBoxFocused: {
    borderColor: BRAND_GREEN,
  },
  phoneInput: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.regular,
    color: "#181B1A",
    padding: 0,
  },
  continueBtn: {
    alignItems: "center",
    backgroundColor: BRAND_GREEN,
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 16,
  },
  continueBtnText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamily.bold,
    color: "#FFFFFF",
  },
});
