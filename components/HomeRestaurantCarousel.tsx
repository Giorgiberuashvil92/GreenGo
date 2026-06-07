import { fontFamily } from "@/constants/fonts";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { HomeSectionRestaurant } from "../hooks/useHomeSections";
import HomeRestaurantCard, {
  HOME_RESTAURANT_CARD_GAP,
  HOME_RESTAURANT_CARD_PADDING,
  HOME_RESTAURANT_CARD_WIDTH,
} from "./HomeRestaurantCard";

export default function HomeRestaurantCarousel({
  title,
  restaurants,
  showSeeAll = true,
}: {
  title: string;
  restaurants: HomeSectionRestaurant[];
  showSeeAll?: boolean;
}) {
  const router = useRouter();
  const cardWidth = HOME_RESTAURANT_CARD_WIDTH;

  if (!restaurants.length) return null;

  const navigateToRestaurant = (restaurantId: string) => {
    router.push({
      pathname: "/screens/restaurant",
      params: { restaurantId },
    });
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showSeeAll ? (
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => router.push("/(tabs)/restaurants")}
          >
            <Text style={styles.seeAllText}>სრულად </Text>
            <Feather name="chevron-right" size={12} color="#1D4045" />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {restaurants.map((restaurant, index) => {
          const id = restaurant._id || restaurant.id || "";
          return (
            <View
              key={id}
              style={[
                styles.cardWrap,
                { width: cardWidth },
                index < restaurants.length - 1 && {
                  marginRight: HOME_RESTAURANT_CARD_GAP,
                },
              ]}
            >
              <HomeRestaurantCard
                restaurant={restaurant}
                width={cardWidth}
                onPress={() => navigateToRestaurant(id)}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 1,
    marginBottom: 8,
    marginLeft: HOME_RESTAURANT_CARD_PADDING,
    marginRight: HOME_RESTAURANT_CARD_PADDING,
  },
  title: {
    color: "#181B1A",
    fontSize: 16,
    fontFamily: fontFamily.bold,
    lineHeight: 20,
    textTransform: "uppercase",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 4,
  },
  seeAllText: {
    color: "#1D4045",
    fontSize: 8,
    fontFamily: fontFamily.medium,
    lineHeight: 12,
    marginRight: 2,
  },
  scrollContent: {
    paddingLeft: HOME_RESTAURANT_CARD_PADDING,
    paddingRight: HOME_RESTAURANT_CARD_PADDING,
  },
  cardWrap: {},
});
