import {
  configure,
  resetSession,
  setSessionSegment,
  setTokenId,
  setUserEmail,
  setUserNickname,
  setUserPhone,
  show,
} from "crisp-sdk-react-native";

export const CRISP_WEBSITE_ID = "c13038eb-f0b9-4d39-aadb-902b015646ee";

export function configureCrisp() {
  configure(CRISP_WEBSITE_ID);
  setSessionSegment("courier");
}

export function openCrispChat() {
  show();
}

export function identifyCrispUser(user: {
  id: string;
  phoneNumber?: string | null;
  name?: string | null;
  email?: string | null;
}) {
  setTokenId(user.id);
  setSessionSegment("courier");

  if (user.name) {
    setUserNickname(user.name);
  }

  if (user.email) {
    setUserEmail(user.email);
  }

  if (user.phoneNumber) {
    const digits = user.phoneNumber.replace(/\D/g, "");
    const phone = user.phoneNumber.startsWith("+")
      ? user.phoneNumber
      : `+995${digits.replace(/^995/, "")}`;
    setUserPhone(phone);
  }
}

export function resetCrispSession() {
  setTokenId(null);
  resetSession();
}
