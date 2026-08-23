"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CloudinaryImageUpload from "@/components/common/CloudinaryImageUpload";
import SafeRemoteImage from "@/components/common/SafeRemoteImage";
import Badge from "@/components/ui/badge/Badge";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreDotIcon, PencilIcon, TrashBinIcon } from "@/icons";
import { MenuItem, menuItemsApi, Restaurant, restaurantsApi } from "@/lib/api/endpoints";
import { useEffect, useState } from "react";

type MenuItemForm = {
  name: string;
  description: string;
  price: string;
  image: string;
  heroImage: string;
  category: string;
  isPopular: boolean;
  isAvailable: boolean;
};

const emptyForm: MenuItemForm = {
  name: "",
  description: "",
  price: "",
  image: "",
  heroImage: "",
  category: "",
  isPopular: false,
  isAvailable: true,
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white";
const labelClass =
  "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function MenuItemsPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [restaurantFilter, setRestaurantFilter] = useState<string>("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<MenuItemForm>(emptyForm);
  const [saving, setSaving] = useState(false);

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

  const updateForm = <K extends keyof MenuItemForm>(
    key: K,
    value: MenuItemForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description || "",
      price: String(item.price),
      image: item.image || "",
      heroImage: item.heroImage || "",
      category: item.category,
      isPopular: !!item.isPopular,
      isAvailable: item.isAvailable,
    });
    setOpenDropdown(null);
  };

  const handleCloseEdit = () => {
    setEditingItem(null);
    setForm(emptyForm);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const name = form.name.trim();
    const price = parseFloat(form.price.replace(",", "."));
    const image = form.image.trim();
    const category = form.category.trim();

    if (!name) {
      alert("შეიყვანეთ პროდუქტის სახელი");
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      alert("შეიყვანეთ სწორი ფასი");
      return;
    }
    if (!image) {
      alert("შეიყვანეთ სურათის URL");
      return;
    }
    if (!category) {
      alert("შეიყვანეთ კატეგორია");
      return;
    }

    setSaving(true);
    try {
      await menuItemsApi.update(editingItem._id, {
        name,
        description: form.description.trim() || undefined,
        price,
        image,
        heroImage: form.heroImage.trim() || image,
        category,
        isPopular: form.isPopular,
        isAvailable: form.isAvailable,
      });
      handleCloseEdit();
      fetchMenuItems();
    } catch (error) {
      console.error("Error updating menu item:", error);
      alert("რედაქტირება ვერ მოხერხდა");
    } finally {
      setSaving(false);
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

  const getRestaurantName = (restaurantId: string) => {
    const restaurant = restaurants.find((r) => r._id === restaurantId);
    return restaurant?.name || "—";
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="მენიუ" />
      <div className="space-y-6">
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
                      რესტორნი
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
                          <SafeRemoteImage
                            width={48}
                            height={48}
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
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
                        {getRestaurantName(item.restaurantId)}
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
                                openDropdown === item._id ? null : item._id,
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
                              onItemClick={() => handleOpenEdit(item)}
                              className="flex w-full items-center gap-2 font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                            >
                              <PencilIcon className="w-4 h-4" />
                              რედაქტირება
                            </DropdownItem>
                            <DropdownItem
                              onItemClick={() => handleToggleAvailable(item)}
                              className="flex w-full items-center gap-2 font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                            >
                              {item.isAvailable ? "დახურვა" : "გახსნა"}
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

      <Modal
        isOpen={!!editingItem}
        onClose={handleCloseEdit}
        className="m-4 max-w-[720px]"
      >
        <div className="no-scrollbar max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <div className="mb-6 pr-12">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              პროდუქტის რედაქტირება
            </h2>
            {editingItem && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {editingItem.name} · {getRestaurantName(editingItem.restaurantId)}
              </p>
            )}
          </div>

          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>სახელი *</label>
                <input
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>ფასი (₾) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => updateForm("price", e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>აღწერა</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  className={`${inputClass} min-h-[80px]`}
                />
              </div>
              <div>
                <label className={labelClass}>სურათის URL *</label>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => updateForm("image", e.target.value)}
                  className={inputClass}
                  required
                />
                <CloudinaryImageUpload
                  folder="greengo/products"
                  onUploaded={(url) => updateForm("image", url)}
                />
              </div>
              <div>
                <label className={labelClass}>Hero სურათის URL</label>
                <input
                  type="url"
                  value={form.heroImage}
                  onChange={(e) => updateForm("heroImage", e.target.value)}
                  className={inputClass}
                  placeholder="ცარიელი = იგივე რაც სურათი"
                />
                <CloudinaryImageUpload
                  folder="greengo/products/hero"
                  onUploaded={(url) => updateForm("heroImage", url)}
                />
              </div>
              <div>
                <label className={labelClass}>კატეგორია *</label>
                <input
                  value={form.category}
                  onChange={(e) => updateForm("category", e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div className="flex flex-col justify-end gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.isPopular}
                    onChange={(e) => updateForm("isPopular", e.target.checked)}
                  />
                  პოპულარული
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.isAvailable}
                    onChange={(e) => updateForm("isAvailable", e.target.checked)}
                  />
                  ხელმისაწვდომი
                </label>
              </div>
            </div>

            {form.image && (
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <SafeRemoteImage
                  width={320}
                  height={160}
                  src={form.image}
                  alt={form.name}
                  className="h-40 w-full object-cover"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseEdit}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                გაუქმება
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {saving ? "ინახება..." : "შენახვა"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
