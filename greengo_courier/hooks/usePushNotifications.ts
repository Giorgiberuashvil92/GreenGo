import Constants from 'expo-constants';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { apiService } from '../utils/api';

type NotificationsModule = typeof import('expo-notifications');

function loadNotifications(): NotificationsModule | null {
  const native = requireOptionalNativeModule('ExpoPushTokenManager');
  console.log(
    '📲 [push] ExpoPushTokenManager:',
    native ? 'FOUND' : 'MISSING',
  );
  if (!native) {
    console.log(
      '📲 [push] STOP — native module missing. Run: cd ios && pod install && npx expo run:ios --device',
    );
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-notifications') as NotificationsModule;
  } catch (error) {
    console.log('📲 [push] STOP — require(expo-notifications) failed:', error);
    return null;
  }
}

interface UsePushNotificationsProps {
  courierId: string | null;
  enabled?: boolean;
}

export function usePushNotifications({
  courierId,
  enabled = true,
}: UsePushNotificationsProps) {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const listenersRef = useRef<Array<{ remove: () => void }>>([]);

  useEffect(() => {
    console.log('📲 [push] effect start', {
      enabled,
      courierId,
      platform: Platform.OS,
      isDevice: Constants.isDevice,
    });

    if (!enabled || !courierId) {
      console.log('📲 [push] STOP — waiting for courierId/enabled');
      return;
    }

    let cancelled = false;

    const run = async () => {
      const Notifications = loadNotifications();
      if (!Notifications) return;

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
      } catch (error) {
        console.log('📲 [push] STOP — setNotificationHandler failed:', error);
        return;
      }

      try {
        // Only skip when we know it's a simulator. undefined = try anyway
        // (Constants.isDevice can be undefined on newer Expo).
        if (Constants.isDevice === false) {
          console.log(
            '📲 [push] STOP — simulator. Use physical device for fcmToken',
          );
          return;
        }

        console.log('📲 [push] requesting permissions...');
        const existing = await Notifications.getPermissionsAsync();
        const existingLegacy = existing as {
          granted?: boolean;
          status?: string;
        };
        console.log('📲 [push] current permission:', existingLegacy);

        let allowed =
          existingLegacy.granted === true || existingLegacy.status === 'granted';

        if (!allowed) {
          const requested = await Notifications.requestPermissionsAsync();
          const requestedLegacy = requested as {
            granted?: boolean;
            status?: string;
          };
          console.log('📲 [push] after request:', requestedLegacy);
          allowed =
            requestedLegacy.granted === true ||
            requestedLegacy.status === 'granted';
        }

        if (!allowed) {
          console.log('📲 [push] STOP — permission denied');
          return;
        }

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('orders', {
            name: 'შეკვეთები',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#4CAF50',
            sound: 'default',
          });
        }

        console.log('📲 [push] fetching device token...');
        const { data } = await Notifications.getDevicePushTokenAsync();
        const token = typeof data === 'string' ? data : String(data);
        if (cancelled || !token) {
          console.log('📲 [push] STOP — empty token', { cancelled, data });
          return;
        }

        setFcmToken(token);
        console.log('📲 courier fcmToken =', token);
        console.log('📲 courierId =', courierId, '| platform =', Platform.OS);

        await apiService.updateCourierPushToken(courierId, {
          fcmToken: token,
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
        });
        console.log('📲 fcmToken sent to backend');
      } catch (error) {
        console.log('📲 [push] STOP — registration error:', error);
      }

      try {
        listenersRef.current = [
          Notifications.addNotificationReceivedListener((notification) => {
            console.log('📲 [push] received:', notification.request.content);
          }),
          Notifications.addNotificationResponseReceivedListener((response) => {
            console.log(
              '📲 [push] tapped:',
              response.notification.request.content,
            );
          }),
        ];
      } catch (error) {
        console.log('📲 [push] listeners failed:', error);
      }
    };

    run();

    return () => {
      cancelled = true;
      listenersRef.current.forEach((l) => l.remove());
      listenersRef.current = [];
    };
  }, [courierId, enabled]);

  return { fcmToken };
}
