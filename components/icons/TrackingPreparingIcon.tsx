import React from "react";
import Svg, { Path, Rect } from "react-native-svg";

export default function TrackingPreparingIcon({
  size = 32,
}: {
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Rect x={0.5} y={0.5} width={31} height={31} rx={15.5} fill="#EFFBF5" />
      <Rect
        x={0.5}
        y={0.5}
        width={31}
        height={31}
        rx={15.5}
        stroke="#A0C9B8"
      />
      <Path
        d="M16.1825 14.255V13.4775C16.1825 13.4775 15.0725 13.1975 15.0725 12.2275C15.0725 11.1 16.2825 10.8825 16.8475 11.2325C16.8475 11.2325 16.4875 10.1775 17.4525 9.38C19.105 8.0125 22.285 9.35 21.2475 11.8425C21.2475 11.8425 21.8275 11.5775 22.225 12.1625C22.55 12.645 22.2475 13.5775 21.1975 13.415V14.255M18.7225 18.41H18.655C17.29 18.41 16.1825 17.3025 16.1825 15.9375V14.2575H21.195V15.9375C21.195 17.3025 20.09 18.41 18.7225 18.41Z"
        stroke="#00592D"
        strokeWidth={0.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16.1824 14.5975C16.1824 14.5975 15.8624 14.065 15.5099 14.3875C15.1749 14.6925 15.6249 15.955 16.1824 15.3975M21.1949 14.5975C21.1949 14.5975 21.5149 14.065 21.8674 14.3875C22.1999 14.6925 21.7524 15.955 21.1949 15.3975"
        stroke="#00592D"
        strokeWidth={0.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17.6326 18.1825V19.1675"
        stroke="#00592D"
        strokeWidth={0.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19.745 18.1825V19.1675M19.745 19.1675H20.205C20.7875 19.1675 21.3475 19.375 21.7925 19.75C21.9825 19.9125 22.1825 20.0825 22.345 20.22C22.565 20.4075 22.6925 20.6825 22.6925 20.97V23.1675M19.745 19.1675L17.8475 20.12C17.5725 20.2575 17.3975 20.54 17.3975 20.85V23.1675"
        stroke="#00592D"
        strokeWidth={0.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.415 19.835L17.6325 19.17H16.85C16.5 19.17 16.15 19.235 15.825 19.365L14.3925 19.9275C14.0875 20.0475 13.7425 19.9225 13.5825 19.6375L12.98 18.565M16.8475 11.2325C16.8475 11.2325 17.0425 11.775 17.3325 11.9625"
        stroke="#00592D"
        strokeWidth={0.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.3 21.1275V21.37"
        stroke="#00592D"
        strokeWidth={0.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.3 22.5075V22.7475"
        stroke="#00592D"
        strokeWidth={0.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.7176 18.5625L12.7851 21.125C12.9351 21.485 13.2901 21.7175 13.6776 21.7125L14.9926 21.695V23.1675M15.7626 17.6675H9.31006C9.31006 17.6675 9.56006 14.9975 12.5351 14.9975C15.5126 14.9975 15.7626 17.6675 15.7626 17.6675Z"
        stroke="#00592D"
        strokeWidth={0.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.6499 15.09C11.6499 15.09 11.7674 14.195 12.5349 14.195C13.3024 14.195 13.3674 15.0775 13.3674 15.0775"
        stroke="#00592D"
        strokeWidth={0.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.5525 18.5625H14.615"
        stroke="#00592D"
        strokeWidth={0.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
