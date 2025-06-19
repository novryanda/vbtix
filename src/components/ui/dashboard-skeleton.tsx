"use client";

import { MagicCard } from "~/components/ui/magic-card";
import { CardHeader, CardFooter } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export function DashboardCardSkeleton() {
  return (
    <MagicCard className="border-0 bg-background/50 backdrop-blur-sm shadow-xl h-full flex flex-col">
      <CardHeader className="relative pb-3 sm:pb-4 flex-shrink-0">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 sm:h-4 sm:w-4 rounded-full" />
              <Skeleton className="h-3 w-20 sm:h-4 sm:w-24" />
            </div>
            <Skeleton className="h-8 w-24 sm:h-10 sm:w-32" />
          </div>
          <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl" />
        </div>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-2 sm:gap-3 text-xs sm:text-sm pt-0 flex-grow">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <Skeleton className="h-3 w-3 sm:h-4 sm:w-4" />
          <Skeleton className="h-3 w-12 sm:h-4 sm:w-16" />
          <Skeleton className="h-3 w-16 sm:h-4 sm:w-20" />
        </div>
        <Skeleton className="h-3 w-32 sm:h-4 sm:w-40" />
      </CardFooter>
    </MagicCard>
  );
}

export function DashboardChartSkeleton() {
  return (
    <MagicCard className="border-0 bg-background/50 backdrop-blur-sm shadow-xl">
      <CardHeader className="relative pb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="absolute top-4 right-4">
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </CardHeader>
      <div className="px-6 pb-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
        <div className="h-[240px] w-full">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      </div>
    </MagicCard>
  );
}

export function DashboardTableSkeleton() {
  return (
    <MagicCard className="border-0 bg-background/50 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
      </CardHeader>
      <div className="px-6 pb-6">
        <div className="space-y-4">
          {/* Table header */}
          <div className="flex gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          {/* Table rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </MagicCard>
  );
}

export function DashboardGridSkeleton({
  cards = 4,
  className = "dashboard-cards-grid max-w-7xl mx-auto px-2 sm:px-4"
}: {
  cards?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: cards }).map((_, i) => (
        <DashboardCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>
      
      {/* Cards grid skeleton */}
      <DashboardGridSkeleton />
      
      {/* Chart skeleton */}
      <DashboardChartSkeleton />
      
      {/* Table skeleton */}
      <DashboardTableSkeleton />
    </div>
  );
}
