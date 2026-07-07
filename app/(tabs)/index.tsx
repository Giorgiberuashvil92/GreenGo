import { StatusBar } from "expo-status-bar";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CategoryTabs from "../../components/CategoryTabs";
import GreetingSection from "../../components/GreetingSection";
import Header from "../../components/Header";
import HomeAllObjects from "../../components/HomeAllObjects";
import HomeRestaurantCarousel from "../../components/HomeRestaurantCarousel";
import PopularObjects from "../../components/PopularObjects";
import PromotionalBanner from "../../components/PromotionalBanner";
import { getBannerPlacement, useHomeSections } from "../../hooks/useHomeSections";

export default function HomeScreen() {
  const { sections, loading } = useHomeSections();

  const renderSection = (section: (typeof sections)[number]) => {
    if (section.layout === "banner") {
      return (
        <PromotionalBanner
          key={section._id}
          placement={getBannerPlacement(section.slug)}
        />
      );
    }

    if (section.layout === "list") {
      return (
        <HomeAllObjects
          key={section._id}
          title={section.title}
          restaurants={section.restaurants}
        />
      );
    }

    return (
      <HomeRestaurantCarousel
        key={section._id}
        title={section.title}
        restaurants={section.restaurants}
        showSeeAll={section.showSeeAll}
      />
    );
  };

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

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color="#4CAF50" />
          </View>
        ) : sections.length > 0 ? (
          sections.map(renderSection)
        ) : (
          <>
            <PromotionalBanner />
            <PopularObjects />
          </>
        )}
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
  loadingWrap: {
    paddingVertical: 24,
    alignItems: "center",
  },
});
