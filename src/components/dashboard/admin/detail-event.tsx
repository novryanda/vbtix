"use client";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import {
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Pencil,
  Tag,
  Ticket,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { formatDateTime, formatPrice } from "~/lib/utils";
import { useState } from "react";

// Define ticket type interface
interface TicketType {
  id: string;
  name: string;
  price: number | string;
  quantity: number;
  sold: number;
}

interface EventStatistics {
  totalTicketsSold: number;
  totalCapacity: number;
  totalRevenue: number;
  soldPercentage: number;
  totalTransactions: number;
}

interface EventDetailProps {
  event: any;
  eventId: string;
  isStatsLoading: boolean;
  statistics: EventStatistics;
  onApprove: (feedback: string) => Promise<void>;
  onReject: (feedback: string) => Promise<void>;
}

export function EventDetail({
  event,
  eventId,
  isStatsLoading,
  statistics,
  onApprove,
  onReject,
}: EventDetailProps) {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApproveEvent = async () => {
    try {
      setIsSubmitting(true);
      await onApprove(feedback);
      setFeedback("");
    } catch (error) {
      console.error("Error approving event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectEvent = async () => {
    try {
      setIsSubmitting(true);
      await onReject(feedback);
      setFeedback("");
    } catch (error) {
      console.error("Error rejecting event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Event Details</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="space-y-6 md:col-span-5">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-2xl">{event?.title}</CardTitle>
                <CardDescription className="mt-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-muted-foreground h-4 w-4" />
                    <span>{event?.venue}</span>
                  </div>
                </CardDescription>
              </div>
              <StatusBadge status={event?.status} />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-muted-foreground text-sm font-medium">
                    Organizer
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="text-muted-foreground h-4 w-4" />
                    <span>
                      {event?.organizer?.orgName ||
                        event?.organizer?.user?.name ||
                        "Unknown"}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground text-sm font-medium">
                    Date
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="text-muted-foreground h-4 w-4" />
                    <span>
                      {event?.formattedStartDate ||
                        formatDateTime(event?.startDate)}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground text-sm font-medium">
                    Time
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="text-muted-foreground h-4 w-4" />
                    <span>
                      {event?.startDate
                        ? new Date(event.startDate).toLocaleTimeString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground text-sm font-medium">
                    Category
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="text-muted-foreground h-4 w-4" />
                    <span>{event?.category || "N/A"}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 text-lg font-medium">Description</h3>
                <p className="text-muted-foreground">
                  {event?.description || "No description available."}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 text-lg font-medium">Ticket Types</h3>
                <div className="space-y-4">
                  {event?.ticketTypes && event.ticketTypes.length > 0 ? (
                    event.ticketTypes.map((ticket: TicketType) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between rounded-md border p-4"
                      >
                        <div>
                          <div className="font-medium">{ticket.name}</div>
                          <div className="text-muted-foreground text-sm">
                            {ticket.quantity - ticket.sold} of {ticket.quantity}{" "}
                            remaining
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatPrice(Number(ticket.price))}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            <Ticket className="mr-1 inline h-3 w-3" />
                            {ticket.sold} sold
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground py-4 text-center">
                      No ticket types available
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Event Details</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-sm font-medium">
                        Created At
                      </div>
                      <div>
                        {event?.createdAt
                          ? formatDateTime(new Date(event.createdAt))
                          : "N/A"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-sm font-medium">
                        Last Updated
                      </div>
                      <div>
                        {event?.updatedAt
                          ? formatDateTime(new Date(event.updatedAt))
                          : "N/A"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-sm font-medium">
                        Event ID
                      </div>
                      <div>{event?.id || eventId}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-sm font-medium">
                        Organizer ID
                      </div>
                      <div>{event?.organizerId || "N/A"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="orders" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground py-6 text-center">
                    <p>Order information will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="analytics" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground py-6 text-center">
                    <p>Analytics information will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" asChild>
                <Link href={`/admin/events/${eventId}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Event
                </Link>
              </Button>

              {event?.status === "PENDING_REVIEW" && (
                <>
                  <Textarea
                    placeholder="Feedback for organizer (optional)"
                    className="mb-4"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                  <Button
                    variant="success"
                    className="w-full"
                    onClick={handleApproveEvent}
                    disabled={isSubmitting}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Processing..." : "Approve Event"}
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleRejectEvent}
                    disabled={isSubmitting}
                  >
                    <X className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Processing..." : "Reject Event"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Capacity</span>
                <span className="font-medium">
                  {isStatsLoading
                    ? "Loading..."
                    : statistics?.totalCapacity || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tickets Sold</span>
                <span className="font-medium">
                  {isStatsLoading
                    ? "Loading..."
                    : statistics?.totalTicketsSold || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-medium">
                  {isStatsLoading
                    ? "Loading..."
                    : formatPrice(statistics?.totalRevenue || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transactions</span>
                <span className="font-medium">
                  {isStatsLoading
                    ? "Loading..."
                    : statistics?.totalTransactions || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    DRAFT: { label: "Draft", variant: "outline" as const },
    PENDING_REVIEW: { label: "Pending Review", variant: "warning" as const },
    PUBLISHED: { label: "Published", variant: "success" as const },
    REJECTED: { label: "Rejected", variant: "destructive" as const },
  };

  const config =
    status && statusConfig[status as keyof typeof statusConfig]
      ? statusConfig[status as keyof typeof statusConfig]
      : statusConfig.DRAFT;

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
