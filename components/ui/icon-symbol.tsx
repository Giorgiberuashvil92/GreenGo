import React from "react";
import { Text } from "react-native";

interface IconSymbolProps {
  name: string;
  size?: number;
  color?: string;
}

export function IconSymbol({
  name,
  size = 24,
  color = "#000",
}: IconSymbolProps) {
  const iconMap: { [key: string]: string } = {
    "house.fill": "🏠",
    magnifyingglass: "🔍",
    "bag.fill": "🛍️",
    "heart.fill": "❤️",
    "person.fill": "👤",
    "location.fill": "📍",
    "line.3.horizontal.decrease": "☰",
    "star.fill": "⭐",
    "truck.fill": "🚚",
    "clock.fill": "🕐",
  };

  return <Text style={{ fontSize: size, color }}>{iconMap[name] || "?"}</Text>;
}
