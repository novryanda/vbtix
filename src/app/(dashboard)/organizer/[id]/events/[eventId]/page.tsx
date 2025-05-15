"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  useOrganizerEventDetail,
  useEventTickets,
  useEventSales,
} from "~/lib/api/hooks/organizer";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Pencil,
  Tag,
  Ticket,
  User,
  Trash,
  Share2,
  Plus,
  BarChart,
  Edit,
  ImageIcon,
} from "lucide-react";
import { formatDate, formatCurrency } from "~/lib/utils";
import { EventStatus } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { ORGANIZER_ENDPOINTS } from "~/lib/api/endpoints";

export default function EventDetailPage() {
  // Use the useParams hook to get route parameters
  const params = useParams();
  const organizerId = params.id as string;
  const eventId = params.eventId as string;

  const router = useRouter();
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [ticketFormData, setTicketFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch event details
  const { data, isLoading, error } = useOrganizerEventDetail(
    organizerId,
    eventId,
  );
  const event = data?.data;

  // Fetch event tickets
  const {
    data: ticketsData,
    isLoading: isTicketsLoading,
    error: ticketsError,
    mutate: mutateTickets,
  } = useEventTickets(organizerId, eventId);

  // Fetch event sales data
  const {
    data: salesData,
    isLoading: isSalesLoading,
    error: salesError,
  } = useEventSales(organizerId, { eventId: eventId });

  // Type assertion for sales data
  type SalesDataItem = {
    date: string;
    count: number;
    ticketsSold: number;
    revenue: number;
  };

  type SalesResponse = {
    salesData: SalesDataItem[];
    totalRevenue: number;
    totalTicketsSold: number;
    totalSales: number;
  };

  // Type assertion for the sales data
  const typedSalesData = salesData as
    | { success: boolean; data: SalesResponse; error?: string }
    | undefined;

  // Handle ticket form change
  const handleTicketFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setTicketFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle create ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      const ticketData = {
        name: ticketFormData.name,
        description: ticketFormData.description,
        price: parseFloat(ticketFormData.price),
        quantity: parseInt(ticketFormData.quantity, 10),
      };

      const response = await fetch(
        ORGANIZER_ENDPOINTS.EVENT_TICKETS(organizerId, eventId),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ticketData),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create ticket");
      }

      // Reset form and close dialog
      setTicketFormData({
        name: "",
        description: "",
        price: "",
        quantity: "",
      });
      setIsTicketDialogOpen(false);

      // Refresh tickets data
      mutateTickets();
    } catch (err: any) {
      console.error("Error creating ticket:", err);
      setFormError(err.message || "Failed to create ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit ticket
  const handleEditTicket = (ticketId: string) => {
    // For now, just navigate to the ticket edit page
    router.push(`/organizer/${organizerId}/tickets/${ticketId}`);
  };

  // Handle delete event
  const handleDeleteEvent = async () => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        // Delete event logic will be implemented later
        console.log("Delete event:", eventId);
        router.push(`/organizer/${organizerId}/events`);
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Event Details</h1>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Event Details</h1>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold">
            Error loading event
          </h3>
          <p className="text-muted-foreground text-sm">
            {error?.message ||
              "Failed to load event details. Please try again."}
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.refresh()}
            >
              Try Again
            </Button>
            <Button
              onClick={() =>
                router.push(`/organizer/${organizerId}/events`)
              }
            >
              Back to Events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold">{event.title}</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/organizer/${organizerId}/events/${eventId}/edit`,
                )
              }
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Event
            </Button>
            <Button variant="destructive" onClick={handleDeleteEvent}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="attendees">Attendees</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
          </TabsList>

                    <TabsContent value="details">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Card className="md:col-span-2">
                          <CardHeader>
                            <CardTitle>Event Information</CardTitle>
                            <CardDescription>
                              Details about your event
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Event Images */}
                            <div className="mb-6 space-y-4">
                              {event.posterUrl && (
                                <div>
                                  <h3 className="flex items-center font-medium">
                                    <ImageIcon className="text-muted-foreground mr-2 h-4 w-4" />
                                    Event Poster
                                  </h3>
                                  <div className="mt-2 overflow-hidden rounded-md">
                                    <div className="relative h-[200px] w-full">
                                      <Image
                                        src={event.posterUrl}
                                        alt={event.title}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {event.bannerUrl && (
                                <div>
                                  <h3 className="flex items-center font-medium">
                                    <ImageIcon className="text-muted-foreground mr-2 h-4 w-4" />
                                    Event Banner
                                  </h3>
                                  <div className="mt-2 overflow-hidden rounded-md">
                                    <div className="relative h-[200px] w-full">
                                      <Image
                                        src={event.bannerUrl}
                                        alt={event.title}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {event.images && event.images.length > 0 && (
                                <div>
                                  <h3 className="flex items-center font-medium">
                                    <ImageIcon className="text-muted-foreground mr-2 h-4 w-4" />
                                    Additional Images
                                  </h3>
                                  <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
                                    {event.images.map((image, index) => (
                                      <div
                                        key={index}
                                        className="relative h-[120px] overflow-hidden rounded-md"
                                      >
                                        <Image
                                          src={image}
                                          alt={`${event.title} - Image ${index + 1}`}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div>
                              <h3 className="font-medium">Status</h3>
                              <Badge
                                variant={
                                  event.status === EventStatus.PUBLISHED
                                    ? "success"
                                    : event.status === EventStatus.DRAFT
                                      ? "outline"
                                      : "destructive"
                                }
                                className="mt-1"
                              >
                                {event.status === EventStatus.PUBLISHED
                                  ? "Published"
                                  : event.status === EventStatus.DRAFT
                                    ? "Draft"
                                    : "Cancelled"}
                              </Badge>
                            </div>

                            <div>
                              <h3 className="font-medium">Description</h3>
                              <p className="text-muted-foreground mt-1 text-sm">
                                {event.description ||
                                  "No description provided."}
                              </p>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <div>
                                <h3 className="flex items-center font-medium">
                                  <CalendarDays className="text-muted-foreground mr-2 h-4 w-4" />
                                  Date
                                </h3>
                                <p className="mt-1 text-sm">
                                  {formatDate(event.startDate)} -{" "}
                                  {formatDate(event.endDate)}
                                </p>
                              </div>

                              <div>
                                <h3 className="flex items-center font-medium">
                                  <Clock className="text-muted-foreground mr-2 h-4 w-4" />
                                  Time
                                </h3>
                                <p className="mt-1 text-sm">
                                  {new Date(
                                    event.startDate,
                                  ).toLocaleTimeString()}{" "}
                                  -{" "}
                                  {new Date(event.endDate).toLocaleTimeString()}
                                </p>
                              </div>

                              <div>
                                <h3 className="flex items-center font-medium">
                                  <MapPin className="text-muted-foreground mr-2 h-4 w-4" />
                                  Location
                                </h3>
                                <p className="mt-1 text-sm">
                                  {event.venue}, {event.city}, {event.province}
                                </p>
                              </div>

                              <div>
                                <h3 className="flex items-center font-medium">
                                  <Tag className="text-muted-foreground mr-2 h-4 w-4" />
                                  Category
                                </h3>
                                <p className="mt-1 text-sm">
                                  {event.category || "Uncategorized"}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between">
                            <Button
                              variant="outline"
                              onClick={() =>
                                router.push(
                                  `/organizer/${organizerId}/events/${eventId}/edit`,
                                )
                              }
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Details
                            </Button>
                            <Button variant="outline">
                              <Share2 className="mr-2 h-4 w-4" />
                              Share Event
                            </Button>
                          </CardFooter>
                        </Card>

                        <div className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <Button
                                className="w-full justify-start"
                                variant="outline"
                              >
                                <Ticket className="mr-2 h-4 w-4" />
                                Manage Tickets
                              </Button>
                              <Button
                                className="w-full justify-start"
                                variant="outline"
                              >
                                <User className="mr-2 h-4 w-4" />
                                View Attendees
                              </Button>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle>Event Stats</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground text-sm">
                                    Tickets Sold
                                  </span>
                                  <span className="font-medium">0</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground text-sm">
                                    Revenue
                                  </span>
                                  <span className="font-medium">$0.00</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground text-sm">
                                    Views
                                  </span>
                                  <span className="font-medium">0</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="tickets">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle>Ticket Management</CardTitle>
                            <CardDescription>
                              Create and manage tickets for this event
                            </CardDescription>
                          </div>
                          <Dialog
                            open={isTicketDialogOpen}
                            onOpenChange={setIsTicketDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Ticket
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Create New Ticket</DialogTitle>
                                <DialogDescription>
                                  Add a new ticket type for this event
                                </DialogDescription>
                              </DialogHeader>
                              <form onSubmit={handleCreateTicket}>
                                {formError && (
                                  <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500">
                                    {formError}
                                  </div>
                                )}
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="name">Ticket Name</Label>
                                    <Input
                                      id="name"
                                      name="name"
                                      value={ticketFormData.name}
                                      onChange={handleTicketFormChange}
                                      required
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="description">
                                      Description
                                    </Label>
                                    <Textarea
                                      id="description"
                                      name="description"
                                      value={ticketFormData.description}
                                      onChange={handleTicketFormChange}
                                      rows={3}
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="price">Price</Label>
                                      <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={ticketFormData.price}
                                        onChange={handleTicketFormChange}
                                        required
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="quantity">Quantity</Label>
                                      <Input
                                        id="quantity"
                                        name="quantity"
                                        type="number"
                                        min="1"
                                        value={ticketFormData.quantity}
                                        onChange={handleTicketFormChange}
                                        required
                                      />
                                    </div>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsTicketDialogOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting
                                      ? "Creating..."
                                      : "Create Ticket"}
                                  </Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </CardHeader>
                        <CardContent>
                          {isTicketsLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                            </div>
                          ) : ticketsError ? (
                            <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
                              Error loading tickets: {ticketsError.message}
                            </div>
                          ) : !ticketsData?.data ||
                            ticketsData.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                              <Ticket className="text-muted-foreground mb-2 h-8 w-8" />
                              <h3 className="mb-2 text-lg font-semibold">
                                No tickets yet
                              </h3>
                              <p className="text-muted-foreground text-sm">
                                You haven't created any tickets for this event
                                yet.
                              </p>
                              <Button
                                className="mt-4"
                                onClick={() => setIsTicketDialogOpen(true)}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Create Your First Ticket
                              </Button>
                            </div>
                          ) : (
                            <div className="rounded-md border">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Sold</TableHead>
                                    <TableHead>Available</TableHead>
                                    <TableHead className="text-right">
                                      Actions
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {ticketsData.data.map((ticket: any) => (
                                    <TableRow key={ticket.id}>
                                      <TableCell className="font-medium">
                                        {ticket.name}
                                        {ticket.description && (
                                          <p className="text-muted-foreground text-xs">
                                            {ticket.description}
                                          </p>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {formatCurrency(ticket.price)}
                                      </TableCell>
                                      <TableCell>{ticket.quantity}</TableCell>
                                      <TableCell>{ticket.sold || 0}</TableCell>
                                      <TableCell>
                                        {ticket.quantity - (ticket.sold || 0)}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleEditTicket(ticket.id)
                                          }
                                        >
                                          <Edit className="h-4 w-4" />
                                          <span className="sr-only">Edit</span>
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="attendees">
                      <Card>
                        <CardHeader>
                          <CardTitle>Attendees</CardTitle>
                          <CardDescription>
                            View and manage event attendees
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground text-sm">
                            No attendees for this event yet.
                          </p>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="sales">
                      <Card>
                        <CardHeader>
                          <CardTitle>Sales Reports</CardTitle>
                          <CardDescription>
                            View sales data for this event
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {isSalesLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                            </div>
                          ) : salesError ? (
                            <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
                              Error loading sales data: {salesError.message}
                            </div>
                          ) : !typedSalesData?.data ||
                            !typedSalesData.data.salesData ||
                            typedSalesData.data.salesData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                              <BarChart className="text-muted-foreground mb-2 h-8 w-8" />
                              <h3 className="mb-2 text-lg font-semibold">
                                No sales data yet
                              </h3>
                              <p className="text-muted-foreground text-sm">
                                There are no sales recorded for this event yet.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="rounded-lg border p-4">
                                  <h3 className="text-muted-foreground mb-2 text-sm">
                                    Total Sales
                                  </h3>
                                  <p className="text-2xl font-bold">
                                    {formatCurrency(
                                      typedSalesData?.data.totalRevenue || 0,
                                    )}
                                  </p>
                                </div>
                                <div className="rounded-lg border p-4">
                                  <h3 className="text-muted-foreground mb-2 text-sm">
                                    Tickets Sold
                                  </h3>
                                  <p className="text-2xl font-bold">
                                    {typedSalesData?.data.totalTicketsSold || 0}
                                  </p>
                                </div>
                                <div className="rounded-lg border p-4">
                                  <h3 className="text-muted-foreground mb-2 text-sm">
                                    Orders
                                  </h3>
                                  <p className="text-2xl font-bold">
                                    {typedSalesData?.data.totalSales || 0}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <h3 className="mb-4 text-lg font-medium">
                                  Sales by Date
                                </h3>
                                <div className="rounded-md border">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Orders</TableHead>
                                        <TableHead>Tickets Sold</TableHead>
                                        <TableHead className="text-right">
                                          Revenue
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {typedSalesData?.data.salesData.map(
                                        (item: any) => (
                                          <TableRow key={item.date}>
                                            <TableCell>{item.date}</TableCell>
                                            <TableCell>{item.count}</TableCell>
                                            <TableCell>
                                              {item.ticketsSold}
                                            </TableCell>
                                            <TableCell className="text-right">
                                              {formatCurrency(item.revenue)}
                                            </TableCell>
                                          </TableRow>
                                        ),
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
          </Tabs>
        </div>
      </div>
  );
}
