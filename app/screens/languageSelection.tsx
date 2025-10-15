import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: "ka", name: "Georgian", nativeName: "ქართული" },
  { code: "en", name: "English", nativeName: "English" },
  { code: "et", name: "Estonian", nativeName: "Eesti" },
  { code: "az", name: "Azerbaijani", nativeName: "Azarbaycanca" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "lv", name: "Latvian", nativeName: "Latviesu" },
  { code: "lt", name: "Lithuanian", nativeName: "Lietuviu" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar" },
  { code: "pt", name: "Portuguese", nativeName: "Portoguese" },
  { code: "ro", name: "Romanian", nativeName: "Romana" },
];

export default function LanguageSelectionScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("ka");

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    // Here you would typically save the selected language
    console.log("Selected language:", languageCode);
    router.back();
  };

  const renderLanguage = ({ item }: { item: Language }) => (
    <TouchableOpacity
      style={styles.languageItem}
      onPress={() => handleLanguageSelect(item.code)}
    >
      <View style={styles.languageInfo}>
        <Text style={styles.languageName}>{item.nativeName}</Text>
        <Text style={styles.languageEnglish}>{item.name}</Text>
      </View>
      <View style={styles.radioContainer}>
        {selectedLanguage === item.code && (
          <View style={styles.radioSelected} />
        )}
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>ენა</Text>
      </View>

      {/* Languages List */}
      <FlatList
        data={languages}
        renderItem={renderLanguage}
        keyExtractor={(item) => item.code}
        style={styles.languagesList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.languagesListContent}
      />
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
  languagesList: {
    flex: 1,
  },
  languagesListContent: {
    paddingTop: 20,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    color: "#333",
    marginBottom: 2,
  },
  languageEnglish: {
    fontSize: 14,
    color: "#666",
  },
  radioContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#00C851",
  },
});
