import AsyncStorage from "@react-native-async-storage/async-storage";

export const CHECKOUT_PAYMENT_KEY = "@greengo:checkout_payment";

export type PaymentCardType = "amex" | "mastercard" | "visa";
export type CheckoutPaymentMethod = "card" | "cash" | "greengo_balance";

export interface SavedPaymentCard {
  id: string;
  type: PaymentCardType;
  lastFour: string;
  maskedNumber: string;
}

export interface CheckoutPaymentSelection {
  method: CheckoutPaymentMethod;
  cardId?: string;
  cardType?: PaymentCardType;
  lastFour?: string;
}

export const PAYMENT_CARDS: SavedPaymentCard[] = [
  {
    id: "1",
    type: "amex",
    lastFour: "7729",
    maskedNumber: "**** 7729",
  },
  {
    id: "2",
    type: "mastercard",
    lastFour: "1234",
    maskedNumber: "**** 1234",
  },
  {
    id: "3",
    type: "visa",
    lastFour: "5678",
    maskedNumber: "**** 5678",
  },
];

const DEFAULT_PAYMENT: CheckoutPaymentSelection = {
  method: "card",
  cardId: "1",
  cardType: "amex",
  lastFour: "7729",
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
  const lastFour =
    selection.lastFour ||
    PAYMENT_CARDS.find((c) => c.id === selection.cardId)?.lastFour ||
    "7729";
  return `**** ${lastFour}`;
}
