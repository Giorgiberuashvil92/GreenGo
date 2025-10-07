import { Stack } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

import AuthGuard from "@/components/AuthGuard";
import { AuthProvider } from "../contexts/AuthContext";
import { useFonts } from "../hooks/useFonts";

export default function RootLayout() {
  const fontsLoaded = useFonts();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <AuthGuard>
        <Stack>
          <Stack.Screen
            name="screens/login"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="screens/verification"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="screens/food"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="screens/restaurant"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="screens/product"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </AuthGuard>
    </AuthProvider>
  );
}
