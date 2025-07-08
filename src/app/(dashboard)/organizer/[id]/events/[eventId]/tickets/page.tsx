"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  useOrganizerEventDetail,
  useEventTickets,
} from "~/lib/api/hooks/organizer";
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
import { Checkbox } from "~/components/ui/checkbox";
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
  MoreHorizontal,
} from "lucide-react";
import { ORGANIZER_ENDPOINTS } from "~/lib/api/endpoints";
import { formatPrice } from "~/lib/utils";
import { TicketLogoUpload } from "~/components/ui/ticket-logo-upload";
import { EnhancedTicketTypeList } from "~/components/ticket/enhanced-ticket-type-list";
import { TicketTypeEditModal } from "~/components/ticket/ticket-type-edit-modal";
import { useEnhancedTicketTypes } from "~/lib/api/hooks/enhanced-crud";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";

export default function EventTicketsPage({
  params,
}: {
  params: Promise<{ id: string; eventId: string }>;
}) {
  const router = useRouter();
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketFormData, setTicketFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    maxPerPurchase: "10",
    isVisible: true,
    allowTransfer: false,
    ticketFeatures: "",
    perks: "",
    earlyBirdDeadline: "",
    saleStartDate: "",
    saleEndDate: "",
    logoUrl: "",
    logoPublicId: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTicketTypeForEdit, setSelectedTicketTypeForEdit] = useState<any>(null);
  const [showEnhancedView, setShowEnhancedView] = useState(false);
  const [formError, setFormError] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);

  // Unwrap params with React.use()
  const { id, eventId } = React.use(params);

  // Fetch event details
  const {
    data: eventData,
    isLoading: isEventLoading,
    error: eventError,
  } = useOrganizerEventDetail(id, eventId);
  const event = eventData?.data;

  // Fetch event tickets
  const {
    data: ticketsData,
    isLoading: isTicketsLoading,
    error: ticketsError,
    mutate: mutateTickets,
  } = useEventTickets(id, eventId);

  // Type assertion for TypeScript
  const tickets = ticketsData?.data as any[] | undefined;

  // Enhanced ticket type management hooks
  const {
    deleteTicketType,
    bulkOperationTicketTypes,
    exportTicketTypes
  } = useEnhancedTicketTypes(id);

  // Fetch payment methods
  React.useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        console.log("Fetching payment methods...");
        const response = await fetch("/api/payment-methods");
        const result = await response.json();
        console.log("Payment methods response:", result);
        if (result.success) {
          console.log("Setting payment methods:", result.data);
          setPaymentMethods(result.data);
          // Set all payment methods as selected by default for new tickets
          setSelectedPaymentMethods(result.data.map((pm: any) => pm.id));
          console.log("Selected payment methods:", result.data.map((pm: any) => pm.id));
        } else {
          console.error("Failed to fetch payment methods:", result);
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      }
    };

    // Only fetch if payment methods haven't been loaded yet
    if (paymentMethods.length === 0) {
      fetchPaymentMethods();
    }
  }, [paymentMethods.length]);

  // Debug dialog state
  React.useEffect(() => {
    console.log("Dialog state changed:", isTicketDialogOpen);
  }, [isTicketDialogOpen]);

  // Handle ticket form change
  const handleTicketFormChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setTicketFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Handle logo upload change
  const handleLogoChange = useCallback((logoData: { url: string; publicId: string } | null) => {
    setTicketFormData((prev) => ({
      ...prev,
      logoUrl: logoData?.url || "",
      logoPublicId: logoData?.publicId || "",
    }));
  }, []);

  // Handle payment method selection
  const handlePaymentMethodToggle = useCallback((paymentMethodId: string) => {
    setSelectedPaymentMethods((prev) => {
      if (prev.includes(paymentMethodId)) {
        return prev.filter((id) => id !== paymentMethodId);
      } else {
        return [...prev, paymentMethodId];
      }
    });
  }, []);

  // Handle checkbox changes
  const handleVisibilityChange = useCallback((checked: boolean) => {
    setTicketFormData((prev) => ({
      ...prev,
      isVisible: checked === true,
    }));
  }, []);

  const handleTransferChange = useCallback((checked: boolean) => {
    setTicketFormData((prev) => ({
      ...prev,
      allowTransfer: checked === true,
    }));
  }, []);

  // Handle create ticket
  const handleCreateTicket = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      // Validate required fields before processing
      if (!ticketFormData.name.trim()) {
        throw new Error("Nama tiket harus diisi");
      }
      if (!ticketFormData.price || isNaN(Number(ticketFormData.price))) {
        throw new Error("Harga tiket harus berupa angka yang valid");
      }
      if (!ticketFormData.quantity || isNaN(Number(ticketFormData.quantity))) {
        throw new Error("Jumlah tiket harus berupa angka yang valid");
      }
      if (!ticketFormData.maxPerPurchase || isNaN(Number(ticketFormData.maxPerPurchase))) {
        throw new Error("Maksimal pembelian harus berupa angka yang valid");
      }

      // Parse numeric values
      const price = parseFloat(ticketFormData.price);
      const quantity = parseInt(ticketFormData.quantity, 10);
      const maxPerPurchase = parseInt(ticketFormData.maxPerPurchase, 10);

      // Additional validation
      if (price < 0) {
        throw new Error("Harga tiket harus berupa angka positif");
      }
      if (quantity <= 0) {
        throw new Error("Jumlah tiket harus lebih dari 0");
      }
      if (maxPerPurchase <= 0) {
        throw new Error("Maksimal pembelian harus lebih dari 0");
      }
      if (maxPerPurchase > quantity) {
        throw new Error("Maksimal pembelian tidak boleh melebihi total jumlah tiket");
      }

      // Validate payment methods selection
      if (selectedPaymentMethods.length === 0) {
        throw new Error("Minimal satu metode pembayaran harus dipilih");
      }

      // Create the ticket data with proper types
      const ticketData = {
        name: ticketFormData.name.trim(),
        description: ticketFormData.description.trim() || undefined,
        price: price,
        quantity: quantity,
        maxPerPurchase: maxPerPurchase,
        isVisible: ticketFormData.isVisible,
        allowTransfer: ticketFormData.allowTransfer,
        ticketFeatures: ticketFormData.ticketFeatures.trim() || undefined,
        perks: ticketFormData.perks.trim() || undefined,
        logoUrl: ticketFormData.logoUrl.trim() || undefined,
        logoPublicId: ticketFormData.logoPublicId.trim() || undefined,
        earlyBirdDeadline: ticketFormData.earlyBirdDeadline.trim() || undefined,
        saleStartDate: ticketFormData.saleStartDate.trim() || undefined,
        saleEndDate: ticketFormData.saleEndDate.trim() || undefined,
        allowedPaymentMethodIds: selectedPaymentMethods,
      };

      // Create the ticket first
      const response = await fetch(
        ORGANIZER_ENDPOINTS.EVENT_TICKETS(id, eventId),
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
        // Handle specific validation errors
        if (result.details && Array.isArray(result.details)) {
          const errorMessages = result.details.map((detail: any) => detail.message).join(", ");
          throw new Error(`Validation error: ${errorMessages}`);
        }
        throw new Error(result.error || "Gagal membuat tiket");
      }



      // Reset form and close dialog in a single batch
      React.startTransition(() => {
        setTicketFormData({
          name: "",
          description: "",
          price: "",
          quantity: "",
          maxPerPurchase: "10",
          isVisible: true,
          allowTransfer: false,
          ticketFeatures: "",
          perks: "",
          earlyBirdDeadline: "",
          saleStartDate: "",
          saleEndDate: "",
          logoUrl: "",
          logoPublicId: "",
        });

        // Reset payment methods to all selected by default
        setSelectedPaymentMethods(paymentMethods.map((pm: any) => pm.id));

        setIsTicketDialogOpen(false);
      });

      // Refresh tickets data
      mutateTickets();

      // Navigate to the newly created ticket
      if (result.data?.id) {
        router.push(
          `/organizer/${id}/events/${eventId}/tickets/${result.data.id}`,
        );
      }
    } catch (err: any) {
      console.error("Error creating ticket:", err);
      setFormError(err.message || "Gagal membuat tiket. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }, [ticketFormData, selectedPaymentMethods, paymentMethods, id, eventId, mutateTickets, router]);

  // Handle edit ticket
  const handleEditTicket = useCallback((ticketId: string) => {
    router.push(`/organizer/${id}/events/${eventId}/tickets/${ticketId}`);
  }, [router, id, eventId]);

  // Handle delete ticket
  const handleDeleteTicket = useCallback(async () => {
    if (!selectedTicketId) return;

    try {
      const response = await fetch(
        ORGANIZER_ENDPOINTS.EVENT_TICKET_DETAIL(id, eventId, selectedTicketId),
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
    }
  }, [selectedTicketId, id, eventId, mutateTickets]);

  // Debug handlers
  const handleDebugDialogOpen = useCallback(() => {
    console.log("Debug: Manual dialog open triggered");
    setIsTicketDialogOpen(true);
  }, []);

  const handleDebugRefetchPaymentMethods = useCallback(async () => {
    console.log("Debug: Refetching payment methods");
    try {
      console.log("Manual refetch: Fetching payment methods...");
      const response = await fetch("/api/payment-methods");
      const result = await response.json();
      console.log("Manual refetch: Payment methods response:", result);
      if (result.success) {
        // Batch state updates to prevent multiple re-renders
        const newPaymentMethods = result.data;
        const newSelectedMethods = newPaymentMethods.map((pm: any) => pm.id);

        setPaymentMethods(newPaymentMethods);
        setSelectedPaymentMethods(newSelectedMethods);
      }
    } catch (error) {
      console.error("Manual refetch error:", error);
    }
  }, []);

  // Handle payment method card click with event propagation control
  const handlePaymentMethodCardClick = useCallback((paymentMethodId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    handlePaymentMethodToggle(paymentMethodId);
  }, [handlePaymentMethodToggle]);

  // Handle dialog close
  const handleDialogClose = useCallback(() => {
    setIsTicketDialogOpen(false);
  }, []);

  // Memoized payment methods list to prevent unnecessary re-renders
  const paymentMethodsList = useMemo(() => {
    if (paymentMethods.length === 0) {
      return (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <div className="text-center space-y-2">
            <div className="text-sm">Memuat metode pembayaran...</div>
            <div className="text-xs">Debug: Payment methods array length: {paymentMethods.length}</div>
          </div>
        </div>
      );
    }

    return paymentMethods.map((paymentMethod) => {
      console.log("Rendering payment method:", paymentMethod);
      return (
        <Card
          key={paymentMethod.id}
          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
            selectedPaymentMethods.includes(paymentMethod.id)
              ? 'ring-2 ring-primary bg-primary/5 border-primary'
              : 'hover:border-primary/50'
          }`}
          onClick={(e) => handlePaymentMethodCardClick(paymentMethod.id, e)}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div
                className="pt-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  id={`payment-method-${paymentMethod.id}`}
                  checked={selectedPaymentMethods.includes(paymentMethod.id)}
                  readOnly
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor={`payment-method-${paymentMethod.id}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {paymentMethod.name}
                </Label>
                {paymentMethod.description && (
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {paymentMethod.description}
                  </p>
                )}
              </div>
              {paymentMethod.code === 'QRIS_BY_WONDERS' && (
                <div className="flex items-center space-x-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-md">
                  <span>QR</span>
                </div>
              )}
              {paymentMethod.code === 'MANUAL_PAYMENT' && (
                <div className="flex items-center space-x-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                  <span>Manual</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    });
  }, [paymentMethods, selectedPaymentMethods]);

  // Enhanced ticket type handlers
  const handleEditTicketType = (ticketType: any) => {
    setSelectedTicketTypeForEdit(ticketType);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = (updatedTicketType: any) => {
    setIsEditModalOpen(false);
    setSelectedTicketTypeForEdit(null);
    mutateTickets(); // Refresh the ticket list
  };

  const handleDeleteTicketType = async (ticketTypeId: string, reason?: string) => {
    try {
      await deleteTicketType(ticketTypeId, reason);
      mutateTickets(); // Refresh the ticket list
    } catch (error) {
      console.error("Error deleting ticket type:", error);
    }
  };

  const handleBulkOperation = async (ticketTypeIds: string[], operation: string, reason?: string) => {
    try {
      await bulkOperationTicketTypes(ticketTypeIds, operation, reason);
      mutateTickets(); // Refresh the ticket list
    } catch (error) {
      console.error("Error performing bulk operation:", error);
    }
  };

  const handleExportTicketTypes = (ticketTypes: any[]) => {
    exportTicketTypes(ticketTypes, { eventName: event?.title });
  };

  // Loading state
  if (isEventLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 flex-col">
          <div className="container flex flex-1 flex-col gap-2 pt-4">
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
      </div>
    );
  }

  // Error state
  if (eventError || !event) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 flex-col">
          <div className="container flex flex-1 flex-col gap-2 pt-4">
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
                  <Button variant="outline" onClick={() => router.refresh()}>
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
      </div>
    );
  }

  // Main content
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col">
        <div className="container flex flex-1 flex-col gap-2 pt-4">
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
                      {event?.title}
                    </p>
                  </div>
                </div>
                <Dialog
                  key="ticket-creation-dialog"
                  open={isTicketDialogOpen}
                  onOpenChange={(open) => {
                    if (!open) {
                      handleDialogClose();
                    } else {
                      setIsTicketDialogOpen(true);
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Ticket Type
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px]">
                    <DialogHeader>
                      <DialogTitle>Create New Ticket Type</DialogTitle>
                      <DialogDescription>
                        Create a ticket category that defines pricing,
                        availability, and features. Individual tickets will be
                        generated when buyers make purchases.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateTicket}>
                      {formError && (
                        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500">
                          {formError}
                        </div>
                      )}
                      <div className="grid max-h-[60vh] gap-4 overflow-y-auto py-4 pr-2">
                        {/* Basic Information Section */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">
                            Basic Information
                          </h3>

                          <div className="grid gap-2">
                            <Label htmlFor="name">Ticket Name</Label>
                            <Input
                              id="name"
                              name="name"
                              value={ticketFormData.name}
                              onChange={handleTicketFormChange}
                              required
                            />
                            <p className="text-muted-foreground text-xs">
                              The name of this ticket type (e.g., VIP, Early
                              Bird, General Admission)
                            </p>
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
                            <p className="text-muted-foreground text-xs">
                              Describe what's included with this ticket type,
                              special perks, or any restrictions
                            </p>
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                              <Label htmlFor="price">Price</Label>
                              <Input
                                id="price"
                                name="price"
                                type="number"
                                min="0"
                                step="1"
                                value={ticketFormData.price}
                                onChange={handleTicketFormChange}
                                required
                                placeholder="0"
                              />
                              <p className="text-muted-foreground text-xs">
                                Price in Indonesian Rupiah (IDR)
                                {ticketFormData.price &&
                                  !isNaN(Number(ticketFormData.price)) && (
                                    <span className="block font-medium text-blue-600">
                                      Preview:{" "}
                                      {formatPrice(
                                        Number(ticketFormData.price),
                                      )}
                                    </span>
                                  )}
                              </p>
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
                              <p className="text-muted-foreground text-xs">
                                Total number of tickets available for sale
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                              <Label htmlFor="maxPerPurchase">
                                Max Per Purchase
                              </Label>
                              <Input
                                id="maxPerPurchase"
                                name="maxPerPurchase"
                                type="number"
                                min="1"
                                value={ticketFormData.maxPerPurchase}
                                onChange={handleTicketFormChange}
                                required
                              />
                              <p className="text-muted-foreground text-xs">
                                Maximum number of tickets a buyer can purchase
                                in a single transaction
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator className="my-2" />

                        {/* Features & Perks Section */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">
                            Features & Perks
                          </h3>

                          <div className="grid gap-2">
                            <Label htmlFor="ticketFeatures">
                              Ticket Features
                            </Label>
                            <Input
                              id="ticketFeatures"
                              name="ticketFeatures"
                              value={ticketFormData.ticketFeatures}
                              onChange={handleTicketFormChange}
                            />
                            <p className="text-muted-foreground text-xs">
                              A comma-separated list of features included with
                              this ticket (e.g., "Reserved Seating, Merchandise,
                              Early Entry")
                            </p>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="perks">Perks Description</Label>
                            <Textarea
                              id="perks"
                              name="perks"
                              value={ticketFormData.perks}
                              onChange={handleTicketFormChange}
                              rows={2}
                            />
                            <p className="text-muted-foreground text-xs">
                              Detailed description of special perks or benefits
                              included with this ticket type
                            </p>
                          </div>

                          {/* Logo Upload Section */}
                          <div className="grid gap-2">
                            <TicketLogoUpload
                              label="Logo Tiket (Opsional)"
                              value={
                                ticketFormData.logoUrl && ticketFormData.logoPublicId
                                  ? {
                                      url: ticketFormData.logoUrl,
                                      publicId: ticketFormData.logoPublicId,
                                    }
                                  : null
                              }
                              onChange={handleLogoChange}
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>

                        <Separator className="my-2" />

                        {/* Sale Period Section */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">Sale Period</h3>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                              <Label htmlFor="saleStartDate">
                                Sale Start Date
                              </Label>
                              <Input
                                id="saleStartDate"
                                name="saleStartDate"
                                type="datetime-local"
                                value={ticketFormData.saleStartDate}
                                onChange={handleTicketFormChange}
                              />
                              <p className="text-muted-foreground text-xs">
                                When this ticket type will become available for
                                purchase
                              </p>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="saleEndDate">Sale End Date</Label>
                              <Input
                                id="saleEndDate"
                                name="saleEndDate"
                                type="datetime-local"
                                value={ticketFormData.saleEndDate}
                                onChange={handleTicketFormChange}
                              />
                              <p className="text-muted-foreground text-xs">
                                When this ticket type will no longer be
                                available for purchase
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="earlyBirdDeadline">
                              Early Bird Deadline
                            </Label>
                            <Input
                              id="earlyBirdDeadline"
                              name="earlyBirdDeadline"
                              type="datetime-local"
                              value={ticketFormData.earlyBirdDeadline}
                              onChange={handleTicketFormChange}
                            />
                            <p className="text-muted-foreground text-xs">
                              If this is an early bird ticket, when the special
                              pricing ends
                            </p>
                          </div>
                        </div>

                        <Separator className="my-2" />

                        {/* Visibility & Transfer Options */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">
                            Visibility & Transfer Options
                          </h3>

                          <div className="flex items-start space-x-2">
                            <div className="pt-1">
                              <Checkbox
                                id="isVisible"
                                checked={ticketFormData.isVisible}
                                onCheckedChange={handleVisibilityChange}
                              />
                            </div>
                            <div>
                              <Label htmlFor="isVisible">
                                Visible to buyers
                              </Label>
                              <p className="text-muted-foreground text-xs">
                                When checked, this ticket type will be visible
                                on the public event page. Uncheck to hide it
                                temporarily.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-2">
                            <div className="pt-1">
                              <Checkbox
                                id="allowTransfer"
                                checked={ticketFormData.allowTransfer}
                                onCheckedChange={handleTransferChange}
                              />
                            </div>
                            <div>
                              <Label htmlFor="allowTransfer">
                                Allow ticket transfer
                              </Label>
                              <p className="text-muted-foreground text-xs">
                                When checked, buyers can transfer their tickets
                                to other users. Useful for group purchases.
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator className="my-2" />

                        {/* Payment Methods */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-foreground">
                              Metode Pembayaran yang Diizinkan
                            </h3>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                              Pilih metode pembayaran yang dapat digunakan pelanggan untuk membeli tiket ini.
                              Minimal satu metode pembayaran harus dipilih.
                            </p>
                          </div>

                          {/* Debug Information */}
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                            <h4 className="font-medium text-yellow-800">Debug Info:</h4>
                            <p className="text-sm text-yellow-700">Payment methods count: {paymentMethods.length}</p>
                            <p className="text-sm text-yellow-700">Selected methods: {selectedPaymentMethods.length}</p>
                            <p className="text-sm text-yellow-700">Payment methods data: {JSON.stringify(paymentMethods, null, 2)}</p>
                          </div>

                          <div className="space-y-3">
                            {paymentMethodsList}
                          </div>

                          {selectedPaymentMethods.length === 0 && paymentMethods.length > 0 && (
                            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                              <p className="text-red-700 text-xs">
                                Silakan pilih minimal satu metode pembayaran.
                              </p>
                            </div>
                          )}
                        </div>

                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleDialogClose}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Creating..." : "Create Ticket Type"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="mb-4 px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Understanding Tickets</CardTitle>
                  <CardDescription>
                    How ticket types and individual tickets work in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">
                        Ticket Types vs. Individual Tickets
                      </h3>
                      <p className="text-muted-foreground mt-1 text-sm">
                        In this system, there are two related but distinct
                        concepts:
                      </p>
                      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
                        <li>
                          <span className="font-medium">Ticket Types</span>:
                          These are the categories or classes of tickets you
                          create for your event (e.g., VIP, General Admission,
                          Early Bird). Each type has its own price, quantity,
                          and features. This is what you're managing on this
                          page.
                        </li>
                        <li>
                          <span className="font-medium">
                            Individual Tickets
                          </span>
                          : When a buyer purchases a ticket, an individual
                          ticket record is created based on the ticket type.
                          Each ticket has a unique QR code and belongs to a
                          specific user. These are generated automatically
                          during purchase.
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Workflow</h3>
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
                        <li>
                          You create ticket types for your event (this page)
                        </li>
                        <li>Buyers purchase tickets of a specific type</li>
                        <li>
                          Individual tickets are generated for each purchase
                        </li>
                        <li>
                          Buyers receive their tickets with unique QR codes
                        </li>
                        <li>
                          The system tracks inventory by reducing available
                          quantity
                        </li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Debug Panel */}
            <div className="px-4 lg:px-6">
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-800">🔍 Debug Information</CardTitle>
                  <CardDescription className="text-blue-700">
                    Payment method configuration debugging
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-blue-800">Payment Methods Count:</span>
                        <span className="ml-2 text-blue-700">{paymentMethods.length}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Selected Methods:</span>
                        <span className="ml-2 text-blue-700">{selectedPaymentMethods.length}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Dialog Open:</span>
                        <span className="ml-2 text-blue-700">{isTicketDialogOpen ? 'Yes' : 'No'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Form Loading:</span>
                        <span className="ml-2 text-blue-700">{isSubmitting ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="font-medium text-blue-800">Payment Methods Data:</span>
                      <pre className="mt-2 max-h-32 overflow-y-auto rounded bg-blue-100 p-2 text-xs text-blue-900">
                        {JSON.stringify(paymentMethods, null, 2)}
                      </pre>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDebugDialogOpen}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        🔧 Test Dialog Open
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDebugRefetchPaymentMethods}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        🔄 Refetch Payment Methods
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Ticket Types</CardTitle>
                      <CardDescription>
                        Manage ticket types for {event?.title}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowEnhancedView(!showEnhancedView)}
                      >
                        {showEnhancedView ? "Table View" : "Enhanced View"}
                      </Button>
                    </div>
                  </div>
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
                        No ticket types yet
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        You haven't created any ticket types for this event yet.
                        Ticket types define the categories of tickets available
                        for purchase.
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => setIsTicketDialogOpen(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Ticket Type
                      </Button>
                    </div>
                  ) : showEnhancedView ? (
                    <EnhancedTicketTypeList
                      organizerId={id}
                      onEdit={handleEditTicketType}
                      onDelete={handleDeleteTicketType}
                      onBulkOperation={handleBulkOperation}
                      onExport={handleExportTicketTypes}
                    />
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Logo</TableHead>
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
                              <TableCell>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                                  {ticket.logoUrl ? (
                                    <Image
                                      src={ticket.logoUrl}
                                      alt={`Logo ${ticket.name}`}
                                      width={48}
                                      height={48}
                                      className="object-contain w-full h-full"
                                    />
                                  ) : (
                                    <Ticket className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                {ticket.name}
                                {ticket.description && (
                                  <p className="text-muted-foreground text-xs">
                                    {ticket.description}
                                  </p>
                                )}
                              </TableCell>
                              <TableCell>{formatPrice(ticket.price)}</TableCell>
                              <TableCell>{ticket.quantity}</TableCell>
                              <TableCell>{ticket.sold || 0}</TableCell>
                              <TableCell>
                                {ticket.quantity - (ticket.sold || 0)}
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
                                    <DropdownMenuLabel>
                                      Actions
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleEditTicket(ticket.id)
                                      }
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Ticket
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <AlertDialog
                                      open={selectedTicketId === ticket.id}
                                      onOpenChange={(open: boolean) => {
                                        if (open) {
                                          setSelectedTicketId(ticket.id);
                                        } else {
                                          setSelectedTicketId(null);
                                        }
                                      }}
                                    >
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                          className="text-destructive focus:text-destructive"
                                          onSelect={(e) => e.preventDefault()}
                                        >
                                          <Trash className="mr-2 h-4 w-4" />
                                          Delete Ticket
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Are you sure?
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This action cannot be undone. This
                                            will permanently delete the ticket
                                            type and remove it from our servers.
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
                                  </DropdownMenuContent>
                                </DropdownMenu>
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

      {/* Edit Ticket Type Modal */}
      <TicketTypeEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        ticketType={selectedTicketTypeForEdit}
        organizerId={id}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
