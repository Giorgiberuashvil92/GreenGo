import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        title: "",
      }}
    >
      <Stack.Screen
        name="home"
        options={{
          title: "",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: "შეტყობინებები",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="finances"
        options={{
          title: "ფინანსები",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: "პროფილი",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="earn-more"
        options={{
          title: "გამოიმუშავე მეტი",
          headerShown: false,
        }}
      />
      
    </Stack>
  );
}

