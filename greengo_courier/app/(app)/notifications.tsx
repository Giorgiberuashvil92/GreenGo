import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { Dimensions as Dims } from "../../constants/dimensions";

interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
}

// Mock notifications data - later this will come from API
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "ოფისი",
    description: "ოფისის ლოკაცია შეიცვალა",
    date: "11.1.2025",
  },
  {
    id: "2",
    title: "ავტომატური თარგმანი",
    description:
      "დამატებითი ინფორმაციის გადათარგმნას უკვე GreenGo Partner აპლიკაციიდან შეძლებ.",
    date: "11.1.2025",
  },
  {
    id: "3",
    title: "გადახდის თარიღი",
    description:
      "მალე აპლიკაციში შენი გამომუშავება განულდება, დეტალებს შეყტობინებაში ნახავ.",
    date: "11.1.2025",
  },
];

export default function NotificationsScreen() {
  const router = useRouter();

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationTitle}>{item.title}</Text>
      <Text style={styles.notificationDescription}>{item.description}</Text>
      <Text style={styles.notificationDate}>{item.date}</Text>
      <View style={styles.separator} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={Platform.OS === 'android' ? ['top', 'bottom'] : ['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>შემომავალი შეტყობინებები</Text>
      </View>

      {/* Notifications List */}
      <FlatList
        data={mockNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Dims.padding.large,
    paddingTop: Platform.OS === "ios" ? 8 : Dims.padding.medium,
    paddingBottom: Dims.padding.medium,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.light,
  },
  backButton: {
    padding: Dims.padding.small,
    marginRight: Dims.padding.medium,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
  },
  listContent: {
    paddingHorizontal: Dims.padding.large,
  },
  notificationItem: {
    paddingVertical: Dims.padding.large,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: Dims.padding.small,
  },
  notificationDescription: {
    fontSize: 14,
    color: Colors.gray.dark,
    lineHeight: 20,
    marginBottom: Dims.padding.small,
  },
  notificationDate: {
    fontSize: 12,
    color: Colors.gray.medium,
    marginBottom: Dims.padding.medium,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.gray.light,
  },
});
