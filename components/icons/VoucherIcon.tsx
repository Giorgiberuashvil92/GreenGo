import React from "react";
import Svg, { Path } from "react-native-svg";

const VOUCHER_OUTLINE_PATH =
  "M7.33839 16.425H5.39256C4.38923 16.425 3.57506 15.6117 3.57506 14.6075V13.4142C3.57506 12.9325 3.38339 12.47 3.04256 12.1292L2.19839 11.285C1.48839 10.575 1.48839 9.425 2.19839 8.715L3.04256 7.87083C3.38339 7.53 3.57506 7.06833 3.57506 6.58583V5.3925C3.57506 4.38917 4.38839 3.575 5.39256 3.575H6.58589C7.06756 3.575 7.53006 3.38333 7.87089 3.0425L8.71506 2.19833C9.42506 1.48833 10.5751 1.48833 11.2851 2.19833L12.1292 3.0425C12.4701 3.38333 12.9326 3.575 13.4142 3.575H14.6076C15.6109 3.575 16.4251 4.38833 16.4251 5.3925V6.58583C16.4251 7.0675 16.6167 7.53 16.9576 7.87083L17.8017 8.715C18.5117 9.425 18.5117 10.575 17.8017 11.285L16.9576 12.1292C16.6167 12.47 16.4251 12.9325 16.4251 13.4142V14.6075C16.4251 15.6108 15.6117 16.425 14.6076 16.425H13.4142C12.9326 16.425 12.4701 16.6167 12.1292 16.9575L11.2851 17.8017C10.5751 18.5117 9.42506 18.5117 8.71506 17.8017L7.33839 16.425Z";

type VoucherIconProps = {
  size?: number;
  color?: string;
};

export default function VoucherIcon({
  size = 20,
  color = "#FF4D4F",
}: VoucherIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d={VOUCHER_OUTLINE_PATH}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7.5 12.5L12.5 7.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7.70746 7.50002C7.59246 7.50002 7.49913 7.59335 7.49996 7.70835C7.49996 7.82335 7.5933 7.91669 7.7083 7.91669C7.8233 7.91669 7.91663 7.82335 7.91663 7.70835C7.91663 7.59335 7.8233 7.50002 7.70746 7.50002"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.2908 12.0833C12.1758 12.0833 12.0825 12.1767 12.0833 12.2917C12.0833 12.4067 12.1767 12.5 12.2917 12.5C12.4067 12.5 12.5 12.4067 12.5 12.2917C12.5 12.1767 12.4067 12.0833 12.2908 12.0833"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
