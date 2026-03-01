"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MenuItem, menuItemsApi, Order, ordersApi, Restaurant, restaurantsApi } from "@/lib/api/endpoints";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
    case "delivering":
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
    delivering: "გზაში",
    delivered: "მიწოდებული",
    cancelled: "გაუქმებული",
  };
  return statusMap[status] || status;
};

// რესტორანისთვის დაშვებული სტატუსების განსაზღვრა
const getAvailableStatusesForRestaurant = (currentStatus: string, hasCourier: boolean = false): string[] => {
  switch (currentStatus) {
    case "pending":
      return ["confirmed"]; // pending -> confirmed (დადასტურება, ამ დროს იწყება კურიერის მოძიება)
    case "confirmed":
      // confirmed -> preparing (მხოლოდ თუ კურიერი უკვე მინიჭებულია)
      // confirmed -> cancelled (თუ კურიერი არ არის მინიჭებული და ბევრი ხანი გავიდა)
      return hasCourier ? ["preparing"] : ["cancelled"];
    case "preparing":
      return ["ready"]; // preparing -> ready (მზადაა)
    case "ready":
      return []; // ready-დან აღარ შეიძლება სხვა სტატუსზე გადასვლა (კურიერი იღებს)
    case "delivering":
    case "delivered":
    case "cancelled":
      return []; // ეს სტატუსები აღარ შეიძლება შეიცვალოს
    default:
      return ["confirmed"]; // default-ად შეიძლება confirmed-ზე გადასვლა
  }
};

