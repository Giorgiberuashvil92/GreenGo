import { BRAND_GREEN } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
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

export default function Header() {
  return (
    <View style={styles.container}>
      <View style={styles.locationContainer}>
        <LocationPinIcon />
        <View style={styles.locationTextContainer}>
          <Text style={styles.streetText}>4 შანიძის ქუჩა</Text>
          <Text style={styles.cityText}>წყალტუბო</Text>
        </View>
      </View>
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
  },
  streetText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#181B1A",
  },
  cityText: {
    fontSize: 14,
    color: "#9E9E9E",
    marginTop: 2,
  },

  cartButton: {
    padding: 8,
  },
});
