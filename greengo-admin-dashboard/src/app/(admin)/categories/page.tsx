"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import SafeRemoteImage from "@/components/common/SafeRemoteImage";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PencilIcon, PlusIcon, TrashBinIcon } from "@/icons";
import { categoriesApi, Category } from "@/lib/api/endpoints";
import { FormEvent, useEffect, useState } from "react";

type CategoryForm = {
  name: string;
  description: string;
  icon: string;
  bgColor: string;
  order: string;
  isActive: boolean;
};

const emptyForm: CategoryForm = {
  name: "",
  description: "",
  icon: "",
  bgColor: "#F5F5F5",
  order: "0",
  isActive: true,
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white";
const labelClass =
  "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      order: String(categories.length),
    });
    setShowForm(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm({
      name: category.name,
      description: category.description || "",
      icon: category.icon || category.image || "",
      bgColor: category.bgColor || "#F5F5F5",
      order: String(category.order ?? 0),
      isActive: category.isActive,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      alert("სახელი სავალდებულოა");
      return;
    }

    const payload = {
      name,
      description: form.description.trim() || undefined,
      icon: form.icon.trim() || undefined,
      bgColor: form.bgColor.trim() || "#F5F5F5",
      order: Number(form.order) || 0,
      isActive: form.isActive,
    };

    try {
      setSaving(true);
      if (editing) {
        await categoriesApi.update(editing._id, payload);
      } else {
        await categoriesApi.create(payload);
      }
      closeForm();
      await fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      alert(error instanceof Error ? error.message : "შენახვა ვერ მოხერხდა");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("დარწმუნებული ხართ რომ გსურთ კატეგორიის წაშლა?")) return;
    try {
      await categoriesApi.delete(id);
      await fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("წაშლა ვერ მოხერხდა");
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      await categoriesApi.update(category._id, {
        isActive: !category.isActive,
      });
      await fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      alert("განახლება ვერ მოხერხდა");
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="კატეგორიები" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ეს კატეგორიები ჩანს მთავარ ეკრანზე და რესტორნებზე ინიშნება
            დროფდაუნით
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            <PlusIcon className="h-4 w-4" />
            ახალი კატეგორია
          </button>
        </div>

        {showForm ? (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6"
          >
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              {editing ? "კატეგორიის რედაქტირება" : "ახალი კატეგორია"}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>სახელი *</label>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="მაგ: კვება"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>ფონის ფერი</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.bgColor}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, bgColor: e.target.value }))
                    }
                    className="h-11 w-14 cursor-pointer rounded-lg border border-gray-300 bg-white p-1 dark:border-gray-700"
                  />
                  <input
                    className={inputClass}
                    value={form.bgColor}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, bgColor: e.target.value }))
                    }
                    placeholder="#F5F5F5"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>აღწერა</label>
                <input
                  className={inputClass}
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>აიკონის URL</label>
                <input
                  className={inputClass}
                  value={form.icon}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, icon: e.target.value }))
                  }
                  placeholder="https://..."
                />
                {form.icon ? (
                  <div className="mt-2 h-12 w-12 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                    <SafeRemoteImage
                      width={48}
                      height={48}
                      src={form.icon}
                      alt="preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}
              </div>
              <div>
                <label className={labelClass}>თანმიმდევრობა</label>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.order}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, order: e.target.value }))
                  }
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                  />
                  აქტიური (ჩანს აპში)
                </label>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
              >
                {saving ? "ინახება..." : "შენახვა"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-200"
              >
                გაუქმება
              </button>
            </div>
          </form>
        ) : null}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          {loading ? (
            <div className="p-8 text-center">იტვირთება...</div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              კატეგორიები ჯერ არ არის. დაამატეთ პირველი.
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
                      აიკონი
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
                      ფერი
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      თანმიმდევრობა
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
                  {categories.map((category) => {
                    const iconUrl = category.icon || category.image;
                    return (
                      <TableRow key={category._id}>
                        <TableCell className="px-5 py-4">
                          <div
                            className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md"
                            style={{
                              backgroundColor: category.bgColor || "#F5F5F5",
                            }}
                          >
                            {iconUrl ? (
                              <SafeRemoteImage
                                width={40}
                                height={40}
                                src={iconUrl}
                                alt={category.name}
                                className="h-10 w-10 object-contain"
                              />
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {category.name}
                          </div>
                          {category.description ? (
                            <div className="mt-0.5 text-xs text-gray-500">
                              {category.description}
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-5 w-5 rounded border border-gray-200 dark:border-gray-700"
                              style={{
                                backgroundColor: category.bgColor || "#F5F5F5",
                              }}
                            />
                            <span className="text-xs text-gray-500">
                              {category.bgColor || "#F5F5F5"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-theme-sm">
                          {category.order ?? 0}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => void handleToggleActive(category)}
                          >
                            <Badge
                              size="sm"
                              color={category.isActive ? "success" : "error"}
                            >
                              {category.isActive ? "აქტიური" : "არააქტიური"}
                            </Badge>
                          </button>
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(category)}
                              className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(category._id)}
                              className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-500/10"
                            >
                              <TrashBinIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
