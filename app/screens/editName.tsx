import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
    if (!user?.id && !(user as any)?._id) {
      Alert.alert("შეცდომა", "მომხმარებლის ინფორმაცია ვერ მოიძებნა");
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("შეცდომა", "გთხოვთ შეიყვანოთ როგორც სახელი, ასევე გვარი");
      return;
    }

    try {
      setLoading(true);
      const userId = user?.id || (user as any)?._id;
      const response = await apiService.updateUserProfile(userId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`,
      });

      if (response.success && response.data) {
        await refreshUser();
        Alert.alert("წარმატება", "სახელი წარმატებით განახლდა", [
          {
            text: "კარგი",
            onPress: () => router.back(),
          },
        ]);
      } else {
        throw new Error(response.error?.details || "განახლება ვერ მოხერხდა");
      }
    } catch (error: any) {
      console.error("Error updating name:", error);
      Alert.alert(
        "შეცდომა",
        error.message || "სახელის განახლება ვერ მოხერხდა. გთხოვთ სცადოთ მოგვიანებით"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFieldFocus = (field: string) => {
    setActiveField(field);
  };

  const handleFieldBlur = () => {
    setActiveField(null);
  };

  if (initialLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00C851" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>მომხმარებლის სახელი</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* First Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>სახელი</Text>
          <TextInput
            style={[
              styles.input,
              activeField === "firstName" && styles.inputFocused,
            ]}
            value={firstName}
            onChangeText={setFirstName}
            onFocus={() => handleFieldFocus("firstName")}
            onBlur={handleFieldBlur}
            placeholder="შეიყვანეთ სახელი"
            placeholderTextColor="#999"
            editable={!loading}
          />
        </View>

        {/* Last Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>გვარი</Text>
          <TextInput
            style={[
              styles.input,
              activeField === "lastName" && styles.inputFocused,
            ]}
            value={lastName}
            onChangeText={setLastName}
            onFocus={() => handleFieldFocus("lastName")}
            onBlur={handleFieldBlur}
            placeholder="შეიყვანეთ გვარი"
            placeholderTextColor="#999"
            editable={!loading}
          />
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>დადასტურება</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#333",
    borderWidth: 2,
    borderColor: "transparent",
  },
  inputFocused: {
    backgroundColor: "#FFFFFF",
    borderColor: "#00C851",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
  },
  saveButton: {
    backgroundColor: "#00C851",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
