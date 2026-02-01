"use client";
import { ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import { ordersApi, restaurantsApi, usersApi } from "@/lib/api/endpoints";
import { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";

export const EcommerceMetrics = () => {
  const [usersCount, setUsersCount] = useState<number>(0);
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [restaurantsCount, setRestaurantsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const [users, orders, restaurants] = await Promise.all([
          usersApi.getAll(),
          ordersApi.getAll({ limit: 1 }),
          restaurantsApi.getAll({ limit: 1 }),
        ]);

        setUsersCount(Array.isArray(users) ? users.length : 0);
        setOrdersCount(orders?.total || 0);
        setRestaurantsCount(restaurants?.total || 0);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="animate-pulse">
            <div className="h-12 w-12 bg-gray-200 rounded-xl dark:bg-gray-700"></div>
            <div className="mt-5 h-4 bg-gray-200 rounded w-24 dark:bg-gray-700"></div>
            <div className="mt-2 h-8 bg-gray-200 rounded w-16 dark:bg-gray-700"></div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="animate-pulse">
            <div className="h-12 w-12 bg-gray-200 rounded-xl dark:bg-gray-700"></div>
            <div className="mt-5 h-4 bg-gray-200 rounded w-24 dark:bg-gray-700"></div>
            <div className="mt-2 h-8 bg-gray-200 rounded w-16 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              მომხმარებლები
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {usersCount.toLocaleString()}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            Active
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              შეკვეთები
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {ordersCount.toLocaleString()}
            </h4>
          </div>

          <Badge color="success">
            <ArrowUpIcon />
            Total
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIconLine className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              რესტორნები
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {restaurantsCount.toLocaleString()}
            </h4>
          </div>

          <Badge color="success">
            <ArrowUpIcon />
            Active
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
};
