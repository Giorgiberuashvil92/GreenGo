import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DeletionReason {
  id: string;
  text: string;
}

const deletionReasons: DeletionReason[] = [
  { id: "no_use", text: "აღარ ვიყენებ Greendo-ს" },
  { id: "expensive", text: "ძვირი სერვისი" },
  { id: "not_satisfied", text: "არ ვარ კმაყოფილი" },
  { id: "no_reason", text: "მიზეზის გარეშე" },
];

export default function DeleteAccountScreen() {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [reasonText, setReasonText] = useState<string>("აირჩიეთ მიზეზი");
  const [showReasonModal, setShowReasonModal] = useState<boolean>(false);

  const handleDeleteAccount = () => {
    if (!selectedReason) {
      Alert.alert("შეცდომა", "გთხოვთ აირჩიოთ წაშლის მიზეზი");
      return;
    }

    Alert.alert(
      "ანგარიშის წაშლა",
      "ნამდვილად გსურთ ანგარიშის წაშლა? ეს მოქმედება შეუქცევადია.",
      [
        {
          text: "გაუქმება",
          style: "cancel",
        },
        {
          text: "წაშლა",
          style: "destructive",
          onPress: () => {
            // Here you would typically delete the account
            console.log("Account deleted with reason:", selectedReason);
            router.replace("/screens/login");
          },
        },
      ]
    );
  };

  const handleReasonSelect = (reason: DeletionReason) => {
    setSelectedReason(reason.id);
    setReasonText(reason.text);
    setShowReasonModal(false);
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
        <Text style={styles.headerTitle}>ანგარიშის წაშლა</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.message}>
          dato, ძალიან ვწუხვართ, რომ მიდიხართ. ნამდვილად გსურთ ანგარიშის წაშლა?
        </Text>

        <View style={styles.reasonContainer}>
          <Text style={styles.reasonLabel}>აირჩიეთ მიზეზი</Text>
          <TouchableOpacity
            style={styles.reasonInput}
            onPress={() => setShowReasonModal(true)}
          >
            <Text style={styles.reasonText}>{reasonText}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Delete Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteButtonText}>ანგარიშის წაშლა</Text>
        </TouchableOpacity>
      </View>

      {/* Reason Selection Modal */}
      <Modal
        visible={showReasonModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReasonModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ვწუხვართ, რომ მიდიხართ!</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowReasonModal(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>გვითხარით წასვლის მიზეზი</Text>

            <View style={styles.reasonsList}>
              {deletionReasons.map((reason) => (
                <TouchableOpacity
                  key={reason.id}
                  style={styles.reasonItem}
                  onPress={() => handleReasonSelect(reason)}
                >
                  <Text style={styles.reasonItemText}>{reason.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  message: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 30,
  },
  reasonContainer: {
    marginBottom: 20,
  },
  reasonLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },
  reasonInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  reasonText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  deleteButton: {
    backgroundColor: "#FF4444",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  reasonsList: {
    gap: 12,
  },
  reasonItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
  },
  reasonItemText: {
    fontSize: 16,
    color: "#333",
  },
});
