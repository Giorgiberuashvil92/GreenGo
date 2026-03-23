import { useFonts as useExpoFonts } from "expo-font";

const georgianFontMap = {
  "NotoSansGeorgian-Thin": require("../assets/fonts/NotoSansGeorgian-Thin.ttf"),
  "NotoSansGeorgian-ExtraLight": require("../assets/fonts/NotoSansGeorgian-ExtraLight.ttf"),
  "NotoSansGeorgian-Light": require("../assets/fonts/NotoSansGeorgian-Light.ttf"),
  "NotoSansGeorgian-Regular": require("../assets/fonts/NotoSansGeorgian-Regular.ttf"),
  "NotoSansGeorgian-Medium": require("../assets/fonts/NotoSansGeorgian-Medium.ttf"),
  "NotoSansGeorgian-SemiBold": require("../assets/fonts/NotoSansGeorgian-SemiBold.ttf"),
  "NotoSansGeorgian-Bold": require("../assets/fonts/NotoSansGeorgian-Bold.ttf"),
  "NotoSansGeorgian-ExtraBold": require("../assets/fonts/NotoSansGeorgian-ExtraBold.ttf"),
  "NotoSansGeorgian-Black": require("../assets/fonts/NotoSansGeorgian-Black.ttf"),
} as const;

export function useAppFonts() {
  return useExpoFonts(georgianFontMap);
}
