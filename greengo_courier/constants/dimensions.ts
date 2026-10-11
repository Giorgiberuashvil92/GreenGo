import { Platform } from "react-native";

export const Dimensions = {
  slideButton: {
    width: 52,
    padding: 6,
  },
  panel: {
    maxHeight: 0.65, // 65% of screen height (increased for better visibility)
    minHeight: 200,
  },
  drawer: {
    width: 0.85, // 85% of screen width
    maxWidth: 400,
  },
  markers: {
    driver: 32,
    restaurant: 40,
    customer: 40,
  },
  padding: {
    screen: 24,
    small: 8,
    medium: 12,
    large: 20,
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 20,
    xlarge: 24,
    round: 32,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 8 : 12,
    paddingBottom: 12,
  },
  drawerHeader: {
    paddingTop: Platform.OS === "ios" ? 80 : 60,
    paddingBottom: 34,
  },
} as const;

