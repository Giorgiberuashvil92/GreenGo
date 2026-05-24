import FormScreenLayout, {
  PrimaryFooterButton,
} from "@/components/layout/FormScreenLayout";
import { fieldInput, inputWrap as formInputWrap } from "@/constants/formStyles";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Alert, StatusBar, StyleSheet, TextInput, View } from "react-native";

const promoIllustration = require("@/assets/images/promo-codes-illustration.png");

export default function PromoCodesScreen() {
  const [promoCode, setPromoCode] = useState("");

  const handleActivate = () => {
    if (!promoCode.trim()) {
      Alert.alert("შეცდომა", "გთხოვთ შეიყვანოთ პრომო კოდი");
      return;
    }
    Alert.alert("წარმატება", "პრომო კოდი წარმატებით გააქტიურდა!");
    setPromoCode("");
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <FormScreenLayout
        title="პრომო კოდები"
        contentStyle={styles.content}
        keyboardAvoiding={false}
        footer={
          <PrimaryFooterButton label="გააქტიურება" onPress={handleActivate} />
        }
      >
        <Image
          source={promoIllustration}
          style={styles.illustration}
          contentFit="contain"
          accessibilityLabel="პრომო კოდები"
        />
        <View style={formInputWrap}>
          <TextInput
            style={[fieldInput, styles.input]}
            value={promoCode}
            onChangeText={setPromoCode}
            placeholder="პრომო კოდი"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
            textAlign="center"
          />
        </View>
      </FormScreenLayout>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    alignItems: "stretch",
  },
  illustration: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginBottom: 32,
  },
  input: {
    textAlign: "center",
  },
});
