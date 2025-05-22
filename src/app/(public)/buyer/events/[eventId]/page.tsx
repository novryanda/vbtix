"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BuyerTopNavbar } from "~/components/navigation/buyer-top-navbar";
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
  Share2,
  ArrowLeft,
  AlertCircle,
  Info,
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
  const [selectedTicketType, setSelectedTicketType] = useState<string | null>(
    null,
  );

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/buyer/events/${eventId}`);
        const data = await response.json();

        if (data.success) {
          setEvent(data.data);
          // Set the first available ticket type as selected by default
          if (data.data.ticketTypes && data.data.ticketTypes.length > 0) {
            setSelectedTicketType(data.data.ticketTypes[0].id);
          }
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

  // Handle ticket selection
  const handleTicketSelect = (ticketTypeId: string) => {
    setSelectedTicketType(ticketTypeId);
  };

  // Handle buy ticket
  const handleBuyTicket = () => {
    if (!selectedTicketType) return;

    // Navigate to checkout page with selected ticket type
    router.push(
      `/checkout?eventId=${eventId}&ticketTypeId=${selectedTicketType}`,
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <BuyerTopNavbar />
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
      </main>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <main className="min-h-screen bg-gray-50">
        <BuyerTopNavbar />
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
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <BuyerTopNavbar />

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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
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

              <div>
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Ticket Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {event.ticketTypes && event.ticketTypes.length > 0 ? (
                      <div className="space-y-4">
                        <div className="text-sm text-gray-500">
                          Starting from{" "}
                          <span className="text-lg font-bold text-blue-600">
                            {formatPrice(
                              Math.min(
                                ...event.ticketTypes.map(
                                  (ticket) => ticket.price,
                                ),
                              ),
                            )}
                          </span>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => {
                            document
                              .querySelector('[data-value="tickets"]')
                              ?.scrollIntoView({ behavior: "smooth" });
                          }}
                        >
                          <Ticket className="mr-2 h-4 w-4" />
                          View Tickets
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Share2 className="mr-2 h-4 w-4" />
                          Share Event
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 text-center">
                        <Info className="mb-2 h-8 w-8 text-blue-600" />
                        <p className="text-gray-500">
                          No tickets available for this event yet.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
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
                  <div className="space-y-4">
                    {event.ticketTypes.map((ticket) => (
                      <div
                        key={ticket.id}
                        className={`cursor-pointer rounded-lg border p-4 transition-all hover:border-blue-600 ${
                          selectedTicketType === ticket.id
                            ? "border-blue-600 bg-blue-50"
                            : ""
                        }`}
                        onClick={() => handleTicketSelect(ticket.id)}
                      >
                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                          <div className="flex-1">
                            <div className="mb-1 flex items-center justify-between">
                              <h3 className="text-lg font-semibold">
                                {ticket.name}
                              </h3>
                              <span className="font-bold text-blue-600">
                                {formatPrice(ticket.price)}
                              </span>
                            </div>
                            {ticket.description && (
                              <p className="mb-2 text-sm text-gray-600">
                                {ticket.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2">
                              {ticket.available > 0 ? (
                                <Badge
                                  variant="outline"
                                  className="text-green-600"
                                >
                                  {ticket.available} tickets left
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-red-600"
                                >
                                  Sold Out
                                </Badge>
                              )}
                              {ticket.ticketFeatures && (
                                <Badge
                                  variant="outline"
                                  className="text-blue-600"
                                >
                                  {ticket.ticketFeatures}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Button
                              disabled={ticket.available <= 0}
                              onClick={() => handleTicketSelect(ticket.id)}
                            >
                              Select
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="mt-6 rounded-lg bg-gray-50 p-4">
                      <h3 className="mb-2 text-lg font-semibold">
                        Order Summary
                      </h3>
                      <Separator className="my-2" />
                      {selectedTicketType ? (
                        <>
                          <div className="mb-4 space-y-2">
                            {event.ticketTypes
                              .filter((t) => t.id === selectedTicketType)
                              .map((ticket) => (
                                <div
                                  key={ticket.id}
                                  className="flex justify-between"
                                >
                                  <span>{ticket.name} x 1</span>
                                  <span className="font-medium">
                                    {formatPrice(ticket.price)}
                                  </span>
                                </div>
                              ))}
                            <Separator className="my-2" />
                            <div className="flex justify-between font-bold">
                              <span>Total</span>
                              <span className="text-blue-600">
                                {formatPrice(
                                  event.ticketTypes.find(
                                    (t) => t.id === selectedTicketType,
                                  )?.price || 0,
                                )}
                              </span>
                            </div>
                          </div>
                          <Button
                            className="w-full"
                            onClick={handleBuyTicket}
                            disabled={
                              !selectedTicketType ||
                              (event.ticketTypes.find(
                                (t) => t.id === selectedTicketType,
                              )?.available || 0) <= 0
                            }
                          >
                            Buy Ticket
                          </Button>
                        </>
                      ) : (
                        <p className="text-center text-gray-500">
                          Select a ticket to continue
                        </p>
                      )}
                    </div>
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
    </main>
  );
}
