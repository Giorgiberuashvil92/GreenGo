import {
  getHomeBannerLayout,
  HOME_BANNER_BORDER_RADIUS,
  HOME_BANNER_GAP,
  HOME_BANNER_SIDE_PADDING,
} from "@/constants/homeBanner";
import {
  useBanners,
  type AppBanner,
  type BannerPlacement,
} from "@/hooks/useBanners";
import {
  getBannerRestaurantId,
  hasBannerAction,
} from "@/utils/bannerActions";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

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

export default function PromotionalBanner({
  placement = "top",
}: {
  placement?: BannerPlacement;
}) {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const { banners, loading } = useBanners(placement);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const { bannerWidth, bannerHeight, snapInterval } = useMemo(() => {
    const layout = getHomeBannerLayout(screenWidth);
    return {
      bannerWidth: layout.width,
      bannerHeight: layout.height,
      snapInterval: layout.snapInterval,
    };
  }, [screenWidth]);

  const updateIndex = (scrollX: number) => {
    if (banners.length === 0) return;
    const index = Math.round(scrollX / snapInterval);
    const clamped = Math.max(0, Math.min(index, banners.length - 1));
    setCurrentBannerIndex(clamped);
  };

  const handleBannerScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    updateIndex(event.nativeEvent.contentOffset.x);
  };

  const handleBannerPress = async (banner: AppBanner) => {
    const restaurantId = getBannerRestaurantId(banner);

    if (restaurantId) {
      router.push({
        pathname: "/screens/restaurant",
        params: { restaurantId },
      });
      return;
    }

    const link = banner.link?.trim();
    if (!link) return;

    try {
      const canOpen = await Linking.canOpenURL(link);
      if (canOpen) await Linking.openURL(link);
    } catch {
      // ignore invalid links
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingWrap, { height: bannerHeight + 32 }]}>
        <ActivityIndicator size="small" color="#1D4045" />
      </View>
    );
  }

  if (banners.length === 0) return null;

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
          { paddingHorizontal: HOME_BANNER_SIDE_PADDING },
        ]}
        onScroll={handleBannerScroll}
        onMomentumScrollEnd={handleBannerScroll}
        scrollEventThrottle={16}
      >
        {banners.map((banner, index) => {
          const isActionable = hasBannerAction(banner);

          return (
            <TouchableOpacity
              key={banner.id}
              activeOpacity={isActionable ? 0.95 : 1}
              disabled={!isActionable}
              style={[
                styles.bannerContainer,
                {
                  width: bannerWidth,
                  height: bannerHeight,
                  marginRight:
                    index < banners.length - 1 ? HOME_BANNER_GAP : 0,
                },
              ]}
              onPress={() => void handleBannerPress(banner)}
            >
              <Image source={banner.source} style={styles.bannerImage} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {banners.length > 1 ? (
        <View style={styles.dotsContainer}>
          {banners.map((banner, index) => {
            const distance = Math.abs(index - currentBannerIndex);
            const size = getDotSize(distance);
            return (
              <View
                key={banner.id}
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
  loadingWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  bannerScrollContent: {
    alignItems: "center",
  },
  bannerContainer: {
    borderRadius: HOME_BANNER_BORDER_RADIUS,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
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
    paddingHorizontal: HOME_BANNER_SIDE_PADDING,
  },
  dot: {},
});
