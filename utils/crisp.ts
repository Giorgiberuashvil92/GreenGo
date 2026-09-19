import {
  configure,
  resetSession,
  setTokenId,
  setUserEmail,
  setUserNickname,
  setUserPhone,
  show,
} from "crisp-sdk-react-native";

export const CRISP_WEBSITE_ID = "c13038eb-f0b9-4d39-aadb-902b015646ee";

export function configureCrisp() {
  configure(CRISP_WEBSITE_ID);
}

export function openCrispChat() {
  show();
}

export function identifyCrispUser(user: {
  id: string;
  phoneNumber?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}) {
  setTokenId(user.id);
  const displayName =
    user.name || [user.firstName, user.lastName].filter(Boolean).join(" ");
  if (displayName) setUserNickname(displayName);
  if (user.email) setUserEmail(user.email);
  if (user.phoneNumber) {
    const phone = user.phoneNumber.startsWith("+")
      ? user.phoneNumber
      : `+995${user.phoneNumber.replace(/^995/, "")}`;
    setUserPhone(phone);
  }
}

export function resetCrispSession() {
  setTokenId(null);
  resetSession();
}
