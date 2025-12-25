import React, { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { promotionalBanners } from "../assets/data/promotionalBanners";

const { width: screenWidth } = Dimensions.get("window");
const BANNER_WIDTH = screenWidth * 0.85;
const BANNER_SPACING = 12;
const SNAP_INTERVAL = BANNER_WIDTH + BANNER_SPACING;

export default function PromotionalBanner() {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleBannerScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / SNAP_INTERVAL);
    setCurrentBannerIndex(
      Math.max(0, Math.min(index, promotionalBanners.length - 1))
    );
  };

  // Calculate dot size based on distance from active index
  const getDotStyle = (index: number) => {
    const distance = Math.abs(currentBannerIndex - index);

    if (distance === 0) {
      // Active dot - largest and darkest
      return {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#2D2D2D",
      };
    } else if (distance === 1) {
      // Adjacent dots - medium size
      return {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#6B6B6B",
      };
    } else if (distance === 2) {
      // Two away - smaller
      return {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#9B9B9B",
      };
    } else {
      // Far dots - smallest and lightest
      return {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: "#C4C4C4",
      };
    }
  };

  return (
    <View style={styles.bannerWrapper}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bannerScrollContent}
        onScroll={handleBannerScroll}
        scrollEventThrottle={16}
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        decelerationRate="fast"
      >
        {promotionalBanners.map((banner, index) => (
          <TouchableOpacity
            key={banner.id}
            style={[
              styles.bannerContainer,
              index === promotionalBanners.length - 1 && { marginRight: 0 },
            ]}
            activeOpacity={0.95}
          >
            <Image source={banner.image} style={styles.bannerImage} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Scaled dots indicator */}
      <View style={styles.dotsContainer}>
        {promotionalBanners.map((_, index) => (
          <View key={index} style={[styles.dotBase, getDotStyle(index)]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerWrapper: {
    marginBottom: 20,
  },
  bannerScrollContent: {
    paddingHorizontal: (screenWidth - BANNER_WIDTH) / 2,
  },
  bannerContainer: {
    width: BANNER_WIDTH,
    height: 200,
    marginRight: BANNER_SPACING,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    height: 12,
  },
  dotBase: {
    marginHorizontal: 4,
  },
});
