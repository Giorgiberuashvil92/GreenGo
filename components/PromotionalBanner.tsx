import React, { useMemo, useState } from "react";
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { promotionalBanners } from "../assets/data/promotionalBanners";

const BANNER_ASPECT = 158 / 315;
const SIDE_PADDING = 16;
const ITEM_GAP = 10;
const BORDER_RADIUS = 16;

function getDotSize(distance: number): number {
  if (distance === 0) return 8;
  if (distance === 1) return 7;
  if (distance === 2) return 6;
  if (distance === 3) return 5;
  return 4;
}

function getDotColor(distance: number): string {
  if (distance === 0) return "#181B1A";
  if (distance === 1) return "#8A8A8A";
  if (distance === 2) return "#A8A8A8";
  return "#C4C4C4";
}

export default function PromotionalBanner() {
  const { width: screenWidth } = useWindowDimensions();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const { bannerWidth, bannerHeight, snapInterval } = useMemo(() => {
    const width = screenWidth - SIDE_PADDING * 2;
    return {
      bannerWidth: width,
      bannerHeight: width * BANNER_ASPECT,
      snapInterval: width + ITEM_GAP,
    };
  }, [screenWidth]);

  const updateIndex = (scrollX: number) => {
    const index = Math.round(scrollX / snapInterval);
    const clamped = Math.max(
      0,
      Math.min(index, promotionalBanners.length - 1),
    );
    setCurrentBannerIndex(clamped);
  };

  const handleBannerScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    updateIndex(event.nativeEvent.contentOffset.x);
  };

  return (
    <View style={styles.bannerWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={snapInterval}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={[
          styles.bannerScrollContent,
          { paddingHorizontal: SIDE_PADDING },
        ]}
        onScroll={handleBannerScroll}
        onMomentumScrollEnd={handleBannerScroll}
        scrollEventThrottle={16}
      >
        {promotionalBanners.map((banner, index) => (
          <TouchableOpacity
            key={banner.id}
            activeOpacity={0.95}
            style={[
              styles.bannerContainer,
              {
                width: bannerWidth,
                height: bannerHeight,
                marginRight:
                  index < promotionalBanners.length - 1 ? ITEM_GAP : 0,
              },
            ]}
          >
            <Image source={banner.image} style={styles.bannerImage} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {promotionalBanners.length > 1 ? (
      <View style={styles.dotsContainer}>
        {promotionalBanners.map((_, index) => {
          const distance = Math.abs(index - currentBannerIndex);
          const size = getDotSize(distance);
          return (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: getDotColor(distance),
                  marginHorizontal: distance === 0 ? 5 : 4,
                },
              ]}
            />
          );
        })}
      </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bannerWrapper: {
    marginBottom: 20,
  },
  bannerScrollContent: {
    alignItems: "center",
  },
  bannerContainer: {
    borderRadius: BORDER_RADIUS,
    overflow: "hidden",
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
    marginTop: 12,
    paddingHorizontal: SIDE_PADDING,
  },
  dot: {},
});
