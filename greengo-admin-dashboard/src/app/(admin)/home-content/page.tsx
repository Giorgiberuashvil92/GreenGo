"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import {
  HomeSection,
  Restaurant,
  homeSectionsApi,
  restaurantsApi,
} from "@/lib/api/endpoints";
import SafeRemoteImage from "@/components/common/SafeRemoteImage";
import { useEffect, useMemo, useState } from "react";

const LAYOUT_LABELS: Record<HomeSection["layout"], string> = {
  carousel: "კარუსელი",
  list: "სია",
  banner: "ბანერი",
};

export default function HomeContentPage() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<
    Record<string, string>
  >({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sectionsData, restaurantsResponse] = await Promise.all([
        homeSectionsApi.getAll(),
        restaurantsApi.getAll({ limit: 500, isActive: true }),
      ]);
      setSections(
        Array.isArray(sectionsData)
          ? [...sectionsData].sort((a, b) => a.order - b.order)
          : [],
      );
      setRestaurants(restaurantsResponse.data ?? []);
    } catch (error) {
      console.error("Error loading home content:", error);
    } finally {
      setLoading(false);
    }
  };

  const restaurantMap = useMemo(() => {
    const map = new Map<string, Restaurant>();
    restaurants.forEach((r) => map.set(r._id, r));
    return map;
  }, [restaurants]);

  const toggleActive = async (section: HomeSection) => {
    try {
      setSavingId(section._id);
      await homeSectionsApi.update(section._id, {
        isActive: !section.isActive,
      });
      await loadData();
    } catch (error) {
      console.error("Error toggling section:", error);
      alert("სექციის განახლება ვერ მოხერხდა");
    } finally {
      setSavingId(null);
    }
  };

  const addRestaurant = async (section: HomeSection) => {
    const restaurantId = selectedRestaurant[section._id];
    if (!restaurantId) return;

    if (section.restaurantIds.includes(restaurantId)) {
      alert("ეს რესტორანი უკვე დამატებულია");
      return;
    }

    try {
      setSavingId(section._id);
      await homeSectionsApi.addRestaurant(section._id, restaurantId);
      setSelectedRestaurant((prev) => ({ ...prev, [section._id]: "" }));
      await loadData();
    } catch (error) {
      console.error("Error adding restaurant:", error);
      alert("რესტორნის დამატება ვერ მოხერხდა");
    } finally {
      setSavingId(null);
    }
  };

  const removeRestaurant = async (section: HomeSection, restaurantId: string) => {
    try {
      setSavingId(section._id);
      await homeSectionsApi.removeRestaurant(section._id, restaurantId);
      await loadData();
    } catch (error) {
      console.error("Error removing restaurant:", error);
      alert("რესტორნის წაშლა ვერ მოხერხდა");
    } finally {
      setSavingId(null);
    }
  };

  const availableRestaurants = (section: HomeSection) =>
    restaurants.filter((r) => !section.restaurantIds.includes(r._id));

  return (
    <div>
      <PageBreadcrumb pageTitle="მთავარი გვერდის კონტენტი" />
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            მთავარი გვერდის სექციები
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            ჩართეთ/გამორთეთ სექციები და დაამატეთ რესტორნები თითო კატეგორიაში
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-white/[0.05] dark:bg-white/[0.03]">
            იტვირთება...
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section) => {
              const isExpanded = expandedId === section._id;
              const isBanner = section.layout === "banner";
              const assigned = section.restaurantIds
                .map((id) => restaurantMap.get(id))
                .filter(Boolean) as Restaurant[];

              return (
                <div
                  key={section._id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : section._id)
                        }
                        className="text-left"
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800 dark:text-white/90">
                            {section.title}
                          </h3>
                          <Badge
                            size="sm"
                            color={
                              section.isActive ? "success" : "warning"
                            }
                          >
                            {section.isActive ? "ჩართული" : "გამორთული"}
                          </Badge>
                          <Badge size="sm" color="info">
                            {LAYOUT_LABELS[section.layout]}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {isBanner
                            ? "ბანერები მართეთ „ბანერები“ გვერდზე"
                            : `${assigned.length} რესტორანი`}
                        </p>
                      </button>
                    </div>

                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={section.isActive}
                        disabled={savingId === section._id}
                        onChange={() => toggleActive(section)}
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-brand-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700" />
                    </label>
                  </div>

                  {isExpanded && !isBanner ? (
                    <div className="border-t border-gray-100 p-5 dark:border-white/[0.05]">
                      <div className="mb-4 flex flex-wrap gap-2">
                        <select
                          value={selectedRestaurant[section._id] ?? ""}
                          onChange={(e) =>
                            setSelectedRestaurant((prev) => ({
                              ...prev,
                              [section._id]: e.target.value,
                            }))
                          }
                          className="min-w-[220px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-transparent"
                        >
                          <option value="">აირჩიეთ რესტორანი...</option>
                          {availableRestaurants(section).map((r) => (
                            <option key={r._id} value={r._id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={
                            !selectedRestaurant[section._id] ||
                            savingId === section._id
                          }
                          onClick={() => addRestaurant(section)}
                          className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white hover:bg-brand-600 disabled:opacity-50"
                        >
                          + დამატება
                        </button>
                      </div>

                      {assigned.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          რესტორნები ჯერ არ არის დამატებული. „ყველა ობიექტი“
                          სექციაში ცარიელი სიისას აპი ყველა აქტიურ რესტორანს
                          აჩვენებს.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {assigned.map((restaurant) => (
                            <div
                              key={restaurant._id}
                              className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 dark:border-white/[0.05]"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 overflow-hidden rounded-md bg-gray-100">
                                  <SafeRemoteImage
                                    src={restaurant.image}
                                    alt={restaurant.name}
                                    width={40}
                                    height={40}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                    {restaurant.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    რეიტინგი: {restaurant.rating ?? 0}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                disabled={savingId === section._id}
                                onClick={() =>
                                  removeRestaurant(section, restaurant._id)
                                }
                                className="text-sm text-red-500 hover:text-red-600"
                              >
                                წაშლა
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}

                  {isExpanded && isBanner ? (
                    <div className="border-t border-gray-100 p-5 text-sm text-gray-500 dark:border-white/[0.05]">
                      პრომო ბანერების სურათები და ტექსტები მართეთ{" "}
                      <a href="/banners" className="text-brand-500 underline">
                        ბანერების
                      </a>{" "}
                      გვერდზე. აქ მხოლოდ ჩართვა/გამორთვაა.
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
