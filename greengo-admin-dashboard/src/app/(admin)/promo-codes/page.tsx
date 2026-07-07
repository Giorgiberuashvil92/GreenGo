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
import { MoreDotIcon, PencilIcon, TrashBinIcon } from "@/icons";
import { PromoCode, promoCodesApi } from "@/lib/api/endpoints";
import { useEffect, useState } from "react";

type PromoForm = {
  code: string;
  description: string;
  discountType: "percentage" | "free_delivery" | "fixed_total";
  discountValue: string;
  minOrderAmount: string;
  maxDiscount: string;
  startsAt: string;
  expiresAt: string;
  usageLimit: string;
  isActive: boolean;
};

const emptyForm: PromoForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "10",
  minOrderAmount: "0",
  maxDiscount: "",
  startsAt: "",
  expiresAt: "",
  usageLimit: "",
  isActive: true,
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white";
const labelClass =
  "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";

function normalizePromoType(
  discountType: PromoCode["discountType"],
): PromoForm["discountType"] {
  if (discountType === "fixed") {
    return "fixed_total";
  }
  return discountType;
}

function promoToForm(promo: PromoCode): PromoForm {
  const discountType = normalizePromoType(promo.discountType);
  return {
    code: promo.code,
    description: promo.description || "",
    discountType,
    discountValue:
      discountType === "free_delivery" ? "0" : String(promo.discountValue),
    minOrderAmount: String(promo.minOrderAmount ?? 0),
    maxDiscount:
      promo.maxDiscount != null ? String(promo.maxDiscount) : "",
    startsAt: promo.startsAt ? promo.startsAt.slice(0, 10) : "",
    expiresAt: promo.expiresAt ? promo.expiresAt.slice(0, 10) : "",
    usageLimit: promo.usageLimit != null ? String(promo.usageLimit) : "",
    isActive: promo.isActive,
  };
}

