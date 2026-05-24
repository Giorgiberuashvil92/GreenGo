import { BRAND_GREEN } from "@/constants/colors";
import { BORDER_LIGHT, screenTitle } from "@/constants/formStyles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ListScreenLayoutProps = {
  title: string;
  children: ReactNode;
  onBack?: () => void;
  scrollable?: boolean;
  titleStyle?: TextStyle;
};

export default function ListScreenLayout({
  title,
  children,
  onBack,
  scrollable = false,
  titleStyle,
}: ListScreenLayoutProps) {
  const body = scrollable ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.flex}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
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
      {body}
    </SafeAreaView>
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
  scrollContent: {
    flexGrow: 1,
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
    ...screenTitle,
    flex: 1,
    textAlign: "center",
  },
  headerSide: {
    width: 40,
  },
});
