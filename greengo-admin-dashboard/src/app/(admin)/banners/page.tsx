"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
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
import { bannersApi, Banner, Restaurant, restaurantsApi } from "@/lib/api/endpoints";
import { useEffect, useMemo, useState } from "react";

type BannerForm = {
  title: string;
  image: string;
  link: string;
  restaurantId: string;
  description: string;
  oldPrice: string;
  newPrice: string;
  order: string;
  placement: "top" | "mid";
  isClickable: boolean;
  isActive: boolean;
  startDate: string;
  endDate: string;
};

const emptyForm: BannerForm = {
  title: "",
  image: "",
  link: "",
  restaurantId: "",
  description: "",
  oldPrice: "",
  newPrice: "",
  order: "0",
  placement: "top",
  isClickable: true,
  isActive: true,
  startDate: "",
  endDate: "",
};

const PLACEMENT_LABELS: Record<BannerForm["placement"], string> = {
  top: "ზედა (მთავარი)",
  mid: "შუა (3 სექციის შემდეგ)",
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white";
const labelClass =
  "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";

function getBannerRestaurantId(banner: Banner): string {
  if (!banner.restaurantId) return "";
  if (typeof banner.restaurantId === "string") return banner.restaurantId;
  return banner.restaurantId._id || "";
}

function getRestaurantLabel(
  banner: Banner,
  restaurantMap: Map<string, Restaurant>,
): string {
  const restaurantId = getBannerRestaurantId(banner);
  if (!restaurantId) return "-";
  const restaurant = restaurantMap.get(restaurantId);
  if (restaurant?.name) return restaurant.name;
  if (
    typeof banner.restaurantId === "object" &&
    banner.restaurantId?.name
  ) {
    return banner.restaurantId.name;
  }
  return restaurantId;
}

function bannerToForm(banner: Banner): BannerForm {
  return {
    title: banner.title,
    image: banner.image,
    link: banner.link || "",
    restaurantId: getBannerRestaurantId(banner),
    description: banner.description || "",
    oldPrice: banner.oldPrice || "",
    newPrice: banner.newPrice || "",
    order: String(banner.order ?? 0),
    placement: banner.placement === "mid" ? "mid" : "top",
    isClickable: banner.isClickable !== false,
    isActive: banner.isActive,
    startDate: banner.startDate ? banner.startDate.slice(0, 10) : "",
    endDate: banner.endDate ? banner.endDate.slice(0, 10) : "",
  };
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<BannerForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetchBanners();
    void fetchRestaurants();
  }, []);

  const restaurantMap = useMemo(() => {
    const map = new Map<string, Restaurant>();
    restaurants.forEach((restaurant) => map.set(restaurant._id, restaurant));
    return map;
  }, [restaurants]);

  const fetchRestaurants = async () => {
    try {
      const response = await restaurantsApi.getAll({ limit: 500, isActive: true });
      setRestaurants(response.data ?? []);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await bannersApi.getAll();
      setBanners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateForm = <K extends keyof BannerForm>(
    key: K,
    value: BannerForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setIsCreating(true);
    setForm(emptyForm);
  };

  const handleOpenEdit = (banner: Banner) => {
    setIsCreating(false);
    setEditingBanner(banner);
    setForm(bannerToForm(banner));
    setOpenDropdown(null);
  };

  const handleCloseModal = () => {
    setEditingBanner(null);
    setIsCreating(false);
    setForm(emptyForm);
    setSaving(false);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      title: form.title.trim(),
      image: form.image.trim(),
      link: form.link.trim() || undefined,
      restaurantId: form.restaurantId.trim() ? form.restaurantId.trim() : null,
      description: form.description.trim() || undefined,
      oldPrice: form.oldPrice.trim() || undefined,
      newPrice: form.newPrice.trim() || undefined,
      order: Number(form.order) || 0,
      placement: form.placement,
      isClickable: form.isClickable,
      isActive: form.isActive,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };

    try {
      setSaving(true);
      if (editingBanner) {
        await bannersApi.update(editingBanner._id, payload);
      } else {
        await bannersApi.create(payload);
      }
      handleCloseModal();
      fetchBanners();
    } catch (error) {
      console.error("Error saving banner:", error);
      alert("შენახვა ვერ მოხერხდა");
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("დარწმუნებული ხართ რომ გსურთ ბანერის წაშლა?")) {
      return;
    }
    try {
      await bannersApi.delete(id);
      fetchBanners();
      setOpenDropdown(null);
    } catch (error) {
      console.error("Error deleting banner:", error);
      alert("წაშლა ვერ მოხერხდა");
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      await bannersApi.update(banner._id, {
        isActive: !banner.isActive,
      });
      fetchBanners();
      setOpenDropdown(null);
    } catch (error) {
      console.error("Error updating banner:", error);
      alert("განახლება ვერ მოხერხდა");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ka-GE");
  };

  const formatPrice = (price?: string) => {
    return price || "-";
  };

  const modalOpen = isCreating || !!editingBanner;

  return (
    <div>
      <PageBreadcrumb pageTitle="ბანერები" />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              პრომოციული ბანერები
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              მართეთ მთავარი გვერდის carousel ბანერები
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
          >
            + ახალი ბანერი
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          {loading ? (
            <div className="p-8 text-center">იტვირთება...</div>
          ) : banners.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              ბანერები ვერ მოიძებნა
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
                      რიგი
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      განთავსება
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      რესტორანი
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
                      აღწერა
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      დაჭერა
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
                  {banners.map((banner) => (
                    <TableRow key={banner._id}>
                      <TableCell className="px-5 py-4">
                        <div className="h-20 w-32 overflow-hidden rounded-md">
                          <SafeRemoteImage
                            width={128}
                            height={80}
                            src={banner.image}
                            alt={banner.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {banner.title}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                        {banner.order}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                        {PLACEMENT_LABELS[banner.placement === "mid" ? "mid" : "top"]}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                        {getRestaurantLabel(banner, restaurantMap)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          {banner.oldPrice && (
                            <span className="line-through text-gray-400">
                              {formatPrice(banner.oldPrice)}
                            </span>
                          )}
                          {banner.newPrice && (
                            <span className="font-semibold text-brand-500">
                              {formatPrice(banner.newPrice)}
                            </span>
                          )}
                          {!banner.oldPrice && !banner.newPrice && "-"}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                        {banner.description || "-"}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge
                          size="sm"
                          color={banner.isClickable === false ? "warning" : "success"}
                        >
                          {banner.isClickable === false ? "გამორთული" : "ჩართული"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge
                          size="sm"
                          color={banner.isActive ? "success" : "error"}
                        >
                          {banner.isActive ? "აქტიური" : "არააქტიური"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(banner.createdAt)}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setOpenDropdown(
                                openDropdown === banner._id
                                  ? null
                                  : banner._id,
                              )
                            }
                            className="dropdown-toggle"
                          >
                            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
                          </button>
                          <Dropdown
                            isOpen={openDropdown === banner._id}
                            onClose={() => setOpenDropdown(null)}
                            className="w-48 p-2"
                          >
                            <DropdownItem
                              onItemClick={() => handleOpenEdit(banner)}
                              className="flex w-full items-center gap-2 font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                            >
                              <PencilIcon className="w-4 h-4" />
                              რედაქტირება
                            </DropdownItem>
                            <DropdownItem
                              onItemClick={() => handleToggleActive(banner)}
                              className="flex w-full items-center gap-2 font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                            >
                              {banner.isActive ? "დეაქტივაცია" : "აქტივაცია"}
                            </DropdownItem>
                            <DropdownItem
                              onItemClick={() => handleDelete(banner._id)}
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
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        className="m-4 max-w-[720px]"
      >
        <div className="no-scrollbar max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <div className="mb-6 pr-12">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              {editingBanner ? "ბანერის რედაქტირება" : "ახალი ბანერი"}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              ზედა ბანერი — გვერდის დასაწყისში, შუა ბანერი — 3 სექციის შემდეგ
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>სახელი *</label>
                <input
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>რიგი</label>
                <input
                  type="number"
                  min="0"
                  value={form.order}
                  onChange={(e) => updateForm("order", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>განთავსება *</label>
                <select
                  value={form.placement}
                  onChange={(e) =>
                    updateForm("placement", e.target.value as BannerForm["placement"])
                  }
                  className={inputClass}
                >
                  <option value="top">{PLACEMENT_LABELS.top}</option>
                  <option value="mid">{PLACEMENT_LABELS.mid}</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>რესტორანი (დაჭერისას)</label>
                <select
                  value={form.restaurantId}
                  onChange={(e) => updateForm("restaurantId", e.target.value)}
                  className={inputClass}
                >
                  <option value="">— არჩევა —</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant._id} value={restaurant._id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  თუ რესტორანი მიუთითებულია, ბანერზე დაჭერა გადაიყვანს რესტორანის
                  გვერდზე
                </p>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>სურათის URL *</label>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => updateForm("image", e.target.value)}
                  className={inputClass}
                  placeholder="https://..."
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>გარე ბმული (დაჭერისას)</label>
                <input
                  type="url"
                  value={form.link}
                  onChange={(e) => updateForm("link", e.target.value)}
                  className={inputClass}
                  placeholder="https://..."
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  გამოიყენება მხოლოდ მაშინ, თუ რესტორანი არ არის მითითებული
                </p>
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
                <label className={labelClass}>ძველი ფასი</label>
                <input
                  value={form.oldPrice}
                  onChange={(e) => updateForm("oldPrice", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>ახალი ფასი</label>
                <input
                  value={form.newPrice}
                  onChange={(e) => updateForm("newPrice", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>დაწყების თარიღი</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => updateForm("startDate", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>დასრულების თარიღი</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => updateForm("endDate", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex items-center md:col-span-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.isClickable}
                    onChange={(e) => updateForm("isClickable", e.target.checked)}
                  />
                  დაჭერადი ბანერი
                </label>
              </div>
              <div className="flex items-center md:col-span-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => updateForm("isActive", e.target.checked)}
                  />
                  აქტიური
                </label>
              </div>
            </div>

            {form.image && (
              <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
                <SafeRemoteImage
                  width={640}
                  height={320}
                  src={form.image}
                  alt={form.title || "ბანერი"}
                  className="aspect-[315/158] w-full object-cover"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseModal}
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
