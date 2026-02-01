"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreDotIcon, PencilIcon, TrashBinIcon } from "@/icons";
import { Restaurant, restaurantsApi } from "@/lib/api/endpoints";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RestaurantsPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isActiveFilter, setIsActiveFilter] = useState<string>("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

  const [togglingRestaurantId, setTogglingRestaurantId] = useState<string | null>(null);
  const limit = 10;

  useEffect(() => {
    fetchRestaurants();
  }, [page, isActiveFilter]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      
      const params: Record<string, any> = {
        page,
        limit,
      };

      if (isActiveFilter === "true") {
        params.isActive = true;
      } else if (isActiveFilter === "false") {
        params.isActive = false;
      }

      const response = await restaurantsApi.getAll(params);
      setRestaurants(response.data || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("დარწმუნებული ხართ რომ გსურთ რესტორნის წაშლა?")) {
      return;
    }
    try {
      await restaurantsApi.delete(id);
      fetchRestaurants();
      setOpenDropdown(null);
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      alert("წაშლა ვერ მოხერხდა");
    }
  };

  const handleToggleActive = async (restaurant: Restaurant) => {
    // დეაქტივაციისთვის დადასტურება
    if (restaurant.isActive) {
      if (!confirm(`დარწმუნებული ხართ რომ გსურთ "${restaurant.name}" რესტორანის დეაქტივაცია?`)) {
        return;
      }
    }

    const newActiveState = !restaurant.isActive;
    
    // Optimistic update - დაუყოვნებლივ შევცვალოთ UI
    setRestaurants(prevRestaurants =>
      prevRestaurants.map(r =>
        r._id === restaurant._id ? { ...r, isActive: newActiveState } : r
      )
    );
    
    setTogglingRestaurantId(restaurant._id);
    setOpenDropdown(null);

    try {
      await restaurantsApi.update(restaurant._id, {
        isActive: newActiveState,
      });
      // განახლება backend-იდან (რომ დავრწმუნდეთ რომ ყველაფერი სწორად განახლდა)
      await fetchRestaurants();
    } catch (error) {
      console.error("Error updating restaurant:", error);
      // Revert optimistic update on error
      setRestaurants(prevRestaurants =>
        prevRestaurants.map(r =>
          r._id === restaurant._id ? { ...r, isActive: restaurant.isActive } : r
        )
      );
      alert(`განახლება ვერ მოხერხდა: ${error instanceof Error ? error.message : 'უცნობი შეცდომა'}`);
    } finally {
      setTogglingRestaurantId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ka-GE");
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="რესტორნები" />
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex gap-4 items-center">
          <select
            value={isActiveFilter}
            onChange={(e) => {
              setIsActiveFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <option value="">ყველა</option>
            <option value="true">აქტიური</option>
            <option value="false">არააქტიური</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          {loading ? (
            <div className="p-8 text-center">იტვირთება...</div>
          ) : restaurants.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              რესტორნები ვერ მოიძებნა
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
                      სურათი
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      სახელი
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      მისამართი
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      რეიტინგი
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
                  {restaurants.map((restaurant) => (
                    <TableRow key={restaurant._id}>
                      <TableCell className="px-5 py-4">
                        <div className="h-12 w-12 overflow-hidden rounded-md">
                          {restaurant.image ? (
                            <Image
                              width={48}
                              height={48}
                              src={restaurant.image}
                              alt={restaurant.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                              <span className="text-xs text-gray-400">N/A</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {restaurant.name}
                        </div>
                        {restaurant.description && (
                          <div className="text-gray-500 text-theme-xs dark:text-gray-400 line-clamp-1">
                            {restaurant.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                        {restaurant.address
                          ? `${restaurant.address.street}, ${restaurant.address.city}`
                          : "N/A"}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        {restaurant.rating ? (
                          <span className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {restaurant.rating.toFixed(1)} ⭐
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge
                          size="sm"
                          color={restaurant.isActive ? "success" : "error"}
                        >
                          {restaurant.isActive ? "აქტიური" : "არააქტიური"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(restaurant.createdAt)}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setOpenDropdown(
                                openDropdown === restaurant._id
                                  ? null
                                  : restaurant._id
                              )
                            }
                            className="dropdown-toggle"
                          >
                            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
                          </button>
                          <Dropdown
                            isOpen={openDropdown === restaurant._id}
                            onClose={() => setOpenDropdown(null)}
                            className="w-48 p-2"
                          >
                            <DropdownItem
                              onItemClick={() => {
                                router.push(`/restaurant-dashboard?restaurantId=${restaurant._id}`);
                                setOpenDropdown(null);
                              }}
                              className="flex w-full items-center gap-2 font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                            >
                              მართვა
                            </DropdownItem>
                            <DropdownItem
                              onItemClick={() => {
                                router.push(`/orders?restaurantId=${restaurant._id}`);
                                setOpenDropdown(null);
                              }}
                              className="flex w-full items-center gap-2 font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                            >
                              შეკვეთები
                            </DropdownItem>
                            <DropdownItem
                              onItemClick={() => {
                                setEditingRestaurant(restaurant);
                                setShowModal(true);
                                setOpenDropdown(null);
                              }}
                              className="flex w-full items-center gap-2 font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                            >
                              <PencilIcon className="w-4 h-4" />
                              რედაქტირება
                            </DropdownItem>
                            <DropdownItem
                              onItemClick={() => handleToggleActive(restaurant)}
                              disabled={togglingRestaurantId === restaurant._id}
                              className={`flex w-full items-center gap-2 font-normal text-left rounded-lg ${
                                togglingRestaurantId === restaurant._id
                                  ? 'opacity-50 cursor-not-allowed text-gray-400'
                                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300'
                              }`}
                            >
                              {togglingRestaurantId === restaurant._id ? (
                                <>
                                  <span className="animate-spin">⏳</span>
                                  {restaurant.isActive ? "დეაქტივაცია..." : "აქტივაცია..."}
                                </>
                              ) : (
                                <>
                                  {restaurant.isActive ? "დეაქტივაცია" : "აქტივაცია"}
                                </>
                              )}
                            </DropdownItem>
                            <DropdownItem
                              onItemClick={() => handleDelete(restaurant._id)}
                              className="flex w-full items-center gap-2 font-normal text-left text-red-500 rounded-lg hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10"
                            >
                              <TrashBinIcon className="w-4 h-4" />
                              წაშლა
                            </DropdownItem>
                          </Dropdown>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4 dark:border-white/[0.05]">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                ჯამში {total} რესტორნი
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
