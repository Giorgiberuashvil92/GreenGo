export const fontFamily = {
  thin: "NotoSansGeorgian-Thin",
  extraLight: "NotoSansGeorgian-ExtraLight",
  light: "NotoSansGeorgian-Light",
  regular: "NotoSansGeorgian-Regular",
  medium: "NotoSansGeorgian-Medium",
  semiBold: "NotoSansGeorgian-SemiBold",
  bold: "NotoSansGeorgian-Bold",
  extraBold: "NotoSansGeorgian-ExtraBold",
  black: "NotoSansGeorgian-Black",
} as const;

export type FontFamilyKey = keyof typeof fontFamily;