export default function RestaurantDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('restaurantId');
  
  const [restaurant, setRestaurant] = useState<any>(null);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    totalRevenue: 0,
    menuItemsCount: 0,
  });

  const limit = 10;

  useEffect(() => {
    fetchAllRestaurants();
  }, []);

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurant();
      fetchOrders();
      fetchMenuItems();
    }
  }, [page, statusFilter, restaurantId]);

  const fetchAllRestaurants = async () => {
    try {
      const response = await restaurantsApi.getAll({ limit: 1000 });
      setAllRestaurants(response.data || []);
      
      // თუ restaurantId არ არის URL-ში, მაგრამ რესტორანები არსებობს, აირჩიე პირველი აქტიური რესტორანი
      const currentRestaurantId = searchParams.get('restaurantId');
      if (!currentRestaurantId && response.data && response.data.length > 0) {
        const activeRestaurant = response.data.find((r: Restaurant) => r.isActive) || response.data[0];
        if (activeRestaurant) {
          router.replace(`/restaurant-dashboard?restaurantId=${activeRestaurant._id}`);
        }
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  const handleRestaurantChange = (newRestaurantId: string) => {
    router.push(`/restaurant-dashboard?restaurantId=${newRestaurantId}`);
    setPage(1); // Reset page when changing restaurant
  };

  const fetchRestaurant = async () => {
    if (!restaurantId) return;
    try {
      const data = await restaurantsApi.getById(restaurantId);
      setRestaurant(data);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
    }
  };

  const fetchMenuItems = async () => {
    if (!restaurantId) return;
    try {
      const response = await menuItemsApi.getAll({ restaurantId, limit: 100 });
      setMenuItems(response.data || []);
      setStats(prev => ({ ...prev, menuItemsCount: response.data?.length || 0 }));
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };


  const fetchOrders = async () => {
    if (!restaurantId) return;
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
        restaurantId,
      };

      if (statusFilter && statusFilter.trim()) {
        params.status = statusFilter.trim();
      }

      const response = await ordersApi.getAll(params);
      setOrders(response.data || []);
      setTotal(response.total || 0);

      // Calculate statistics
      const allOrders = response.data || [];
      const totalOrders = response.total || 0;
      const pendingOrders = allOrders.filter(o => o.status === 'pending').length;
      const preparingOrders = allOrders.filter(o => o.status === 'preparing').length;
      const readyOrders = allOrders.filter(o => o.status === 'ready').length;
      const totalRevenue = allOrders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      setStats({
        totalOrders,
        pendingOrders,
        preparingOrders,
        readyOrders,
        totalRevenue,
        menuItemsCount: menuItems.length,
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
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


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ka-GE");
  };

  const formatPrice = (amount: number) => {
    return `${amount.toFixed(2)} ₾`;
  };

  return (
    <div>
      <PageBreadcrumb pageTitle={restaurant ? `${restaurant.name} - მართვა` : "რესტორანის მართვა"} />
      <div className="space-y-6">
        {/* Restaurant Selector */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="flex items-center gap-4">
            <label htmlFor="restaurant-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              რესტორანის არჩევა:
            </label>
            <select
              id="restaurant-select"
              value={restaurantId || ""}
              onChange={(e) => handleRestaurantChange(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:hover:bg-gray-700"
            >
              <option value="">აირჩიეთ რესტორანი</option>
              {allRestaurants.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} {!r.isActive && "(არააქტიური)"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!restaurantId && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-white/[0.05] dark:bg-white/[0.03]">
            <p className="text-gray-500 dark:text-gray-400">
              გთხოვთ აირჩიოთ რესტორანი ზემოთ მოცემული სიიდან
            </p>
          </div>
        )}

        {restaurantId && (
          <>
        {/* Restaurant Info */}
        {restaurant && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="flex items-center gap-4">
              {restaurant.image && (
                <div className="h-20 w-20 overflow-hidden rounded-lg">
                  <Image
                    width={80}
                    height={80}
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                  {restaurant.name}
                </h2>
                {restaurant.description && (
                  <p className="text-gray-500 text-sm dark:text-gray-400">
                    {restaurant.description}
                  </p>
                )}
                {restaurant.address && (
                  <p className="text-gray-500 text-sm dark:text-gray-400">
                    {restaurant.address.street}, {restaurant.address.city}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="text-sm text-gray-500 dark:text-gray-400">ჯამში შეკვეთები</div>
            <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
              {stats.totalOrders}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="text-sm text-gray-500 dark:text-gray-400">მოლოდინში</div>
            <div className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.pendingOrders}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="text-sm text-gray-500 dark:text-gray-400">მზადდება</div>
            <div className="mt-2 text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.preparingOrders}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="text-sm text-gray-500 dark:text-gray-400">მზადაა</div>
            <div className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.readyOrders}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="text-sm text-gray-500 dark:text-gray-400">შემოსავალი</div>
            <div className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
              {formatPrice(stats.totalRevenue)}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="text-sm text-gray-500 dark:text-gray-400">მენიუს პროდუქტები</div>
            <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
              {stats.menuItemsCount}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-white/[0.05]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">შეკვეთები</h3>
          </div>
          <div className="p-6">
            {/* Filters */}
            <div className="mb-4 flex gap-4">
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
                <option value="delivering">გზაში</option>
                <option value="delivered">მიწოდებული</option>
                <option value="cancelled">გაუქმებული</option>
              </select>
            </div>

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
                        პროდუქტები
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
                        კურიერი
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
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {orders.map((order) => {
                      const user = (order as any).userId;
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
                            {order.items.length} პროდუქტი
                          </TableCell>
                          <TableCell className="px-5 py-4 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {formatPrice(order.totalAmount)}
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
                            {(() => {
                              const availableStatuses = getAvailableStatusesForRestaurant(order.status, !!order.courierId);
                              const allStatuses = ["pending", "confirmed", "preparing", "ready", "delivering", "delivered", "cancelled"];
                              
                              return (
                                <>
                                  <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                                      getStatusColor(order.status) === "success"
                                        ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
                                        : getStatusColor(order.status) === "error"
                                        ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                                        : "border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                    }`}
                                  >
                                    {allStatuses.map((status) => {
                                      const isAvailable = availableStatuses.includes(status) || status === order.status;
                                      return (
                                        <option 
                                          key={status} 
                                          value={status}
                                          disabled={!isAvailable}
                                          className={!isAvailable ? "opacity-50" : ""}
                                        >
                                          {getStatusLabel(status)}
                                        </option>
                                      );
                                    })}
                                  </select>
                                  {order.status === "confirmed" && !order.courierId && (
                                    <div className="mt-2 space-y-1">
                                      <div className="text-xs text-yellow-600 dark:text-yellow-400">
                                        კურიერის მოძიება...
                                      </div>
                                      <button
                                        onClick={() => {
                                          if (confirm("დარწმუნებული ხართ რომ გსურთ შეკვეთის გაუქმება?")) {
                                            handleStatusChange(order._id, "cancelled");
                                          }
                                        }}
                                        className="w-full rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                      >
                                        გაუქმება
                                      </button>
                                    </div>
                                  )}
                                  {order.status === "confirmed" && order.courierId && (
                                    <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                                      ✓ კურიერი მიენიჭა
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                            {formatDate(order.createdAt)}
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
              <div className="mt-4 flex items-center justify-between border-t border-gray-200 px-5 py-4 dark:border-white/[0.05]">
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

        {/* Menu Items */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-white/[0.05]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">მენიუს პროდუქტები</h3>
          </div>
          <div className="p-6">
            {menuItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                მენიუს პროდუქტები ვერ მოიძებნა
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {menuItems.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-lg border border-gray-200 p-4 dark:border-white/[0.05]"
                  >
                    {item.image && (
                      <div className="mb-3 h-32 w-full overflow-hidden rounded-lg">
                        <Image
                          width={200}
                          height={200}
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <h4 className="font-semibold text-gray-800 dark:text-white/90">
                      {item.name}
                    </h4>
                    {item.description && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-bold text-gray-800 dark:text-white/90">
                        {formatPrice(item.price)}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          item.isAvailable
                            ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {item.isAvailable ? "ხელმისაწვდომი" : "არაა ხელმისაწვდომი"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
