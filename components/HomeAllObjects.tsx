import { fontFamily } from "@/constants/fonts";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { HomeSectionRestaurant } from "../hooks/useHomeSections";
import RestaurantListCard from "./RestaurantListCard";

export default function HomeAllObjects({
  title,
  restaurants,
}: {
  title: string;
  restaurants: HomeSectionRestaurant[];
}) {
  const router = useRouter();

  if (!restaurants.length) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.list}>
        {restaurants.map((restaurant) => {
          const id = restaurant._id || restaurant.id || "";
          return (
            <RestaurantListCard
              key={id}
              restaurant={{
                ...restaurant,
                id,
                cuisine: restaurant.cuisine ?? [],
                categories: restaurant.categories ?? [],
              }}
              onPress={() =>
                router.push({
                  pathname: "/screens/restaurant",
                  params: { restaurantId: id },
                })
              }
              onDishPress={(menuItemId) =>
                router.push({
                  pathname: "/screens/restaurant",
                  params: { restaurantId: id, menuItemId },
                })
              }
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 14,
    fontFamily: fontFamily.semiBold,
    textTransform: "uppercase",
    lineHeight: 20,
    color: "#181B1A",
    marginBottom: 16,
  },
  list: {
    gap: 16,
  },
});
