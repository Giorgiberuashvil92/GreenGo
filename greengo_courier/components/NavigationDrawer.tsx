import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Animated,
  InteractionManager,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type PlatformIOSStatic,
} from "react-native";
import { Colors } from "../constants/colors";
import { Dimensions as Dims } from "../constants/dimensions";
import { useCourierAuth } from "../hooks/useCourierAuth";
import { apiService } from "../utils/api";
import {
  getCourierDisplayName,
  getCourierFirstName,
  normalizeCourierFromResponse,
} from "../utils/courier";
import { openCrispChat, resetCrispSession } from "../utils/crisp";

interface NavigationDrawerProps {
  translateX: Animated.AnimatedInterpolation<number>;
  overlayOpacity: Animated.AnimatedInterpolation<number>;
  isOpen: boolean;
  onClose: () => void;
}

const isIPad =
  Platform.OS === "ios" && (Platform as PlatformIOSStatic).isPad === true;

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  translateX,
  overlayOpacity,
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const { courierId, clearCourierData } = useCourierAuth();
  const [courierName, setCourierName] = useState<string>("");
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchCourierData = useCallback(async () => {
    if (!courierId) return;

    try {
      setLoading(true);
      const response = await apiService.getCourier(courierId);

      if (response.success && response.data) {
        const courier = normalizeCourierFromResponse(response.data);
        const displayName = getCourierDisplayName(courier?.name);

        if (displayName) {
          setCourierName(displayName);
        }

        const rawData = response.data as Record<string, unknown> | unknown[];
        const rawRecord = Array.isArray(rawData) ? rawData[0] : rawData;
        if (
          rawRecord &&
          typeof rawRecord === "object" &&
          typeof (rawRecord as Record<string, unknown>).notificationCount ===
            "number"
        ) {
          setNotificationCount(
            (rawRecord as Record<string, unknown>).notificationCount as number,
          );
        }
      }
    } catch (error) {
      console.error("Error fetching courier data:", error);
    } finally {
      setLoading(false);
    }
  }, [courierId]);

  useEffect(() => {
    if (courierId) {
      fetchCourierData();
    } else {
      setLoading(false);
    }
  }, [courierId, fetchCourierData]);

  const navigateAfterDrawerClose = (path: "/(app)/profile" | "/(app)/statistics" | "/(app)/notifications" | "/(app)/finances" | "/(app)/earn-more") => {
    onClose();
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        router.push(path);
      }, Platform.OS === "ios" ? 300 : 0);
    });
  };

  const handleStatisticsPress = () => {
    navigateAfterDrawerClose("/(app)/statistics");
  };

  const handleNotificationsPress = () => {
    navigateAfterDrawerClose("/(app)/notifications");
  };

  const handleFinancesPress = () => {
    navigateAfterDrawerClose("/(app)/finances");
  };

  const handleProfilePress = () => {
    navigateAfterDrawerClose("/(app)/profile");
  };

  const handleEarnMorePress = () => {
    navigateAfterDrawerClose("/(app)/earn-more");
  };

  const handleSupportPress = () => {
    onClose();
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        openCrispChat();
      }, Platform.OS === "ios" ? 300 : 0);
    });
  };

  const handleLogoutPress = () => {
    Alert.alert("გამოსვლა", "დარწმუნებული ხართ, რომ გსურთ გამოსვლა?", [
      { text: "გაუქმება", style: "cancel" },
      {
        text: "გამოსვლა",
        style: "destructive",
        onPress: async () => {
          onClose();
          resetCrispSession();
          await clearCourierData();
          router.replace("/(auth)/phone");
        },
      },
    ]);
  };

  const getGreetingName = () => getCourierFirstName(courierName);

  const DrawerSurface = isIPad ? View : BlurView;
  const drawerSurfaceProps = isIPad
    ? { style: styles.blur }
    : { intensity: 100, tint: "light" as const, style: styles.blur };

  return (
    <>
      {isOpen && (
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: Colors.background,
                opacity: overlayOpacity,
              },
            ]}
          />
        </TouchableOpacity>
      )}

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <DrawerSurface {...drawerSurfaceProps}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>
              {loading
                ? "გამარჯობა... 👋"
                : courierName
                  ? `გამარჯობა, ${getGreetingName()} 👋`
                  : "გამარჯობა 👋"}
            </Text>
          </View>

          {/* Profile Section */}
          <TouchableOpacity
            style={styles.profileSection}
            onPress={handleProfilePress}
          >
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={40} color={Colors.primary} />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {loading ? "იტვირთება..." : courierName || "მომხმარებელი"}
              </Text>
              <Text style={styles.profileLabel}>ჩემი პროფილი</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.gray.medium}
            />
          </TouchableOpacity>

          {/* Menu Items */}
          <View style={styles.menuItems}>
            {/* Notifications */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleNotificationsPress}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="notifications" size={24} color={Colors.black} />
                <Text style={styles.menuItemText}>შეტყობინებები</Text>
              </View>
              <View style={styles.menuItemRight}>
                {notificationCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </Text>
                  </View>
                )}
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.gray.medium}
                />
              </View>
            </TouchableOpacity>

            {/* Finances */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleFinancesPress}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="cash" size={24} color={Colors.black} />
                <Text style={styles.menuItemText}>ფინანსები</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.gray.medium}
              />
            </TouchableOpacity>

            {/* Statistics */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleStatisticsPress}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="stats-chart" size={24} color={Colors.black} />
                <Text style={styles.menuItemText}>სტატისტიკა</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.gray.medium}
              />
            </TouchableOpacity>

            {/* Order Assignment */}

            {/* Earn More */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleEarnMorePress}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="wallet" size={24} color={Colors.black} />
                <Text style={styles.menuItemText}>გამოიმუშავე მეტი</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.gray.medium}
              />
            </TouchableOpacity>

            {/* Support */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleSupportPress}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="headset" size={24} color={Colors.black} />
                <Text style={styles.menuItemText}>მხარდაჭერა</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.gray.medium}
              />
            </TouchableOpacity>

            {/* Logout */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleLogoutPress}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name="log-out-outline"
                  size={24}
                  color={Colors.error}
                />
                <Text style={[styles.menuItemText, styles.logoutText]}>
                  გამოსვლა
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.gray.medium}
              />
            </TouchableOpacity>
          </View>
        </DrawerSurface>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "85%",
    maxWidth: Dims.drawer.maxWidth,
    zIndex: 1000,
    elevation: 1000,
  },
  blur: {
    flex: 1,
    backgroundColor: isIPad ? Colors.white : Colors.overlay.light,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: Dims.drawerHeader.paddingTop,
    paddingBottom: Dims.drawerHeader.paddingBottom,
    paddingHorizontal: Dims.padding.large,
    borderTopRightRadius: 0,
    borderBottomRightRadius: Dims.borderRadius.xlarge,
  },
  greeting: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: "600",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: Dims.padding.large,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.light,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.gray.light,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 4,
  },
  profileLabel: {
    fontSize: 14,
    color: Colors.gray.medium,
  },
  menuItems: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Dims.padding.large,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.light,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.black,
    marginLeft: 16,
    fontWeight: "500",
  },
  logoutText: {
    color: Colors.error,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Dims.padding.small,
  },
  notificationBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
});
