"use client";

import {
  MenuItem,
  RestaurantOffer,
  restaurantOffersApi,
} from "@/lib/api/endpoints";
import { useCallback, useEffect, useMemo, useState } from "react";

type Props = {
  restaurantId: string;
  menuItems: MenuItem[];
};

type OfferForm = {
  title: string;
  description: string;
  discountType: "percentage" | "delivery_fixed";
  discountValue: string;
  menuItemIds: string[];
  isActive: boolean;
  sortOrder: string;
};

const emptyForm: OfferForm = {
  title: "",
  description: "",
  discountType: "percentage",
  discountValue: "25",
  menuItemIds: [],
  isActive: true,
  sortOrder: "0",
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white";
const labelClass =
  "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";

function menuItemIdOf(
  item: string | { _id: string },
): string {
  return typeof item === "string" ? item : item._id;
}

function offerToForm(offer: RestaurantOffer): OfferForm {
  return {
    title: offer.title,
    description: offer.description || "",
    discountType: offer.discountType,
    discountValue: String(offer.discountValue),
    menuItemIds: (offer.menuItemIds || []).map(menuItemIdOf),
    isActive: offer.isActive,
    sortOrder: String(offer.sortOrder ?? 0),
  };
}

function formatOfferDiscount(offer: RestaurantOffer): string {
  if (offer.discountType === "delivery_fixed") {
    return `−${offer.discountValue.toFixed(2)} ₾ მიტანაზე`;
  }
  return `${offer.discountValue}%`;
}

export default function RestaurantOffersManager({
  restaurantId,
  menuItems,
}: Props) {
  const [offers, setOffers] = useState<RestaurantOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<RestaurantOffer | null>(
    null,
  );
  const [form, setForm] = useState<OfferForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const fetchOffers = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const data = await restaurantOffersApi.getAll({ restaurantId });
      setOffers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching restaurant offers:", error);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    void fetchOffers();
  }, [fetchOffers]);

  const filteredMenuItems = useMemo(() => {
    const q = productSearch.trim().toLocaleLowerCase("ka");
    if (!q) return menuItems;
    return menuItems.filter(
      (item) =>
        item.name.toLocaleLowerCase("ka").includes(q) ||
        (item.category || "").toLocaleLowerCase("ka").includes(q),
    );
  }, [menuItems, productSearch]);

  const updateForm = <K extends keyof OfferForm>(key: K, value: OfferForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleOpenCreate = () => {
    setEditingOffer(null);
    setForm(emptyForm);
    setProductSearch("");
    setShowForm(true);
  };

  const handleOpenEdit = (offer: RestaurantOffer) => {
    setEditingOffer(offer);
    setForm(offerToForm(offer));
    setProductSearch("");
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingOffer(null);
    setForm(emptyForm);
    setProductSearch("");
  };

  const toggleMenuItem = (id: string) => {
    setForm((prev) => {
      const has = prev.menuItemIds.includes(id);
      return {
        ...prev,
        menuItemIds: has
          ? prev.menuItemIds.filter((x) => x !== id)
          : [...prev.menuItemIds, id],
      };
    });
  };

  const handleSave = async () => {
    const title = form.title.trim();
    if (!title) {
      alert("გთხოვთ შეიყვანოთ სათაური");
      return;
    }

    const discountValue = Number(form.discountValue);
    if (Number.isNaN(discountValue) || discountValue <= 0) {
      alert("ფასდაკლების ოდენობა არასწორია");
      return;
    }

    if (
      form.discountType === "percentage" &&
      form.menuItemIds.length === 0
    ) {
      alert("პროცენტული შეთავაზებისთვის აირჩიეთ მინიმუმ ერთი პროდუქტი");
      return;
    }

    const payload = {
      restaurantId,
      title,
      description: form.description.trim() || undefined,
      discountType: form.discountType,
      discountValue,
      menuItemIds:
        form.discountType === "delivery_fixed" ? [] : form.menuItemIds,
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder) || 0,
    };

    try {
      setSaving(true);
      if (editingOffer) {
        await restaurantOffersApi.update(editingOffer._id, payload);
      } else {
        await restaurantOffersApi.create(payload);
      }
      handleCloseForm();
      await fetchOffers();
    } catch (error) {
      console.error("Error saving offer:", error);
      alert(
        error instanceof Error
          ? error.message
          : "შეთავაზების შენახვა ვერ მოხერხდა",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (offer: RestaurantOffer) => {
    if (!confirm(`წავშალოთ „${offer.title}“?`)) return;
    try {
      await restaurantOffersApi.delete(offer._id);
      await fetchOffers();
    } catch (error) {
      console.error("Error deleting offer:", error);
      alert("წაშლა ვერ მოხერხდა");
    }
  };

  return (
    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            შეთავაზებები
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            რესტორნის ბეიჯები აპში — პროცენტი შერჩეულ პროდუქტებზე ან მიტანის
            ფასდაკლება
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          + ახალი შეთავაზება
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">იტვირთება...</p>
      ) : offers.length === 0 ? (
        <p className="text-sm text-gray-500">შეთავაზებები ჯერ არ არის.</p>
      ) : (
        <ul className="space-y-3">
          {offers.map((offer) => {
            const count = (offer.menuItemIds || []).length;
            return (
              <li
                key={offer._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      {offer.title}
                    </span>
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                      {formatOfferDiscount(offer)}
                    </span>
                    {!offer.isActive ? (
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        გამორთული
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {offer.discountType === "percentage"
                      ? `${count} პროდუქტი`
                      : "მიტანის ფასდაკლება"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(offer)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-white dark:border-gray-600 dark:text-gray-200"
                  >
                    რედაქტირება
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(offer)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400"
                  >
                    წაშლა
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {showForm ? (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/50">
          <h4 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
            {editingOffer ? "შეთავაზების რედაქტირება" : "ახალი შეთავაზება"}
          </h4>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>სათაური</label>
              <input
                className={inputClass}
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                placeholder="25% Off on Selected Items"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>აღწერა (ოფციონალური)</label>
              <textarea
                className={inputClass}
                rows={2}
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>ტიპი</label>
              <select
                className={inputClass}
                value={form.discountType}
                onChange={(e) =>
                  updateForm(
                    "discountType",
                    e.target.value as OfferForm["discountType"],
                  )
                }
              >
                <option value="percentage">პროცენტი შერჩეულ პროდუქტებზე</option>
                <option value="delivery_fixed">ფიქსირებული მიტანის ფასდაკლება</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                {form.discountType === "percentage"
                  ? "პროცენტი (%)"
                  : "თანხა (₾)"}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={form.discountValue}
                onChange={(e) => updateForm("discountValue", e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>თანმიმდევრობა</label>
              <input
                type="number"
                className={inputClass}
                value={form.sortOrder}
                onChange={(e) => updateForm("sortOrder", e.target.value)}
              />
            </div>

            <div className="flex items-end pb-2">
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

          {form.discountType === "percentage" ? (
            <div className="mt-4">
              <label className={labelClass}>
                პროდუქტები ({form.menuItemIds.length} არჩეული)
              </label>
              <input
                className={`${inputClass} mb-2`}
                placeholder="ძიება სახელით ან კატეგორიით..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
              <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
                {filteredMenuItems.length === 0 ? (
                  <p className="p-3 text-sm text-gray-500">პროდუქტები არ მოიძებნა</p>
                ) : (
                  filteredMenuItems.map((item) => {
                    const checked = form.menuItemIds.includes(item._id);
                    return (
                      <label
                        key={item._id}
                        className="flex cursor-pointer items-center gap-3 border-b border-gray-100 px-3 py-2 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleMenuItem(item._id)}
                        />
                        <span className="min-w-0 flex-1 truncate text-sm text-gray-800 dark:text-gray-200">
                          {item.name}
                        </span>
                        <span className="shrink-0 text-xs text-gray-500">
                          {item.price.toFixed(2)} ₾
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          ) : null}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {saving ? "ინახება..." : "შენახვა"}
            </button>
            <button
              type="button"
              onClick={handleCloseForm}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              გაუქმება
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
