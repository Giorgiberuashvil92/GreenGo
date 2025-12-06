import { Stack } from "expo-router";
import React from "react";
// import { ActivityIndicator, View } from "react-native";

import AuthGuard from "@/components/AuthGuard";
import { AuthProvider } from "../contexts/AuthContext";
import { CartProvider } from "../contexts/CartContext";
// import { useFonts } from "../hooks/useFonts";

export default function RootLayout() {
  // const fontsLoaded = useFonts();

  // if (!fontsLoaded) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <ActivityIndicator size="large" color="#4CAF50" />
  //     </View>
  //   );
  // }

  // console.log("Fonts loaded:", fontsLoaded);

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
          </Stack>
        </AuthGuard>
      </CartProvider>
    </AuthProvider>
  );
}
