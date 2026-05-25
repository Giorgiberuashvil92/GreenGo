"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
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
import { MoreDotIcon, PencilIcon, PlusIcon, TrashBinIcon } from "@/icons";
import { CreateRestaurantPayload, Restaurant, restaurantsApi } from "@/lib/api/endpoints";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

type RestaurantFormState = {
  name: string;
  description: string;
  deliveryFee: string;
  deliveryTime: string;
  image: string;
  heroImage: string;
  latitude: string;
  longitude: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
  categories: string;
  cuisine: string;
  priceRange: "€" | "€€" | "€€€" | "€€€€";
  phone: string;
  email: string;
  website: string;
  isActive: boolean;
  hasDelivery: boolean;
  hasPickup: boolean;
  hasDineIn: boolean;
  acceptsOnlineOrders: boolean;
};

const createInitialRestaurantForm = (): RestaurantFormState => ({
  name: "",
  description: "",
  deliveryFee: "",
  deliveryTime: "30-40 წუთი",
  image: "",
  heroImage: "",
  latitude: "",
  longitude: "",
  address: "",
  city: "თბილისი",
  district: "",
  postalCode: "",
  categories: "",
  cuisine: "",
  priceRange: "€€",
  phone: "",
  email: "",
  website: "",
  isActive: true,
  hasDelivery: true,
  hasPickup: false,
  hasDineIn: false,
  acceptsOnlineOrders: true,
});

const inputClassName =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90";

const labelClassName =
  "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";

const splitListInput = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const formatRestaurantAddress = (restaurant: Restaurant) => {
  if (restaurant.location) {
    return `${restaurant.location.address}, ${restaurant.location.city}`;
  }

  if (restaurant.address) {
    return `${restaurant.address.street}, ${restaurant.address.city}`;
  }

  return "N/A";
};

const featureCheckboxes: Array<{
  field: "isActive" | "hasDelivery" | "hasPickup" | "hasDineIn" | "acceptsOnlineOrders";
  label: string;
}> = [
  { field: "isActive", label: "აქტიური" },
  { field: "hasDelivery", label: "მიტანა" },
  { field: "hasPickup", label: "ადგილზე წაღება" },
  { field: "hasDineIn", label: "ადგილზე კვება" },
  { field: "acceptsOnlineOrders", label: "ონლაინ შეკვეთები" },
];

