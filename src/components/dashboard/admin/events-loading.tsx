"use client";

import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "~/components/ui/table";

export function EventsTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Organizer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function EventsFilterSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between">
      <div className="flex gap-2 w-full sm:w-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-10" />
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[180px]" />
      </div>
    </div>
  );
}

export function EventsPaginationSkeleton() {
  return (
    <div className="flex justify-center">
      <Skeleton className="h-10 w-64" />
    </div>
  );
}

export function EventsErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border bg-destructive/10 text-destructive p-6">
      <h3 className="text-lg font-semibold">Error</h3>
      <p>{message}</p>
    </div>
  );
}
