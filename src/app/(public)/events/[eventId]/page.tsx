"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Ticket,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Tag,
} from "lucide-react";
import { formatPrice } from "~/lib/utils";

// Type definitions
interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sold: number;
  available: number;
  maxPerPurchase: number;
  isVisible: boolean;
  allowTransfer: boolean;
  ticketFeatures?: string;
  perks?: string;
  logoUrl?: string;
  logoPublicId?: string;
  earlyBirdDeadline?: string;
  saleStartDate?: string;
  saleEndDate?: string;
}

interface Organizer {
  id: string;
  orgName: string;
  verified: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

interface Event {
  id: string;
  slug: string;
  title: string;
  description?: string;
  posterUrl?: string;
  bannerUrl?: string;
  category?: string;
  venue: string;
  address?: string;
  city?: string;
  province: string;
  country: string;
  tags: string[];
  images: string[];
  featured: boolean;
  seatingMap?: string;
  maxAttendees?: number;
  website?: string;
  terms?: string;
  startDate: string;
  endDate: string;
  status: string;
  formattedStartDate: string;
  formattedEndDate: string;
  organizer: Organizer;
  ticketTypes: TicketType[];
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketQuantities, setTicketQuantities] = useState<
    Record<string, number>
  >({});
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/public/events/${eventId}`);
        const data = await response.json();

        if (data.success) {
          setEvent(data.data);
        } else {
          setError(data.error || "Failed to load event details");
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
        setError(
          "An error occurred while loading the event. Please try again.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  // Handle ticket quantity change
  const handleQuantityChange = (ticketTypeId: string, newQuantity: number) => {
    setTicketQuantities((prev) => {
      if (newQuantity <= 0) {
        const { [ticketTypeId]: removed, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [ticketTypeId]: newQuantity,
      };
    });
  };

  // Handle buy ticket
  const handleBuyTicket = async () => {
    const selectedTickets = Object.entries(ticketQuantities).filter(
      ([_, quantity]) => quantity > 0,
    );

    console.log("handleBuyTicket called");
    console.log("Selected tickets:", selectedTickets);

    if (selectedTickets.length === 0) {
      console.log("No tickets selected");
      return;
    }

    setIsCreatingReservation(true);

    try {
      // Generate session ID
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      console.log("Generated session ID:", sessionId);

      const reservationPayload = {
        reservations: selectedTickets.map(([ticketTypeId, quantity]) => ({
          ticketTypeId,
          quantity: parseInt(quantity.toString(), 10),
        })),
        sessionId,
        expirationMinutes: 10,
      };

      console.log("Creating reservations with payload:", reservationPayload);

      // Create reservations first
      const reservationResponse = await fetch("/api/public/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationPayload),
      });

      console.log("Reservation response status:", reservationResponse.status);
      const reservationResult = await reservationResponse.json();
      console.log("Reservation result:", reservationResult);

      if (!reservationResult.success) {
        throw new Error(reservationResult.error || "Failed to reserve tickets");
      }

      // Create query string with selected tickets and session ID
      const ticketParams = selectedTickets
        .map(
          ([ticketTypeId, quantity]) => `tickets=${ticketTypeId}:${quantity}`,
        )
        .join("&");

      console.log("Navigating to checkout with params:", ticketParams);

      // Navigate to checkout page with selected tickets and session ID
      router.push(
        `/checkout?eventId=${eventId}&${ticketParams}&sessionId=${sessionId}`,
      );
    } catch (error) {
      console.error("Error creating reservation:", error);
      // Fallback to old behavior if reservation fails
      const ticketParams = selectedTickets
        .map(
          ([ticketTypeId, quantity]) => `tickets=${ticketTypeId}:${quantity}`,
        )
        .join("&");
      console.log("Fallback navigation to checkout with params:", ticketParams);
      router.push(`/checkout?eventId=${eventId}&${ticketParams}`);
    } finally {
      setIsCreatingReservation(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Event Details</h1>
        </div>
        <div className="flex items-center justify-center p-12">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Event Details</h1>
        </div>
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold">Event Not Found</h2>
          <p className="mb-4 text-gray-600">
            {error ||
              "The event you're looking for doesn't exist or has been removed."}
          </p>
          <Button asChild>
            <Link href="/events">Browse Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Event Header */}
      <div className="relative">
        {/* Banner Image */}
        <div className="relative h-64 w-full bg-blue-600 md:h-80">
          {event.bannerUrl ? (
            <Image
              src={event.bannerUrl}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <h1 className="text-3xl font-bold text-white">{event.title}</h1>
            </div>
          )}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Event Info Card */}
        <div className="container mx-auto px-4">
          <div className="relative -mt-20 rounded-lg bg-white p-6 shadow-md md:flex md:items-start md:gap-6">
            {/* Poster Image */}
            <div className="mb-4 h-40 w-40 shrink-0 overflow-hidden rounded-lg border md:mb-0">
              {event.posterUrl ? (
                <Image
                  src={event.posterUrl}
                  alt={event.title}
                  width={160}
                  height={160}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </div>

            {/* Event Details */}
            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {event.category && (
                  <Badge className="bg-blue-600">{event.category}</Badge>
                )}
                <Badge
                  variant="outline"
                  className="border-green-500 text-green-600"
                >
                  {event.status}
                </Badge>
              </div>
              <h1 className="mb-2 text-2xl font-bold md:text-3xl">
                {event.title}
              </h1>
              <div className="mb-4 space-y-2 text-sm">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-blue-600" />
                  <span>
                    {event.formattedStartDate}
                    {event.formattedStartDate !== event.formattedEndDate &&
                      ` - ${event.formattedEndDate}`}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-blue-600" />
                  <span>
                    {new Date(event.startDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(event.endDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-blue-600" />
                  <span>
                    {event.venue}, {event.city}, {event.province}
                  </span>
                </div>
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-blue-600" />
                  <span className="flex items-center">
                    {event.organizer.orgName}
                    {event.organizer.verified && (
                      <CheckCircle className="ml-1 h-3 w-3 text-blue-600" />
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="w-full">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Event Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      {event.description ? (
                        <p className="whitespace-pre-line">
                          {event.description}
                        </p>
                      ) : (
                        <p className="text-gray-500">
                          No description provided.
                        </p>
                      )}
                    </div>

                    {event.tags && event.tags.length > 0 && (
                      <div className="mt-6">
                        <h3 className="mb-2 flex items-center text-sm font-medium">
                          <Tag className="mr-2 h-4 w-4 text-blue-600" />
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {event.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Additional Images */}
                {event.images && event.images.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Event Gallery</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                        {event.images.map((image, index) => (
                          <div
                            key={index}
                            className="relative aspect-square overflow-hidden rounded-md"
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
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tickets" data-value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>Available Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                {event.ticketTypes && event.ticketTypes.length > 0 ? (
                  <div className="space-y-6">
                    {event.ticketTypes.map((ticket) => {
                      const quantity = ticketQuantities[ticket.id] || 0;
                      const isSelected = quantity > 0;

                      return (
                        <div
                          key={ticket.id}
                          className={`rounded-lg border p-6 transition-all ${
                            isSelected
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex flex-col space-y-4">
                            {/* Ticket Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 sm:gap-4 flex-1">
                                {/* Logo */}
                                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  {ticket.logoUrl ? (
                                    <Image
                                      src={ticket.logoUrl}
                                      alt={`Logo ${ticket.name}`}
                                      width={64}
                                      height={64}
                                      className="object-contain w-full h-full"
                                    />
                                  ) : event.image ? (
                                    <Image
                                      src={event.image}
                                      alt={event.title}
                                      width={64}
                                      height={64}
                                      className="object-cover w-full h-full"
                                    />
                                  ) : (
                                    <Ticket className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                                  )}
                                </div>

                                {/* Ticket Info */}
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {ticket.name}
                                  </h3>
                                  <div className="mt-1">
                                    {ticket.available > 0 ? (
                                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                        On Sale
                                      </Badge>
                                    ) : (
                                      <Badge variant="destructive">
                                        Sold Out
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Description */}
                            {ticket.description && (
                              <p className="text-sm text-gray-600">
                                {ticket.description}
                              </p>
                            )}

                            {/* Price and Action */}
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="mb-1 text-sm text-gray-500">
                                  Harga
                                </p>
                                <p className="text-2xl font-bold text-blue-600">
                                  {formatPrice(ticket.price)}
                                </p>
                              </div>

                              <div className="flex items-center space-x-3">
                                {!isSelected ? (
                                  <Button
                                    disabled={ticket.available <= 0}
                                    onClick={() =>
                                      handleQuantityChange(ticket.id, 1)
                                    }
                                    className="px-6"
                                  >
                                    Pilih
                                  </Button>
                                ) : (
                                  <div className="flex items-center space-x-3">
                                    {/* Quantity Controls */}
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleQuantityChange(
                                            ticket.id,
                                            quantity - 1,
                                          )
                                        }
                                        disabled={quantity <= 0}
                                        className="h-8 w-8 p-0"
                                      >
                                        -
                                      </Button>
                                      <span className="w-8 text-center font-medium">
                                        {quantity}
                                      </span>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleQuantityChange(
                                            ticket.id,
                                            quantity + 1,
                                          )
                                        }
                                        disabled={
                                          quantity >= ticket.available ||
                                          quantity >=
                                            (ticket.maxPerPurchase || 10)
                                        }
                                        className="h-8 w-8 p-0"
                                      >
                                        +
                                      </Button>
                                    </div>

                                    {/* Cancel Button */}
                                    <Button
                                      variant="outline"
                                      onClick={() =>
                                        handleQuantityChange(ticket.id, 0)
                                      }
                                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                      Batal
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Additional Info */}
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                              <span>{ticket.available} tiket tersisa</span>
                              {ticket.maxPerPurchase && (
                                <span>
                                  • Maksimal {ticket.maxPerPurchase} tiket per
                                  pembelian
                                </span>
                              )}
                              {ticket.ticketFeatures && (
                                <span>• {ticket.ticketFeatures}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Order Summary */}
                    {Object.values(ticketQuantities).some((q) => q > 0) && (
                      <div className="mt-8 rounded-lg bg-gray-50 p-6">
                        <h3 className="mb-4 text-lg font-semibold">
                          Ringkasan Pesanan
                        </h3>
                        <div className="space-y-3">
                          {event.ticketTypes
                            .filter(
                              (ticket) =>
                                (ticketQuantities[ticket.id] || 0) > 0,
                            )
                            .map((ticket) => {
                              const quantity = ticketQuantities[ticket.id] || 0;
                              const subtotal = ticket.price * quantity;
                              return (
                                <div
                                  key={ticket.id}
                                  className="flex items-center justify-between"
                                >
                                  <span className="text-sm">
                                    {ticket.name} x {quantity}
                                  </span>
                                  <span className="font-medium">
                                    {formatPrice(subtotal)}
                                  </span>
                                </div>
                              );
                            })}
                          <Separator className="my-3" />
                          <div className="flex items-center justify-between text-lg font-bold">
                            <span>Total</span>
                            <span className="text-blue-600">
                              {formatPrice(
                                event.ticketTypes.reduce((total, ticket) => {
                                  const quantity =
                                    ticketQuantities[ticket.id] || 0;
                                  return total + ticket.price * quantity;
                                }, 0),
                              )}
                            </span>
                          </div>
                        </div>
                        <Button
                          className="mt-6 w-full"
                          onClick={handleBuyTicket}
                          size="lg"
                          disabled={isCreatingReservation}
                        >
                          {isCreatingReservation
                            ? "Creating Reservation..."
                            : "Beli Tiket"}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Ticket className="mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-semibold">
                      No tickets available
                    </h3>
                    <p className="text-gray-500">
                      There are no tickets available for this event yet. Please
                      check back later.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle>Event Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 rounded-lg bg-gray-100 p-4">
                  <h3 className="mb-2 text-lg font-semibold">{event.venue}</h3>
                  <p className="text-gray-600">
                    {event.address}, {event.city}, {event.province},{" "}
                    {event.country}
                  </p>
                </div>
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-200">
                  {/* Map would go here - using placeholder for now */}
                  <div className="flex h-full items-center justify-center">
                    <p className="text-gray-500">Map view not available</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    window.open(
                      `https://maps.google.com/?q=${encodeURIComponent(
                        `${event.venue}, ${event.address}, ${event.city}, ${event.province}`,
                      )}`,
                      "_blank",
                    );
                  }}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Open in Google Maps
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
