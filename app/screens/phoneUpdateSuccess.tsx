import { router } from "expo-router";
import React from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PhoneUpdateSuccessScreen() {
  const handleContinue = () => {
    // Navigate back to profile screen
    router.replace("/(tabs)/profile");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Content */}
      <View style={styles.content}>
        {/* Success Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustrationBackground}>
            <View style={styles.personContainer}>
              <View style={styles.personBody}>
                <View style={styles.shirt} />
                <View style={styles.pants} />
              </View>
              <View style={styles.phoneContainer}>
                <View style={styles.phone} />
              </View>
            </View>
          </View>
        </View>

        {/* Success Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.successMessage}>
            მობილური ნომერი წარმატებით განახლდა
          </Text>
        </View>
      </View>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>გაგრძელება</Text>
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  illustrationContainer: {
    marginBottom: 40,
  },
  illustrationBackground: {
    width: 200,
    height: 200,
    backgroundColor: "#E3F2FD",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  personContainer: {
    alignItems: "center",
    position: "relative",
  },
  personBody: {
    alignItems: "center",
  },
  shirt: {
    width: 40,
    height: 35,
    backgroundColor: "#64B5F6",
    borderRadius: 8,
    marginBottom: 2,
  },
  pants: {
    width: 35,
    height: 25,
    backgroundColor: "#424242",
    borderRadius: 4,
  },
  phoneContainer: {
    position: "absolute",
    left: -15,
    top: 10,
  },
  phone: {
    width: 20,
    height: 30,
    backgroundColor: "#1976D2",
    borderRadius: 3,
  },
  messageContainer: {
    alignItems: "center",
  },
  successMessage: {
    fontSize: 20,
    fontWeight: "600",
    color: "#00C851",
    textAlign: "center",
    lineHeight: 28,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: "#00C851",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
