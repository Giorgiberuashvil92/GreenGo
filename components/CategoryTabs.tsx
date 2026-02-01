import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCategories } from "../hooks/useCategories";

export default function CategoryTabs() {
  const { categories, loading } = useCategories(true);

  // Fallback icon mapping for categories that don't have icon URLs
  const getCategoryIcon = (categoryName: string, iconUrl?: string) => {
    if (iconUrl) {
      return { uri: iconUrl };
    }
    // Fallback to local icons based on category name
    const nameLower = categoryName.toLowerCase();
    if (nameLower.includes('კვება') || nameLower.includes('food')) {
      return require("../assets/images/categories/food.png");
    }
    if (nameLower.includes('ყვავილ') || nameLower.includes('flower')) {
      return require("../assets/images/categories/flowers.png");
    }
    return require("../assets/images/categories/all.png");
  };

  if (loading && categories.length === 0) {
    return (
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <ActivityIndicator size="small" color="#4CAF50" />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id || category._id}
            style={[
              styles.categoryButton,
              { backgroundColor: category.bgColor || "#F5F5F5" },
            ]}
            onPress={() => {
              // Navigate to restaurants screen with category filter
              router.push({
                pathname: "/(tabs)/restaurants",
                params: { category: category.name },
              });
            }}
          >
            <Image 
              source={getCategoryIcon(category.name, category.icon)} 
              style={styles.categoryIcon} 
            />
            <Text style={styles.categoryText}>
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
