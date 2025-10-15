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

interface Country {
  code: string;
  name: string;
  flag: string;
  phoneCode: string;
}

const countries: Country[] = [
  { code: "GE", name: "საქართველო", flag: "🇬🇪", phoneCode: "+995" },
  { code: "UA", name: "უკრაინა", flag: "🇺🇦", phoneCode: "+380" },
  { code: "DE", name: "გერმანია", flag: "🇩🇪", phoneCode: "+49" },
  { code: "IL", name: "ისრაელი", flag: "🇮🇱", phoneCode: "+972" },
  { code: "DK", name: "დანია", flag: "🇩🇰", phoneCode: "+45" },
  { code: "BE", name: "ბელგია", flag: "🇧🇪", phoneCode: "+32" },
  { code: "IE", name: "ირლანდია", flag: "🇮🇪", phoneCode: "+353" },
  { code: "MT", name: "მალტა", flag: "🇲🇹", phoneCode: "+356" },
  { code: "SM", name: "სან მარინო", flag: "🇸🇲", phoneCode: "+378" },
  {
    code: "US",
    name: "ამერიკის შეერთებული შტატები",
    flag: "🇺🇸",
    phoneCode: "+1",
  },
  { code: "GB", name: "გაერთიანებული სამეფო", flag: "🇬🇧", phoneCode: "+44" },
  { code: "FR", name: "საფრანგეთი", flag: "🇫🇷", phoneCode: "+33" },
  { code: "IT", name: "იტალია", flag: "🇮🇹", phoneCode: "+39" },
  { code: "ES", name: "ესპანეთი", flag: "🇪🇸", phoneCode: "+34" },
  { code: "RU", name: "რუსეთი", flag: "🇷🇺", phoneCode: "+7" },
  { code: "TR", name: "თურქეთი", flag: "🇹🇷", phoneCode: "+90" },
  { code: "CN", name: "ჩინეთი", flag: "🇨🇳", phoneCode: "+86" },
  { code: "JP", name: "იაპონია", flag: "🇯🇵", phoneCode: "+81" },
  { code: "KR", name: "კორეა", flag: "🇰🇷", phoneCode: "+82" },
  { code: "IN", name: "ინდოეთი", flag: "🇮🇳", phoneCode: "+91" },
];

export default function SelectCountryScreen() {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    // Here you would typically save the selected country
    console.log("Selected country:", country);
    router.back();
  };

  const renderCountry = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => handleCountrySelect(item)}
    >
      <View style={styles.flagContainer}>
        <Text style={styles.flag}>{item.flag}</Text>
      </View>
      <Text style={styles.countryName}>{item.name}</Text>
      {selectedCountry?.code === item.code && (
        <Ionicons name="checkmark" size={20} color="#00C851" />
      )}
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
        <Text style={styles.headerTitle}>ქვეყანა</Text>
      </View>

      {/* Countries List */}
      <FlatList
        data={countries}
        renderItem={renderCountry}
        keyExtractor={(item) => item.code}
        style={styles.countriesList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.countriesListContent}
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  countriesList: {
    flex: 1,
  },
  countriesListContent: {
    paddingTop: 20,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  flagContainer: {
    width: 30,
    alignItems: "center",
  },
  flag: {
    fontSize: 20,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 16,
  },
});
