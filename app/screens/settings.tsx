import ListScreenLayout from "@/components/layout/ListScreenLayout";
import { DESTRUCTIVE, listRow, listRowText } from "@/constants/formStyles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SettingsScreen() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <ListScreenLayout title="პარამეტრები">
        <View style={styles.list}>
          <TouchableOpacity
            style={listRow}
            onPress={() => router.push("/screens/notificationsSettings")}
          >
            <Text style={listRowText}>მარკეტინგული შეტყობინებები</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={listRow}
            onPress={() => router.push("/screens/deleteAccount")}
          >
            <Text style={[listRowText, styles.destructive]}>
              ანგარიშის წაშლა
            </Text>
            <Ionicons name="chevron-forward" size={20} color={DESTRUCTIVE} />
          </TouchableOpacity>
        </View>
      </ListScreenLayout>
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: 8,
  },
  destructive: {
    color: DESTRUCTIVE,
  },
});
