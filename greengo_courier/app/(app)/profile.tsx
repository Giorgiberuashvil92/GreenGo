import { uploadImageToCloudinary } from "@/utils/cloudinary";
import {
  getCourierDisplayName,
  normalizeCourierFromResponse,
} from "@/utils/courier";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/colors";
import { Dimensions as Dims } from "../../constants/dimensions";
import { useCourierAuth } from "../../hooks/useCourierAuth";
import { apiService } from "../../utils/api";

type FocusField = "firstName" | "lastName" | "phone" | "email" | null;

export default function ProfileScreen() {
  const router = useRouter();
  const { courierId, isLoading: authLoading } = useCourierAuth();
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<FocusField>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+995");

  const fetchCourierData = useCallback(async () => {
    if (!courierId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.getCourier(courierId);
      const courier = normalizeCourierFromResponse(response.data);

      if (response.success && courier) {
        const displayName = getCourierDisplayName(courier.name);
        if (displayName) {
          const nameParts = displayName.split(" ");
          setFirstName(nameParts[0] || "");
          setLastName(nameParts.slice(1).join(" ") || "");
        }

        setPhone(formatPhoneNumber(courier.phone || ""));
        setEmail(courier.email || "");
        setCountryCode(courier.countryCode || "+995");

        if (courier.profileImage) {
          setProfileImage(courier.profileImage);
        }
      }
    } catch (error) {
      console.error("Error fetching courier data:", error);
    } finally {
      setLoading(false);
    }
  }, [courierId]);

  useEffect(() => {
    if (authLoading) return;

    if (!courierId) {
      setLoading(false);
      return;
    }

    fetchCourierData();
  }, [authLoading, courierId, fetchCourierData]);

  const handleChangePhoto = async () => {
    try {
      const ImagePicker = await import("expo-image-picker");
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("წვდომა უარყოფილია", "გთხოვთ, მიანიჭოთ წვდომა ფოტოებზე");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const imageUri = result.assets[0].uri;
      setUploadingImage(true);

      try {
        const publicId = courierId ? `courier_${courierId}_profile` : undefined;
        const uploadedUrl = await uploadImageToCloudinary(imageUri, publicId);
        setProfileImage(uploadedUrl);
        Alert.alert("წარმატება", "ფოტო წარმატებით ატვირთა");
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);
        Alert.alert("შეცდომა", "ფოტოს ატვირთვა ვერ მოხერხდა");
      } finally {
        setUploadingImage(false);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("შეცდომა", "ფოტოს არჩევა ვერ მოხერხდა");
      setUploadingImage(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "ანგარიშის წაშლა",
      "დარწმუნებული ხართ, რომ გსურთ ანგარიშის წაშლა? ეს მოქმედება შეუქცევადია.",
      [
        { text: "გაუქმება", style: "cancel" },
        {
          text: "წაშლა",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "შეტყობინება",
              "ანგარიშის წაშლის ფუნქცია მალე დაემატება",
            );
          },
        },
      ],
    );
  };

  function formatPhoneNumber(text: string) {
    const digits = text.replace(/\D/g, "").slice(0, 9);

    if (digits.length <= 3) return digits;
    if (digits.length <= 5) {
      return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    }
    if (digits.length <= 7) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
    }
    return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
  }

  const fieldStyle = (field: FocusField) => [
    styles.field,
    focusedField === field && styles.fieldFocused,
  ];

  if (authLoading || loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ჩემი პროფილი</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ჩემი პროფილი</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              {uploadingImage ? (
                <View style={styles.profileImagePlaceholder}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
              ) : profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Ionicons name="person" size={60} color={Colors.gray.medium} />
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={handleChangePhoto}
              disabled={uploadingImage}
            >
              <Text
                style={[
                  styles.changePhotoText,
                  uploadingImage && styles.changePhotoTextDisabled,
                ]}
              >
                {uploadingImage
                  ? "იტვირთება..."
                  : "შეცვალე ფოტო ან ავატარი"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>პირადი ინფორმაცია</Text>

          <View style={fieldStyle("firstName")}>
            <Text style={styles.floatingLabel}>სახელი</Text>
            <TextInput
              style={styles.fieldInput}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="სახელი"
              placeholderTextColor={Colors.gray.medium}
              onFocus={() => setFocusedField("firstName")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View style={fieldStyle("lastName")}>
            <Text style={styles.floatingLabel}>გვარი</Text>
            <TextInput
              style={styles.fieldInput}
              value={lastName}
              onChangeText={setLastName}
              placeholder="გვარი"
              placeholderTextColor={Colors.gray.medium}
              onFocus={() => setFocusedField("lastName")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.floatingLabel}>ქვეყანა</Text>
            <View style={styles.countryContent}>
              <Text style={styles.countryFlag}>🇬🇪</Text>
              <Text style={styles.countryCode}>{countryCode}</Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={Colors.gray.medium}
              />
            </View>
          </View>

          <View style={fieldStyle("phone")}>
            <Text style={styles.floatingLabel}>ნომერი</Text>
            <TextInput
              style={styles.fieldInput}
              value={phone}
              onChangeText={(text) => setPhone(formatPhoneNumber(text))}
              placeholder="123 12 12 12"
              placeholderTextColor={Colors.gray.medium}
              keyboardType="phone-pad"
              maxLength={13}
              onFocus={() => setFocusedField("phone")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View style={fieldStyle("email")}>
            <Text style={styles.floatingLabel}>ელ.ფოსტა</Text>
            <TextInput
              style={styles.fieldInput}
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              placeholderTextColor={Colors.gray.medium}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteButtonText}>ანგარიშის წაშლა</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.error} />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingHorizontal: Dims.padding.large,
    paddingTop: Platform.OS === "ios" ? 4 : Dims.padding.medium,
    paddingBottom: Dims.padding.small,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: Dims.padding.small,
    marginBottom: Dims.padding.small,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.black,
    letterSpacing: -0.4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Dims.padding.large,
    paddingBottom: Dims.padding.large * 2,
  },
  profileSection: {
    alignItems: "center",
    marginTop: Dims.padding.medium,
    marginBottom: Dims.padding.large * 1.5,
  },
  profileImageContainer: {
    marginBottom: Dims.padding.medium,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.gray.light,
    justifyContent: "center",
    alignItems: "center",
  },
  changePhotoText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: "500",
  },
  changePhotoTextDisabled: {
    color: Colors.gray.medium,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: Dims.padding.large,
  },
  field: {
    backgroundColor: Colors.gray.light,
    borderRadius: Dims.borderRadius.medium,
    paddingHorizontal: Dims.padding.medium,
    paddingTop: 8,
    paddingBottom: 10,
    marginBottom: Dims.padding.medium,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  fieldFocused: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
  },
  floatingLabel: {
    fontSize: 12,
    color: Colors.gray.medium,
    marginBottom: 2,
  },
  fieldInput: {
    fontSize: 16,
    color: Colors.black,
    padding: 0,
    margin: 0,
    minHeight: 24,
  },
  countryContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 24,
  },
  countryFlag: {
    fontSize: 18,
  },
  countryCode: {
    fontSize: 16,
    color: Colors.black,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: Dims.borderRadius.medium,
    paddingVertical: 16,
    paddingHorizontal: Dims.padding.medium,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Dims.padding.large,
  },
  deleteButtonText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: "600",
  },
});
