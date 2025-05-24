"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Search,
  Tag,
  Loader2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { AdminRoute } from "~/components/auth/admin-route";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

// Interface untuk event yang sesuai dengan data API
interface Event {
  id: string;
  slug: string;
  title: string;
  description?: string;
  venue: string;
  address?: string;
  city?: string;
  province: string;
  country: string;
  category?: string;
  startDate: string;
  endDate: string;
  status: string;
  posterUrl?: string;
  bannerUrl?: string;
  tags: string[];
  images: string[];
  featured: boolean;
  organizerId: string;
  organizer?: {
    id: string;
    orgName: string;
    verified: boolean;
    user?: {
      id: string;
      name: string;
      email: string;
      image?: string;
    };
  };
  _count?: {
    ticketTypes: number;
    transactions: number;
  };
}

export default function AdminEventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // State for events data
  const [events, setEvents] = useState<Event[]>([]);
  const [meta, setMeta] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch events
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build URL
      const url = new URL("/api/admin/events", window.location.origin);

      if (debouncedSearch) {
        url.searchParams.append("search", debouncedSearch);
      }

      if (statusFilter !== "all") {
        url.searchParams.append("status", statusFilter);
      }

      url.searchParams.append("page", currentPage.toString());
      url.searchParams.append("limit", itemsPerPage.toString());

      console.log("Fetching events from:", url.toString());

      // Fetch data
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log("Received data:", {
        success: data.success,
        eventsCount: data.data?.length || 0,
        meta: data.meta,
      });

      if (data.success) {
        setEvents(data.data || []);
        setMeta(data.meta || null);
      } else {
        throw new Error(data.error || "Failed to fetch events");
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setEvents([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, currentPage, itemsPerPage]);

  // Fetch events when dependencies change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Function to mutate (refresh) data
  const mutate = useCallback(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Format tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AdminRoute>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold">Events</h1>
              <p className="text-muted-foreground">
                Kelola semua event yang ada di platform
              </p>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 gap-4">
                <div className="relative w-full max-w-sm">
                  <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Cari event..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Event</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PENDING_REVIEW">
                      Pending Review
                    </SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
                <span className="ml-2">Memuat data...</span>
              </div>
            ) : error ? (
              <Alert variant="destructive" className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Terjadi kesalahan saat memuat data.{" "}
                  {error.message ? `(${error.message})` : ""} Silakan coba lagi.
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => mutate()}
                  >
                    Coba Lagi
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="mb-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">Daftar Event</h2>
                      <p className="text-muted-foreground text-sm">
                        {meta?.total
                          ? `Menampilkan ${events?.length || 0} dari ${meta.total} event`
                          : "Tidak ada event"}
                      </p>
                    </div>
                    <Link href="/admin/events/create">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Event
                      </Button>
                    </Link>
                  </div>

                  {/* Status summary badges
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={statusFilter === "all" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setStatusFilter("all")}
                    >
                      Semua Event
                    </Badge>
                    <Badge
                      variant={statusFilter === "DRAFT" ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setStatusFilter("DRAFT")}
                    >
                      Draft
                    </Badge>
                    <Badge
                      variant={
                        statusFilter === "PENDING_REVIEW"
                          ? "warning"
                          : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => setStatusFilter("PENDING_REVIEW")}
                    >
                      Pending Review
                    </Badge>
                    <Badge
                      variant={
                        statusFilter === "PUBLISHED" ? "success" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => setStatusFilter("PUBLISHED")}
                    >
                      Published
                    </Badge>
                    <Badge
                      variant={
                        statusFilter === "REJECTED" ? "destructive" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => setStatusFilter("REJECTED")}
                    >
                      Rejected
                    </Badge>
                    <Badge
                      variant={
                        statusFilter === "COMPLETED" ? "secondary" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => setStatusFilter("COMPLETED")}
                    >
                      Completed
                    </Badge>
                    <Badge
                      variant={
                        statusFilter === "CANCELLED" ? "destructive" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => setStatusFilter("CANCELLED")}
                    >
                      Cancelled
                    </Badge>
                  </div> */}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {events && events.length > 0 ? (
                    events.map((event: Event) => (
                      <Link href={`/admin/events/${event.id}`} key={event.id}>
                        <Card className="h-full cursor-pointer transition-all hover:shadow-md">
                          <CardHeader className="relative">
                            <div className="absolute top-6 right-6">
                              <StatusBadge status={event.status} />
                            </div>
                            <CardTitle className="line-clamp-2">
                              {event.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {event.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex flex-col gap-4">
                            <div className="flex items-start gap-2">
                              <Calendar className="text-muted-foreground mt-0.5 h-4 w-4" />
                              <span>{formatDate(event.startDate)}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="text-muted-foreground mt-0.5 h-4 w-4" />
                              <span>
                                {event.venue}
                                {event.city && `, ${event.city}`}
                                {event.province && `, ${event.province}`}
                              </span>
                            </div>
                            {event.category && (
                              <div className="flex items-start gap-2">
                                <Tag className="text-muted-foreground mt-0.5 h-4 w-4" />
                                <span>{event.category}</span>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter>
                            <Button variant="outline" className="w-full">
                              Lihat Detail
                            </Button>
                          </CardFooter>
                        </Card>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
                      <p className="text-muted-foreground">
                        Tidak ada event yang ditemukan
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("");
                          setStatusFilter("all");
                          setCurrentPage(1);
                        }}
                      >
                        Reset Filter
                      </Button>
                    </div>
                  )}
                </div>

                {meta && meta.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className={`border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }`}
                      >
                        <span className="sr-only">Previous Page</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                      </button>

                      {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === meta.totalPages ||
                            (page >= currentPage - 1 &&
                              page <= currentPage + 1),
                        )
                        .map((page, index, array) => {
                          // Add ellipsis
                          if (
                            index > 0 &&
                            array[index - 1] !== undefined &&
                            page - array[index - 1]! > 1
                          ) {
                            return (
                              <React.Fragment key={`ellipsis-${page}`}>
                                <span className="flex h-9 w-9 items-center justify-center">
                                  ...
                                </span>
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page)}
                                  className={`focus-visible:ring-ring inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
                                    page === currentPage
                                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                      : "border-input bg-background hover:bg-accent hover:text-accent-foreground border"
                                  }`}
                                >
                                  {page}
                                </button>
                              </React.Fragment>
                            );
                          }

                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`focus-visible:ring-ring inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
                                page === currentPage
                                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                  : "border-input bg-background hover:bg-accent hover:text-accent-foreground border"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(meta.totalPages, prev + 1),
                          )
                        }
                        disabled={currentPage === meta.totalPages}
                        className={`border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                          currentPage === meta.totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }`}
                      >
                        <span className="sr-only">Next Page</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}

interface StatusBadgeProps {
  status: string;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<
    string,
    {
      label: string;
      variant:
        | "default"
        | "outline"
        | "secondary"
        | "destructive"
        | "success"
        | "warning";
    }
  > = {
    DRAFT: { label: "Draft", variant: "outline" },
    PENDING_REVIEW: { label: "Pending Review", variant: "warning" },
    PUBLISHED: { label: "Published", variant: "success" },
    REJECTED: { label: "Rejected", variant: "destructive" },
    COMPLETED: { label: "Completed", variant: "secondary" },
    CANCELLED: { label: "Cancelled", variant: "destructive" },
  };

  const config = statusConfig[status] || { label: status, variant: "default" };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
