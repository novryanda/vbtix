"use client";

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { AdminRoute } from "~/components/auth/admin-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "~/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "~/components/ui/pagination"
import {
  CalendarDays,
  Check,
  ChevronDown,
  Eye,
  MoreHorizontal,
  Search,
  X
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Badge } from "~/components/ui/badge"
import { useAdminEvents, useReviewEvent } from "~/lib/api/hooks"
import { EventsTableSkeleton, EventsFilterSkeleton, EventsPaginationSkeleton, EventsErrorState } from "~/components/dashboard/admin/events-loading"
import { formatDate } from "~/lib/utils"
import Link from "next/link"

export default function AdminEventsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState<string>("");

  const { data, isLoading, error } = useAdminEvents({ page, limit, status, search });
  const reviewEventMutation = useReviewEvent();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const searchQuery = formData.get("search") as string;
    setSearch(searchQuery);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value === "all" ? undefined : value);
  };

  const handleApproveEvent = async (id: string) => {
    try {
      await reviewEventMutation.mutateAsync({
        id,
        status: "approved",
      });
      // Refetch events after approval
      // This will be handled by React Query's invalidation
    } catch (error) {
      console.error("Error approving event:", error);
    }
  };

  const handleRejectEvent = async (id: string) => {
    try {
      await reviewEventMutation.mutateAsync({
        id,
        status: "rejected",
      });
      // Refetch events after rejection
      // This will be handled by React Query's invalidation
    } catch (error) {
      console.error("Error rejecting event:", error);
    }
  };

  return (
    <AdminRoute>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Events Management</h2>
          <p className="text-muted-foreground">
            Manage all events on the platform
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">
            <CalendarDays className="mr-2 h-4 w-4" />
            Add New Event
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>
            View and manage all events on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {error ? (
              <EventsErrorState message="Failed to load events. Please try again later." />
            ) : (
              <>
                {isLoading ? (
                  <EventsFilterSkeleton />
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          name="search"
                          placeholder="Search events..."
                          className="w-full pl-8 bg-background"
                          defaultValue={search}
                        />
                      </div>
                      <Button type="submit" variant="outline" size="icon">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </form>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Select defaultValue={status || "all"} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="PENDING">Pending Review</SelectItem>
                          <SelectItem value="PUBLISHED">Published</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select defaultValue="newest">
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                          <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {isLoading ? (
                  <EventsTableSkeleton />
                ) : (
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
                        {data?.events && data.events.length > 0 ? (
                          data.events.map((event) => (
                            <TableRow key={event.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <div>{event.title}</div>
                                    <div className="text-xs text-muted-foreground">{event.venue}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{event.organizer?.orgName || "Unknown"}</TableCell>
                              <TableCell>{formatDate(new Date(event.startDate))}</TableCell>
                              <TableCell>
                                <StatusBadge status={event.status.toLowerCase() as any} />
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Actions</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem asChild>
                                      <Link href={`/admin/events/${event.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                      </Link>
                                    </DropdownMenuItem>
                                    {event.status === "PENDING" && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleApproveEvent(event.id)}>
                                          <Check className="mr-2 h-4 w-4" />
                                          Approve
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleRejectEvent(event.id)}>
                                          <X className="mr-2 h-4 w-4" />
                                          Reject
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                              No events found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {isLoading ? (
                  <EventsPaginationSkeleton />
                ) : (
                  data?.pagination && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (page > 1) setPage(page - 1);
                            }}
                            className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              href="#"
                              isActive={pageNum === page}
                              onClick={(e) => {
                                e.preventDefault();
                                setPage(pageNum);
                              }}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (page < data.pagination.totalPages) setPage(page + 1);
                            }}
                            className={page >= data.pagination.totalPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface StatusBadgeProps {
  status: "draft" | "pending" | "published" | "rejected"
}

function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    draft: { label: "Draft", variant: "outline" as const },
    pending: { label: "Pending Review", variant: "warning" as const },
    published: { label: "Published", variant: "success" as const },
    rejected: { label: "Rejected", variant: "destructive" as const },
  }

  const config = statusConfig[status]

  return (
    <Badge variant={config.variant}>{config.label}</Badge>
  )
}

// Sample data
const events = [
  {
    id: "1",
    title: "Music Festival 2025",
    venue: "Jakarta Convention Center",
    organizer: "Music Events Inc.",
    date: "May 15, 2025",
    status: "published" as const,
  },
  {
    id: "2",
    title: "Tech Conference",
    venue: "Bandung Tech Hub",
    organizer: "Tech Community",
    date: "June 10, 2025",
    status: "pending" as const,
  },
  {
    id: "3",
    title: "Food Festival",
    venue: "Surabaya Grand City",
    organizer: "Culinary Association",
    date: "July 5, 2025",
    status: "draft" as const,
  },
  {
    id: "4",
    title: "Art Exhibition",
    venue: "Bali Art Center",
    organizer: "Creative Arts",
    date: "August 20, 2025",
    status: "rejected" as const,
  },
  {
    id: "5",
    title: "Sports Tournament",
    venue: "Yogyakarta Stadium",
    organizer: "Sports Organization",
    date: "September 12, 2025",
    status: "published" as const,
  },
]
    </AdminRoute>
  )
}