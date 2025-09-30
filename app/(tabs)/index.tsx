import { StatusBar } from "expo-status-bar";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CategoryTabs from "../../components/CategoryTabs";
import GreetingSection from "../../components/GreetingSection";
import Header from "../../components/Header";
import PopularObjects from "../../components/PopularObjects";
import PromotionalBanner from "../../components/PromotionalBanner";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Header />
        <GreetingSection />
        <CategoryTabs />
        <PromotionalBanner />
        <PopularObjects />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});
