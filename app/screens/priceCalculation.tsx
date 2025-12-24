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

export default function PriceCalculationScreen() {
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);

  const handleYesPress = () => {
    setIsHelpful(true);
  };

  const handleNoPress = () => {
    setIsHelpful(false);
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
        <Text style={styles.title}>ფასის გამოთვლა</Text>

        <Text style={styles.description}>
          აპლიკაციაში შეკვეთისთვის ხელმისაწვდომი ყველა პროდუქტის ფასი არის ინდივიდუალური. შეკვეთის დადასტურებამდე შესაძლებლობა გექნებათ, რომ გადახედოთ კალათას და იხილოთ არჩეული ერთეულების ჯამური ღირებულება.
        </Text>

        <Text style={styles.description}>
          ჯამურ ღირებულებას შეიძლება დაემატოს შემდეგი გადასახადები:
        </Text>

        <Text style={styles.sectionTitle}>მიტანის საფასური</Text>
        <Text style={styles.description}>
          თქვენი გეოგრაფიული მდებარეობიდან გამომდინარე გამოითვლება მიტანის საფასური და ემატება შეკვეთის ჯამურ ღირებულებას.
        </Text>

        <Text style={styles.sectionTitle}>მცირე შეკვეთის საფასური</Text>
        <Text style={styles.description}>
          შეკვეთის დადასტურებამდე, კალათაში მითითებულია შეკვეთის მინიმალური ღირებულება. თუ თქვენს მიერ არჩეული პროდუქტების ჯამური ღირებულება მინიმალურზე ნაკლებია, სხვაობის გადახდა მცირე შეკვეთის საფასურის სახით მოგიწევთ.
        </Text>

        <Text style={styles.sectionTitle}>შენიშვნა:</Text>
        <Text style={styles.description}>
          აპლიკაციაში მითითებული ფასები შეიძლება იყოს რესტორნებში არსებული ფასებისგან განსხვავებული. გაითვალისწინეთ, რომ ამას შესაძლოა გავლენა მოახდინოს რესტორანის პოლიტიკამ ან სპეციალური შეთავაზებებმა.
        </Text>

        {/* Question Section */}
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
              style={[styles.actionButton, isHelpful === false && styles.selectedButton]}
              onPress={handleNoPress}
            >
              <Ionicons 
                name={isHelpful === false ? "checkmark-circle" : "close-outline"} 
                size={20} 
                color={isHelpful === false ? "#00C851" : "#333"} 
              />
              <Text style={[styles.buttonText, isHelpful === false && styles.selectedButtonText]}>არა</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginTop: 8,
    marginBottom: 8,
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

