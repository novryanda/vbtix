"use client";

import { useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { PlusIcon, SearchIcon, ShieldAlert } from "lucide-react";

import { OrganizerRoute } from "~/components/auth/organizer-route";
import { OrganizerPageWrapper } from "~/components/dashboard/organizer/organizer-page-wrapper";
import {
  useOrganizerEvents,
  useOrganizerSettings,
} from "~/lib/api/hooks/organizer";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { EventStatus } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { EventsTable } from "~/components/dashboard/organizer/events-table";
import { PaginationControls } from "~/components/dashboard/organizer/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

export default function EventsPage() {
  const params = useParams();
  const organizerId = params.id as string;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get query parameters
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";
  const status = searchParams.get("status") as EventStatus | null;
  const search = searchParams.get("search") || "";

  // State for search input
  const [searchInput, setSearchInput] = useState(search);

  // Fetch events data with query parameters
  const { data, isLoading, error } = useOrganizerEvents(organizerId, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    status: status || undefined,
    search: search || undefined,
  });

  // Fetch organizer settings to check verification status
  const { settings, isLoading: isLoadingSettings } =
    useOrganizerSettings(organizerId);

  // Type assertion for TypeScript
  const eventsData = data as
    | {
        success: boolean;
        data: any[];
        meta: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }
    | undefined;

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set("search", searchInput);
    params.set("page", "1"); // Reset to first page on new search
    router.push(`/organizer/${organizerId}/events?${params.toString()}`);
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    params.set("page", "1"); // Reset to first page on filter change
    router.push(`/organizer/${organizerId}/events?${params.toString()}`);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/organizer/${organizerId}/events?${params.toString()}`);
  };

  // Calculate pagination values
  const currentPage = parseInt(page, 10);
  const totalPages = eventsData?.meta?.totalPages || 1;

  return (
    <OrganizerRoute>
      <OrganizerPageWrapper>
        <div className="px-4 lg:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold">Events</h1>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      onClick={() =>
                        router.push(`/organizer/${organizerId}/events/new`)
                      }
                      disabled={settings && !settings.verified}
                    >
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Create Event
                    </Button>
                  </div>
                </TooltipTrigger>
                {settings && !settings.verified && (
                  <TooltipContent side="left">
                    <p>Your account must be verified to create events</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <form
              onSubmit={handleSearch}
              className="flex w-full max-w-sm items-center space-x-2"
            >
              <Input
                type="search"
                placeholder="Search events..."
                className="w-full"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Button type="submit" size="icon" variant="ghost">
                <SearchIcon className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </form>

            <div className="flex items-center space-x-2">
              <Select
                value={status || "ALL"}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value={EventStatus.DRAFT}>Draft</SelectItem>
                  <SelectItem value={EventStatus.PUBLISHED}>
                    Published
                  </SelectItem>
                  <SelectItem value={EventStatus.CANCELLED}>
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-6">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <h3 className="mb-2 text-lg font-semibold">
                Error loading events
              </h3>
              <p className="text-muted-foreground text-sm">
                {error.message || "Failed to load events. Please try again."}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.refresh()}
              >
                Try Again
              </Button>
            </div>
          ) : eventsData?.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <h3 className="mb-2 text-lg font-semibold">No events found</h3>
              <p className="text-muted-foreground text-sm">
                You haven't created any events yet or no events match your
                search criteria.
              </p>
              {settings && !settings.verified ? (
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() =>
                    router.push(`/organizer/${organizerId}/verification`)
                  }
                >
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  Verify Your Account
                </Button>
              ) : (
                <Button
                  className="mt-4"
                  onClick={() =>
                    router.push(`/organizer/${organizerId}/events/new`)
                  }
                  disabled={settings && !settings.verified}
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Create Your First Event
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <EventsTable data={eventsData?.data || []} />
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </OrganizerPageWrapper>
    </OrganizerRoute>
  );
}
