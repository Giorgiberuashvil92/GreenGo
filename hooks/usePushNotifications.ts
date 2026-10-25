import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  isDeviceRegisteredForRemoteMessages,
  onMessage,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  requestPermission,
  type RemoteMessage,
} from "@react-native-firebase/messaging";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { apiService } from "../utils/api";

interface UsePushNotificationsProps {
  userId: string | null;
  enabled?: boolean;
}

function isPermissionGranted(status: number) {
  return (
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL
  );
}

export function usePushNotifications({
  userId,
  enabled = true,
}: UsePushNotificationsProps) {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const userIdRef = useRef(userId);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    if (!enabled || !userId || Platform.OS === "web" || (Platform.OS === "ios" && !Device.isDevice)) {
      if (Platform.OS === "ios" && !Device.isDevice) {
        console.log("📲 [push] simulator — FCM registration skipped");
      }
      return;
    }

    let cancelled = false;
    let unsubscribeForeground: (() => void) | undefined;
    let unsubscribeTokenRefresh: (() => void) | undefined;

    const showForegroundNotification = async (message: RemoteMessage) => {
      const title = message.notification?.title;
      const body = message.notification?.body;
      if (!title && !body) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: title || "GreenGo",
          body: body || "",
          data: message.data || {},
          sound: "default",
        },
        trigger: null,
      });
    };

    const register = async () => {
      try {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("orders", {
            name: "შეკვეთები",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#3BB54A",
            sound: "default",
          });
        }

        const firebaseMessaging = getMessaging();
        const permission = await requestPermission(firebaseMessaging);
        if (!isPermissionGranted(permission)) {
          console.log("📲 [push] notification permission denied");
          return;
        }

        if (cancelled) return;
        if (Platform.OS === "ios" && !isDeviceRegisteredForRemoteMessages(firebaseMessaging)) {
          await registerDeviceForRemoteMessages(firebaseMessaging);
        }

        const token = await getToken(firebaseMessaging);
        if (cancelled || !token || !userIdRef.current) return;

        setFcmToken(token);
        await apiService.updateUserPushToken(userIdRef.current, {
          fcmToken: token,
          platform: Platform.OS === "ios" ? "ios" : "android",
        });
        console.log("📲 customer FCM token saved");

        unsubscribeForeground = onMessage(
          firebaseMessaging,
          showForegroundNotification,
        );
        unsubscribeTokenRefresh = onTokenRefresh(
          firebaseMessaging,
          async (refreshedToken) => {
            const currentUserId = userIdRef.current;
            if (!currentUserId || cancelled) return;
            setFcmToken(refreshedToken);
            await apiService.updateUserPushToken(currentUserId, {
              fcmToken: refreshedToken,
              platform: Platform.OS === "ios" ? "ios" : "android",
            });
          },
        );
      } catch (error) {
        if (cancelled) return;
        if ((error as { code?: string })?.code === "messaging/registration-timeout") {
          console.warn("📲 [push] APNs registration timed out on a physical device. Check Push Notifications capability, signing profile and network connection.");
          return;
        }
        console.error(
          "📲 [push] FCM registration failed. Check Firebase native config and rebuild:",
          error,
        );
      }
    };

    void register();

    return () => {
      cancelled = true;
      unsubscribeForeground?.();
      unsubscribeTokenRefresh?.();
    };
  }, [enabled, userId]);

  return { fcmToken };
}
