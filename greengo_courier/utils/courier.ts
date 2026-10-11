export interface CourierProfile {
  _id?: string;
  name?: string;
  phone?: string;
  email?: string;
  country?: string;
  countryCode?: string;
  profileImage?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeCourierFromResponse(
  data: unknown,
): CourierProfile | null {
  if (!data) return null;

  if (Array.isArray(data)) {
    return normalizeCourierFromResponse(data[0]);
  }

  if (!isRecord(data)) return null;

  if (Array.isArray(data.data)) {
    return normalizeCourierFromResponse(data.data[0]);
  }

  if (isRecord(data.data)) {
    return normalizeCourierFromResponse(data.data);
  }

  if (isRecord(data.courier)) {
    return normalizeCourierFromResponse(data.courier);
  }

  const phone =
    typeof data.phone === "string"
      ? data.phone
      : typeof data.phoneNumber === "string"
        ? data.phoneNumber
        : undefined;

  return {
    _id: data._id ? String(data._id) : undefined,
    name: typeof data.name === "string" ? data.name : undefined,
    phone,
    email: typeof data.email === "string" ? data.email : undefined,
    country: typeof data.country === "string" ? data.country : undefined,
    countryCode:
      typeof data.countryCode === "string" ? data.countryCode : undefined,
    profileImage:
      typeof data.profileImage === "string" ? data.profileImage : undefined,
  };
}

export function getCourierDisplayName(name: unknown): string {
  return typeof name === "string" ? name.trim() : "";
}

export function getCourierFirstName(name: unknown): string {
  const displayName = getCourierDisplayName(name);
  if (!displayName) return "";
  return displayName.split(" ")[0]?.toUpperCase() ?? "";
}
