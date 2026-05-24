import { TextStyle, ViewStyle } from "react-native";
import { BRAND_GREEN } from "./colors";
import { fontFamily } from "./fonts";

/** ღილაკის ტექსტი — #1D4045, bold 16/20, uppercase */
export const buttonText: TextStyle = {
  fontFamily: fontFamily.bold,
  fontSize: 16,
  lineHeight: 20,
  color: BRAND_GREEN,
  textTransform: "uppercase",
};

/** სექციის/ლეიბლის ტექსტი — იგივე სტილი */
export const labelText: TextStyle = {
  fontFamily: fontFamily.bold,
  fontSize: 16,
  lineHeight: 20,
  color: BRAND_GREEN,
  textTransform: "uppercase",
};

export const primaryButton: ViewStyle = {
  backgroundColor: BRAND_GREEN,
  borderRadius: 14,
  paddingVertical: 16,
  paddingHorizontal: 20,
  alignItems: "center",
  justifyContent: "center",
};

export const primaryButtonText: TextStyle = {
  ...buttonText,
  color: "#FFFFFF",
};

export const outlineButton: ViewStyle = {
  borderRadius: 14,
  paddingVertical: 16,
  paddingHorizontal: 20,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#F2FAF7",
  borderWidth: 1,
  borderColor: BRAND_GREEN,
};

export const outlineButtonText: TextStyle = {
  ...buttonText,
};
