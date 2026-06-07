import AsyncStorage from "@react-native-async-storage/async-storage";

export const CHECKOUT_PAYMENT_KEY = "@greengo:checkout_payment";

export type PaymentCardType = "amex" | "mastercard" | "visa";
export type CheckoutPaymentMethod = "card" | "cash" | "greengo_balance";

export interface SavedPaymentCard {
  id: string;
  type: PaymentCardType;
  lastFour: string;
  maskedNumber: string;
  isPrimary?: boolean;
}

export interface CheckoutPaymentSelection {
  method: CheckoutPaymentMethod;
  cardId?: string;
  cardType?: PaymentCardType;
  lastFour?: string;
}

const DEFAULT_PAYMENT: CheckoutPaymentSelection = {
  method: "cash",
};

export async function loadCheckoutPayment(): Promise<CheckoutPaymentSelection> {
  try {
    const json = await AsyncStorage.getItem(CHECKOUT_PAYMENT_KEY);
    if (!json) return DEFAULT_PAYMENT;
    return JSON.parse(json) as CheckoutPaymentSelection;
  } catch {
    return DEFAULT_PAYMENT;
  }
}

export async function saveCheckoutPayment(
  selection: CheckoutPaymentSelection,
): Promise<void> {
  await AsyncStorage.setItem(CHECKOUT_PAYMENT_KEY, JSON.stringify(selection));
}

export function getCardBrandLabel(type: PaymentCardType): string {
  switch (type) {
    case "amex":
      return "AMEX";
    case "mastercard":
      return "MC";
    case "visa":
      return "VISA";
    default:
      return "CARD";
  }
}

export function getPaymentDisplayLine(
  selection: CheckoutPaymentSelection,
): string {
  if (selection.method === "cash") {
    return "გადახდა მიტანისას";
  }
  if (selection.method === "greengo_balance") {
    return "GreenGo ბალანსი";
  }
  const lastFour = selection.lastFour || "----";
  return `**** ${lastFour}`;
}
