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
import { Courier, couriersApi } from "@/lib/api/endpoints";
import { MoreDotIcon, PencilIcon, TrashBinIcon } from "@/icons";
import { useCallback, useEffect, useMemo, useState } from "react";

type CourierForm = {
  name: string;
  phoneNumber: string;
  email: string;
  status: Courier["status"];
  isActive: boolean;
};

const emptyForm: CourierForm = {
  name: "",
  phoneNumber: "",
  email: "",
  status: "offline",
  isActive: true,
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white";
const labelClass =
  "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";

const statusOptions: Array<{ value: Courier["status"]; label: string }> = [
  { value: "available", label: "ხელმისაწვდომი" },
  { value: "busy", label: "დაკავებული" },
  { value: "offline", label: "ოფლაინი" },
];

function getStatusLabel(status: Courier["status"]) {
  return statusOptions.find((option) => option.value === status)?.label || status;
}

function getStatusColor(status: Courier["status"]) {
  if (status === "available") return "success";
  if (status === "busy") return "warning";
  return "light";
}

function courierToForm(courier: Courier): CourierForm {
  return {
    name: courier.name || "",
    phoneNumber: courier.phoneNumber,
    email: courier.email || "",
    status: courier.status || "offline",
    isActive: courier.isActive,
  };
}

export default function CouriersPage() {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [editingCourier, setEditingCourier] = useState<Courier | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<CourierForm>(emptyForm);
  const [statusFilter, setStatusFilter] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");

  const fetchCouriers = useCallback(async (phoneNumber = phoneSearch.trim()) => {
    try {
      setLoading(true);
      const response = await couriersApi.getAll({
        limit: 100,
        status: statusFilter || undefined,
        phoneNumber: phoneNumber || undefined,
      });
      setCouriers(response.data || []);
    } catch (error) {
      console.error("Error fetching couriers:", error);
      alert("კურიერების ჩატვირთვა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  }, [phoneSearch, statusFilter]);

  useEffect(() => {
    void fetchCouriers();
  }, [fetchCouriers]);

  const stats = useMemo(() => {
    return {
      total: couriers.length,
      available: couriers.filter((courier) => courier.status === "available").length,
      busy: couriers.filter((courier) => courier.status === "busy").length,
      offline: couriers.filter((courier) => courier.status === "offline").length,
    };
  }, [couriers]);

  const updateForm = <K extends keyof CourierForm>(
    key: K,
    value: CourierForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleOpenCreate = () => {
    setEditingCourier(null);
    setIsCreating(true);
    setForm(emptyForm);
  };

  const handleOpenEdit = (courier: Courier) => {
    setEditingCourier(courier);
    setIsCreating(false);
    setForm(courierToForm(courier));
    setOpenDropdown(null);
  };

  const handleCloseModal = () => {
    setEditingCourier(null);
    setIsCreating(false);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    const phoneNumber = form.phoneNumber.trim();
    if (!phoneNumber) {
      alert("გთხოვთ შეიყვანოთ ტელეფონის ნომერი");
      return;
    }

    const payload = {
      name: form.name.trim() || undefined,
      phoneNumber,
      email: form.email.trim() || undefined,
      status: form.status,
      isAvailable: form.status === "available",
      isActive: form.isActive,
    };

    try {
      setSaving(true);
      if (editingCourier) {
        await couriersApi.update(editingCourier._id, payload);
      } else {
        await couriersApi.create(payload);
      }
      handleCloseModal();
      await fetchCouriers();
    } catch (error) {
      console.error("Error saving courier:", error);
      alert("შენახვა ვერ მოხერხდა");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("დარწმუნებული ხართ რომ გსურთ კურიერის წაშლა?")) {
      return;
    }

    try {
      await couriersApi.delete(id);
      setOpenDropdown(null);
      await fetchCouriers();
    } catch (error) {
      console.error("Error deleting courier:", error);
      alert("წაშლა ვერ მოხერხდა");
    }
  };

  const handleSetStatus = async (courier: Courier, status: Courier["status"]) => {
    try {
      await couriersApi.update(courier._id, {
        status,
        isAvailable: status === "available",
      });
      setOpenDropdown(null);
      await fetchCouriers();
    } catch (error) {
      console.error("Error updating courier status:", error);
      alert("სტატუსის განახლება ვერ მოხერხდა");
    }
  };

  const handleToggleActive = async (courier: Courier) => {
    try {
      await couriersApi.update(courier._id, { isActive: !courier.isActive });
      setOpenDropdown(null);
      await fetchCouriers();
    } catch (error) {
      console.error("Error updating courier:", error);
      alert("განახლება ვერ მოხერხდა");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ka-GE");
  };

  const isModalOpen = isCreating || Boolean(editingCourier);

  return (
    <div>
      <PageBreadcrumb pageTitle="კურიერები" />
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="სულ" value={stats.total} />
          <StatCard label="ხელმისაწვდომი" value={stats.available} />
          <StatCard label="დაკავებული" value={stats.busy} />
          <StatCard label="ოფლაინი" value={stats.offline} />
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03] sm:flex-row sm:items-end sm:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>ტელეფონით ძებნა</label>
              <input
                className={inputClass}
                value={phoneSearch}
                onChange={(event) => setPhoneSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void fetchCouriers();
                }}
                placeholder="+995..."
              />
            </div>
            <div>
              <label className={labelClass}>სტატუსი</label>
              <select
                className={inputClass}
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">ყველა</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => void fetchCouriers()}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
            >
              ძებნა
            </button>
            <button
              onClick={handleOpenCreate}
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              + ახალი კურიერი
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          {loading ? (
            <div className="p-8 text-center">იტვირთება...</div>
          ) : couriers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              კურიერები ვერ მოიძებნა
            </div>
          ) : (
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      კურიერი
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      კონტაქტი
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      სტატუსი
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      აქტიურობა
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      მიწოდებები
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      დამატებულია
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                      მოქმედებები
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {couriers.map((courier) => (
                    <TableRow key={courier._id}>
                      <TableCell className="px-5 py-4">
                        <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {courier.name || "უსახელო კურიერი"}
                        </div>
                        <div className="text-gray-500 text-theme-xs dark:text-gray-400">
                          ID: {courier._id.slice(-6)}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                        <div>{courier.phoneNumber}</div>
                        <div className="text-theme-xs">{courier.email || "-"}</div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge size="sm" color={getStatusColor(courier.status)}>
                          {getStatusLabel(courier.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge size="sm" color={courier.isActive ? "success" : "error"}>
                          {courier.isActive ? "აქტიური" : "გამორთული"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                        {courier.totalDeliveries ?? 0}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(courier.createdAt)}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setOpenDropdown(
                                openDropdown === courier._id ? null : courier._id,
                              )
                            }
                            className="dropdown-toggle"
                          >
                            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
                          </button>
                          <Dropdown
                            isOpen={openDropdown === courier._id}
                            onClose={() => setOpenDropdown(null)}
                            className="w-56 p-2"
                          >
                            <DropdownItem
                              onItemClick={() => handleOpenEdit(courier)}
                              className="flex w-full items-center gap-2 rounded-lg text-left font-normal text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                            >
                              <PencilIcon className="h-4 w-4" />
                              რედაქტირება
                            </DropdownItem>
                            {statusOptions.map((option) => (
                              <DropdownItem
                                key={option.value}
                                onItemClick={() => void handleSetStatus(courier, option.value)}
                                className="flex w-full items-center gap-2 rounded-lg text-left font-normal text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                              >
                                სტატუსი: {option.label}
                              </DropdownItem>
                            ))}
                            <DropdownItem
                              onItemClick={() => void handleToggleActive(courier)}
                              className="flex w-full items-center gap-2 rounded-lg text-left font-normal text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                            >
                              {courier.isActive ? "გამორთვა" : "ჩართვა"}
                            </DropdownItem>
                            <DropdownItem
                              onItemClick={() => void handleDelete(courier._id)}
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} className="max-w-xl p-6">
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              {editingCourier ? "კურიერის რედაქტირება" : "ახალი კურიერი"}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>სახელი</label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                placeholder="კურიერის სახელი"
              />
            </div>
            <div>
              <label className={labelClass}>ტელეფონი</label>
              <input
                className={inputClass}
                value={form.phoneNumber}
                onChange={(event) => updateForm("phoneNumber", event.target.value)}
                placeholder="+995..."
              />
            </div>
            <div>
              <label className={labelClass}>ელ. ფოსტა</label>
              <input
                className={inputClass}
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
                placeholder="mail@example.com"
              />
            </div>
            <div>
              <label className={labelClass}>სტატუსი</label>
              <select
                className={inputClass}
                value={form.status}
                onChange={(event) =>
                  updateForm("status", event.target.value as Courier["status"])
                }
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => updateForm("isActive", event.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            აქტიური კურიერი
          </label>
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCloseModal}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
        {value}
      </div>
    </div>
  );
}
