import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
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

interface Transaction {
  id: string;
  date: string;
  description: string;
  source?: string;
  amount: number;
}

interface CourierOrder {
  _id: string;
  status: string;
  paymentMethod?: string;
  totalAmount?: number;
  deliveryFee?: number;
  tip?: number;
  orderDate?: string;
  actualDelivery?: string;
  restaurantId?: {
    name?: string;
  };
}

function orderEarnings(order: CourierOrder): number {
  return (Number(order.deliveryFee) || 0) + (Number(order.tip) || 0);
}

const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatTransactionDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getDate()} ${MONTHS_EN[d.getMonth()]}, ${d.getFullYear()}`;
}

function normalizeOrders(payload: unknown): CourierOrder[] {
  if (Array.isArray(payload)) return payload;
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as any).data)
  ) {
    return (payload as any).data;
  }
  return [];
}

function buildTransactionsFromOrders(orders: CourierOrder[]): Transaction[] {
  return orders
    .filter((order) => order.status === "delivered")
    .sort((a, b) => {
      const aTime = new Date(a.actualDelivery || a.orderDate || 0).getTime();
      const bTime = new Date(b.actualDelivery || b.orderDate || 0).getTime();
      return bTime - aTime;
    })
    .map((order) => {
      const earnings = orderEarnings(order);
      const isCash =
        String(order.paymentMethod || "").toLowerCase() === "cash";

      return {
        id: order._id,
        date: formatTransactionDate(order.actualDelivery || order.orderDate),
        description: isCash ? "ნაღდი ფულის აღება" : "მიწოდების შემოსავალი",
        source: order.restaurantId?.name,
        amount: isCash ? Number(order.totalAmount) || earnings : earnings,
      };
    });
}

function totalEarningsFromOrders(orders: CourierOrder[]): number {
  return orders
    .filter((order) => order.status === "delivered")
    .reduce((sum, order) => sum + orderEarnings(order), 0);
}

function cashHeldFromOrders(orders: CourierOrder[]): number {
  return orders
    .filter(
      (order) =>
        order.status === "delivered" &&
        String(order.paymentMethod || "").toLowerCase() === "cash",
    )
    .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
}

function formatCurrency(amount: number) {
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toFixed(2).replace(".", ",");
  return `${amount < 0 ? "-" : ""}${formatted} ₾`;
}

export default function FinancesScreen() {
  const router = useRouter();
  const { courierId } = useCourierAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [cashToWithdraw, setCashToWithdraw] = useState(0);

  useEffect(() => {
    if (courierId) {
      fetchFinances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courierId]);

  const fetchFinances = async () => {
    if (!courierId) return;

    try {
      setLoading(true);
      const ordersResponse = await apiService.getCourierOrders(courierId);

      if (ordersResponse.success && ordersResponse.data) {
        const orders = normalizeOrders(ordersResponse.data);
        setTransactions(buildTransactionsFromOrders(orders));
        setTotalEarnings(totalEarningsFromOrders(orders));
        setCashToWithdraw(cashHeldFromOrders(orders));
      } else {
        setTransactions([]);
        setTotalEarnings(0);
        setCashToWithdraw(0);
      }
    } catch (error) {
      console.error("Error fetching finances:", error);
      setTransactions([]);
      setTotalEarnings(0);
      setCashToWithdraw(0);
    } finally {
      setLoading(false);
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionContent}>
        <Text style={styles.transactionDate}>{item.date}</Text>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        {item.source ? (
          <Text style={styles.transactionSource}>{item.source}</Text>
        ) : null}
      </View>
      <Text
        style={[
          styles.transactionAmount,
          item.amount < 0 && styles.transactionAmountNegative,
        ]}
      >
        {formatCurrency(item.amount)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={styles.container}
      edges={Platform.OS === "android" ? ["top", "bottom"] : ["top"]}
    >
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ფინანსები</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewLabel}>მთლიანი შემოსავალი</Text>
                <Text style={styles.totalEarnings}>
                  {formatCurrency(totalEarnings)}
                </Text>

                <View style={styles.cashToWithdrawRow}>
                  <View style={styles.cashToWithdrawLeft}>
                    <Text style={styles.cashToWithdrawLabel}>
                      ჩამოსაჭრელი ნაღდი ფული
                    </Text>
                    <Ionicons
                      name="information-circle-outline"
                      size={16}
                      color={Colors.gray.medium}
                    />
                  </View>
                  <Text style={styles.cashToWithdrawAmount}>
                    {formatCurrency(cashToWithdraw)}
                  </Text>
                </View>
              </View>

              <Text style={styles.transactionsTitle}>ბოლო ტრანზაქციები</Text>
            </>
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>ტრანზაქციები ჯერ არ არის</Text>
          }
        />
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
    fontSize: 32,
    fontWeight: "700",
    color: Colors.black,
    letterSpacing: -0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: Dims.padding.large,
    paddingBottom: Dims.padding.large * 2,
  },
  overviewCard: {
    backgroundColor: Colors.white,
    borderRadius: Dims.borderRadius.large,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    padding: Dims.padding.large,
    marginTop: Dims.padding.medium,
    marginBottom: Dims.padding.large,
  },
  overviewLabel: {
    fontSize: 14,
    color: Colors.gray.medium,
    marginBottom: Dims.padding.small,
  },
  totalEarnings: {
    fontSize: 36,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: Dims.padding.large,
  },
  cashToWithdrawRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cashToWithdrawLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    marginRight: Dims.padding.medium,
  },
  cashToWithdrawLabel: {
    fontSize: 14,
    color: Colors.gray.dark,
  },
  cashToWithdrawAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },
  transactionsTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: Dims.padding.medium,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray.medium,
    textAlign: "center",
    marginTop: Dims.padding.large,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: Dims.padding.medium,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5E5",
  },
  transactionContent: {
    flex: 1,
    marginRight: Dims.padding.medium,
  },
  transactionDate: {
    fontSize: 13,
    color: Colors.gray.medium,
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 15,
    color: Colors.black,
    fontWeight: "500",
    marginBottom: 2,
  },
  transactionSource: {
    fontSize: 14,
    color: Colors.gray.medium,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
  },
  transactionAmountNegative: {
    color: Colors.error,
  },
});
