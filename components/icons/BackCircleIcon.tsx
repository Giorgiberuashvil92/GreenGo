import React from "react";
import Svg, { Path, Rect } from "react-native-svg";

const ARROW_COLOR = "#00592D";

export default function BackCircleIcon({
  size = 32,
  color = ARROW_COLOR,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Rect width={32} height={32} rx={16} fill="white" />
      <Path
        d="M13.2167 16.6667L16.95 20.4L16 21.3334L10.6667 16L16 10.6667L16.95 11.6L13.2167 15.3334H21.3334V16.6667H13.2167Z"
        fill={color}
      />
    </Svg>
  );
}
