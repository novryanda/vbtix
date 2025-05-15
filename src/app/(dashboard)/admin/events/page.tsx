"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, MapPin, Search, Tag, Loader2 } from "lucide-react";

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
import { useAdminEvents } from "~/lib/api/hooks/admin";

// Interface untuk event
interface Event {
  id: string;
  title: string;
  description: string;
  venue: string;
  address: string;
  city: string;
  province: string;
  country: string;
  category: string;
  startDate: string;
  status: string;
  posterUrl?: string;
  organizerId: string;
  organizer?: {
    id: string;
    name: string;
  };
}

export default function AdminEventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch events dari API
  const { events, isLoading, error, mutate } = useAdminEvents({
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    limit: 20,
  });

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
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
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
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground">
                  Terjadi kesalahan saat memuat data. Silakan coba lagi.
                </p>
                <Button variant="outline" onClick={() => mutate()}>
                  Coba Lagi
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {events && events.length > 0 ? (
                    events.map((event: Event) => (
                      <Link href={`/admin/events/${event.id}`} key={event.id}>
                        <Card className="h-full cursor-pointer transition-all hover:shadow-md">
                          <CardHeader className="relative">
                            <div className="absolute top-6 right-6">
                              <StatusBadge
                                status={event.status.toLowerCase()}
                              />
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
                                {event.venue}, {event.city}, {event.province}
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Tag className="text-muted-foreground mt-0.5 h-4 w-4" />
                              <span>{event.category}</span>
                            </div>
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
                        }}
                      >
                        Reset Filter
                      </Button>
                    </div>
                  )}
                </div>
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
    draft: { label: "Draft", variant: "outline" },
    pending: { label: "Pending", variant: "warning" },
    published: { label: "Published", variant: "success" },
    rejected: { label: "Rejected", variant: "destructive" },
  };

  const config = statusConfig[status] || { label: status, variant: "default" };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
