import {
  fieldInput,
  fieldLabel,
  inputWrap,
  inputWrapFocused,
} from "@/constants/formStyles";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

type FormFieldProps = TextInputProps & {
  label: string;
  focused?: boolean;
};

export default function FormField({
  label,
  focused,
  style,
  ...inputProps
}: FormFieldProps) {
  return (
    <View style={styles.wrap}>
      <Text style={fieldLabel}>{label}</Text>
      <View style={[inputWrap, focused && inputWrapFocused]}>
        <TextInput
          style={[fieldInput, styles.input, style]}
          placeholderTextColor="#9CA3AF"
          {...inputProps}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 20,
  },
  input: {
    padding: 0,
    margin: 0,
    minHeight: 20,
  },
});
