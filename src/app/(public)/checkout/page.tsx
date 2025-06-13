"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  ArrowLeft,
  User,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Ticket,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  MagicInput,
  MagicCard,
  MagicButton,
} from "~/components/ui/magic-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { formatPrice } from "~/lib/utils";
import { toast } from "sonner";
import { Clock } from "lucide-react";

interface Event {
  id: string;
  title: string;
  venue: string;
  city: string;
  startDate: string;
  endDate: string;
  posterUrl?: string;
}

interface TicketType {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface SelectedTicket {
  ticketTypeId: string;
  ticketType: TicketType;
  quantity: number;
  subtotal: number;
}

interface BuyerInfo {
  fullName: string;
  identityType: string;
  identityNumber: string;
  email: string;
  whatsapp: string;
}

interface TicketHolder {
  fullName: string;
  identityType: string;
  identityNumber: string;
  email: string;
  whatsapp: string;
}

export default function TicketPurchasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [event, setEvent] = useState<Event | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<SelectedTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reservation states
  const [reservations, setReservations] = useState<any[]>([]);
  const [reservationExpiry, setReservationExpiry] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [sessionId, setSessionId] = useState<string>("");
  const [isProceedingToPayment, setIsProceedingToPayment] =
    useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);

  // Form states
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo>({
    fullName: "",
    identityType: "KTP",
    identityNumber: "",
    email: "",
    whatsapp: "",
  });

  const [ticketHolders, setTicketHolders] = useState<TicketHolder[]>([]);
  const [useBuyerData, setUseBuyerData] = useState<boolean[]>([]);

  // Auto-update ticket holders when buyer info changes and checkbox is checked
  useEffect(() => {
    useBuyerData.forEach((shouldUseBuyerData, index) => {
      if (shouldUseBuyerData) {
        setTicketHolders((prev) => {
          const updated = [...prev];
          updated[index] = {
            fullName: buyerInfo.fullName || "",
            identityType: buyerInfo.identityType || "KTP",
            identityNumber: buyerInfo.identityNumber || "",
            email: buyerInfo.email || "",
            whatsapp: buyerInfo.whatsapp || "",
          };
          return updated;
        });
      }
    });
  }, [buyerInfo, useBuyerData]);

  // Countdown timer effect
  useEffect(() => {
    if (!reservationExpiry) {
      console.log("No reservation expiry set, timer not starting");
      return;
    }

    console.log("Starting countdown timer, expiry:", reservationExpiry);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = reservationExpiry.getTime();
      const remaining = Math.max(0, expiry - now);
      const remainingSeconds = Math.floor(remaining / 1000);

      console.log("Timer update - remaining seconds:", remainingSeconds);
      setTimeRemaining(remainingSeconds);

      if (remaining <= 0) {
        console.log("Timer expired, cleaning up reservations");
        clearInterval(timer);

        // Cleanup reservations when timer expires
        if (reservations.length > 0) {
          fetch("/api/public/reservations/cleanup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              reservationIds: reservations.map((r) => r.id),
            }),
          }).catch(console.error);
        }

        // Redirect back to event page when timer expires
        toast.error("Reservation expired", {
          description: "Your ticket reservation has expired. Please try again.",
        });
        router.push(`/events/${event?.id}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [reservationExpiry, router, event?.id, reservations, sessionId]);

  // Cleanup reservations on page unload or navigation
  useEffect(() => {
    let shouldCleanup = true;

    const cleanupReservations = () => {
      // Don't cleanup if user is proceeding to payment
      if (reservations.length > 0 && shouldCleanup && !isProceedingToPayment) {
        fetch("/api/public/reservations/cleanup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            reservationIds: reservations.map((r) => r.id),
          }),
        }).catch(console.error);
      }
    };

    const handleBeforeUnload = () => {
      // Cancel reservations when user leaves the page (but not when proceeding to payment)
      if (reservations.length > 0 && !isProceedingToPayment) {
        navigator.sendBeacon(
          "/api/public/reservations/cleanup",
          JSON.stringify({
            sessionId,
            reservationIds: reservations.map((r) => r.id),
          }),
        );
      }
    };

    // Handle browser navigation (back button, etc.)
    const handlePopState = () => {
      // Don't cleanup if user is proceeding to payment
      if (!isProceedingToPayment) {
        cleanupReservations();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      // Don't cleanup when component unmounts normally (navigation to payment)
      // Only cleanup on explicit user actions like back button or page close
    };
  }, [reservations, sessionId, isProceedingToPayment]);

  // Parse URL parameters
  useEffect(() => {
    const eventId = searchParams.get("eventId");
    const urlSessionId = searchParams.get("sessionId");

    if (!eventId) {
      setError("Event ID is required");
      setIsLoading(false);
      return;
    }

    // Set session ID from URL or generate new one
    const currentSessionId =
      urlSessionId ||
      localStorage.getItem("vbticket_session_id") ||
      `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    // Store session ID in localStorage for guest access
    localStorage.setItem("vbticket_session_id", currentSessionId);
    setSessionId(currentSessionId);

    console.log("Using session ID:", currentSessionId);

    // Parse ticket selections from URL
    const ticketParams: Array<{ ticketTypeId: string; quantity: number }> = [];
    searchParams.forEach((value, key) => {
      if (key === "tickets") {
        const [ticketTypeId, quantity] = value.split(":");
        if (ticketTypeId && quantity) {
          ticketParams.push({
            ticketTypeId,
            quantity: parseInt(quantity, 10),
          });
        }
      }
    });

    if (ticketParams.length === 0) {
      setError("No tickets selected");
      setIsLoading(false);
      return;
    }

    fetchEventAndTickets(eventId, ticketParams, currentSessionId);
  }, [searchParams]);

  const fetchEventAndTickets = async (
    eventId: string,
    ticketParams: Array<{ ticketTypeId: string; quantity: number }>,
    currentSessionId: string,
  ) => {
    try {
      console.log("Fetching event and tickets:", { eventId, ticketParams, currentSessionId });

      // Fetch event details with enhanced error handling
      const eventResponse = await fetch(`/api/public/events/${eventId}`);

      if (!eventResponse.ok) {
        const errorText = await eventResponse.text();
        console.error("Event fetch failed:", { status: eventResponse.status, error: errorText });
        throw new Error(`Failed to load event: ${eventResponse.status} ${errorText}`);
      }

      const eventData = await eventResponse.json();
      console.log("Event data received:", eventData);

      if (!eventData.success) {
        console.error("Event API returned error:", eventData.error);
        throw new Error(eventData.error || "Failed to load event");
      }

      setEvent(eventData.data);

      // Check for existing reservations first (for page refresh)
      const existingReservationsResponse = await fetch(
        `/api/public/reservations?sessionId=${currentSessionId}`,
      );
      const existingReservationsResult =
        await existingReservationsResponse.json();

      let reservationData;

      if (
        existingReservationsResult.success &&
        existingReservationsResult.data.length > 0
      ) {
        // Use existing reservations
        reservationData = existingReservationsResult.data;
      } else {
        // Create new bulk reservations for selected tickets
        const reservationResponse = await fetch("/api/public/reservations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reservations: ticketParams,
            sessionId: currentSessionId,
            expirationMinutes: 10,
          }),
        });

        const reservationResult = await reservationResponse.json();

        if (!reservationResult.success) {
          throw new Error(
            reservationResult.error || "Failed to reserve tickets",
          );
        }

        reservationData = reservationResult.data.successful;
      }

      // Set reservation data
      console.log("Setting reservation data:", reservationData);
      setReservations(reservationData);

      // Set expiry time from the first reservation
      if (reservationData.length > 0) {
        const firstReservation = reservationData[0];
        console.log("First reservation:", firstReservation);

        const expiryDate = new Date(firstReservation.expiresAt);
        console.log("Setting reservation expiry:", expiryDate);
        setReservationExpiry(expiryDate);

        // Calculate initial time remaining
        const now = new Date().getTime();
        const remaining = Math.max(0, expiryDate.getTime() - now);
        const remainingSeconds = Math.floor(remaining / 1000);
        console.log("Initial time remaining:", remainingSeconds, "seconds");
        setTimeRemaining(remainingSeconds);
      } else {
        console.log("No reservations found");
      }

      // Process selected tickets
      const tickets: SelectedTicket[] = [];
      let totalTicketCount = 0;

      for (const param of ticketParams) {
        const ticketType = eventData.data.ticketTypes?.find(
          (t: TicketType) => t.id === param.ticketTypeId,
        );

        if (ticketType) {
          tickets.push({
            ticketTypeId: param.ticketTypeId,
            ticketType,
            quantity: param.quantity,
            subtotal: ticketType.price * param.quantity,
          });
          totalTicketCount += param.quantity;
        }
      }

      setSelectedTickets(tickets);

      // Initialize ticket holders array
      const holders: TicketHolder[] = [];
      const buyerDataFlags: boolean[] = [];
      for (let i = 0; i < totalTicketCount; i++) {
        holders.push({
          fullName: "",
          identityType: "KTP",
          identityNumber: "",
          email: "",
          whatsapp: "",
        });
        buyerDataFlags.push(false);
      }
      setTicketHolders(holders);
      setUseBuyerData(buyerDataFlags);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTicketHolder = (
    index: number,
    field: keyof TicketHolder,
    value: string,
  ) => {
    setTicketHolders((prev) => {
      const updated = [...prev];
      const currentHolder = updated[index] || {
        fullName: "",
        identityType: "KTP",
        identityNumber: "",
        email: "",
        whatsapp: "",
      };
      updated[index] = { ...currentHolder, [field]: value };
      return updated;
    });
  };

  // Toggle use buyer data for ticket holder
  const toggleUseBuyerData = (index: number, checked: boolean) => {
    const updatedFlags = [...useBuyerData];
    updatedFlags[index] = checked;
    setUseBuyerData(updatedFlags);

    if (checked) {
      // Copy buyer data to ticket holder
      setTicketHolders((prev) => {
        const updated = [...prev];
        updated[index] = {
          fullName: buyerInfo.fullName || "",
          identityType: buyerInfo.identityType || "KTP",
          identityNumber: buyerInfo.identityNumber || "",
          email: buyerInfo.email || "",
          whatsapp: buyerInfo.whatsapp || "",
        };
        return updated;
      });
    } else {
      // Clear ticket holder data
      setTicketHolders((prev) => {
        const updated = [...prev];
        updated[index] = {
          fullName: "",
          identityType: "KTP",
          identityNumber: "",
          email: "",
          whatsapp: "",
        };
        return updated;
      });
    }
  };

  const calculateTotal = () => {
    const subtotal = selectedTickets.reduce(
      (sum, ticket) => sum + ticket.subtotal,
      0,
    );
    const serviceFee = Math.round(subtotal * 0.05); // 5% service fee
    return { subtotal, serviceFee, total: subtotal + serviceFee };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate buyer info
    if (
      !buyerInfo.fullName ||
      !buyerInfo.identityNumber ||
      !buyerInfo.email ||
      !buyerInfo.whatsapp
    ) {
      setError("Mohon lengkapi semua data pemesan");
      return;
    }

    // Validate ticket holders
    const hasEmptyFields = ticketHolders.some(
      (holder) =>
        !holder.fullName ||
        !holder.identityNumber ||
        !holder.email ||
        !holder.whatsapp,
    );

    if (hasEmptyFields) {
      setError("Mohon lengkapi semua data pemilik tiket");
      return;
    }

    // Show confirmation modal instead of proceeding directly
    setShowConfirmationModal(true);
  };

  // Handle actual order submission after confirmation
  const handleConfirmOrder = async () => {
    setShowConfirmationModal(false);
    setIsSubmitting(true);
    setError(null);

    try {
      // Use the first reservation for purchase (assuming all reservations have same expiry)
      if (reservations.length === 0) {
        console.error("No reservations available for purchase");
        throw new Error("No active reservations found");
      }

      const firstReservation = reservations[0];
      console.log("Using reservation for purchase:", firstReservation);

      const requestData = {
        sessionId,
        buyerInfo,
        ticketHolders,
      };

      console.log("Submitting purchase request:", requestData);
      console.log("Buyer info:", buyerInfo);
      console.log("Ticket holders:", ticketHolders);
      console.log("Ticket holders length:", ticketHolders.length);
      console.log("Session ID:", sessionId);

      // Submit purchase request using reservation
      const response = await fetch(
        `/api/public/reservations/${firstReservation.id}/purchase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        },
      );

      const result = await response.json();
      console.log("Purchase response:", result);

      if (!result.success) {
        console.error("Reservation purchase error:", result);
        console.error("Validation errors:", result.validationErrors);
        console.error("Error details:", result.details);

        // Show detailed error message
        let errorMessage = result.error || "Failed to create order";
        if (result.validationErrors) {
          errorMessage +=
            "\nValidation errors: " +
            JSON.stringify(result.validationErrors, null, 2);
        }

        throw new Error(errorMessage);
      }

      // Show success toast
      toast.success("Order created successfully!", {
        description: "Redirecting to payment page...",
      });

      // Set flag to prevent reservation cleanup during navigation to payment
      setIsProceedingToPayment(true);

      // Redirect to payment page (reservations are converted, no need to cleanup)
      router.push(`/checkout/${result.data.transaction.id}`);
    } catch (err: any) {
      console.error("Error submitting order:", err);
      setError(err.message || "Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center p-12">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Pembelian Tiket</h1>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error || "Event tidak ditemukan"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { subtotal, serviceFee, total } = calculateTotal();

  // Cleanup reservations helper function
  const cleanupReservationsAsync = async () => {
    if (reservations.length === 0) return;

    try {
      await fetch("/api/public/reservations/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          reservationIds: reservations.map((r) => r.id),
        }),
      });
    } catch (error) {
      console.error("Error cleaning up reservations:", error);
    }
  };

  // Handle manual cancellation
  const handleCancelReservation = async () => {
    if (reservations.length === 0) return;

    try {
      await cleanupReservationsAsync();

      toast.success("Reservation cancelled", {
        description: "Your ticket reservation has been cancelled.",
      });

      // Redirect back to event page
      router.push(`/events/${event?.id}`);
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      toast.error("Failed to cancel reservation", {
        description: "Please try again or wait for the timer to expire.",
      });
    }
  };

  // Handle back button click
  const handleBackClick = async () => {
    await cleanupReservationsAsync();
    router.back();
  };

  // Format time remaining for display
  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleBackClick}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold">Pembelian Tiket</h1>
          </div>
        </div>
      </div>

      {/* Countdown Timer */}
      {reservations.length > 0 && reservationExpiry && timeRemaining > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">
                  Waktu tersisa: {formatTimeRemaining(timeRemaining)}
                </span>
                <span className="text-sm opacity-90">
                  - Selesaikan pembelian sebelum waktu habis
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelReservation}
                className="text-white hover:bg-white/20 hover:text-white"
              >
                Batalkan Reservasi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-yellow-100 p-2 text-xs">
          <div>Reservations: {reservations.length}</div>
          <div>Reservation Expiry: {reservationExpiry?.toString()}</div>
          <div>Time Remaining: {timeRemaining}</div>
          <div>Session ID: {sessionId}</div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Event Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Detail Event
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{event.title}</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>
                      {new Date(event.startDate).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>
                      {event.venue}, {event.city}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Buyer Information */}
              <MagicCard className="bg-gradient-to-br from-background/90 to-muted/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Data Pemesan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="fullName">Nama Lengkap *</Label>
                      <MagicInput
                        id="fullName"
                        value={buyerInfo.fullName}
                        onChange={(e) =>
                          setBuyerInfo((prev) => ({
                            ...prev,
                            fullName: e.target.value,
                          }))
                        }
                        placeholder="Masukkan nama lengkap"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="identityType">Jenis Identitas *</Label>
                      <Select
                        value={buyerInfo.identityType}
                        onValueChange={(value) =>
                          setBuyerInfo((prev) => ({
                            ...prev,
                            identityType: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="KTP">KTP</SelectItem>
                          <SelectItem value="SIM">SIM</SelectItem>
                          <SelectItem value="PASSPORT">Passport</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="identityNumber">Nomor Identitas *</Label>
                      <MagicInput
                        id="identityNumber"
                        value={buyerInfo.identityNumber}
                        onChange={(e) =>
                          setBuyerInfo((prev) => ({
                            ...prev,
                            identityNumber: e.target.value,
                          }))
                        }
                        placeholder="Masukkan nomor identitas"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <MagicInput
                        id="email"
                        type="email"
                        value={buyerInfo.email}
                        onChange={(e) =>
                          setBuyerInfo((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="Masukkan email"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">Nomor WhatsApp *</Label>
                    <MagicInput
                      id="whatsapp"
                      value={buyerInfo.whatsapp}
                      onChange={(e) =>
                        setBuyerInfo((prev) => ({
                          ...prev,
                          whatsapp: e.target.value,
                        }))
                      }
                      placeholder="Masukkan nomor WhatsApp"
                      required
                    />
                  </div>
                </CardContent>
              </MagicCard>

              {/* Ticket Holders */}
              <MagicCard className="bg-gradient-to-br from-background/90 to-muted/20">
                <CardHeader>
                  <CardTitle>Data Pemilik Tiket</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {ticketHolders.map((holder, index) => (
                    <div
                      key={index}
                      className="space-y-4 rounded-lg border p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Tiket #{index + 1}</h4>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`use-buyer-data-${index}`}
                            checked={useBuyerData[index] || false}
                            onCheckedChange={(checked) =>
                              toggleUseBuyerData(index, checked as boolean)
                            }
                          />
                          <Label
                            htmlFor={`use-buyer-data-${index}`}
                            className="text-sm font-normal"
                          >
                            Samakan dengan data pemesan
                          </Label>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor={`holder-name-${index}`}>
                            Nama Lengkap *
                          </Label>
                          <MagicInput
                            id={`holder-name-${index}`}
                            value={holder.fullName}
                            onChange={(e) =>
                              updateTicketHolder(
                                index,
                                "fullName",
                                e.target.value,
                              )
                            }
                            placeholder="Masukkan nama lengkap"
                            disabled={useBuyerData[index]}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`holder-identity-type-${index}`}>
                            Jenis Identitas *
                          </Label>
                          <Select
                            value={holder.identityType}
                            onValueChange={(value) =>
                              updateTicketHolder(index, "identityType", value)
                            }
                            disabled={useBuyerData[index]}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="KTP">KTP</SelectItem>
                              <SelectItem value="SIM">SIM</SelectItem>
                              <SelectItem value="PASSPORT">Passport</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor={`holder-identity-${index}`}>
                            Nomor Identitas *
                          </Label>
                          <MagicInput
                            id={`holder-identity-${index}`}
                            value={holder.identityNumber}
                            onChange={(e) =>
                              updateTicketHolder(
                                index,
                                "identityNumber",
                                e.target.value,
                              )
                            }
                            placeholder="Masukkan nomor identitas"
                            disabled={useBuyerData[index]}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`holder-email-${index}`}>
                            Email *
                          </Label>
                          <MagicInput
                            id={`holder-email-${index}`}
                            type="email"
                            value={holder.email}
                            onChange={(e) =>
                              updateTicketHolder(index, "email", e.target.value)
                            }
                            placeholder="Masukkan email"
                            disabled={useBuyerData[index]}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`holder-whatsapp-${index}`}>
                          Nomor WhatsApp *
                        </Label>
                        <MagicInput
                          id={`holder-whatsapp-${index}`}
                          value={holder.whatsapp}
                          onChange={(e) =>
                            updateTicketHolder(
                              index,
                              "whatsapp",
                              e.target.value,
                            )
                          }
                          placeholder="Masukkan nomor WhatsApp"
                          disabled={useBuyerData[index]}
                          required
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </MagicCard>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Ringkasan Pesanan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected Tickets */}
                <div className="space-y-3">
                  {selectedTickets.map((ticket, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{ticket.ticketType.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatPrice(ticket.ticketType.price)} x{" "}
                          {ticket.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatPrice(ticket.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biaya Layanan</span>
                    <span>{formatPrice(serviceFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">{formatPrice(total)}</span>
                  </div>
                </div>

                <MagicButton
                  type="submit"
                  className="w-full"
                  size="lg"
                  variant="magic"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? "Memproses..." : "Lanjut ke Pembayaran"}
                </MagicButton>

                <p className="text-center text-xs text-gray-500">
                  Dengan melanjutkan, Anda menyetujui syarat dan ketentuan yang
                  berlaku
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog
        open={showConfirmationModal}
        onOpenChange={setShowConfirmationModal}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Informasi Tiket
            </DialogTitle>
            <DialogDescription>
              Pastikan data kamu sudah benar yaa!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Buyer Information */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Nama</span>
                <span>{buyerInfo.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email</span>
                <span>{buyerInfo.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">No. WhatsApp</span>
                <span>{buyerInfo.whatsapp}</span>
              </div>
            </div>

            <Separator />

            {/* Email and WhatsApp Information */}
            <div className="space-y-3 text-sm">
              <p>
                <span className="font-medium">
                  Invoice dan e-Tiket akan dikirim ke alamat email berikut:
                </span>
                <br />
                <span className="text-blue-600">{buyerInfo.email}</span>
              </p>
              <p>
                <span className="font-medium">
                  e-Tiket juga akan dikirim melalui whatsapp dengan nomor:
                </span>
                <br />
                <span className="text-blue-600">{buyerInfo.whatsapp}</span>
              </p>
            </div>

            <Separator />

            {/* Email Tips */}
            <div className="space-y-2 text-sm text-gray-600">
              <p className="font-medium">
                Jika belum menerima notifikasi email setelah melakukan
                pembayaran:
              </p>
              <ul className="list-inside list-disc space-y-1 text-xs">
                <li>Silahkan ketik "vbticket" dikolom pencarian email</li>
                <li>Cek e-Tiket difolder spam/promotion email Anda</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <MagicButton
              variant="outline"
              onClick={() => setShowConfirmationModal(false)}
              className="w-full sm:w-auto"
            >
              Edit Data (kembali)
            </MagicButton>
            <MagicButton
              onClick={handleConfirmOrder}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
              variant="magic"
            >
              {isSubmitting ? "Memproses..." : "Saya Mengerti"}
            </MagicButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
