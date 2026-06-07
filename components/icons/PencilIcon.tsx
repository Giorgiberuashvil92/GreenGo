import React from "react";
import Svg, { Path } from "react-native-svg";

type PencilIconProps = {
  size?: number;
  color?: string;
};

export default function PencilIcon({
  size = 12,
  color = "#8C8C8C",
}: PencilIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <Path
        d="M5.5 2H2C1.73478 2 1.48043 2.10536 1.29289 2.29289C1.10536 2.48043 1 2.73478 1 3V10C1 10.2652 1.10536 10.5196 1.29289 10.7071C1.48043 10.8946 1.73478 11 2 11H9C9.26522 11 9.51957 10.8946 9.70711 10.7071C9.89464 10.5196 10 10.2652 10 10V6.5"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.25 1.25C9.44891 1.05109 9.7187 0.939339 10 0.939339C10.2813 0.939339 10.5511 1.05109 10.75 1.25C10.9489 1.44891 11.0607 1.71869 11.0607 2C11.0607 2.2813 10.9489 2.55109 10.75 2.75L6 7.5L4 8L4.5 6L9.25 1.25Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
