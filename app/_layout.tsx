import { Stack } from "expo-router";
import React from "react";

import AuthGuard from "@/components/AuthGuard";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
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
        </Stack>
      </AuthGuard>
    </AuthProvider>
  );
}
