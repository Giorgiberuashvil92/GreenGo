import { BRAND_GREEN } from "@/constants/colors";
import { fontFamily } from "@/constants/fonts";
import { useDeliveryAddress } from "@/hooks/useDeliveryAddress";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

function LocationPinIcon() {
  return (
    <Svg width={36} height={36} viewBox="0 0 36 36" fill="none">
      <Rect width={36} height={36} rx={18} fill="#F5F5F5" />
      <Path
        d="M15.5967 19.8225C12.635 20.2125 10.5 21.3 10.5 22.5833C10.5 24.1942 13.8575 25.5 18 25.5C22.1425 25.5 25.5 24.1942 25.5 22.5833C25.5 21.3 23.365 20.2125 20.4033 19.8225"
        stroke={BRAND_GREEN}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M23 14.5276C23 11.8434 20.7617 9.66675 18 9.66675C15.2383 9.66675 13 11.8434 13 14.5276C13 18.1734 18 22.1667 18 22.1667C18 22.1667 23 18.1734 23 14.5276Z"
        stroke={BRAND_GREEN}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M19.1786 13.4882C19.8294 14.139 19.8294 15.1943 19.1786 15.8452C18.5277 16.4961 17.4724 16.4961 16.8215 15.8452C16.1707 15.1943 16.1707 14.139 16.8215 13.4882C17.4724 12.8373 18.5277 12.8373 19.1786 13.4882"
        stroke={BRAND_GREEN}
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

type HeaderProps = {
  /** სქროლისას სტიკი ჰედერი — ცენტრში მისამართი + chevron */
  variant?: "default" | "compact";
};

export default function Header({ variant = "default" }: HeaderProps) {
  const { address, loading } = useDeliveryAddress();

  const streetLine = loading
    ? "მდებარეობის განსაზღვრა..."
    : address?.street?.trim() || "შეიყვანეთ მისამართი";

  const cityLine = loading
    ? ""
    : address?.street?.trim()
      ? address.district?.trim() || address.city?.trim() || ""
      : "";

  if (variant === "compact") {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={() => router.push("/screens/locations")}
        activeOpacity={0.7}
      >
        <View style={styles.compactStreetRow}>
          <Text style={styles.compactStreet} numberOfLines={1}>
            {streetLine}
          </Text>
          {loading ? (
            <ActivityIndicator size="small" color={BRAND_GREEN} />
          ) : (
            <Ionicons name="chevron-down" size={16} color="#181B1A" />
          )}
        </View>
        {cityLine ? (
          <Text style={styles.compactCity} numberOfLines={1}>
            {cityLine}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.locationContainer}
        onPress={() => router.push("/screens/locations")}
        activeOpacity={0.7}
      >
        <LocationPinIcon />
        <View style={styles.locationTextContainer}>
          <View style={styles.streetRow}>
            <Text style={styles.streetText} numberOfLines={1}>
              {streetLine}
            </Text>
            {loading ? (
              <ActivityIndicator
                size="small"
                color={BRAND_GREEN}
                style={styles.loader}
              />
            ) : null}
          </View>
          {cityLine ? (
            <Text style={styles.cityText} numberOfLines={1}>
              {cityLine}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: "#FFFFFF",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  streetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  streetText: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: "#181B1A",
  },
  loader: {
    marginRight: 4,
  },
  cityText: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: "#9E9E9E",
    marginTop: 2,
  },
  compactContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  compactStreetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    maxWidth: "90%",
  },
  compactStreet: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: "#181B1A",
    textAlign: "center",
  },
  compactCity: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: fontFamily.regular,
    color: "#9E9E9E",
    textAlign: "center",
  },
});
