import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditNameScreen() {
  const [firstName, setFirstName] = useState("Dato");
  const [lastName, setLastName] = useState("Avaliani");
  const [activeField, setActiveField] = useState<string | null>(null);

  const handleSave = () => {
    // Here you would typically save the data to your state management or API
    console.log("Saving:", { firstName, lastName });
    router.back();
  };

  const handleFieldFocus = (field: string) => {
    setActiveField(field);
  };

  const handleFieldBlur = () => {
    setActiveField(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
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
          />
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>დადასტურება</Text>
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
});
