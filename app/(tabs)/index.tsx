import { StatusBar } from "expo-status-bar";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import CategoryTabs from "../../components/CategoryTabs";
import GreetingSection from "../../components/GreetingSection";
import Header from "../../components/Header";
import HomeAllObjects from "../../components/HomeAllObjects";
import HomeRestaurantCarousel from "../../components/HomeRestaurantCarousel";
import PopularObjects from "../../components/PopularObjects";
import PromotionalBanner from "../../components/PromotionalBanner";
import { useHomeCategories } from "../../hooks/useHomeCategories";
import {
  getBannerPlacement,
  useHomeSections,
} from "../../hooks/useHomeSections";

const COLLAPSE_START = 48;
const COLLAPSE_END = 110;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { sections, loading } = useHomeSections();
  const { categories } = useHomeCategories();
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const stickyStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [COLLAPSE_START, COLLAPSE_END],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollY.value,
      [COLLAPSE_START, COLLAPSE_END],
      [-12, 0],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ translateY }],
      pointerEvents: opacity > 0.5 ? ("auto" as const) : ("none" as const),
    };
  });

  const topChromeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [COLLAPSE_START, COLLAPSE_END],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

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
    <View style={styles.container}>
      <StatusBar style="dark" />

      <Animated.View
        style={[styles.stickyHeader, { paddingTop: insets.top }, stickyStyle]}
      >
        <Header variant="compact" />
        <CategoryTabs categories={categories} compact />
        <View style={styles.stickyDivider} />
      </Animated.View>

      <SafeAreaView style={styles.flex} edges={["top"]}>
        <Animated.ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          <Animated.View style={topChromeStyle}>
            <Header />
            <GreetingSection />
            <CategoryTabs categories={categories} />
          </Animated.View>

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
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
  },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: "#FFFFFF",
  },
  stickyDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#EFEFEF",
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
