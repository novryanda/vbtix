"use client";

import {
  TrendingUpIcon,
  Calendar,
  Ticket,
  DollarSign,
  Users,
  SparklesIcon,
  ArrowUpIcon,
} from "lucide-react";
import { useParams } from "next/navigation";

import { Badge } from "~/components/ui/badge";
import { MagicCard } from "~/components/ui/magic-card";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useOrganizerDashboard } from "~/lib/api/hooks/organizer";
import { formatPrice } from "~/lib/utils";

export function SectionCards() {
  const params = useParams();
  const organizerId = params.id as string;
  const { data, isLoading, error } = useOrganizerDashboard(organizerId);

  // Show error message if there's an error
  if (error) {
    console.error("Error loading dashboard data:", error);
  }

  // Default values if data is loading or there's an error - using nullish coalescing
  const totalEvents = data?.data?.stats?.totalEvents ?? 5;
  const totalTicketsSold = data?.data?.stats?.totalTicketsSold ?? 127;
  const totalRevenue = data?.data?.stats?.totalRevenue ?? 2450000;
  const upcomingEventsCount = data?.data?.stats?.upcomingEventsCount ?? 3;
  return (
    <div className="flex flex-wrap gap-4 sm:gap-6 max-w-7xl mx-auto px-2 sm:px-4 justify-center sm:justify-start">
      {/* Flex container with content-based card sizing */}      {/* Total Events Card */}
      <MagicCard
        className="border-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] flex flex-col min-w-[280px] max-w-sm"
        gradientColor="rgba(34, 197, 94, 0.1)"
      >
        <CardHeader className="relative pb-3 sm:pb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
              <CardDescription className="text-muted-foreground/80 font-medium flex items-center gap-2 text-xs sm:text-sm">
                <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                <span className="truncate">Total Events</span>
              </CardDescription>
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent leading-tight">
                {isLoading ? (
                  <div className="h-8 sm:h-10 w-16 sm:w-20 bg-muted animate-pulse rounded-lg"></div>
                ) : (
                  totalEvents.toLocaleString()
                )}
              </CardTitle>
            </div>
            <div className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-3 sm:p-4 shadow-lg flex-shrink-0">
              <Calendar className="text-white size-6 sm:size-8" />
            </div>
          </div>
        </CardHeader>
        
      </MagicCard>      {/* Tickets Sold Card */}
      <MagicCard
        className="border-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] flex flex-col min-w-[280px] max-w-sm"
        gradientColor="rgba(59, 130, 246, 0.1)"
      >
        <CardHeader className="relative pb-3 sm:pb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
              <CardDescription className="text-muted-foreground/80 font-medium flex items-center gap-2 text-xs sm:text-sm">
                <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                <span className="truncate">Tickets Sold</span>
              </CardDescription>
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
                {isLoading ? (
                  <div className="h-8 sm:h-10 w-20 sm:w-24 bg-muted animate-pulse rounded-lg"></div>
                ) : (
                  totalTicketsSold.toLocaleString()
                )}
              </CardTitle>
            </div>
            <div className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 p-3 sm:p-4 shadow-lg flex-shrink-0">
              <Ticket className="text-white size-6 sm:size-8" />
            </div>
          </div>
        </CardHeader>      
      </MagicCard>

      {/* Total Revenue Card */}
      <MagicCard
        className="border-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] flex flex-col min-w-[320px] w-fit"
        gradientColor="rgba(147, 51, 234, 0.1)"
      >
        <CardHeader className="relative pb-3 sm:pb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
              <CardDescription className="text-muted-foreground/80 font-medium flex items-center gap-2 text-xs sm:text-sm">
                <SparklesIcon className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 flex-shrink-0" />
                <span className="truncate">Total Revenue</span>
              </CardDescription>
              <CardTitle className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent leading-tight">
                {isLoading ? (
                  <div className="h-8 sm:h-10 w-24 sm:w-32 bg-muted animate-pulse rounded-lg"></div>
                ) : (
                  <span className="inline-block whitespace-nowrap">{formatPrice(totalRevenue)}</span>
                )}
              </CardTitle>
            </div>
            <div className="rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 p-3 sm:p-4 shadow-lg flex-shrink-0">
              <DollarSign className="text-white size-6 sm:size-8" />
            </div>
          </div>
        </CardHeader>      </MagicCard>
    </div>
  );
}
