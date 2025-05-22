"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useOrganizerEventDetail,
  useEventTicketDetail,
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
import { ArrowLeft, AlertCircle, ImageIcon } from "lucide-react";
import { ORGANIZER_ENDPOINTS } from "~/lib/api/endpoints";
import { formatPrice } from "~/lib/utils";
import { Checkbox } from "~/components/ui/checkbox";
import { TicketImageUploader } from "~/components/ui/ticket-image-uploader";
import { Separator } from "~/components/ui/separator";
import Image from "next/image";

export default function EditTicketPage({
  params,
}: {
  params: Promise<{ id: string; eventId: string; ticketId: string }>;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [ticketFormData, setTicketFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    maxPerPurchase: "",
    isVisible: true,
    allowTransfer: false,
  });

  // Unwrap params with React.use()
  const { id, eventId, ticketId } = React.use(params);

  // Fetch event details
  const {
    data: eventData,
    isLoading: isEventLoading,
    error: eventError,
  } = useOrganizerEventDetail(id, eventId);
  const event = eventData?.data;

  // Fetch ticket details
  const {
    data: ticketData,
    isLoading: isTicketLoading,
    error: ticketError,
    mutate: mutateTicket,
  } = useEventTicketDetail(id, eventId, ticketId);
  const ticket = ticketData?.data;

  // Populate form with ticket data when available
  useEffect(() => {
    if (ticket) {
      setTicketFormData({
        name: ticket.name || "",
        description: ticket.description || "",
        price: ticket.price.toString() || "",
        quantity: ticket.quantity.toString() || "",
        maxPerPurchase: ticket.maxPerPurchase?.toString() || "10",
        isVisible: ticket.isVisible ?? true,
        allowTransfer: ticket.allowTransfer ?? false,
      });
    }
  }, [ticket]);

  // Handle form change
  const handleTicketFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const target = e.target as HTMLInputElement;
      setTicketFormData((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } else {
      setTicketFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle update ticket
  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      const ticketData = {
        name: ticketFormData.name,
        description: ticketFormData.description,
        price: parseFloat(ticketFormData.price),
        quantity: parseInt(ticketFormData.quantity, 10),
        maxPerPurchase: parseInt(ticketFormData.maxPerPurchase, 10),
        isVisible: ticketFormData.isVisible,
        allowTransfer: ticketFormData.allowTransfer,
      };

      const response = await fetch(
        ORGANIZER_ENDPOINTS.EVENT_TICKET_DETAIL(id, eventId, ticketId),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ticketData),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update ticket");
      }

      // Refresh ticket data
      mutateTicket();

      // Show success message
      alert("Ticket updated successfully");

      // Navigate to ticket details page
      router.push(`/organizer/${id}/events/${eventId}/tickets/${ticketId}`);
    } catch (err: any) {
      console.error("Error updating ticket:", err);
      setFormError(err.message || "Failed to update ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isEventLoading || isTicketLoading) {
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
                  <h1 className="text-2xl font-semibold">Edit Ticket</h1>
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
  if (eventError || ticketError || !event || !ticket) {
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
                  <h1 className="text-2xl font-semibold">Edit Ticket</h1>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <AlertCircle className="mb-2 h-8 w-8 text-red-500" />
                <h3 className="mb-2 text-lg font-semibold">
                  Error loading data
                </h3>
                <p className="text-muted-foreground text-sm">
                  {eventError?.message ||
                    ticketError?.message ||
                    "Failed to load data. Please try again."}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" onClick={() => router.refresh()}>
                    Try Again
                  </Button>
                  <Button onClick={() => router.back()}>Back</Button>
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
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-semibold">Edit Ticket</h1>
                  <p className="text-muted-foreground text-sm">
                    {event?.title}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Ticket</CardTitle>
                  <CardDescription>
                    Update ticket details for {event?.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateTicket}>
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
                                  {formatPrice(Number(ticketFormData.price))}
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
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="maxPerPurchase">Max Per Purchase</Label>
                        <Input
                          id="maxPerPurchase"
                          name="maxPerPurchase"
                          type="number"
                          min="1"
                          value={ticketFormData.maxPerPurchase}
                          onChange={handleTicketFormChange}
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isVisible"
                          checked={ticketFormData.isVisible}
                          onCheckedChange={(checked) =>
                            setTicketFormData((prev) => ({
                              ...prev,
                              isVisible: checked === true,
                            }))
                          }
                        />
                        <Label htmlFor="isVisible">Visible to buyers</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="allowTransfer"
                          checked={ticketFormData.allowTransfer}
                          onCheckedChange={(checked) =>
                            setTicketFormData((prev) => ({
                              ...prev,
                              allowTransfer: checked === true,
                            }))
                          }
                        />
                        <Label htmlFor="allowTransfer">
                          Allow ticket transfer
                        </Label>
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Ticket Image</h3>
                        <p className="text-muted-foreground text-sm">
                          Upload an image that will be displayed on the ticket.
                          This is optional but recommended.
                        </p>

                        {/* Ticket Image Upload Component */}
                        <div className="mt-4">
                          <TicketImageUploader
                            organizerId={id}
                            ticketId={ticketId}
                            currentImageUrl={ticket?.imageUrl}
                            onSuccess={(imageUrl) => {
                              console.log(
                                "Image uploaded successfully:",
                                imageUrl,
                              );
                              // Refresh ticket data
                              mutateTicket();
                            }}
                            onError={(error) => {
                              console.error("Error uploading image:", error);
                              setFormError(`Error uploading image: ${error}`);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Updating..." : "Update Ticket"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
