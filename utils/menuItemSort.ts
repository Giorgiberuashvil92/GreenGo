export type SortableMenuItem = {
  order?: number | string | null;
  popularOrder?: number | string | null;
  createdAt?: string;
};

function numericOrder(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return Number.MAX_SAFE_INTEGER;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

export function sortByMenuOrder<T extends SortableMenuItem>(items: T[]) {
  return [...items].sort((a, b) => {
    const orderA = numericOrder(a.order);
    const orderB = numericOrder(b.order);

    if (orderA !== orderB) return orderA - orderB;
    return (b.createdAt || "").localeCompare(a.createdAt || "");
  });
}

export function sortByPopularOrder<T extends SortableMenuItem>(items: T[]) {
  return [...items].sort((a, b) => {
    const popularOrderA = numericOrder(a.popularOrder);
    const popularOrderB = numericOrder(b.popularOrder);

    if (popularOrderA !== popularOrderB) return popularOrderA - popularOrderB;

    const orderA = numericOrder(a.order);
    const orderB = numericOrder(b.order);
    if (orderA !== orderB) return orderA - orderB;

    return (b.createdAt || "").localeCompare(a.createdAt || "");
  });
}
