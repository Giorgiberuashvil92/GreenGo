import { StatusBar } from "expo-status-bar";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import CategoryTabs from "../../components/CategoryTabs";
import GreetingSection from "../../components/GreetingSection";
import Header from "../../components/Header";
import PopularObjects from "../../components/PopularObjects";
import PromotionalBanner from "../../components/PromotionalBanner";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar />
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
    </View>
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
