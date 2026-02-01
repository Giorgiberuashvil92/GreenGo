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
import { categoriesApi, Category } from "@/lib/api/endpoints";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleDelete = async (id: string) => {
    if (!confirm("დარწმუნებული ხართ რომ გსურთ კატეგორიის წაშლა?")) {
      return;
    }
    try {
      await categoriesApi.delete(id);
      fetchCategories();
      setOpenDropdown(null);
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
      fetchCategories();
      setOpenDropdown(null);
    } catch (error) {
      console.error("Error updating category:", error);
      alert("განახლება ვერ მოხერხდა");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ka-GE");
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="კატეგორიები" />
      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          {loading ? (
            <div className="p-8 text-center">იტვირთება...</div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              კატეგორიები ვერ მოიძებნა
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
                      აღწერა
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
                  {categories.map((category) => (
                    <TableRow key={category._id}>
                      <TableCell className="px-5 py-4">
                        <div className="h-12 w-12 overflow-hidden rounded-md">
                          {category.image ? (
                            <Image
                              width={48}
                              height={48}
                              src={category.image}
                              alt={category.name}
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
                          {category.name}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                        {category.description || "-"}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge
                          size="sm"
                          color={category.isActive ? "success" : "error"}
                        >
                          {category.isActive ? "აქტიური" : "არააქტიური"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                        {formatDate(category.createdAt)}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setOpenDropdown(
                                openDropdown === category._id
                                  ? null
                                  : category._id
                              )
                            }
                            className="dropdown-toggle"
                          >
                            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
                          </button>
                          <Dropdown
                            isOpen={openDropdown === category._id}
                            onClose={() => setOpenDropdown(null)}
                            className="w-48 p-2"
                          >
                            <DropdownItem
                              onItemClick={() => handleToggleActive(category)}
                              className="flex w-full items-center gap-2 font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                            >
                              {category.isActive
                                ? "დეაქტივაცია"
                                : "აქტივაცია"}
                            </DropdownItem>
                            <DropdownItem
                              onItemClick={() => handleDelete(category._id)}
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
    </div>
  );
}
