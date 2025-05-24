"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  MapPin,
  Clock,
  Download,
  QrCode,
  Filter,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { TicketStatus } from "@prisma/client";
import { formatPrice } from "~/lib/utils";

// Ticket type definition
interface Ticket {
  id: string;
  code: string;
  status: TicketStatus;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  ticketType: {
    name: string;
    price: number;
  };
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    image: string;
  };
  order: {
    id: string;
  };
  ownerName: string;
  ownerEmail: string;
}

// Pagination metadata
interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function TicketsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for tickets and loading
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState<PaginationMeta>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Get current status filter from URL or default to "ACTIVE"
  const currentStatus =
    (searchParams.get("status") as TicketStatus) || TicketStatus.ACTIVE;

  // Fetch tickets from API
  const fetchTickets = async () => {
    setIsLoading(true);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append("status", currentStatus);

      const page = searchParams.get("page") || "1";
      params.append("page", page);
      params.append("limit", "10");

      // Fetch tickets from API
      const response = await fetch(`/api/buyer/tickets?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setTickets(data.data);
        setMeta(data.meta);
      } else {
        console.error("Failed to fetch tickets:", data.error);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("status", status);
    params.delete("page"); // Reset to page 1 when changing status
    router.push(`/buyer/tickets?${params.toString()}`);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`/buyer/tickets?${params.toString()}`);
  };

  // Fetch tickets on mount and when search params change
  useEffect(() => {
    fetchTickets();
  }, [searchParams]);

  // Get status badge color
  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.ACTIVE:
        return <Badge className="bg-green-500">Aktif</Badge>;
      case TicketStatus.USED:
        return <Badge className="bg-gray-500">Terpakai</Badge>;
      case TicketStatus.CANCELLED:
        return <Badge className="bg-red-500">Dibatalkan</Badge>;
      case TicketStatus.EXPIRED:
        return <Badge className="bg-yellow-500">Kadaluarsa</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Ticket card component
  const TicketCard = ({ ticket }: { ticket: Ticket }) => (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-32 w-full overflow-hidden bg-blue-600">
        {ticket.imageUrl ? (
          <img
            src={ticket.imageUrl}
            alt={`Ticket for ${ticket.event.title}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <>
            <img
              src={
                ticket.event.image ||
                "https://placehold.co/400x200?text=No+Image"
              }
              alt={ticket.event.title}
              className="h-full w-full object-cover opacity-30"
            />
            <div className="absolute inset-0 flex flex-col justify-center p-4 text-white">
              <h3 className="mb-1 line-clamp-1 text-lg font-semibold">
                {ticket.event.title}
              </h3>
              <div className="flex items-center text-sm">
                <Calendar size={14} className="mr-1.5" />
                <span>{ticket.event.date}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin size={14} className="mr-1.5" />
                <span className="line-clamp-1">{ticket.event.location}</span>
              </div>
            </div>
          </>
        )}
        <div className="absolute top-2 right-2">
          {getStatusBadge(ticket.status)}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Tipe Tiket</div>
            <div className="font-medium">{ticket.ticketType.name}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Harga</div>
            <div className="font-medium text-blue-600">
              {formatPrice(ticket.ticketType.price)}
            </div>
          </div>
        </div>
        <div className="mb-3">
          <div className="text-sm text-gray-500">Pemilik Tiket</div>
          <div className="font-medium">{ticket.ownerName}</div>
          <div className="text-sm text-gray-500">{ticket.ownerEmail}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Kode Tiket</div>
          <div className="font-mono font-medium">{ticket.code}</div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 border-t p-4">
        <Button variant="outline" size="sm" className="flex-1">
          <QrCode size={16} className="mr-2" />
          Lihat E-Ticket
        </Button>
        <Button size="sm" className="flex-1">
          <Download size={16} className="mr-2" />
          Download
        </Button>
      </CardFooter>
    </Card>
  );

  // Loading skeleton
  const TicketCardSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="h-32 w-full" />
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="mb-3 h-12 w-full" />
        <Skeleton className="h-8 w-3/4" />
      </CardContent>
      <CardFooter className="flex justify-between gap-2 border-t p-4">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tiket Saya</h1>
        <p className="text-gray-500">Kelola semua tiket event Anda</p>
      </div>

      <Tabs defaultValue={currentStatus} onValueChange={handleStatusChange}>
        <TabsList className="mb-6">
          <TabsTrigger value={TicketStatus.ACTIVE}>Aktif</TabsTrigger>
          <TabsTrigger value={TicketStatus.USED}>Terpakai</TabsTrigger>
          <TabsTrigger value={TicketStatus.EXPIRED}>Kadaluarsa</TabsTrigger>
          <TabsTrigger value={TicketStatus.CANCELLED}>Dibatalkan</TabsTrigger>
        </TabsList>

        <TabsContent value={currentStatus} className="mt-0">
          {isLoading ? (
            // Show skeletons while loading
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <TicketCardSkeleton key={index} />
              ))}
            </div>
          ) : tickets.length > 0 ? (
            // Show tickets
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <Pagination className="mt-8">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(Math.max(1, meta.currentPage - 1))
                        }
                        className={
                          meta.currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                        size="default"
                      />
                    </PaginationItem>

                    {Array.from({ length: meta.totalPages }).map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink
                          isActive={meta.currentPage === index + 1}
                          onClick={() => handlePageChange(index + 1)}
                          size="default"
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(
                            Math.min(meta.totalPages, meta.currentPage + 1),
                          )
                        }
                        className={
                          meta.currentPage === meta.totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                        size="default"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          ) : (
            // Show empty state
            <div className="rounded-lg border border-dashed p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                <QrCode className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="mb-1 text-lg font-medium">Tidak ada tiket</h3>
              <p className="mb-4 text-gray-500">
                Anda belum memiliki tiket {currentStatus.toLowerCase()}
              </p>
              <Button asChild>
                <Link href="/buyer/events">Jelajahi Event</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
