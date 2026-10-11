import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCourierAuth } from "../../hooks/useCourierAuth";

const GREEN = "#0B532D";
const MINT = "#E8F5E9";
const GRAY = "#666666";
const BORDER = "#E8E8E8";

const STEPS = [
  {
    icon: "link" as const,
    title: "რეფერალური კოდის გაზიარება",
    description:
      "არ არის რეკომენდაციების ლიმიტი, ასე რომ სთხოვეთ ყველა თქვენ მეგობარს დროულად დარეგისტრირება!",
  },
  {
    icon: "person-add" as const,
    title: "შეასრულე გამოწვევა",
    description:
      "მათი გამოწვევა იქნება ერთჯერადად შეკვეთის მიტანა მათი გამოცდის მიზნით.",
  },
  {
    icon: "cash" as const,
    title: "გაინაწილეთ ჯილდოები",
    description:
      "შეასრულეთ ეს გამოწვევა და ორივე თქვენგანს შეეძლება დამატებითი თანხის გამომუშავება.",
  },
];

export default function EarnMoreScreen() {
  const router = useRouter();
  const { courierId } = useCourierAuth();
  const [referralCode] = useState(
    courierId ? `GG${String(courierId).slice(-6).toUpperCase()}` : "REF12345",
  );

  const quest = useMemo(
    () => ({
      title: "კვირეული ბონუსი",
      reward: 240,
      dateRange: "კვი, 2 ნოე, 23:59 - კვი, 9 ნოე, 23:59",
      goal: "მიზნის მისაღწევად შეასრულე კიდევ 40 მიტანა და მიიღე 240₾",
      progress: 8,
      total: 40,
    }),
    [],
  );

  const progressPct = Math.min(100, (quest.progress / quest.total) * 100);

  const handleInviteFriend = async () => {
    try {
      await Share.share({
        title: "მოიწვიე მეგობარი",
        message: `გამარჯობა! შემოუერთდი GreenGo Courier-ს და გამოიმუშავე მეტი! გამოიყენე ჩემი რეფერალური კოდი: ${referralCode}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={Platform.OS === "android" ? ["top", "bottom"] : ["top"]}
    >
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>გამოიმუშავე მეტი! მოიწვიე მეგობრები.</Text>

        <View style={styles.hero}>
          <Image
            source={require("../../assets/images/earn-more-hero.png")}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.steps}>
          {STEPS.map((step, i) => (
            <View key={step.title} style={styles.stepRow}>
              <View style={styles.stepLeft}>
                <View style={styles.stepIcon}>
                  <Ionicons name={step.icon} size={18} color={GREEN} />
                </View>
                {i < STEPS.length - 1 ? (
                  <View style={styles.stepLine} />
                ) : null}
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bonusCard}>
          <View style={styles.bonusHeader}>
            <Text style={styles.bonusTitle}>{quest.title}</Text>
            <View style={styles.bonusBadge}>
              <Text style={styles.bonusBadgeText}>{quest.reward} ₾</Text>
            </View>
          </View>
          <Text style={styles.bonusDate}>{quest.dateRange}</Text>
          <Text style={styles.bonusGoal}>{quest.goal}</Text>

          <View style={styles.progressRow}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressCircleText}>P</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
            <View style={styles.progressCircle}>
              <Ionicons name="trophy" size={14} color="#FFFFFF" />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.inviteButton}
          onPress={handleInviteFriend}
          activeOpacity={0.9}
        >
          <Text style={styles.inviteButtonText}>მოიწვიე მეგობარი</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 4 : 8,
    paddingBottom: 4,
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    lineHeight: 26,
    letterSpacing: -0.2,
    marginBottom: 16,
    textAlign: "center",
  },
  hero: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  heroImage: {
    width: "100%",
    height: 160,
  },
  steps: {
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: "row",
    minHeight: 72,
  },
  stepLeft: {
    width: 44,
    alignItems: "center",
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: MINT,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLine: {
    flex: 1,
    width: 2,
    marginVertical: 4,
    borderLeftWidth: 2,
    borderColor: "#D9D9D9",
    borderStyle: "dashed",
  },
  stepContent: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 14,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 12,
    color: GRAY,
    lineHeight: 17,
  },
  bonusCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#FFFFFF",
  },
  bonusHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  bonusTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  bonusBadge: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 16,
  },
  bonusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  bonusDate: {
    fontSize: 11,
    color: GRAY,
    marginBottom: 8,
  },
  bonusGoal: {
    fontSize: 12,
    color: "#333333",
    lineHeight: 17,
    marginBottom: 14,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  progressCircleText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E5E5",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: GREEN,
    borderRadius: 2,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    backgroundColor: "#FFFFFF",
  },
  inviteButton: {
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  inviteButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