function formatDiscount(promo: PromoCode): string {
  const discountType = normalizePromoType(promo.discountType);
  if (discountType === "free_delivery") {
    return "უფასო მიტანა";
  }
  if (discountType === "percentage") {
    return `${promo.discountValue}%`;
  }
  return `${promo.discountValue.toFixed(2)} ₾ საერთოდ`;
}

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<PromoForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const data = await promoCodesApi.getAll();
      setPromoCodes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching promo codes:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateForm = <K extends keyof PromoForm>(key: K, value: PromoForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleOpenCreate = () => {
    setEditingPromo(null);
    setIsCreating(true);
    setForm(emptyForm);
  };

  const handleOpenEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    setIsCreating(false);
    setForm(promoToForm(promo));
    setOpenDropdown(null);
  };

  const handleCloseModal = () => {
    setEditingPromo(null);
    setIsCreating(false);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    const code = form.code.trim().toUpperCase();
    if (!code) {
      alert("გთხოვთ შეიყვანოთ კოდი");
      return;
    }

    const discountValue =
      form.discountType === "free_delivery" ? 0 : Number(form.discountValue);
    if (
      form.discountType !== "free_delivery" &&
      (Number.isNaN(discountValue) || discountValue <= 0)
    ) {
      alert("ფასდაკლების ოდენობა არასწორია");
      return;
    }

    const payload = {
      code,
      description: form.description.trim() || undefined,
      discountType: form.discountType,
      discountValue,
      minOrderAmount: Number(form.minOrderAmount) || 0,
      maxDiscount:
        form.discountType === "percentage" && form.maxDiscount
          ? Number(form.maxDiscount)
          : undefined,
      startsAt: form.startsAt || undefined,
      expiresAt: form.expiresAt || undefined,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      isActive: form.isActive,
    };

    try {
      setSaving(true);
      if (editingPromo) {
        await promoCodesApi.update(editingPromo._id, payload);
      } else {
        await promoCodesApi.create(payload);
      }
      handleCloseModal();
      await fetchPromoCodes();
    } catch (error) {
      console.error("Error saving promo code:", error);
      alert("შენახვა ვერ მოხერხდა");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("დარწმუნებული ხართ რომ გსურთ პრომო კოდის წაშლა?")) {
      return;
    }

    try {
      await promoCodesApi.delete(id);
      setOpenDropdown(null);
      await fetchPromoCodes();
    } catch (error) {
      console.error("Error deleting promo code:", error);
      alert("წაშლა ვერ მოხერხდა");
    }
  };

  const handleToggleActive = async (promo: PromoCode) => {
    try {
      await promoCodesApi.update(promo._id, { isActive: !promo.isActive });
      setOpenDropdown(null);
      await fetchPromoCodes();
    } catch (error) {
      console.error("Error updating promo code:", error);
      alert("განახლება ვერ მოხერხდა");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ka-GE");
  };

  const isModalOpen = isCreating || Boolean(editingPromo);

  return (
    <div>
      <PageBreadcrumb pageTitle="პრომო კოდები" />
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            onClick={handleOpenCreate}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            + ახალი კოდი
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          {loading ? (
            <div className="p-8 text-center">იტვირთება...</div>
          ) : promoCodes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              პრომო კოდები ვერ მოიძებნა
            </div>
          ) : (
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      კოდი
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      ფასდაკლება
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      მინ. ჯამი
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      გამოყენება
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      ვადა
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      სტატუსი
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      მოქმედებები
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {promoCodes.map((promo) => (
                    <TableRow key={promo._id}>
                      <TableCell className="px-5 py-4">
                        <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {promo.code}
                        </div>
                        {promo.description ? (
                          <div className="text-gray-500 text-theme-xs dark:text-gray-400">
                            {promo.description}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDiscount(promo)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                        {(promo.minOrderAmount ?? 0).toFixed(2)} ₾
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                        {promo.usedCount}
                        {promo.usageLimit != null ? ` / ${promo.usageLimit}` : ""}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(promo.expiresAt)}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge
                          size="sm"
                          color={promo.isActive ? "success" : "error"}
                        >
                          {promo.isActive ? "აქტიური" : "არააქტიური"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setOpenDropdown(
                                openDropdown === promo._id ? null : promo._id,
                              )
                            }
                            className="dropdown-toggle"
                          >
                            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
                          </button>
                          <Dropdown
                            isOpen={openDropdown === promo._id}
                            onClose={() => setOpenDropdown(null)}
                            className="w-48 p-2"
                          >
                            <DropdownItem
                              onItemClick={() => handleOpenEdit(promo)}
                              className="flex w-full items-center gap-2 rounded-lg text-left font-normal text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                            >
                              <PencilIcon className="h-4 w-4" />
                              რედაქტირება
                            </DropdownItem>
                            <DropdownItem
                              onItemClick={() => handleToggleActive(promo)}
                              className="flex w-full items-center gap-2 rounded-lg text-left font-normal text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                            >
                              {promo.isActive ? "დეაქტივაცია" : "აქტივაცია"}
                            </DropdownItem>
                            <DropdownItem
                              onItemClick={() => handleDelete(promo._id)}
                              className="flex w-full items-center gap-2 rounded-lg text-left font-normal text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10"
                            >
                              <TrashBinIcon className="h-4 w-4" />
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-xl">
        <div className="p-6">
          <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
            {editingPromo ? "პრომო კოდის რედაქტირება" : "ახალი პრომო კოდი"}
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass}>კოდი</label>
              <input
                className={inputClass}
                value={form.code}
                onChange={(e) => updateForm("code", e.target.value.toUpperCase())}
                placeholder="SAVE10"
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>აღწერა</label>
              <input
                className={inputClass}
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="10% ფასდაკლება"
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
                    e.target.value as PromoForm["discountType"],
                  )
                }
              >
                <option value="percentage">პროცენტი (პროდუქტებზე)</option>
                <option value="free_delivery">უფასო მიტანა</option>
                <option value="fixed_total">ფიქსირებული თანხა (საერთო ჯამიდან)</option>
              </select>
            </div>

            {form.discountType !== "free_delivery" ? (
              <div>
                <label className={labelClass}>ფასდაკლება</label>
                <input
                  className={inputClass}
                  value={form.discountValue}
                  onChange={(e) => updateForm("discountValue", e.target.value)}
                  placeholder={
                    form.discountType === "percentage" ? "10" : "5"
                  }
                />
              </div>
            ) : (
              <div className="flex items-end pb-2 text-sm text-gray-500 dark:text-gray-400">
                მიტანის საფასური გახდება 0 ₾
              </div>
            )}

            <div>
              <label className={labelClass}>მინ. შეკვეთა (₾)</label>
              <input
                className={inputClass}
                value={form.minOrderAmount}
                onChange={(e) => updateForm("minOrderAmount", e.target.value)}
              />
            </div>

            {form.discountType === "percentage" ? (
              <div>
                <label className={labelClass}>მაქს. ფასდაკლება (₾)</label>
                <input
                  className={inputClass}
                  value={form.maxDiscount}
                  onChange={(e) => updateForm("maxDiscount", e.target.value)}
                  placeholder="ოფციონალური"
                />
              </div>
            ) : null}

            <div>
              <label className={labelClass}>დაწყება</label>
              <input
                type="date"
                className={inputClass}
                value={form.startsAt}
                onChange={(e) => updateForm("startsAt", e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>ვადის გასვლა</label>
              <input
                type="date"
                className={inputClass}
                value={form.expiresAt}
                onChange={(e) => updateForm("expiresAt", e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>გამოყენების ლიმიტი</label>
              <input
                className={inputClass}
                value={form.usageLimit}
                onChange={(e) => updateForm("usageLimit", e.target.value)}
                placeholder="ოფციონალური"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                id="promo-active"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => updateForm("isActive", e.target.checked)}
              />
              <label htmlFor="promo-active" className="text-sm text-gray-700 dark:text-gray-300">
                აქტიური
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={handleCloseModal}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
            >
              გაუქმება
            </button>
            <button
              onClick={() => void handleSave()}
              disabled={saving}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {saving ? "ინახება..." : "შენახვა"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
