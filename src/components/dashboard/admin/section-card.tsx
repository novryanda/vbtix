"use client";

import Link from "next/link";
import { Users, Calendar, SparklesIcon, ArrowUpIcon, TrendingUpIcon } from "lucide-react";

import { MagicCard } from "~/components/ui/magic-card";
import {
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useAdminDashboard } from "~/lib/api/hooks";
import { formatPrice } from "~/lib/utils";

export function SectionCards() {
  const { dashboardData, isLoading, error } = useAdminDashboard();

  // Display error message if there's an error
  if (error) {
    console.error("Error loading dashboard data:", error);
  }

  // Use real data from API, fallback to 0 if not available
  const stats = dashboardData?.stats || {
    totalOrganizers: 0,
    totalEvents: 0,
    totalSales: 0,
  };

  // Extract data with fallback to default values
  const totalOrganizers = stats.totalOrganizers;
  const totalEvents = stats.totalEvents;
  const totalSales = stats.totalSales;

  return (
    <div className="dashboard-cards-grid max-w-7xl mx-auto px-2 sm:px-4">
      {/* Grid container with consistent card heights */}
      {/* Total Organizers Card */}
      <Link href="/admin/organizers" className="block group h-full">
        <MagicCard
          className="cursor-pointer border-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] h-full flex flex-col"
          gradientColor="rgba(59, 130, 246, 0.1)"
        >
          <CardHeader className="relative pb-3 sm:pb-4 flex-shrink-0">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
                <CardDescription className="text-muted-foreground/80 font-medium flex items-center gap-2 text-xs sm:text-sm">
                  <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                  <span className="truncate">Total Organizers</span>
                </CardDescription>
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                  {isLoading ? (
                    <div className="h-8 sm:h-10 w-20 sm:w-24 bg-muted animate-pulse rounded-lg"></div>
                  ) : (
                    totalOrganizers.toLocaleString()
                  )}
                </CardTitle>
              </div>
              <div className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-3 sm:p-4 shadow-lg flex-shrink-0">
                <Users className="text-white size-6 sm:size-8" />
              </div>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-2 sm:gap-3 text-xs sm:text-sm pt-0 flex-grow">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <ArrowUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
              <span className="font-semibold text-green-600">+8.2%</span>
              <span className="text-muted-foreground">dari bulan lalu</span>
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              Organizer yang terdaftar di platform
            </div>
          </CardFooter>
        </MagicCard>
      </Link>

      {/* Total Events Card */}
      <Link href="/admin/events" className="block group h-full">
        <MagicCard
          className="cursor-pointer border-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] h-full flex flex-col"
          gradientColor="rgba(147, 51, 234, 0.1)"
        >
          <CardHeader className="relative pb-3 sm:pb-4 flex-shrink-0">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
                <CardDescription className="text-muted-foreground/80 font-medium flex items-center gap-2 text-xs sm:text-sm">
                  <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 flex-shrink-0" />
                  <span className="truncate">Total Events</span>
                </CardDescription>
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                  {isLoading ? (
                    <div className="h-8 sm:h-10 w-20 sm:w-24 bg-muted animate-pulse rounded-lg"></div>
                  ) : (
                    totalEvents.toLocaleString()
                  )}
                </CardTitle>
              </div>
              <div className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 p-3 sm:p-4 shadow-lg flex-shrink-0">
                <Calendar className="text-white size-6 sm:size-8" />
              </div>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-2 sm:gap-3 text-xs sm:text-sm pt-0 flex-grow">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <ArrowUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
              <span className="font-semibold text-green-600">+15.3%</span>
              <span className="text-muted-foreground">dari bulan lalu</span>
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              Event aktif yang tersedia di platform
            </div>
          </CardFooter>
        </MagicCard>
      </Link>

      {/* Total Sales Card */}
      <div className="h-full sm:col-span-2 lg:col-span-1">
        <MagicCard
          className="border-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] h-full flex flex-col"
          gradientColor="rgba(34, 197, 94, 0.1)"
        >
          <CardHeader className="relative pb-3 sm:pb-4 flex-shrink-0">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
                <CardDescription className="text-muted-foreground/80 font-medium flex items-center gap-2 text-xs sm:text-sm">
                  <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                  <span className="truncate">Total Sales</span>
                </CardDescription>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent leading-tight">
                  {isLoading ? (
                    <div className="h-8 sm:h-10 w-24 sm:w-32 bg-muted animate-pulse rounded-lg"></div>
                  ) : (
                    <span className="break-all">{formatPrice(totalSales)}</span>
                  )}
                </CardTitle>
              </div>
              <div className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-3 sm:p-4 shadow-lg flex-shrink-0">
                <TrendingUpIcon className="text-white size-6 sm:size-8" />
              </div>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-2 sm:gap-3 text-xs sm:text-sm pt-0 flex-grow">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <ArrowUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
              <span className="font-semibold text-green-600">+12.5%</span>
              <span className="text-muted-foreground">dari bulan lalu</span>
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
              Total pendapatan dari semua event
            </div>
          </CardFooter>
        </MagicCard>
      </div>
    </div>
  );
}
