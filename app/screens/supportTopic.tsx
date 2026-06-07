import { getSupportCategory } from "@/assets/data/support";
import { BRAND_GREEN } from "@/constants/colors";
import { TEXT_MUTED } from "@/constants/formStyles";
import { fontFamily } from "@/constants/fonts";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SupportTopicScreen() {
  const { topic } = useLocalSearchParams<{ topic: string }>();
  const category = topic ? getSupportCategory(topic) : undefined;

  const handleChat = () => {
    Alert.alert(
      "მხარდაჭერა",
      "ჩატი მალე დაემატება. დაგვიკავშირდით support@greengo.ge",
    );
  };

  if (!category) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color={BRAND_GREEN} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>კატეგორია ვერ მოიძებნა</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={BRAND_GREEN} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{category.title}</Text>

        <View style={styles.list}>
          {category.articles.map((article, index) => (
            <TouchableOpacity
              key={article.id}
              style={[
                styles.row,
                index < category.articles.length - 1 && styles.rowBorder,
              ]}
              onPress={() =>
                router.push({
                  pathname: "/screens/supportArticle",
                  params: { topic: category.id, article: article.id },
                })
              }
              activeOpacity={0.7}
            >
              <Text style={styles.rowText}>{article.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <SafeAreaView style={styles.footerSafe} edges={["bottom"]}>
        <TouchableOpacity
          style={styles.chatBtn}
          onPress={handleChat}
          activeOpacity={0.8}
        >
          <Text style={styles.chatBtnText}>ჩატი მხარდაჭერის გუნდთან</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    lineHeight: 24,
    color: "#181B1A",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  list: {
    paddingTop: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  rowText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 22,
    color: "#181B1A",
  },
  footerSafe: {
    paddingHorizontal: 20,
    paddingTop: 8,
    backgroundColor: "#FFFFFF",
  },
  chatBtn: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  chatBtnText: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 20,
    color: "#181B1A",
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: TEXT_MUTED,
  },
});
