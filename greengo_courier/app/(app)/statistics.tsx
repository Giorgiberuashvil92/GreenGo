import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { Dimensions as Dims } from "../../constants/dimensions";
import { useCourierAuth } from "../../hooks/useCourierAuth";
import { apiService } from "../../utils/api";

type Period = "today" | "week" | "month";

interface Statistics {
  period: Period;
  deliveredOrders: number;
  totalDistance: number;
  totalCompleted: number;
  confirmationRate: number;
  improvementNeeded: number;
  previousPeriodDelivered: number;
  date: string;
}

const PERIODS: { key: Period; label: string }[] = [
  { key: "today", label: "დღეს" },
  { key: "week", label: "ამ კვირაში" },
  { key: "month", label: "ამ თვეში" },
];

const MONTHS_KA = [
  "იანვარი",
  "თებერვალი",
  "მარტი",
  "აპრილი",
  "მაისი",
  "ივნისი",
  "ივლისი",
  "აგვისტო",
  "სექტემბერი",
  "ოქტომბერი",
  "ნოემბერი",
  "დეკემბერი",
];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    const now = new Date();
    return `${now.getDate()} ${MONTHS_KA[now.getMonth()]}`;
  }
  return `${date.getDate()} ${MONTHS_KA[date.getMonth()]}`;
}

function periodWord(period: Period) {
  if (period === "today") return "დღის";
  if (period === "week") return "კვირის";
  return "თვის";
}

function CircularProgress({ percentage }: { percentage: number }) {
  const value = Math.min(100, Math.max(0, percentage));
  const size = 120;
  const stroke = 10;
  const half = size / 2;

  return (
    <View style={styles.circularProgressContainer}>
      <View style={[styles.circularTrack, { width: size, height: size, borderRadius: half }]}>
        <View
          style={[
            styles.circularHalf,
            {
              width: size,
              height: size,
              borderRadius: half,
              borderWidth: stroke,
              borderColor: "transparent",
              borderTopColor: value > 0 ? "#FF9500" : "transparent",
              borderRightColor: value > 25 ? "#FF9500" : "transparent",
              borderBottomColor: value > 50 ? "#FF9500" : "transparent",
              borderLeftColor: value > 75 ? "#FF9500" : "transparent",
              transform: [{ rotate: "-90deg" }],
            },
          ]}
        />
        <View style={styles.circularInner}>
          <Text style={styles.circularProgressText}>{value.toFixed(1)}%</Text>
        </View>
      </View>
    </View>
  );
}

export default function StatisticsScreen() {
  const router = useRouter();
  const { courierId } = useCourierAuth();
  const [period, setPeriod] = useState<Period>("today");
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatistics = async () => {
    if (!courierId) return;

    setLoading(true);
    try {
      const response = await apiService.getCourierStatistics(courierId, period);
      if (response.success && response.data) {
        const data = response.data;
        setStatistics({
          period,
          deliveredOrders: data.deliveredOrders || 0,
          totalDistance: data.totalDistance || 0,
          totalCompleted: data.totalCompleted ?? data.deliveredOrders ?? 0,
          confirmationRate: Number(data.confirmationRate) || 0,
          improvementNeeded: data.improvementNeeded || 0,
          previousPeriodDelivered: data.previousPeriodDelivered || 0,
          date: data.date || new Date().toISOString(),
        });
      } else {
        setStatistics(null);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      setStatistics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courierId) {
      fetchStatistics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courierId, period]);

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
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>თქვენი სტატისტიკა</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : !statistics ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>სტატისტიკა ვერ მოიძებნა</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.periodSelector}>
            {PERIODS.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.periodButton,
                  period === item.key && styles.periodButtonActive,
                ]}
                onPress={() => setPeriod(item.key)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    period === item.key && styles.periodButtonTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryDate}>{formatDate(statistics.date)}</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryStatLabel}>მიტანილი შეკვეთები</Text>
              <Text style={styles.summaryStatValue}>
                {statistics.deliveredOrders}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryStatLabel}>მანძილი</Text>
              <Text style={styles.summaryStatValue}>
                {statistics.totalDistance} კმ
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>ანალიტიკა</Text>
          <Text style={styles.sectionSubtitle}>შესრულებული შეკვეთები</Text>

          <View style={styles.analyticsCard}>
            <Text style={styles.completedOrdersNumber}>
              {statistics.totalCompleted}
            </Text>
            <Text style={styles.completedOrdersLabel}>
              შესრულებული შეკვეთა
            </Text>
            {statistics.improvementNeeded > 0 ? (
              <View style={styles.infoBox}>
                <View style={styles.infoIconBlue}>
                  <Ionicons name="information" size={12} color={Colors.white} />
                </View>
                <Text style={styles.infoText}>
                  შეასრულე {statistics.improvementNeeded}-ზე მეტი შეკვეთა წინა{" "}
                  {periodWord(period)} შედეგის გასაუმჯობესებლად!
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.rateCard}>
            <Text style={styles.rateTitle}>
              შეკვეთის დადასტურების მაჩვენებელი
            </Text>
            <CircularProgress percentage={statistics.confirmationRate} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingHorizontal: Dims.padding.large,
    paddingTop: Platform.OS === "ios" ? 4 : Dims.padding.medium,
    paddingBottom: Dims.padding.small,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: Dims.padding.small,
    marginBottom: Dims.padding.small,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.black,
    letterSpacing: -0.4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Dims.padding.large,
    paddingBottom: Dims.padding.large * 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: Colors.gray.medium,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: Colors.gray.light,
    borderRadius: Dims.borderRadius.round,
    padding: 4,
    marginTop: Dims.padding.medium,
    marginBottom: Dims.padding.large,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Dims.borderRadius.round,
    alignItems: "center",
  },
  periodButtonActive: {
    backgroundColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.gray.medium,
  },
  periodButtonTextActive: {
    color: Colors.black,
    fontWeight: "600",
  },
  summaryCard: {
    backgroundColor: Colors.white,
    padding: Dims.padding.large,
    borderRadius: Dims.borderRadius.large,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginBottom: Dims.padding.large,
  },
  summaryDate: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: Dims.padding.medium,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryStatLabel: {
    fontSize: 15,
    color: Colors.gray.medium,
  },
  summaryStatValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.gray.medium,
    marginBottom: Dims.padding.medium,
  },
  analyticsCard: {
    backgroundColor: Colors.white,
    padding: Dims.padding.large,
    borderRadius: Dims.borderRadius.large,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginBottom: Dims.padding.large,
    alignItems: "center",
  },
  completedOrdersNumber: {
    fontSize: 64,
    fontWeight: "700",
    color: Colors.black,
    lineHeight: 72,
  },
  completedOrdersLabel: {
    fontSize: 16,
    color: Colors.black,
    marginBottom: Dims.padding.medium,
  },
  rateCard: {
    backgroundColor: Colors.white,
    padding: Dims.padding.large,
    borderRadius: Dims.borderRadius.large,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginBottom: Dims.padding.large,
  },
  rateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: Dims.padding.medium,
  },
  circularProgressContainer: {
    alignItems: "center",
    marginVertical: Dims.padding.medium,
  },
  circularTrack: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 10,
    borderColor: Colors.gray.light,
  },
  circularHalf: {
    position: "absolute",
  },
  circularInner: {
    justifyContent: "center",
    alignItems: "center",
  },
  circularProgressText: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.black,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    alignSelf: "stretch",
    marginTop: Dims.padding.small,
  },
  infoIconBlue: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Dims.padding.small,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.gray.dark,
    lineHeight: 18,
  },
});
