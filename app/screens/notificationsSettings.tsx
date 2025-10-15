import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export default function NotificationsSettingsScreen() {
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: "discounts",
      title: "ფასდაკლებები & რჩევები",
      description: "მიიღეთ შეტყობინებები ფასდაკლებებისა და რჩევების შესახებ",
      enabled: false,
    },
    {
      id: "partners",
      title: "შეთავაზებები პარტნიორებისგან",
      description: "მიიღეთ შეტყობინებები ჩვენი პარტნიორებისგან",
      enabled: false,
    },
    {
      id: "push",
      title: "Push შეტყობინებები",
      description: "მიიღეთ push შეტყობინებები აპლიკაციაში",
      enabled: false,
    },
  ]);

  const toggleNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, enabled: !notification.enabled }
          : notification
      )
    );
  };

  const renderNotification = (notification: NotificationSetting) => (
    <View key={notification.id} style={styles.notificationItem}>
      <View style={styles.notificationInfo}>
        <Text style={styles.notificationTitle}>{notification.title}</Text>
        <Text style={styles.notificationDescription}>
          {notification.description}
        </Text>
      </View>
      <Switch
        value={notification.enabled}
        onValueChange={() => toggleNotification(notification.id)}
        trackColor={{ false: "#E0E0E0", true: "#00C851" }}
        thumbColor={notification.enabled ? "#FFFFFF" : "#FFFFFF"}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>შეტყობინებები</Text>
      </View>

      {/* Notifications List */}
      <View style={styles.notificationsList}>
        {notifications.map(renderNotification)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  notificationsList: {
    paddingTop: 20,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  notificationInfo: {
    flex: 1,
    marginRight: 16,
  },
  notificationTitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
    fontWeight: "500",
  },
  notificationDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
