/**
 * შეკვეთების სია API პასუხიდან — იგივე ლოგიკა რაც `app/(tabs)/orders.tsx`.
 * ბექი ზოგჯერ აბრუნებს მასივს პირდაპირ, ზოგჯერ `{ data: Order[] }` ან `{ orders: ... }`.
 */
export function ordersFromGetOrdersData(data: unknown): any[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.data)) return o.data;
    if (Array.isArray(o.orders)) return o.orders;
  }
  return [];
}
