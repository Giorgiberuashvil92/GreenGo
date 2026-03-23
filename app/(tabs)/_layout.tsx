import { fontFamily } from "@/constants/fonts";
import { Tabs } from "expo-router";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  TabHomeIcon,
  TabOrdersIcon,
  TabProfileIcon,
  TabRestaurantIcon,
  TabSearchIcon,
} from "../../components/icons/TabBarIcons";

const TAB_ACTIVE = "#003E20";
const TAB_INACTIVE = "#9B9B9B";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: TAB_ACTIVE,
        tabBarInactiveTintColor: TAB_INACTIVE,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E0E0E0",
          paddingTop: 8,
          paddingBottom: insets.bottom,
          height: 56 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: fontFamily.regular,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "სახლი",
          tabBarIcon: ({ color }) => (
            <TabHomeIcon color={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="restaurants"
        options={{
          title: "რესტორნები",
          tabBarIcon: ({ color }) => (
            <TabRestaurantIcon color={color} size={22} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "ძიება",
          tabBarIcon: ({ color }) => <TabSearchIcon color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "შეკვეთები",
          tabBarIcon: ({ color }) => <TabOrdersIcon color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "ანგარიში",
          tabBarIcon: ({ color }) => (
            <TabProfileIcon color={color} size={22} />
          ),
        }}
      />
    </Tabs>
  );
}
