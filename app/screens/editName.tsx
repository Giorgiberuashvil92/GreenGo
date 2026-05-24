import FormScreenLayout, {
  PrimaryFooterButton,
} from "@/components/layout/FormScreenLayout";
import FormField from "@/components/ui/FormField";
import { BRAND_GREEN } from "@/constants/colors";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../utils/api";

export default function EditNameScreen() {
  const { user, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [activeField, setActiveField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setInitialLoading(false);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user?.id && !(user as { _id?: string })?._id) {
      Alert.alert("შეცდომა", "მომხმარებლის ინფორმაცია ვერ მოიძებნა");
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("შეცდომა", "გთხოვთ შეიყვანოთ როგორც სახელი, ასევე გვარი");
      return;
    }

    try {
      setLoading(true);
      const userId = user?.id || (user as { _id?: string })?._id;
      const response = await apiService.updateUserProfile(userId!, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`,
      });

      if (response.success && response.data) {
        await refreshUser();
        Alert.alert("წარმატება", "სახელი წარმატებით განახლდა", [
          { text: "კარგი", onPress: () => router.back() },
        ]);
      } else {
        throw new Error(response.error?.details || "განახლება ვერ მოხერხდა");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "სახელის განახლება ვერ მოხერხდა. გთხოვთ სცადოთ მოგვიანებით";
      Alert.alert("შეცდომა", message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingWrap}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={BRAND_GREEN} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <FormScreenLayout
        title="მომხმარებლის სახელი"
        contentStyle={styles.content}
        footer={
          <PrimaryFooterButton
            label="დადასტურება"
            onPress={handleSave}
            loading={loading}
          />
        }
      >
        <FormField
          label="სახელი"
          value={firstName}
          onChangeText={setFirstName}
          onFocus={() => setActiveField("firstName")}
          onBlur={() => setActiveField(null)}
          focused={activeField === "firstName"}
          editable={!loading}
          autoCapitalize="words"
        />
        <FormField
          label="გვარი"
          value={lastName}
          onChangeText={setLastName}
          onFocus={() => setActiveField("lastName")}
          onBlur={() => setActiveField(null)}
          focused={activeField === "lastName"}
          editable={!loading}
          autoCapitalize="words"
        />
      </FormScreenLayout>
    </>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingTop: 16,
    alignItems: "stretch",
  },
});
