import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

export default function MoreMoneyDeductedScreen() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);

  const handleYesPress = () => {
    setIsHelpful(true);
  };

  const handleNoPress = () => {
    setShowFeedback(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>მოსალოდნელზე მეტი თანხა ჩამომეჭრა</Text>

        <Text style={styles.description}>
          თუ თქვენს ანგარიშიდან მოსალოდნელზე მეტი თანხა ჩამოგეჭრათ, გთხოვთ დაუკავშირდით ჩვენს მხარდაჭერის გუნდს თქვენი დადასტურებული ელ.ფოსტის მისამართიდან.
        </Text>

        <Text style={styles.description}>
          გთხოვთ, მიუთითოთ შეკვეთის ნომერი და დეტალური ინფორმაცია თანხის შესახებ, რათა ჩვენ შევძლოთ პრობლემის გადაჭრა რაც შეიძლება სწრაფად.
        </Text>

        {/* Question Section */}
        {!showFeedback ? (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>დაგეხმარათ ეს ინფორმაცია?</Text>

            {/* Action Buttons */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, isHelpful === true && styles.selectedButton]}
                onPress={handleYesPress}
              >
                <Ionicons 
                  name={isHelpful === true ? "checkmark-circle" : "person-outline"} 
                  size={20} 
                  color={isHelpful === true ? "#00C851" : "#333"} 
                />
                <Text style={[styles.buttonText, isHelpful === true && styles.selectedButtonText]}>დიახ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleNoPress}
              >
                <Ionicons name="close-outline" size={20} color="#333" />
                <Text style={styles.buttonText}>არა</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.feedbackContainer}>
            {/* Illustration */}
            <View style={styles.illustrationContainer}>
              <Text style={styles.illustrationEmoji}>🙋</Text>
            </View>

            <Text style={styles.subText}>სამწუხაროა ამის გაგება!</Text>

            {/* Action Buttons */}
            <View style={styles.fullButtonsContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push("/screens/helpContact")}
              >
                <Text style={styles.primaryButtonText}>ჩათი მხარდაჭერ გუნდთან</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setShowFeedback(false)}
              >
                <Text style={styles.secondaryButtonText}>არა, მადლობთ</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={() => router.push("/screens/helpContact")}
        >
          <Text style={styles.contactButtonText}>ჩათი მხარდაჭერ გუნდთან</Text>
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
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
  },
  description: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    marginBottom: 16,
  },
  questionContainer: {
    marginTop: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    gap: 8,
  },
  selectedButton: {
    borderColor: "#00C851",
    backgroundColor: "#E8F5E8",
  },
  buttonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  selectedButtonText: {
    color: "#00C851",
  },
  feedbackContainer: {
    marginTop: 30,
    alignItems: "center",
    marginBottom: 40,
  },
  illustrationContainer: {
    width: 120,
    height: 120,
    backgroundColor: "#F5F5F5",
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  illustrationEmoji: {
    fontSize: 60,
  },
  subText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 24,
  },
  fullButtonsContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#00C851",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  secondaryButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  contactButton: {
    backgroundColor: "#E8F5E8",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  contactButtonText: {
    fontSize: 16,
    color: "#00C851",
    fontWeight: "600",
  },
});

