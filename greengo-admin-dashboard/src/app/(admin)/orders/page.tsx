"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Courier, Order, OrdersAnalytics, couriersApi, ordersApi, restaurantsApi } from "@/lib/api/endpoints";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "success";
    case "pending":
    case "confirmed":
    case "preparing":
    case "ready":
      return "warning";
    case "cancelled":
      return "error";
    case "out_for_delivery":
      return "success";
    default:
      return "warning";
  }
};

const statusClasses: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20",
  confirmed: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-400/10 dark:text-blue-300 dark:ring-blue-400/20",
  preparing: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/20",
  ready: "bg-cyan-50 text-cyan-700 ring-cyan-200 dark:bg-cyan-400/10 dark:text-cyan-300 dark:ring-cyan-400/20",
  delivering: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-400/10 dark:text-indigo-300 dark:ring-indigo-400/20",
  out_for_delivery: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-400/10 dark:text-indigo-300 dark:ring-indigo-400/20",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20",
};

const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: "მოლოდინში",
    confirmed: "დადასტურებული",
    preparing: "მზადდება",
    ready: "მზადაა",
    out_for_delivery: "გზაში",
    delivered: "მიწოდებული",
    cancelled: "გაუქმებული",
  };
  return statusMap[status] || status;
};

const getInitials = (name?: string) =>
  (name || "NA").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

const getStatusClass = (status: string) =>
  statusClasses[status] || "bg-gray-50 text-gray-700 ring-gray-200 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10";

