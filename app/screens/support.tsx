import { SUPPORT_CATEGORIES } from "@/assets/data/support";
import ListScreenLayout from "@/components/layout/ListScreenLayout";
import { fontFamily } from "@/constants/fonts";
import { listRow, listRowText } from "@/constants/formStyles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SupportScreen() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <ListScreenLayout
        title="მხარდაჭერა"
        titleStyle={styles.headerTitle}
      >
        <View style={styles.list}>
          {SUPPORT_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={listRow}
              onPress={() =>
                router.push({
                  pathname: "/screens/supportTopic",
                  params: { topic: category.id },
                })
              }
              activeOpacity={0.7}
            >
              <Text style={listRowText}>{category.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      </ListScreenLayout>
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: 8,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    color: "#181B1A",
  },
});
