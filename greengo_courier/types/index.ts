export type DemandLevel = "low" | "medium" | "high";
export type Status = "offline" | "online";
export type OrderState = "none" | "offer" | "pickup" | "delivery";

export interface Location {
  latitude: number;
  longitude: number;
}

export interface DemandConfig {
  text: string;
  backgroundColor: string;
}

