import { DemandLevel, DemandConfig } from "../types";
import { Colors } from "../constants/colors";

export const getDemandConfig = (level: DemandLevel): DemandConfig => {
  switch (level) {
    case "low":
      return {
        text: "მიტანის მოთხოვნა დაბალი",
        backgroundColor: Colors.error,
      };
    case "medium":
      return {
        text: "მიტანის მოთხოვნა საშუალო",
        backgroundColor: Colors.warning,
      };
    case "high":
      return {
        text: "მიტანის მოთხოვნა მაღალი",
        backgroundColor: Colors.primary,
      };
  }
};