function OrdersPageContent() {
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('restaurantId');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [analytics, setAnalytics] = useState<OrdersAnalytics | null>(null);

  const limit = 10;

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantName();
    }
    fetchOrders();
    fetchCouriers();
    if (!restaurantId) fetchAnalytics();
  }, [page, statusFilter, restaurantId]);

  const fetchAnalytics = async () => {
    try {
      const response = await ordersApi.getRecentAnalytics();
      setAnalytics(response);
    } catch (error) {
      console.error("Error fetching order analytics:", error);
    }
  };

  const fetchRestaurantName = async () => {
    if (!restaurantId) return;
    try {
      const restaurant = await restaurantsApi.getById(restaurantId);
      setRestaurantName(restaurant.name);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: {
        page: number;
        limit: number;
        status?: string;
        restaurantId?: string;
      } = {
        page,
        limit,
      };

      if (statusFilter && statusFilter.trim()) {
        params.status = statusFilter.trim();
      }

      if (restaurantId) {
        params.restaurantId = restaurantId;
      }

      const response = await ordersApi.getAll(params);
      setOrders(response.data || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCouriers = async () => {
    try {
      const response = await couriersApi.getAll({ limit: 100 });
      setCouriers(response.data || []);
    } catch (error) {
      console.error("Error fetching couriers:", error);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!newStatus) return;
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      fetchOrders();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("სტატუსის განახლება ვერ მოხერხდა");
    }
  };

  const handleAssignCourier = async (orderId: string, courierId?: string) => {
    try {
      await ordersApi.assignCourier(orderId, courierId);
      fetchOrders();
    } catch (error) {
      console.error("Error assigning courier:", error);
      alert("კურიერის მინიჭება ვერ მოხერხდა");
    }
  };

  const handleConfirmPickup = async (orderId: string) => {
    if (!confirm("დარწმუნებული ხართ რომ კურიერმა მართლა აიღო შეკვეთა?")) {
      return;
    }
    try {
      await ordersApi.updateStatus(orderId, "delivering");
      fetchOrders();
    } catch (error) {
      console.error("Error confirming pickup:", error);
      alert("დადასტურება ვერ მოხერხდა");
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm("დარწმუნებული ხართ რომ გსურთ შეკვეთის წაშლა?")) {
      return;
    }
    try {
      await ordersApi.delete(orderId);
      fetchOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("წაშლა ვერ მოხერხდა");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ka-GE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString("ka-GE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formatPrice = (amount: number) => {
    return `${amount.toFixed(2)} ₾`;
  };

  return (
    <div>
      <PageBreadcrumb pageTitle={restaurantName ? `${restaurantName} - შეკვეთები` : "შეკვეთები"} />
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03]">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500 dark:text-brand-400">ოპერაციების ცენტრი</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">შეკვეთების მართვა</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">აკონტროლე შეკვეთების სტატუსი, მიწოდება და კურიერების განაწილება.</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">ბოლო განახლება</p>
              <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">დღეს · რეალურ დროში</p>
            </div>
          </div>
        </div>

        {!restaurantId && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03]">
              <p className="text-sm text-gray-500 dark:text-gray-400">სულ შეკვეთები</p>
              <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{analytics?.summary.totalOrders ?? total}</p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">ბოლო 24 საათი</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03]">
              <p className="text-sm text-gray-500 dark:text-gray-400">აქტიური შეკვეთები</p>
              <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{analytics ? analytics.byStatus.pending + analytics.byStatus.confirmed + analytics.byStatus.preparing + analytics.byStatus.ready + analytics.byStatus.delivering : "—"}</p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">დამუშავების პროცესში</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03]">
              <p className="text-sm text-gray-500 dark:text-gray-400">შემოსავალი</p>
              <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{analytics ? formatPrice(analytics.summary.totalRevenue) : "—"}</p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">ბოლო 24 საათი</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.03]">
              <p className="text-sm text-gray-500 dark:text-gray-400">საშუალო შეკვეთა</p>
              <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{analytics ? formatPrice(analytics.summary.averageOrderValue) : "—"}</p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">ერთ შეკვეთაზე</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center dark:border-white/[0.06] dark:bg-white/[0.03]">
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">შეკვეთების სია</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{total ? `${total} შეკვეთა ნაპოვნია` : "მონაცემები იტვირთება"}</p>
          </div>
          <label className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span>სტატუსი</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="min-w-[180px] rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
          >
            <option value="">ყველა სტატუსი</option>
            <option value="pending">მოლოდინში</option>
            <option value="confirmed">დადასტურებული</option>
            <option value="preparing">მზადდება</option>
            <option value="ready">მზადაა</option>
            <option value="out_for_delivery">გზაში</option>
            <option value="delivered">მიწოდებული</option>
            <option value="cancelled">გაუქმებული</option>
          </select>
          </label>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          {loading ? (
            <div className="p-16 text-center text-sm text-gray-500">იტვირთება...</div>
          ) : orders.length === 0 ? (
            <div className="p-16 text-center text-gray-500">
              შეკვეთები ვერ მოიძებნა
            </div>
          ) : (
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="whitespace-nowrap px-5 py-4 text-start text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500"
                    >
                      ID
                    </TableCell>
                    <TableCell
                      isHeader
                      className="whitespace-nowrap px-5 py-4 text-start text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500"
                    >
                      მომხმარებელი
                    </TableCell>
                    <TableCell
                      isHeader
                      className="whitespace-nowrap px-5 py-4 text-start text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500"
                    >
                      რესტორნი
                    </TableCell>
                    <TableCell
                      isHeader
                      className="whitespace-nowrap px-5 py-4 text-start text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500"
                    >
                      კურიერი
                    </TableCell>
                    <TableCell
                      isHeader
                      className="whitespace-nowrap px-5 py-4 text-start text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500"
                    >
                      მისამართი
                    </TableCell>
                    <TableCell
                      isHeader
                      className="whitespace-nowrap px-5 py-4 text-start text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500"
                    >
                      თანხა
                    </TableCell>
                    <TableCell
                      isHeader
                      className="whitespace-nowrap px-5 py-4 text-start text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500"
                    >
                      სტატუსი
                    </TableCell>
                    <TableCell
                      isHeader
                      className="whitespace-nowrap px-5 py-4 text-start text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500"
                    >
                      თარიღი
                    </TableCell>
                    <TableCell
                      isHeader
                      className="whitespace-nowrap px-5 py-4 text-start text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500"
                    >
                      მოქმედებები
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {orders.map((order) => {
                    const user = (order as any).userId;
                    const restaurant = (order as any).restaurantId;
                    const courier = (order as any).courierId;
                    return (
                  <TableRow key={order._id} className="transition-colors hover:bg-gray-50/80 dark:hover:bg-white/[0.025]">
                        <TableCell className="px-5 py-4 align-top">
                          <span className="font-mono text-xs font-semibold text-gray-500 dark:text-gray-400">#{order._id.slice(-8)}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 align-top">
                          <div className="flex min-w-[170px] items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                              {getInitials(user?.name)}
                            </div>
                            <div>
                            <div className="font-semibold text-gray-800 text-sm dark:text-white/90">
                              {user?.name || "N/A"}
                            </div>
                            <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                              {user?.phoneNumber || ""}
                            </div>
                          </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 align-top">
                          <span className="font-medium text-sm text-gray-700 dark:text-gray-200">{restaurant?.name || "N/A"}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 align-top">
                          {courier ? (
                            <div>
                              <div className="font-medium text-sm text-gray-800 dark:text-white/90">
                                {courier?.name || "N/A"}
                              </div>
                              <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                {courier?.phoneNumber || ""}
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-white/5 dark:text-gray-400">
                              კურიერი არ არის მინიჭებული
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[240px] px-5 py-4 align-top">
                          {order.deliveryType === "delivery" && order.deliveryAddress ? (
                            <div>
                              <div className="truncate font-medium text-sm text-gray-800 dark:text-white/90">
                                📍 {order.deliveryAddress.street}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {order.deliveryAddress.city}
                              </div>
                              {order.deliveryAddress.instructions && (
                                <div className="mt-1 truncate text-xs italic text-gray-500 dark:text-gray-400">
                                  💬 {order.deliveryAddress.instructions}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-white/5 dark:text-gray-400">
                              🏪 თვით-გამოღება
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap px-5 py-4 align-top font-semibold text-sm text-gray-800 dark:text-white/90">
                          {formatPrice(order.totalAmount)}
                        </TableCell>
                        <TableCell className="px-5 py-4 align-top">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className={`cursor-pointer rounded-full border-0 px-3 py-1.5 text-xs font-semibold ring-1 transition-colors ${getStatusClass(order.status)}`}
                          >
                            <option value="pending">მოლოდინში</option>
                            <option value="confirmed">დადასტურებული</option>
                            <option value="preparing">მზადდება</option>
                            <option value="ready">მზადაა</option>
                            <option value="delivering">გზაში</option>
                            <option value="out_for_delivery">გზაში (legacy)</option>
                            <option value="delivered">მიწოდებული</option>
                            <option value="cancelled">გაუქმებული</option>
                          </select>
                        </TableCell>
                        <TableCell className="whitespace-nowrap px-5 py-4 align-top text-sm text-gray-700 dark:text-gray-300">
                          <div>{formatDate(order.createdAt)}</div>
                          <div className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{formatTime(order.createdAt)}</div>
                        </TableCell>
                        <TableCell className="px-5 py-4 align-top">
                          <div className="flex items-center gap-2 flex-wrap">
                            {!restaurantId && order.status === "confirmed" && (
                              <select
                                onChange={(e) => {
                                  const courierId = e.target.value;
                                  if (courierId) {
                                    handleAssignCourier(order._id, courierId === "auto" ? undefined : courierId);
                                  }
                                }}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-800"
                                defaultValue=""
                              >
                                <option value="" disabled>კურიერი</option>
                                <option value="auto">ავტომატური</option>
                                {couriers.map((courier) => (
                                  <option key={courier._id} value={courier._id}>
                                    {courier.name || courier.phoneNumber}
                                  </option>
                                ))}
                              </select>
                            )}
                            {!restaurantId && order.status === "ready" && order.courierId && (
                              <button
                                onClick={() => handleConfirmPickup(order._id)}
                                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                              >
                                ✅ დაადასტურე აღება
                              </button>
                            )}
                            {!restaurantId && (
                              <button
                                onClick={() => handleDelete(order._id)}
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                              >
                                წაშლა
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4 dark:border-white/[0.05]">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                ჯამში {total} შეკვეთა
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800"
                >
                  წინა
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * limit >= total}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800"
                >
                  შემდეგი
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">იტვირთება...</div>}>
      <OrdersPageContent />
    </Suspense>
  );
}
