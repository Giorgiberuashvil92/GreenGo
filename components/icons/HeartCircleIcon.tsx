import React from "react";
import Svg, { Path, Rect } from "react-native-svg";

const HEART_STROKE = "#00592D";
const HEART_LIKED = "#EF4444";

export default function HeartCircleIcon({
  size = 32,
  liked = false,
  color = HEART_STROKE,
}: {
  size?: number;
  liked?: boolean;
  color?: string;
}) {
  const heartColor = liked ? HEART_LIKED : color;

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Rect width={32} height={32} rx={16} fill="white" />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 11.8074C16.4593 11.27 17.254 10.6667 18.464 10.6667C20.5807 10.6667 22 12.6534 22 14.5034C22 18.3707 17.1853 21.3334 16 21.3334C14.8147 21.3334 10 18.3707 10 14.5034C10 12.6534 11.4193 10.6667 13.536 10.6667C14.746 10.6667 15.5407 11.27 16 11.8074Z"
        fill={liked ? heartColor : "none"}
        stroke={heartColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
