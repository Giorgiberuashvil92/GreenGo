import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { useCourierAuth } from "../hooks/useCourierAuth";
import {
  configureCrisp,
  identifyCrispUser,
  resetCrispSession,
} from "../utils/crisp";

SplashScreen.preventAutoHideAsync().catch(() => {});

function CrispBootstrap() {
  const { courierId, phoneNumber, isLoading } = useCourierAuth();

  useEffect(() => {
    configureCrisp();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (courierId) {
      identifyCrispUser({
        id: courierId,
        phoneNumber,
      });
    } else {
      resetCrispSession();
    }
  }, [courierId, phoneNumber, isLoading]);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <CrispBootstrap />
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