const RESTAURANTS_PAGE_LIMIT = 10;

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
  const [formData, setFormData] = useState<RestaurantFormState>(createInitialRestaurantForm);
  const [saving, setSaving] = useState(false);
  const [togglingRestaurantId, setTogglingRestaurantId] = useState<string | null>(null);

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      
      const params: Record<string, any> = {
        page,
        limit: RESTAURANTS_PAGE_LIMIT,
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
  }, [isActiveFilter, page]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleOpenCreate = () => {
    setEditingRestaurant(null);
    setFormData(createInitialRestaurantForm());
    setShowModal(true);
  };

  const handleOpenEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name || "",
      description: restaurant.description || "",
      deliveryFee: restaurant.deliveryFee?.toString() || "",
      deliveryTime: restaurant.deliveryTime || "30-40 წუთი",
      image: restaurant.image || "",
      heroImage: restaurant.heroImage || restaurant.image || "",
      latitude:
        restaurant.location?.latitude?.toString() ||
        restaurant.address?.coordinates?.latitude?.toString() ||
        "",
      longitude:
        restaurant.location?.longitude?.toString() ||
        restaurant.address?.coordinates?.longitude?.toString() ||
        "",
      address: restaurant.location?.address || restaurant.address?.street || "",
      city: restaurant.location?.city || restaurant.address?.city || "თბილისი",
      district: restaurant.location?.district || "",
      postalCode: restaurant.location?.postalCode || "",
      categories: restaurant.categories?.join(", ") || "",
      cuisine: restaurant.cuisine?.join(", ") || restaurant.cuisineType || "",
      priceRange: restaurant.priceRange || "€€",
      phone: restaurant.contact?.phone || "",
      email: restaurant.contact?.email || "",
      website: restaurant.contact?.website || "",
      isActive: restaurant.isActive,
      hasDelivery: restaurant.features?.hasDelivery ?? true,
      hasPickup: restaurant.features?.hasPickup ?? false,
      hasDineIn: restaurant.features?.hasDineIn ?? false,
      acceptsOnlineOrders: restaurant.features?.acceptsOnlineOrders ?? true,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingRestaurant(null);
    setFormData(createInitialRestaurantForm());
  };

  const updateFormField = <K extends keyof RestaurantFormState>(
    field: K,
    value: RestaurantFormState[K],
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSaveRestaurant = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const categories = splitListInput(formData.categories);
    const deliveryFee = Number(formData.deliveryFee);
    const latitude = Number(formData.latitude);
    const longitude = Number(formData.longitude);

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.deliveryTime.trim() ||
      !formData.image.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      categories.length === 0 ||
      Number.isNaN(deliveryFee) ||
      Number.isNaN(latitude) ||
      Number.isNaN(longitude)
    ) {
      alert("გთხოვთ შეავსოთ ყველა სავალდებულო ველი სწორად");
      return;
    }

    const contact: CreateRestaurantPayload["contact"] = {};
    if (formData.phone.trim()) contact.phone = formData.phone.trim();
    if (formData.email.trim()) contact.email = formData.email.trim();
    if (formData.website.trim()) contact.website = formData.website.trim();

    const cuisine = splitListInput(formData.cuisine);
    const payload: CreateRestaurantPayload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      deliveryFee,
      deliveryTime: formData.deliveryTime.trim(),
      image: formData.image.trim(),
      heroImage: formData.heroImage.trim() || formData.image.trim(),
      isActive: formData.isActive,
      location: {
        latitude,
        longitude,
        address: formData.address.trim(),
        city: formData.city.trim(),
        district: formData.district.trim() || undefined,
        postalCode: formData.postalCode.trim() || undefined,
      },
      categories,
      priceRange: formData.priceRange,
      features: {
        hasDelivery: formData.hasDelivery,
        hasPickup: formData.hasPickup,
        hasDineIn: formData.hasDineIn,
        acceptsOnlineOrders: formData.acceptsOnlineOrders,
      },
    };

    if (Object.keys(contact).length > 0) {
      payload.contact = contact;
    }

    if (cuisine.length > 0) {
      payload.cuisine = cuisine;
    }

    try {
      setSaving(true);
      if (editingRestaurant) {
        await restaurantsApi.update(editingRestaurant._id, payload);
        await fetchRestaurants();
      } else {
        await restaurantsApi.create(payload);
        if (page === 1) {
          await fetchRestaurants();
        } else {
          setPage(1);
        }
      }

      setShowModal(false);
      setEditingRestaurant(null);
      setFormData(createInitialRestaurantForm());
    } catch (error) {
      console.error("Error saving restaurant:", error);
      alert(`რესტორნის შენახვა ვერ მოხერხდა: ${error instanceof Error ? error.message : "უცნობი შეცდომა"}`);
    } finally {
      setSaving(false);
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
          >
            <PlusIcon className="h-4 w-4" />
            ახალი რესტორანი
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
          {loading ? (
            <div className="p-8 text-center">იტვირთება...</div>
          ) : restaurants.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              რესტორნები ვერ მოიძებნა
            </div>
          ) : (
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/5">
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
                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
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
                        {formatRestaurantAddress(restaurant)}
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
                                handleOpenEdit(restaurant);
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
          {total > RESTAURANTS_PAGE_LIMIT && (
            <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4 dark:border-white/5">
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
                  disabled={page * RESTAURANTS_PAGE_LIMIT >= total}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800"
                >
                  შემდეგი
                </button>
              </div>
            </div>
          )}
        </div>

        <Modal isOpen={showModal} onClose={handleCloseModal} className="m-4 max-w-[900px]">
          <div className="no-scrollbar max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
            <div className="mb-6 pr-12">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                {editingRestaurant ? "რესტორნის რედაქტირება" : "ახალი რესტორნის დამატება"}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                შეავსეთ ძირითადი ინფორმაცია, მისამართი და სურათების ბმულები.
              </p>
            </div>

            <form onSubmit={handleSaveRestaurant} className="space-y-6">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white/90">
                  ძირითადი ინფორმაცია
                </h3>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div>
                    <label className={labelClassName}>სახელი *</label>
                    <input
                      value={formData.name}
                      onChange={(e) => updateFormField("name", e.target.value)}
                      className={inputClassName}
                      placeholder="მაგ: Green Bistro"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>კატეგორიები *</label>
                    <input
                      value={formData.categories}
                      onChange={(e) => updateFormField("categories", e.target.value)}
                      className={inputClassName}
                      placeholder="burger, pizza, vegan"
                      required
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className={labelClassName}>აღწერა *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateFormField("description", e.target.value)}
                      className={`${inputClassName} min-h-24 resize-y`}
                      placeholder="რესტორნის მოკლე აღწერა"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>მიტანის საფასური *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.deliveryFee}
                      onChange={(e) => updateFormField("deliveryFee", e.target.value)}
                      className={inputClassName}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>მიტანის დრო *</label>
                    <input
                      value={formData.deliveryTime}
                      onChange={(e) => updateFormField("deliveryTime", e.target.value)}
                      className={inputClassName}
                      placeholder="30-40 წუთი"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>ფასის დიაპაზონი</label>
                    <select
                      value={formData.priceRange}
                      onChange={(e) =>
                        updateFormField("priceRange", e.target.value as RestaurantFormState["priceRange"])
                      }
                      className={inputClassName}
                    >
                      <option value="€">€</option>
                      <option value="€€">€€</option>
                      <option value="€€€">€€€</option>
                      <option value="€€€€">€€€€</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClassName}>სამზარეულო</label>
                    <input
                      value={formData.cuisine}
                      onChange={(e) => updateFormField("cuisine", e.target.value)}
                      className={inputClassName}
                      placeholder="ქართული, იტალიური"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white/90">
                  მისამართი
                </h3>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="lg:col-span-2">
                    <label className={labelClassName}>მისამართი *</label>
                    <input
                      value={formData.address}
                      onChange={(e) => updateFormField("address", e.target.value)}
                      className={inputClassName}
                      placeholder="ქუჩა და ნომერი"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>ქალაქი *</label>
                    <input
                      value={formData.city}
                      onChange={(e) => updateFormField("city", e.target.value)}
                      className={inputClassName}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>უბანი</label>
                    <input
                      value={formData.district}
                      onChange={(e) => updateFormField("district", e.target.value)}
                      className={inputClassName}
                      placeholder="მაგ: ვაკე"
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>Latitude *</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => updateFormField("latitude", e.target.value)}
                      className={inputClassName}
                      placeholder="41.7151"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>Longitude *</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => updateFormField("longitude", e.target.value)}
                      className={inputClassName}
                      placeholder="44.8271"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>საფოსტო კოდი</label>
                    <input
                      value={formData.postalCode}
                      onChange={(e) => updateFormField("postalCode", e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white/90">
                  სურათები და კონტაქტი
                </h3>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div>
                    <label className={labelClassName}>სურათის URL *</label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => updateFormField("image", e.target.value)}
                      className={inputClassName}
                      placeholder="https://..."
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>Hero სურათის URL</label>
                    <input
                      type="url"
                      value={formData.heroImage}
                      onChange={(e) => updateFormField("heroImage", e.target.value)}
                      className={inputClassName}
                      placeholder="ცარიელი დატოვებისას გამოიყენება მთავარი სურათი"
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>ტელეფონი</label>
                    <input
                      value={formData.phone}
                      onChange={(e) => updateFormField("phone", e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label className={labelClassName}>ელ. ფოსტა</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormField("email", e.target.value)}
                      className={inputClassName}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className={labelClassName}>ვებგვერდი</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => updateFormField("website", e.target.value)}
                      className={inputClassName}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white/90">
                  სტატუსი და ფუნქციები
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {featureCheckboxes.map(({ field, label }) => (
                    <label
                      key={field}
                      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      <input
                        type="checkbox"
                        checked={formData[field]}
                        onChange={(e) => updateFormField(field, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 dark:border-gray-700 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/3"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "ინახება..."
                    : editingRestaurant
                      ? "ცვლილებების შენახვა"
                      : "რესტორნის დამატება"}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
}
