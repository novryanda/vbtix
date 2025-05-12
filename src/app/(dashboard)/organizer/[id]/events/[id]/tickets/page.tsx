"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useOrganizerEventDetail,
  useEventTickets,
} from "~/lib/api/hooks/organizer";
import { AppSidebar } from "~/components/dashboard/organizer/app-sidebar";
import { SiteHeader } from "~/components/dashboard/organizer/site-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { OrganizerRoute } from "~/components/auth/organizer-route";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
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
import {
  ArrowLeft,
  Edit,
  Plus,
  Ticket,
  Trash,
  AlertCircle,
} from "lucide-react";
import { ORGANIZER_ENDPOINTS } from "~/lib/api/endpoints";
import { formatCurrency } from "~/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

export default function EventTicketsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketFormData, setTicketFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch event details
  const {
    data: eventData,
    isLoading: isEventLoading,
    error: eventError,
  } = useOrganizerEventDetail(params.id);
  const event = eventData?.data;

  // Fetch event tickets
  const {
    data: ticketsData,
    isLoading: isTicketsLoading,
    error: ticketsError,
    mutate: mutateTickets,
  } = useEventTickets(params.id);

  // Type assertion for TypeScript
  const tickets = ticketsData?.data as any[] | undefined;

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
        ORGANIZER_ENDPOINTS.EVENT_TICKETS(params.id),
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
    router.push(`/organizer/tickets/${ticketId}`);
  };

  // Handle delete ticket
  const handleDeleteTicket = async () => {
    if (!selectedTicketId) return;

    try {
      const response = await fetch(
        ORGANIZER_ENDPOINTS.TICKET_DETAIL(selectedTicketId),
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete ticket");
      }

      // Refresh tickets data
      mutateTickets();
    } catch (err: any) {
      console.error("Error deleting ticket:", err);
      alert(err.message || "Failed to delete ticket. Please try again.");
    } finally {
      setSelectedTicketId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Loading state
  if (isEventLoading) {
    return (
      <OrganizerRoute>
        <SidebarProvider>
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  <div className="px-4 lg:px-6">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <h1 className="text-2xl font-semibold">Event Tickets</h1>
                    </div>
                  </div>
                  <div className="flex items-center justify-center p-8">
                    <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                  </div>
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </OrganizerRoute>
    );
  }

  // Error state
  if (eventError || !event) {
    return (
      <OrganizerRoute>
        <SidebarProvider>
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  <div className="px-4 lg:px-6">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <h1 className="text-2xl font-semibold">Event Tickets</h1>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <AlertCircle className="mb-2 h-8 w-8 text-red-500" />
                    <h3 className="mb-2 text-lg font-semibold">
                      Error loading event
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {eventError?.message ||
                        "Failed to load event details. Please try again."}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => router.refresh()}
                      >
                        Try Again
                      </Button>
                      <Button onClick={() => router.push("/organizer/events")}>
                        Back to Events
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </OrganizerRoute>
    );
  }

  // Main content
  return (
    <OrganizerRoute>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
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
                      <div>
                        <h1 className="text-2xl font-semibold">
                          Ticket Management
                        </h1>
                        <p className="text-muted-foreground text-sm">
                          {event.title}
                        </p>
                      </div>
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
                              <Label htmlFor="description">Description</Label>
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
                              {isSubmitting ? "Creating..." : "Create Ticket"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="px-4 lg:px-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tickets</CardTitle>
                      <CardDescription>
                        Manage ticket types for {event.title}
                      </CardDescription>
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
                      ) : !tickets || tickets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                          <Ticket className="text-muted-foreground mb-2 h-8 w-8" />
                          <h3 className="mb-2 text-lg font-semibold">
                            No tickets yet
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            You haven't created any tickets for this event yet.
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
                              {tickets.map((ticket: any) => (
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
                                    <div className="flex justify-end gap-2">
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
                                      <AlertDialog
                                        open={
                                          isDeleteDialogOpen &&
                                          selectedTicketId === ticket.id
                                        }
                                        onOpenChange={(open: boolean) => {
                                          setIsDeleteDialogOpen(open);
                                          if (!open) setSelectedTicketId(null);
                                        }}
                                      >
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-600"
                                            onClick={() =>
                                              setSelectedTicketId(ticket.id)
                                            }
                                          >
                                            <Trash className="h-4 w-4" />
                                            <span className="sr-only">
                                              Delete
                                            </span>
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>
                                              Are you sure?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                              This action cannot be undone. This
                                              will permanently delete the ticket
                                              type and remove it from our
                                              servers.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>
                                              Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={handleDeleteTicket}
                                              className="bg-red-500 hover:bg-red-600"
                                            >
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </OrganizerRoute>
  );
}
