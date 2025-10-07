import { categories } from "@/assets/data/categories";
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
        {categories.map((category, index) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              { backgroundColor: category.bgColor },
            ]}
            onPress={() => {
              if (category.link) {
                router.push(category.link as any);
              }
            }}
          >
            <Image source={category.icon} style={styles.categoryIcon} />
            <Text
              style={[
                styles.categoryText,
                // index === 0 && styles.activeCategoryText,
              ]}
            >
              {category.name}
            </Text>
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
    backgroundColor: "#F5F5F5",
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
    fontSize: 15,
    fontWeight: "500",
    color: "#181B1A",
  },
  // activeCategoryText: {
  //   color: "#4CAF50",
  // },
});
