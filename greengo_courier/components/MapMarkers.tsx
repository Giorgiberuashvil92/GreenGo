import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Marker } from "react-native-maps";
import { Colors } from "../constants/colors";
import { Dimensions as Dims } from "../constants/dimensions";
import { Location } from "../types";

interface MapMarkersProps {
  driverLocation: Location;
  restaurantLocation: Location;
  customerLocation: Location;
  showRoute: boolean;
  orderState?: "none" | "offer" | "pickup" | "delivery";
}

export const MapMarkers: React.FC<MapMarkersProps> = ({
  restaurantLocation,
  customerLocation,
  showRoute,
  orderState = "none",
}) => {
  const showRestaurant =
    showRoute && (orderState === "pickup" || orderState === "delivery");
  const showCustomer = showRoute && orderState === "delivery";

  return (
    <>
      {/* Driver is rendered as Lottie overlay outside Marker (see DriverLottieOverlay) */}

      {showRestaurant && (
        <Marker coordinate={restaurantLocation} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.restaurantMarker}>
            <Ionicons name="restaurant" size={24} color={Colors.white} />
          </View>
        </Marker>
      )}

      {showCustomer && (
        <Marker coordinate={customerLocation} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.customerMarker}>
            <Ionicons name="home" size={24} color={Colors.white} />
          </View>
        </Marker>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  restaurantMarker: {
    width: Dims.markers.restaurant,
    height: Dims.markers.restaurant,
    borderRadius: Dims.markers.restaurant / 2,
    backgroundColor: Colors.restaurant,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  customerMarker: {
    width: Dims.markers.customer,
    height: Dims.markers.customer,
    borderRadius: Dims.markers.customer / 2,
    backgroundColor: Colors.customer,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});
