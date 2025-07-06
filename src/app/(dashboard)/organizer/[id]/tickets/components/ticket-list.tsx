"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { MagicCard } from "~/components/ui/magic-card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useOrganizerSoldTickets } from "~/lib/api/hooks/organizer-tickets";
import { QRCodeDisplayCompact } from "~/components/ui/qr-code-display";
import { TicketQRModal } from "~/components/ui/ticket-qr-modal";
import { IndividualTicketLogoUpload } from "~/components/ui/individual-ticket-logo-upload";
import Image from "next/image";
import { formatPrice } from "~/lib/utils";
import {
  MoreHorizontalIcon,
  SearchIcon,
  DownloadIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  RefreshCwIcon,
  TicketIcon,
  AlertCircleIcon,
  QrCode,
  ImageIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

interface TicketListProps {
  organizerId: string;
  filters: any;
  onFiltersChange?: (filters: any) => void;
}

export function TicketList({ organizerId, filters, onFiltersChange }: TicketListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [logoUploadStates, setLogoUploadStates] = useState<Record<string, boolean>>({});

  // Combine filters with search term and pagination
  const currentFilters = useMemo(() => ({
    ...filters,
    search: searchTerm,
    page: filters.page || 1,
    limit: filters.limit || 10
  }), [filters, searchTerm]);

  const { data, isLoading, error, refetch } = useOrganizerSoldTickets(
    organizerId,
    currentFilters
  );

  // Extract data and meta early to avoid reference errors
  const tickets = data?.data || [];
  const meta = data?.meta || null;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handlePageChange = useCallback((newPage: number) => {
    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        page: newPage
      });
    }
  }, [onFiltersChange, filters]);

  const handlePreviousPage = useCallback(() => {
    if (meta && meta.page > 1) {
      handlePageChange(meta.page - 1);
    }
  }, [meta, handlePageChange]);

  const handleNextPage = useCallback(() => {
    if (meta && meta.page < meta.totalPages) {
      handlePageChange(meta.page + 1);
    }
  }, [meta, handlePageChange]);

  const handlePageSizeChange = useCallback((newPageSize: string) => {
    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        page: 1, // Reset to first page when changing page size
        limit: parseInt(newPageSize)
      });
    }
  }, [onFiltersChange, filters]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!meta) return;

      // Only handle keyboard navigation when not typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.key === "ArrowLeft" && meta.page > 1) {
        event.preventDefault();
        handlePreviousPage();
      } else if (event.key === "ArrowRight" && meta.page < meta.totalPages) {
        event.preventDefault();
        handleNextPage();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [meta, handlePreviousPage, handleNextPage]);

  const handleViewQRCode = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsQRModalOpen(true);
  };

  const handleCloseQRModal = () => {
    setIsQRModalOpen(false);
    setSelectedTicket(null);
  };

  const handleLogoUploadSuccess = (ticketId: string) => {
    // Refresh the tickets data to show updated logo
    refetch();
  };

  const handleLogoUploadError = (ticketId: string, error: string) => {
    console.error(`Logo upload error for ticket ${ticketId}:`, error);
    // You could show a toast notification here
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "used":
        return <Badge className="bg-blue-100 text-blue-800">Used</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "refunded":
        return <Badge className="bg-yellow-100 text-yellow-800">Refunded</Badge>;
      case "expired":
        return <Badge variant="outline">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TicketIcon className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Sold Tickets</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-64 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </MagicCard>
    );
  }

  if (error) {
    return (
      <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
        <div className="p-8 text-center">
          <AlertCircleIcon className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-semibold mb-2">Error Loading Tickets</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </MagicCard>
    );
  }

  return (
    <MagicCard className="border-0 bg-background/50 backdrop-blur-sm">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TicketIcon className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Sold Tickets</h3>
            {meta && (
              <Badge variant="secondary">
                {meta.totalCount} total
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Table */}
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <TicketIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Tickets Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || Object.keys(filters).length > 0
                ? "No tickets match your current filters."
                : "No tickets have been sold yet."}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>QR Code</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket: any) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        {ticket.logoUrl ? (
                          <Image
                            src={ticket.logoUrl}
                            alt={`Logo tiket ${ticket.id}`}
                            width={40}
                            height={40}
                            className="object-contain w-full h-full"
                          />
                        ) : ticket.ticketType?.logoUrl ? (
                          <Image
                            src={ticket.ticketType.logoUrl}
                            alt={`Logo ${ticket.ticketType.name}`}
                            width={40}
                            height={40}
                            className="object-contain w-full h-full"
                          />
                        ) : (
                          <TicketIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {ticket.id.slice(-8)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ticket.event?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {ticket.event?.startDate && formatDate(ticket.event.startDate)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ticket.attendee?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {ticket.attendee?.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {ticket.ticketType?.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(ticket.ticketType?.price || 0)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(ticket.status)}
                    </TableCell>
                    <TableCell>
                      <QRCodeDisplayCompact
                        ticketId={ticket.id}
                        qrCodeImageUrl={ticket.qrCodeImageUrl}
                        status={ticket.qrCodeStatus || "PENDING"}
                        onClick={() => handleViewQRCode(ticket)}
                      />
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(ticket.createdAt)}
                    </TableCell>
                    <TableCell>
                      {ticket.checkedIn ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircleIcon className="h-4 w-4" />
                          <span className="text-sm">
                            {ticket.checkInTime && formatDate(ticket.checkInTime)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <XCircleIcon className="h-4 w-4" />
                          <span className="text-sm">Not checked in</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <EyeIcon className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewQRCode(ticket)}>
                            <QrCode className="mr-2 h-4 w-4" />
                            View QR Code
                          </DropdownMenuItem>
                          {!ticket.checkedIn && ticket.status === "ACTIVE" && (
                            <DropdownMenuItem>
                              <CheckCircleIcon className="mr-2 h-4 w-4" />
                              Check In
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Upload Logo
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <DownloadIcon className="mr-2 h-4 w-4" />
                            Download E-ticket
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {meta && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Showing {((meta.page - 1) * meta.limit) + 1} to{" "}
                {Math.min(meta.page * meta.limit, meta.totalCount)} of{" "}
                {meta.totalCount} tickets
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show:</span>
                <Select
                  value={meta.limit.toString()}
                  onValueChange={handlePageSizeChange}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {meta.totalPages > 1 && (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.page <= 1 || isLoading}
                    onClick={handlePreviousPage}
                    title="Previous page (← arrow key)"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">Page</span>
                    <span className="text-sm font-medium">{meta.page}</span>
                    <span className="text-sm text-muted-foreground">of</span>
                    <span className="text-sm font-medium">{meta.totalPages}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={meta.page >= meta.totalPages || isLoading}
                    onClick={handleNextPage}
                    title="Next page (→ arrow key)"
                  >
                    Next
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use ← → arrow keys to navigate
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      <TicketQRModal
        isOpen={isQRModalOpen}
        onClose={handleCloseQRModal}
        ticket={selectedTicket}
        organizerId={organizerId}
      />
    </MagicCard>
  );
}
