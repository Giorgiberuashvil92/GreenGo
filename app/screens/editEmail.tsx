import FormScreenLayout, {
  PrimaryFooterButton,
} from "@/components/layout/FormScreenLayout";
import FormField from "@/components/ui/FormField";
import { router } from "expo-router";
import React, { useState } from "react";
import { StatusBar } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function EditEmailScreen() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? "");
  const [activeField, setActiveField] = useState<string | null>(null);

  const handleContinue = () => {
    router.back();
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <FormScreenLayout
        title="შეიყვანეთ თქვენი ელ.ფოსტა"
        contentStyle={{ paddingTop: 8 }}
        footer={
          <PrimaryFooterButton label="გაგრძელება" onPress={handleContinue} />
        }
      >
        <FormField
          label="ელ.ფოსტა"
          value={email}
          onChangeText={setEmail}
          onFocus={() => setActiveField("email")}
          onBlur={() => setActiveField(null)}
          focused={activeField === "email"}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </FormScreenLayout>
    </>
  );
}
