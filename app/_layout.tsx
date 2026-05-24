import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";

import AuthGuard from "@/components/AuthGuard";
import { AuthProvider } from "../contexts/AuthContext";
import { CartProvider } from "../contexts/CartContext";
import { useAppFonts } from "../hooks/useFonts";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useAppFonts();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <CartProvider>
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
            <Stack.Screen
              name="screens/registration"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="screens/orderHistory"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="screens/editName"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="screens/editPhone"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="screens/editEmail"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="screens/phoneUpdateSuccess"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="screens/selectCountry"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="screens/promoCodes"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="screens/settings"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="screens/languageSelection"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="screens/notificationsSettings"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="screens/deleteAccount"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="screens/paymentMethods"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="screens/addCard"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="screens/restaurantDetails"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="screens/search"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="screens/checkout"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="screens/orderSuccess"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="screens/selectAddress"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="screens/locations"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="screens/addAddress"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="screens/orderTracking"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="screens/orderDetails"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
        </AuthGuard>
      </CartProvider>
    </AuthProvider>
  );
}
