"use client";

import { Skeleton } from "~/components/ui/skeleton";

export function SectionCardsSkeleton() {
  return (
    <div className="grid gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="p-6 pt-0">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-32 mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow">
      <div className="p-6">
        <Skeleton className="h-6 w-48" />
        <div className="h-[300px] mt-4 flex items-center justify-center">
          <Skeleton className="h-[250px] w-full" />
        </div>
      </div>
    </div>
  );
}

export function DataTableSkeleton() {
  return (
    <div className="px-4 lg:px-6">
      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="border rounded-md">
            <div className="h-12 px-4 border-b flex items-center">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-32 mr-4" />
              ))}
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 px-4 border-b flex items-center">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-4 w-32 mr-4" />
                ))}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <Skeleton className="h-10 w-64" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border bg-destructive/10 text-destructive p-6 m-4">
      <h3 className="text-lg font-semibold">Error</h3>
      <p>{message}</p>
    </div>
  );
}
