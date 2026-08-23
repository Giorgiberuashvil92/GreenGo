"use client";

import CloudinaryImageUpload from "@/components/common/CloudinaryImageUpload";
import SafeRemoteImage from "@/components/common/SafeRemoteImage";
import {
  MenuItem,
  menuItemsApi,
  Restaurant,
  RestaurantMenuCategory,
  restaurantsApi,
} from "@/lib/api/endpoints";
import { useCallback, useEffect, useState } from "react";

type Props = {
  restaurantId: string;
  restaurant: Restaurant | null;
  menuItems: MenuItem[];
  onRestaurantUpdated: (restaurant: Restaurant) => void;
  onMenuItemsUpdated: (items: MenuItem[]) => void;
};

function sortCategories(categories: RestaurantMenuCategory[]) {
  return [...categories].sort((a, b) => a.order - b.order);
}

function sortMenuItems(items: MenuItem[]) {
  return [...items].sort((a, b) => {
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER;

    if (orderA !== orderB) return orderA - orderB;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

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

const emptyMenuItemForm: MenuItemForm = {
  name: "",
  description: "",
  price: "",
  image: "",
  heroImage: "",
  category: "",
  isPopular: false,
  isAvailable: true,
};

export default function RestaurantMenuManager({
  restaurantId,
  restaurant,
  menuItems,
  onRestaurantUpdated,
  onMenuItemsUpdated,
}: Props) {
  const [categories, setCategories] = useState<RestaurantMenuCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [savingCategories, setSavingCategories] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [editingMenuItemId, setEditingMenuItemId] = useState<string | null>(
    null,
  );
  const [menuForm, setMenuForm] = useState<MenuItemForm>(emptyMenuItemForm);
  const [savingMenuItem, setSavingMenuItem] = useState(false);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [listPreviewIds, setListPreviewIds] = useState<string[]>([]);
  const [savingListPreview, setSavingListPreview] = useState(false);

  useEffect(() => {
    const sorted = sortCategories(restaurant?.menuCategories || []);
    setCategories(sorted);
    const firstActive = sorted.find((c) => c.isActive !== false)?.name || "";
    setMenuForm((prev) =>
      prev.category ? prev : { ...prev, category: firstActive },
    );
    setListPreviewIds(restaurant?.listPreviewMenuItemIds || []);
  }, [restaurant]);

  const saveCategories = useCallback(
    async (nextCategories: RestaurantMenuCategory[]) => {
      if (!restaurantId) return;
      setSavingCategories(true);
      try {
        const updated = await restaurantsApi.update(restaurantId, {
          menuCategories: nextCategories,
        });
        const sorted = sortCategories(updated.menuCategories || nextCategories);
        setCategories(sorted);
        onRestaurantUpdated(updated);
      } catch (error) {
        console.error("Error saving menu categories:", error);
        alert("კატეგორიების შენახვა ვერ მოხერხდა");
      } finally {
        setSavingCategories(false);
      }
    },
    [restaurantId, onRestaurantUpdated],
  );

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      alert("ეს კატეგორია უკვე არსებობს");
      return;
    }

    const next = [
      ...categories,
      { name, order: categories.length, isActive: true },
    ];
    setNewCategoryName("");
    await saveCategories(next);
  };

  const handleRemoveCategory = async (name: string) => {
    if (!confirm(`წავშალოთ კატეგორია „${name}"?`)) return;
    const next = categories
      .filter((c) => c.name !== name)
      .map((c, index) => ({ ...c, order: index }));
    await saveCategories(next);
  };

  const handleMoveCategory = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    [next[index], next[target]] = [next[target], next[index]];
    await saveCategories(next.map((c, i) => ({ ...c, order: i })));
  };

  const handleTogglePopular = async (item: MenuItem) => {
    setUpdatingItemId(item._id);
    try {
      const updated = await menuItemsApi.update(item._id, {
        isPopular: !item.isPopular,
      });
      onMenuItemsUpdated(
        menuItems.map((m) => (m._id === item._id ? { ...m, ...updated } : m)),
      );
    } catch (error) {
      console.error("Error updating popular flag:", error);
      alert("პოპულარულობის განახლება ვერ მოხერხდა");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleToggleListPreview = async (itemId: string) => {
    const exists = listPreviewIds.includes(itemId);
    const next = exists
      ? listPreviewIds.filter((id) => id !== itemId)
      : listPreviewIds.length >= 12
        ? listPreviewIds
        : [...listPreviewIds, itemId];

    if (!exists && listPreviewIds.length >= 12) {
      alert("მაქსიმუმ 12 პროდუქტი ბარათის გალერეაში");
      return;
    }

    setSavingListPreview(true);
    setListPreviewIds(next);
    try {
      const updated = await restaurantsApi.update(restaurantId, {
        listPreviewMenuItemIds: next,
      });
      onRestaurantUpdated(updated);
    } catch (error) {
      console.error("Error updating list preview:", error);
      setListPreviewIds(restaurant?.listPreviewMenuItemIds || []);
      alert("ბარათის გალერეის შენახვა ვერ მოხერხდა");
    } finally {
      setSavingListPreview(false);
    }
  };

  const handleMoveListPreview = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= listPreviewIds.length) return;
    const next = [...listPreviewIds];
    [next[index], next[target]] = [next[target], next[index]];
    setSavingListPreview(true);
    setListPreviewIds(next);
    try {
      const updated = await restaurantsApi.update(restaurantId, {
        listPreviewMenuItemIds: next,
      });
      onRestaurantUpdated(updated);
    } catch (error) {
      console.error("Error reordering list preview:", error);
      setListPreviewIds(restaurant?.listPreviewMenuItemIds || []);
      alert("თანმიმდევრობის შენახვა ვერ მოხერხდა");
    } finally {
      setSavingListPreview(false);
    }
  };

  const updateMenuForm = <K extends keyof MenuItemForm>(
    key: K,
    value: MenuItemForm[K],
  ) => {
    setMenuForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetMenuForm = () => {
    const firstActive = categories.find((c) => c.isActive !== false)?.name || "";
    setMenuForm({ ...emptyMenuItemForm, category: firstActive });
    setEditingMenuItemId(null);
    setShowMenuForm(false);
  };

  const handleStartEditMenuItem = (item: MenuItem) => {
    setEditingMenuItemId(item._id);
    setMenuForm({
      name: item.name || "",
      description: item.description || "",
      price: Number.isFinite(item.price) ? String(item.price) : "",
      image: item.image || "",
      heroImage: item.heroImage || "",
      category: item.category || "",
      isPopular: !!item.isPopular,
      isAvailable: item.isAvailable !== false,
    });
    setShowMenuForm(true);
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = menuForm.name.trim();
    const price = parseFloat(menuForm.price.replace(",", "."));
    const image = menuForm.image.trim();
    const category = menuForm.category.trim();

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
      alert("აირჩიეთ ან შეიყვანეთ კატეგორია");
      return;
    }

    setSavingMenuItem(true);
    try {
      const payload = {
        name,
        description: menuForm.description.trim() || undefined,
        price,
        image,
        heroImage: menuForm.heroImage.trim() || image,
        category,
        isPopular: menuForm.isPopular,
        isAvailable: menuForm.isAvailable,
      };

      if (editingMenuItemId) {
        const updated = await menuItemsApi.update(editingMenuItemId, payload);
        onMenuItemsUpdated(
          menuItems.map((m) =>
            m._id === editingMenuItemId ? { ...m, ...updated } : m,
          ),
        );
      } else {
        const created = await menuItemsApi.create({
          restaurantId,
          ...payload,
        });
        onMenuItemsUpdated([created, ...menuItems]);
      }

      resetMenuForm();
    } catch (error) {
      console.error("Error saving menu item:", error);
      alert("პროდუქტის შენახვა ვერ მოხერხდა");
    } finally {
      setSavingMenuItem(false);
    }
  };

  const handleDeleteMenuItem = async (item: MenuItem) => {
    if (!confirm(`წავშალოთ „${item.name}"?`)) return;
    setUpdatingItemId(item._id);
    try {
      await menuItemsApi.delete(item._id);
      onMenuItemsUpdated(menuItems.filter((m) => m._id !== item._id));
    } catch (error) {
      console.error("Error deleting menu item:", error);
      alert("წაშლა ვერ მოხერხდა");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleCategoryChange = async (item: MenuItem, category: string) => {
    setUpdatingItemId(item._id);
    try {
      const updated = await menuItemsApi.update(item._id, { category });
      onMenuItemsUpdated(
        menuItems.map((m) => (m._id === item._id ? { ...m, ...updated } : m)),
      );
    } catch (error) {
      console.error("Error updating item category:", error);
      alert("კატეგორიის განახლება ვერ მოხერხდა");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleMoveMenuItem = async (index: number, direction: -1 | 1) => {
    const sortedItems = sortMenuItems(menuItems);
    const target = index + direction;
    if (target < 0 || target >= sortedItems.length) return;

    const next = [...sortedItems];
    [next[index], next[target]] = [next[target], next[index]];
    const reordered = next.map((item, itemIndex) => ({
      ...item,
      order: itemIndex,
    }));

    setUpdatingItemId(sortedItems[index]._id);
    onMenuItemsUpdated(reordered);

    try {
      await Promise.all(
        reordered.map((item) =>
          menuItemsApi.update(item._id, { order: item.order }),
        ),
      );
    } catch (error) {
      console.error("Error reordering menu items:", error);
      onMenuItemsUpdated(menuItems);
      alert("პროდუქტების რიგის შენახვა ვერ მოხერხდა");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const activeCategories = categories.filter((c) => c.isActive);
  const sortedMenuItems = sortMenuItems(menuItems);
  const popularItems = menuItems.filter((item) => item.isPopular);

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white";
  const labelClass =
    "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <div className="space-y-6">
      {/* ახალი პროდუქტი */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-white/[0.05]">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              მენიუს პროდუქტები
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              დაამატე ახალი კერძი ამ რესტორნის მენიუში
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (showMenuForm) {
                resetMenuForm();
              } else {
                setShowMenuForm(true);
              }
            }}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            {showMenuForm ? "დახურვა" : "+ პროდუქტის დამატება"}
          </button>
        </div>

        {showMenuForm && (
          <form onSubmit={handleSaveMenuItem} className="space-y-4 p-6">
            {editingMenuItemId && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300">
                პროდუქტის რედაქტირება
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className={labelClass}>სახელი *</label>
                <input
                  value={menuForm.name}
                  onChange={(e) => updateMenuForm("name", e.target.value)}
                  className={inputClass}
                  placeholder="მაგ. ბურგერი"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>ფასი (₾) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={menuForm.price}
                  onChange={(e) => updateMenuForm("price", e.target.value)}
                  className={inputClass}
                  placeholder="20.00"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>აღწერა</label>
                <textarea
                  value={menuForm.description}
                  onChange={(e) =>
                    updateMenuForm("description", e.target.value)
                  }
                  className={`${inputClass} min-h-[80px]`}
                  placeholder="ინგრედიენტები, დეტალები..."
                />
              </div>
              <div>
                <label className={labelClass}>სურათის URL *</label>
                <input
                  type="url"
                  value={menuForm.image}
                  onChange={(e) => updateMenuForm("image", e.target.value)}
                  className={inputClass}
                  placeholder="https://..."
                  required
                />
                <CloudinaryImageUpload
                  folder="greengo/products"
                  onUploaded={(url) => updateMenuForm("image", url)}
                />
              </div>
              <div>
                <label className={labelClass}>Hero სურათის URL</label>
                <input
                  type="url"
                  value={menuForm.heroImage}
                  onChange={(e) => updateMenuForm("heroImage", e.target.value)}
                  className={inputClass}
                  placeholder="ცარიელი = იგივე რაც სურათი"
                />
                <CloudinaryImageUpload
                  folder="greengo/products/hero"
                  onUploaded={(url) => updateMenuForm("heroImage", url)}
                />
              </div>
              <div>
                <label className={labelClass}>კატეგორია *</label>
                {activeCategories.length > 0 ? (
                  <select
                    value={menuForm.category}
                    onChange={(e) => updateMenuForm("category", e.target.value)}
                    className={inputClass}
                    required
                  >
                    <option value="">აირჩიეთ კატეგორია</option>
                    {activeCategories.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={menuForm.category}
                    onChange={(e) => updateMenuForm("category", e.target.value)}
                    className={inputClass}
                    placeholder="მაგ. კვება"
                    required
                  />
                )}
                {activeCategories.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">
                    ჯერ დაამატე მენიუს კატეგორია ქვემოთ, ან შეიყვანე ხელით
                  </p>
                )}
              </div>
              <div className="flex flex-col justify-end gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={menuForm.isPopular}
                    onChange={(e) =>
                      updateMenuForm("isPopular", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-brand-500"
                  />
                  პოპულარული სექციაში
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={menuForm.isAvailable}
                    onChange={(e) =>
                      updateMenuForm("isAvailable", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-brand-500"
                  />
                  ხელმისაწვდომია
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={resetMenuForm}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-700"
              >
                გაუქმება
              </button>
              <button
                type="submit"
                disabled={savingMenuItem}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {savingMenuItem
                  ? "ინახება..."
                  : editingMenuItemId
                    ? "ცვლილებების შენახვა"
                    : "პროდუქტის შენახვა"}
              </button>
            </div>
          </form>
        )}

        {menuItems.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {sortedMenuItems.map((item, index) => (
              <div
                key={item._id}
                className="flex items-center gap-3 px-6 py-3"
              >
                <div className="flex w-16 shrink-0 items-center gap-2">
                  <span className="w-6 text-sm font-semibold text-gray-500">
                    {index + 1}
                  </span>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => void handleMoveMenuItem(index, -1)}
                      disabled={updatingItemId !== null || index === 0}
                      className="rounded border border-gray-300 px-1.5 py-0.5 text-xs disabled:opacity-40 dark:border-gray-700"
                      title="ზემოთ აწევა"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleMoveMenuItem(index, 1)}
                      disabled={
                        updatingItemId !== null ||
                        index === sortedMenuItems.length - 1
                      }
                      className="rounded border border-gray-300 px-1.5 py-0.5 text-xs disabled:opacity-40 dark:border-gray-700"
                      title="ქვემოთ ჩამოწევა"
                    >
                      ↓
                    </button>
                  </div>
                </div>
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                  <SafeRemoteImage
                    width={48}
                    height={48}
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800 dark:text-white/90">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.category}
                    {item.isPopular ? " · პოპულარული" : ""}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {item.price.toFixed(2)} ₾
                </span>
                <button
                  type="button"
                  onClick={() => handleStartEditMenuItem(item)}
                  disabled={updatingItemId === item._id || savingMenuItem}
                  className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
                >
                  რედაქტირება
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteMenuItem(item)}
                  disabled={updatingItemId === item._id}
                  className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 disabled:opacity-50 dark:border-red-900/40 dark:text-red-400"
                >
                  წაშლა
                </button>
              </div>
            ))}
          </div>
        ) : (
          !showMenuForm && (
            <p className="p-6 text-sm text-gray-500">მენიუს პროდუქტები ჯერ არ არის</p>
          )
        )}
      </div>

      {/* მენიუს კატეგორიები */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-white/[0.05]">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            მენიუს კატეგორიები
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            ეს კატეგორიები ჩანს რესტორნის გვერდის ტაბებში (მაგ. კვება, კომბო)
          </p>
        </div>
        <div className="space-y-4 p-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              placeholder="მაგ. კვება, სასმელები..."
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              disabled={savingCategories || !newCategoryName.trim()}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              დამატება
            </button>
          </div>

          {categories.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              კატეგორიები ჯერ არ არის. დაამატე პირველი კატეგორია.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {categories.map((category, index) => (
                <li
                  key={category.name}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      {category.name}
                    </span>
                    {!category.isActive && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800">
                        არააქტიური
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMoveCategory(index, -1)}
                      disabled={savingCategories || index === 0}
                      className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-40 dark:border-gray-700"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveCategory(index, 1)}
                      disabled={
                        savingCategories || index === categories.length - 1
                      }
                      className="rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-40 dark:border-gray-700"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(category.name)}
                      disabled={savingCategories}
                      className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 dark:border-red-900/40 dark:text-red-400"
                    >
                      წაშლა
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ბარათის გალერეა — მთავარი / რესტორნების სია */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-white/[0.05]">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            ბარათის ფოტოები (მთავარი გვერდი)
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            რომელი პროდუქტები გამოჩნდეს რესტორნის ბარათზე (დიდი + 2 პატარა).
            თანმიმდევრობა მნიშვნელოვანია — პირველი არის დიდი ფოტო.
          </p>
        </div>
        <div className="space-y-4 p-6">
          {listPreviewIds.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                არჩეული რიგით ({listPreviewIds.length})
              </p>
              {listPreviewIds.map((id, index) => {
                const item = menuItems.find((m) => m._id === id);
                if (!item) return null;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-white/[0.05]"
                  >
                    <span className="w-6 text-sm font-semibold text-gray-500">
                      {index + 1}
                    </span>
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md">
                      <SafeRemoteImage
                        width={40}
                        height={40}
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800 dark:text-white/90">
                      {item.name}
                    </p>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={savingListPreview || index === 0}
                        onClick={() => void handleMoveListPreview(index, -1)}
                        className="rounded border px-2 py-1 text-xs disabled:opacity-40"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={
                          savingListPreview ||
                          index === listPreviewIds.length - 1
                        }
                        onClick={() => void handleMoveListPreview(index, 1)}
                        className="rounded border px-2 py-1 text-xs disabled:opacity-40"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        disabled={savingListPreview}
                        onClick={() => void handleToggleListPreview(id)}
                        className="rounded border border-red-200 px-2 py-1 text-xs text-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              ჯერ არჩეული არ არის — აპი ავტომატურად აჩვენებს პოპულარულს ან
              მენიუს პირველ პროდუქტებს (placeholder-ების გარეშე).
            </p>
          )}

          {menuItems.length === 0 ? (
            <p className="text-sm text-gray-500">მენიუს პროდუქტები არ არის</p>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                const checked = listPreviewIds.includes(item._id);
                return (
                  <label
                    key={`preview-${item._id}`}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-white/[0.05] dark:hover:bg-white/[0.02]"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={savingListPreview}
                      onChange={() => void handleToggleListPreview(item._id)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-500"
                    />
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md">
                      <SafeRemoteImage
                        width={40}
                        height={40}
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-800 dark:text-white/90">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {item.price.toFixed(2)} ₾
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ყველაზე პოპულარული */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-white/[0.05]">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            ყველაზე პოპულარული
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            მონიშნე პროდუქტები, რომლებიც ჰორიზონტალურ პოპულარულ სექციაში
            გამოჩნდება
          </p>
        </div>
        <div className="p-6">
          {popularItems.length > 0 && (
            <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 dark:bg-green-900/20">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                არჩეული: {popularItems.length} პროდუქტი
              </p>
            </div>
          )}

          {menuItems.length === 0 ? (
            <p className="text-sm text-gray-500">მენიუს პროდუქტები არ არის</p>
          ) : (
            <div className="space-y-2">
              {menuItems.map((item) => (
                <label
                  key={item._id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-white/[0.05] dark:hover:bg-white/[0.02]"
                >
                  <input
                    type="checkbox"
                    checked={!!item.isPopular}
                    disabled={updatingItemId === item._id}
                    onChange={() => handleTogglePopular(item)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-500"
                  />
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md">
                    <SafeRemoteImage
                      width={40}
                      height={40}
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-800 dark:text-white/90">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">{item.category}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {item.price.toFixed(2)} ₾
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* პროდუქტების კატეგორიის მინიჭება */}
      {menuItems.length > 0 && activeCategories.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-white/[0.05]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              პროდუქტების კატეგორიები
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              მიუთითე თითო პროდუქტი რომელ მენიუს კატეგორიაში უნდა ჩანდეს
            </p>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {menuItems.map((item) => (
              <div
                key={item._id}
                className="flex flex-col gap-2 px-6 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {item.name}
                </span>
                <select
                  value={item.category}
                  disabled={updatingItemId === item._id}
                  onChange={(e) => handleCategoryChange(item, e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {!activeCategories.some((c) => c.name === item.category) && (
                    <option value={item.category}>{item.category}</option>
                  )}
                  {activeCategories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
