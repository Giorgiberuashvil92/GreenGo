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
import { MoreDotIcon, TrashBinIcon } from "@/icons";
import { MenuItem, menuItemsApi, Restaurant, restaurantsApi } from "@/lib/api/endpoints";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function MenuItemsPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [restaurantFilter, setRestaurantFilter] = useState<string>("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const limit = 10;

  useEffect(() => {
    fetchMenuItems();
    fetchRestaurants();
  }, [page, restaurantFilter]);

  const fetchRestaurants = async () => {
    try {
      const response = await restaurantsApi.getAll({ limit: 100 });
      setRestaurants(response.data || []);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const params: {
        page: number;
        limit: number;
        restaurantId?: string;
      } = {
        page,
        limit,
      };

      if (restaurantFilter && restaurantFilter.trim()) {
        params.restaurantId = restaurantFilter.trim();
      }

      const response = await menuItemsApi.getAll(params);
      setMenuItems(response.data || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("დარწმუნებული ხართ რომ გსურთ პროდუქტის წაშლა?")) {
      return;
    }
    try {
      await menuItemsApi.delete(id);
      fetchMenuItems();
      setOpenDropdown(null);
    } catch (error) {
      console.error("Error deleting menu item:", error);
      alert("წაშლა ვერ მოხერხდა");
    }
  };

  const handleToggleAvailable = async (item: MenuItem) => {
    try {
      await menuItemsApi.update(item._id, {
        isAvailable: !item.isAvailable,
      });
      fetchMenuItems();
      setOpenDropdown(null);
    } catch (error) {
      console.error("Error updating menu item:", error);
      alert("განახლება ვერ მოხერხდა");
    }
  };

  const formatPrice = (amount: number) => {
    return `${amount.toFixed(2)} ₾`;
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="მენიუ" />
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex gap-4 items-center justify-between">
          <select
            value={restaurantFilter}
            onChange={(e) => {
              setRestaurantFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <option value="">ყველა რესტორნი</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant._id} value={restaurant._id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          {loading ? (
            <div className="p-8 text-center">იტვირთება...</div>
          ) : menuItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              პროდუქტები ვერ მოიძებნა
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
                      კატეგორია
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      ფასი
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
                      მოქმედებები
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {menuItems.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="px-5 py-4">
                        <div className="h-12 w-12 overflow-hidden rounded-md">
                          {item.image ? (
                            <Image
                              width={48}
                              height={48}
                              src={item.image}
                              alt={item.name}
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
                          {item.name}
                        </div>
                        {item.description && (
                          <div className="text-gray-500 text-theme-xs dark:text-gray-400 line-clamp-1">
                            {item.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                        {item.category}
                      </TableCell>
                      <TableCell className="px-5 py-4 font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {formatPrice(item.price)}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge
                          size="sm"
                          color={item.isAvailable ? "success" : "error"}
                        >
                          {item.isAvailable ? "ხელმისაწვდომი" : "არაა ხელმისაწვდომი"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setOpenDropdown(
                                openDropdown === item._id ? null : item._id
                              )
                            }
                            className="dropdown-toggle"
                          >
                            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
                          </button>
                          <Dropdown
                            isOpen={openDropdown === item._id}
                            onClose={() => setOpenDropdown(null)}
                            className="w-48 p-2"
                          >
                            <DropdownItem
                              onItemClick={() => handleToggleAvailable(item)}
                              className="flex w-full items-center gap-2 font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                            >
                              {item.isAvailable
                                ? "დახურვა"
                                : "გახსნა"}
                            </DropdownItem>
                            <DropdownItem
                              onItemClick={() => handleDelete(item._id)}
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
                ჯამში {total} პროდუქტი
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
