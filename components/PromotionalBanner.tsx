import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { promotionalBanners } from "../assets/data/promotionalBanners";

export default function PromotionalBanner() {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const handleBannerScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const bannerWidth = 320;
    const index = Math.round(scrollX / bannerWidth);
    setCurrentBannerIndex(index);
  };

  return (
    <View style={styles.bannerWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bannerScrollContent}
        onScroll={handleBannerScroll}
        scrollEventThrottle={16}
      >
        {promotionalBanners.map((banner) => (
          <TouchableOpacity key={banner.id} style={styles.bannerContainer}>
            <Image source={banner.image} style={styles.bannerImage} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dots outside the scroll view */}
      <View style={styles.dotsContainer}>
        {promotionalBanners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentBannerIndex === index && styles.activeDot,
            ]}
          />
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
    paddingHorizontal: 20,
  },
  bannerContainer: {
    marginRight: 20,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    height: 180,
    width: 300,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bannerContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
  },
  bannerTextContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  oldPrice: {
    fontSize: 16,
    color: "#FFFFFF",
    textDecorationLine: "line-through",
    marginRight: 8,
  },
  newPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700",
  },
  bannerDescription: {
    fontSize: 12,
    color: "#FFFFFF",
    fontStyle: "italic",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#9B9B9B",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#181B1A",
  },
});
