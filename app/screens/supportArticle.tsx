import { getSupportArticle } from "@/assets/data/support";
import { BRAND_GREEN } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
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

export default function SupportArticleScreen() {
  const { topic, article: articleId } = useLocalSearchParams<{
    topic: string;
    article: string;
  }>();
  const article =
    topic && articleId ? getSupportArticle(topic, articleId) : undefined;
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null);

  const handleFeedback = (value: "yes" | "no") => {
    setFeedback(value);
    Alert.alert("მადლობა", "თქვენი პასუხი მიღებულია");
  };

  const handleChat = () => {
    Alert.alert(
      "მხარდაჭერა",
      "ჩატი მალე დაემატება. დაგვიკავშირდით support@greengo.ge",
    );
  };

  if (!article) {
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
          <Text style={styles.emptyText}>სტატია ვერ მოიძებნა</Text>
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
        <Text style={styles.title}>{article.title}</Text>

        {article.paragraphs.map((paragraph) => (
          <Text key={paragraph} style={styles.paragraph}>
            {paragraph}
          </Text>
        ))}

        <Text style={styles.feedbackQuestion}>დაგეხმარათ ეს ინფორმაცია?</Text>

        <View style={styles.feedbackRow}>
          <TouchableOpacity
            style={[
              styles.feedbackBtn,
              feedback === "yes" && styles.feedbackBtnActive,
            ]}
            onPress={() => handleFeedback("yes")}
            activeOpacity={0.75}
          >
            <Ionicons
              name="person-outline"
              size={18}
              color="#181B1A"
              style={styles.feedbackIcon}
            />
            <Text style={styles.feedbackBtnText}>დიახ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.feedbackBtn,
              feedback === "no" && styles.feedbackBtnActive,
            ]}
            onPress={() => handleFeedback("no")}
            activeOpacity={0.75}
          >
            <Ionicons
              name="heart-outline"
              size={18}
              color="#181B1A"
              style={styles.feedbackIcon}
            />
            <Text style={styles.feedbackBtnText}>არა</Text>
          </TouchableOpacity>
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
    paddingBottom: 8,
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
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    lineHeight: 28,
    color: "#181B1A",
    marginBottom: 20,
  },
  paragraph: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: "#181B1A",
    marginBottom: 16,
  },
  feedbackQuestion: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 22,
    color: "#181B1A",
    textAlign: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  feedbackRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  feedbackBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 8,
  },
  feedbackBtnActive: {
    backgroundColor: "#EBEBEB",
  },
  feedbackIcon: {
    marginTop: 1,
  },
  feedbackBtnText: {
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 20,
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
    color: "#6B7280",
  },
});
