"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Courier, Order, couriersApi, ordersApi, restaurantsApi } from "@/lib/api/endpoints";
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

  const limit = 10;

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantName();
    }
    fetchOrders();
    fetchCouriers();
  }, [page, statusFilter, restaurantId]);

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
    return new Date(dateString).toLocaleString("ka-GE");
  };

  const formatPrice = (amount: number) => {
    return `${amount.toFixed(2)} ₾`;
  };

  return (
    <div>
      <PageBreadcrumb pageTitle={restaurantName ? `${restaurantName} - შეკვეთები` : "შეკვეთები"} />
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex gap-4 items-center">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
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
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          {loading ? (
            <div className="p-8 text-center">იტვირთება...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              შეკვეთები ვერ მოიძებნა
            </div>
          ) : (
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      ID
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      მომხმარებელი
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      რესტორნი
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      კურიერი
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      თანხა
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      სტატუსი
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      თარიღი
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
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
                      <TableRow key={order._id}>
                        <TableCell className="px-5 py-4 text-gray-800 text-theme-sm dark:text-white/90">
                          {order._id.slice(-8)}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div>
                            <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                              {user?.name || "N/A"}
                            </div>
                            <div className="text-gray-500 text-theme-xs dark:text-gray-400">
                              {user?.phoneNumber || ""}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                          {restaurant?.name || "N/A"}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          {courier ? (
                            <div>
                              <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                {courier?.name || "N/A"}
                              </div>
                              <div className="text-gray-500 text-theme-xs dark:text-gray-400">
                                {courier?.phoneNumber || ""}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-theme-sm dark:text-gray-500">
                              კურიერი არ არის მინიჭებული
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          {order.deliveryType === "delivery" && order.deliveryAddress ? (
                            <div>
                              <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                📍 {order.deliveryAddress.street}
                              </div>
                              <div className="text-gray-500 text-theme-xs dark:text-gray-400">
                                {order.deliveryAddress.city}
                              </div>
                              {order.deliveryAddress.instructions && (
                                <div className="mt-1 text-gray-500 text-theme-xs dark:text-gray-400 italic">
                                  💬 {order.deliveryAddress.instructions}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-theme-sm dark:text-gray-500">
                              🏪 თვით-გამოღება
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-5 py-4 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {formatPrice(order.totalAmount)}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                              getStatusColor(order.status) === "success"
                                ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : getStatusColor(order.status) === "error"
                                ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                                : "border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                            }`}
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
                        <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell className="px-5 py-4">
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
