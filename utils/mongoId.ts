const MONGO_ID_REGEX = /^[a-f\d]{24}$/i;

export function parseMongoId(value: unknown): string | undefined {
  if (value == null || value === "") return undefined;

  if (typeof value === "string") {
    const trimmed = value.trim();
    return MONGO_ID_REGEX.test(trimmed) ? trimmed : undefined;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    if (typeof record.$oid === "string") {
      return parseMongoId(record.$oid);
    }

    if (record._id != null) {
      return parseMongoId(record._id);
    }

    if (typeof (value as { toString?: () => string }).toString === "function") {
      const str = (value as { toString: () => string }).toString();
      if (MONGO_ID_REGEX.test(str)) return str;
    }
  }

  return undefined;
}
