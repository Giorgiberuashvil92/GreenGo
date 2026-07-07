import { getRestaurantsRouteForCategory, homeCategories } from "@/assets/data/categories";
import { fontFamily } from "@/constants/fonts";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CategoryTabs() {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {homeCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              { backgroundColor: category.bgColor },
            ]}
            onPress={() => {
              const route = getRestaurantsRouteForCategory(category);
              if (typeof route === "string") {
                router.push(route);
                return;
              }
              router.push(route);
            }}
          >
            <Image source={category.icon} style={styles.categoryIcon} />
            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#181B1A",
    textTransform: "uppercase",
    fontFamily: fontFamily.regular,
  },
});
