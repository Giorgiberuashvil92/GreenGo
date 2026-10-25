import { legalDocuments } from "@/assets/data/legal";
import ListScreenLayout from "@/components/layout/ListScreenLayout";
import { BRAND_GREEN } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";

export default function TermsScreen() {
  const { document } = useLocalSearchParams<{ document?: string }>();
  const isPrivacy = document === "privacy";
  const content = isPrivacy ? legalDocuments.privacy : legalDocuments.terms;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />
      <ListScreenLayout
        title={isPrivacy ? "კონფიდენციალურობა" : "წესები და პირობები"}
        scrollable
      >
        <View key={isPrivacy ? "privacy" : "terms"} style={styles.content}>
          <Text accessibilityRole="header" style={styles.title}>{content.title}</Text>
          <Text style={styles.updated}>Last Updated: {content.updated}</Text>
          {content.sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text accessibilityRole="header" style={styles.heading}>{section.title}</Text>
              {section.paragraphs.map((paragraph) => (
                <Text key={paragraph} selectable style={styles.paragraph}>{paragraph}</Text>
              ))}
              {!isPrivacy && section.title === "22. Personal Data" && (
                <Link href={{ pathname: "/screens/terms", params: { document: "privacy" } }} push style={styles.link}>
                  GreenGo Privacy Statement
                </Link>
              )}
            </View>
          ))}
        </View>
      </ListScreenLayout>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48 },
  title: { fontFamily: fontFamily.bold, fontSize: 24, lineHeight: 34, color: "#181B1A", marginBottom: 8 },
  updated: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 22, color: "#666666", marginBottom: 28 },
  section: { marginBottom: 24 },
  heading: { fontFamily: fontFamily.semiBold, fontSize: 18, lineHeight: 28, color: "#181B1A", marginBottom: 12 },
  paragraph: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 26, color: "#333333", marginBottom: 12 },
  link: { fontFamily: fontFamily.semiBold, fontSize: 16, lineHeight: 26, color: BRAND_GREEN, textDecorationLine: "underline" },
});
