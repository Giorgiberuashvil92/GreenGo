import { BRAND_GREEN } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
import { BORDER_LIGHT } from "@/constants/formStyles";
import { primaryButtonText } from "@/constants/typography";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

type FormScreenLayoutProps = {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onBack?: () => void;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
  keyboardAvoiding?: boolean;
};

export default function FormScreenLayout({
  title,
  children,
  footer,
  onBack,
  contentStyle,
  titleStyle,
  keyboardAvoiding = true,
}: FormScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  const body = (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack ?? (() => router.back())}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={BRAND_GREEN} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, titleStyle]} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.headerSide} />
      </View>

      <View style={[styles.content, contentStyle]}>{children}</View>

      {footer ? (
        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          {footer}
        </View>
      ) : null}
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {body}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.flex}>{body}</View>
      )}
    </SafeAreaView>
  );
}

type PrimaryFooterButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function PrimaryFooterButton({
  label,
  onPress,
  loading,
  disabled,
}: PrimaryFooterButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.primaryBtn,
        (loading || disabled) && styles.primaryBtnDisabled,
      ]}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.primaryBtnText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER_LIGHT,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    color: BRAND_GREEN,
    textTransform: "uppercase",
  },
  headerSide: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  primaryBtn: {
    backgroundColor: BRAND_GREEN,
    borderRadius: 12,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  primaryBtnDisabled: {
    opacity: 0.55,
  },
  primaryBtnText: {
    ...primaryButtonText,
    textTransform: "none",
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: "#FFFFFF",
  },
});
