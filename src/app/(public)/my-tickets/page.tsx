"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MagicCard } from "~/components/ui/magic-card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { QRCodeDisplay, QRCodeDisplayCompact } from "~/components/ui/qr-code-display";
import { useTicketQRCode } from "~/lib/api/hooks/qr-code";
import { useBuyerTickets } from "~/lib/api/hooks/buyer-tickets";
import {
  Calendar,
  MapPin,
  Clock,
  User,
  Ticket,
  QrCode,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { formatDate, formatPrice } from "~/lib/utils";
import Link from "next/link";

export default function MyTicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("active");

  // Fetch real tickets data
  const { tickets, isLoading: ticketsLoading, error: ticketsError, refresh } = useBuyerTickets({
    page: 1,
    limit: 50,
    status: activeTab === "all" ? undefined : activeTab.toUpperCase(),
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin?callbackUrl=/my-tickets");
    }
  }, [session, status, router]);

  if (status === "loading" || ticketsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (ticketsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-semibold mb-2">Error Loading Tickets</h3>
          <p className="text-gray-600 mb-4">{ticketsError}</p>
          <Button onClick={refresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const filterTickets = (status: string) => {
    switch (status) {
      case "active":
        return tickets.filter((ticket) => ticket.status === "ACTIVE");
      case "used":
        return tickets.filter((ticket) => ticket.status === "USED");
      case "expired":
        return tickets.filter((ticket) => ticket.status === "EXPIRED");
      default:
        return tickets;
    }
  };

  const filteredTickets = filterTickets(activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
              <p className="text-gray-600 mt-1">
                Manage and view your event tickets
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {tickets.length} Total Tickets
              </Badge>
              <Button variant="outline" size="sm" onClick={refresh} className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Tickets</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="used">Used</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                  <Ticket className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="mb-1 text-lg font-medium">No tickets found</h3>
                <p className="mb-4 text-gray-500">
                  You don't have any {activeTab} tickets yet.
                </p>
                <Button asChild>
                  <Link href="/events">Browse Events</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    isSelected={selectedTicket === ticket.id}
                    onSelect={() => setSelectedTicket(ticket.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* QR Code Modal */}
      {selectedTicket && (
        <QRCodeModal
          ticketId={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}

function TicketCard({
  ticket,
  isSelected,
  onSelect,
}: {
  ticket: any;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const statusConfig = {
    ACTIVE: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    USED: { color: "bg-gray-100 text-gray-800", icon: CheckCircle },
    EXPIRED: { color: "bg-red-100 text-red-800", icon: AlertCircle },
  };

  const status = statusConfig[ticket.status as keyof typeof statusConfig];

  return (
    <MagicCard
      className="border-0 bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-all duration-300 cursor-pointer"
      gradientColor="rgba(59, 130, 246, 0.1)"
      onClick={onSelect}
    >
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {/* Logo with fallback hierarchy */}
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
              {ticket.logoUrl ? (
                <img
                  src={ticket.logoUrl}
                  alt={`Logo tiket ${ticket.id}`}
                  className="object-contain w-full h-full"
                />
              ) : ticket.ticketTypeLogoUrl ? (
                <img
                  src={ticket.ticketTypeLogoUrl}
                  alt={`Logo ${ticket.ticketType}`}
                  className="object-contain w-full h-full"
                />
              ) : ticket.eventImage ? (
                <img
                  src={ticket.eventImage}
                  alt={ticket.eventTitle}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Ticket className="h-6 w-6 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-2">
                {ticket.eventTitle}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{ticket.ticketType}</p>
            </div>
          </div>
          <Badge variant="secondary" className={status.color}>
            <status.icon className="w-3 h-3 mr-1" />
            {ticket.status}
          </Badge>
        </div>

        {/* Event Details */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(ticket.eventDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{ticket.eventLocation}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{ticket.holderName}</span>
          </div>
        </div>

        {/* QR Code Status */}
        <div className="flex items-center justify-between">
          <QRCodeDisplayCompact
            ticketId={ticket.id}
            qrCodeImageUrl={ticket.qrCodeImageUrl}
            status={ticket.qrCodeStatus}
          />
          <div className="text-right">
            <p className="font-semibold">{formatPrice(ticket.price)}</p>
            <p className="text-xs text-gray-500">
              Purchased {formatDate(ticket.purchaseDate)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" className="flex-1">
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button size="sm" className="flex-1">
            <QrCode className="w-4 h-4 mr-2" />
            Show QR
          </Button>
        </div>
      </div>
    </MagicCard>
  );
}

function QRCodeModal({
  ticketId,
  onClose,
}: {
  ticketId: string;
  onClose: () => void;
}) {
  const { qrCode, isLoading, error, refresh } = useTicketQRCode(ticketId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Ticket QR Code</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        <QRCodeDisplay
          ticketId={ticketId}
          qrCodeImageUrl={qrCode?.qrCodeImageUrl}
          status={qrCode?.status || "PENDING"}
          isLoading={isLoading}
          error={error}
          onRefresh={refresh}
          size="lg"
        />

        <div className="text-center text-sm text-gray-600">
          <p>Present this QR code at the event entrance</p>
          <p className="font-mono mt-1">ID: {ticketId.slice(-8)}</p>
        </div>
      </div>
    </div>
  );
}
