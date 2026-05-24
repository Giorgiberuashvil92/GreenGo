import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import { BRAND_GREEN } from "./colors";
import { fontFamily } from "./fonts";
import { primaryButton, primaryButtonText } from "./typography";

export const INPUT_BG = "#F4F4F4";
export const BORDER_LIGHT = "#F0F0F0";
export const TEXT_MUTED = "#6B7280";
export const TITLE_COLOR = "#111827";
export const DESTRUCTIVE = "#EF4444";

export const screenTitle: TextStyle = {
  fontFamily: fontFamily.semiBold,
  fontSize: 16,
  lineHeight: 20,
  color: BRAND_GREEN,
};

export const fieldLabel: TextStyle = {
  fontFamily: fontFamily.regular,
  fontSize: 12,
  lineHeight: 20,
  color: TEXT_MUTED,
  marginBottom: 8,
};

export const fieldInput: TextStyle = {
  fontFamily: fontFamily.medium,
  fontSize: 16,
  lineHeight: 20,
  color: TITLE_COLOR,
};

/** ინფუტის კონტეინერი — პრომო/ფორმა ეკრანების სტილი */
export const inputWrap: ViewStyle = {
  borderWidth: 1,
  borderColor: "#E5E7EB",
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 16,
  backgroundColor: "#FFFFFF",
  minHeight: 52,
  justifyContent: "center",
};

export const inputWrapFocused: ViewStyle = {
  borderColor: BRAND_GREEN,
};

/** ნაცარი ფონი (სახელი/ტელეფონი — ფოკუსზე თეთრი ჩარჩო) */
export const inputBox: ViewStyle = {
  backgroundColor: INPUT_BG,
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 16,
  minHeight: 52,
  borderWidth: 1,
  borderColor: "transparent",
  justifyContent: "center",
};

export const inputBoxFocused: ViewStyle = {
  backgroundColor: "#FFFFFF",
  borderColor: BRAND_GREEN,
};

export const footerButton = primaryButton;
export const footerButtonText = primaryButtonText;

export const listRowText: TextStyle = {
  fontFamily: fontFamily.medium,
  fontSize: 16,
  lineHeight: 20,
  color: TITLE_COLOR,
  flex: 1,
};

export const listRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 20,
  paddingVertical: 16,
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderBottomColor: BORDER_LIGHT,
};
