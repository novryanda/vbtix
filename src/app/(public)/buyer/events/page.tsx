"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  MapPin,
  Search,
  Filter,
  X,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { BuyerTopNavbar } from "~/components/navigation/buyer-top-navbar";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "~/components/ui/pagination";
import { formatPrice } from "~/lib/utils";

// Event type definition
interface Event {
  id: string;
  slug: string;
  title: string;
  description?: string;
  posterUrl?: string;
  bannerUrl?: string;
  category?: string;
  venue: string;
  address?: string;
  city?: string;
  province: string;
  country: string;
  tags: string[];
  featured: boolean;
  startDate: string;
  endDate: string;
  formattedStartDate: string;
  formattedEndDate: string;
  organizer: {
    id: string;
    orgName: string;
    verified: boolean;
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
    };
  };
  ticketInfo: {
    lowestPrice: number;
    totalTickets: number;
    soldTickets: number;
    availableTickets: number;
    percentageSold: number;
  };
}

// Pagination metadata
interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function EventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for events and loading
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState<PaginationMeta>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  });

  // State for filters
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch events from API
  const fetchEvents = async () => {
    setIsLoading(true);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (category) params.append("category", category);

      const page = searchParams.get("page") || "1";
      params.append("page", page);
      params.append("limit", "12");

      // Fetch events from API
      const response = await fetch(`/api/buyer/events?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setEvents(data.data);
        setMeta(data.meta);
      } else {
        console.error("Failed to fetch events:", data.error);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (category) params.append("category", category);

    router.push(`/events?${params.toString()}`);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setCategory("");
    router.push("/events");
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`/events?${params.toString()}`);
  };

  // Fetch events on mount and when search params change
  useEffect(() => {
    fetchEvents();
  }, [searchParams]);

  // Event card component
  const EventCard = ({ event }: { event: Event }) => (
    <Card className="h-full overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={event.posterUrl || "https://placehold.co/400x300?text=No+Image"}
          alt={event.title}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
        {event.category && (
          <Badge className="absolute top-2 left-2 bg-blue-600">
            {event.category}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="mb-2 line-clamp-1 text-lg font-semibold">
          {event.title}
        </h3>
        <div className="mb-3 space-y-1 text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1.5 text-blue-500" />
            <span>{event.formattedStartDate}</span>
          </div>
          <div className="flex items-center">
            <MapPin size={14} className="mr-1.5 text-blue-500" />
            <span className="line-clamp-1">
              {event.venue}, {event.city}
            </span>
          </div>
        </div>
        <p className="line-clamp-2 text-sm text-gray-600">
          {event.description}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t p-4">
        <div className="text-sm font-medium text-blue-600">
          {event.ticketInfo.lowestPrice > 0
            ? `${formatPrice(event.ticketInfo.lowestPrice)}`
            : "Free"}
        </div>
        <Button size="sm" asChild>
          <Link href={`/events/${event.id}`}>Detail</Link>
        </Button>
      </CardFooter>
    </Card>
  );

  // Loading skeleton
  const EventCardSkeleton = () => (
    <Card className="h-full overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <CardContent className="p-4">
        <Skeleton className="mb-2 h-6 w-3/4" />
        <div className="mb-3 space-y-1">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t p-4">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-16" />
      </CardFooter>
    </Card>
  );

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <BuyerTopNavbar />

      {/* Hero section */}
      <div className="bg-blue-600 py-12 text-white">
        <div className="container mx-auto px-4">
          <h1 className="mb-2 text-3xl font-bold">Jelajahi Event</h1>
          <p className="mb-6 text-blue-100">
            Temukan event menarik di sekitar Anda
          </p>

          {/* Search bar */}
          <div className="flex max-w-xl flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Cari event..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} className="mr-2" />
              Filter
            </Button>
            <Button onClick={applyFilters}>Cari</Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-white">
                    Kategori
                  </label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-[180px] bg-white/20 text-white">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Semua Kategori</SelectItem>
                      <SelectItem value="Konser">Konser</SelectItem>
                      <SelectItem value="Festival">Festival</SelectItem>
                      <SelectItem value="Seminar">Seminar</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                      <SelectItem value="Pameran">Pameran</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="mt-auto"
                >
                  <X size={16} className="mr-2" />
                  Reset Filter
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Events grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {isLoading
              ? "Memuat event..."
              : `${meta.totalItems} Event Ditemukan`}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {isLoading ? (
            // Show skeletons while loading
            Array.from({ length: 8 }).map((_, index) => (
              <EventCardSkeleton key={index} />
            ))
          ) : events.length > 0 ? (
            // Show events
            events.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            // Show empty state
            <div className="col-span-full py-12 text-center">
              <h3 className="mb-2 text-lg font-medium">
                Tidak ada event ditemukan
              </h3>
              <p className="text-gray-500">
                Coba ubah filter atau kata kunci pencarian Anda
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    handlePageChange(Math.max(1, meta.currentPage - 1))
                  }
                  disabled={meta.currentPage === 1}
                  className="gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>
              </PaginationItem>

              {Array.from({ length: meta.totalPages }).map((_, index) => (
                <PaginationItem key={index}>
                  <Button
                    variant={
                      meta.currentPage === index + 1 ? "default" : "outline"
                    }
                    size="icon"
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </Button>
                </PaginationItem>
              ))}

              <PaginationItem>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    handlePageChange(
                      Math.min(meta.totalPages, meta.currentPage + 1),
                    )
                  }
                  disabled={meta.currentPage === meta.totalPages}
                  className="gap-1"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </main>
  );
}
