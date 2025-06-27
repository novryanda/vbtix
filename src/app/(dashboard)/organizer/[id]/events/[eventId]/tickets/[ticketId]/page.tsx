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
import { Label } from "~/components/ui/label";
import { ArrowLeft, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import { ORGANIZER_ENDPOINTS } from "~/lib/api/endpoints";
import { formatPrice } from "~/lib/utils";
import { Checkbox } from "~/components/ui/checkbox";
import { MagicCard, MagicInput, MagicTextarea, MagicButton } from "~/components/ui/magic-card";
import { TicketLogoUpload } from "~/components/ui/ticket-logo-upload";
import { toast } from "sonner";

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
    logoUrl: "",
    logoPublicId: "",
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
  } = useEventTicketDetail(id, eventId, ticketId);  const ticket = ticketData?.data;
  // Confetti effect function
  const createConfetti = () => {
    const colors = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.top = '-10px';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)] || '#10b981';
      confetti.style.borderRadius = '50%';
      confetti.style.zIndex = '10000';
      confetti.style.pointerEvents = 'none';
      confetti.style.animation = `confetti-fall ${2 + Math.random() * 3}s linear forwards`;
      
      document.body.appendChild(confetti);
      
      // Remove confetti after animation
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      }, 5000);
    }  };

  // Success sound effect
  const playSuccessSound = () => {
    // Create Web Audio API context for success sound
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Success melody: C - E - G (major chord arpeggio)
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
      let time = audioContext.currentTime;
      
      frequencies.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.value = freq;
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0, time + index * 0.1);
        gain.gain.linearRampToValueAtTime(0.1, time + index * 0.1 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, time + index * 0.1 + 0.3);
        
        osc.start(time + index * 0.1);
        osc.stop(time + index * 0.1 + 0.3);
      });
    }
  };

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
        logoUrl: ticket.logoUrl || "",
        logoPublicId: ticket.logoPublicId || "",
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

  // Handle logo upload change
  const handleLogoChange = (logoData: { url: string; publicId: string } | null) => {
    setTicketFormData((prev) => ({
      ...prev,
      logoUrl: logoData?.url || "",
      logoPublicId: logoData?.publicId || "",
    }));
  };
  // Handle update ticket
  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    // Show loading toast
    const loadingToast = toast.loading("✨ Updating ticket...", {
      description: "Please wait while we save your changes.",
      style: {
        background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
        border: "1px solid #1e40af",
        color: "white",
      },
    });

    try {
      const ticketData = {
        name: ticketFormData.name,
        description: ticketFormData.description,
        price: parseFloat(ticketFormData.price),
        quantity: parseInt(ticketFormData.quantity, 10),
        maxPerPurchase: parseInt(ticketFormData.maxPerPurchase, 10),
        isVisible: ticketFormData.isVisible,
        allowTransfer: ticketFormData.allowTransfer,
        logoUrl: ticketFormData.logoUrl || null,
        logoPublicId: ticketFormData.logoPublicId || null,
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
      }      // Refresh ticket data
      mutateTicket();

      // Dismiss loading toast
      toast.dismiss(loadingToast);      // Show beautiful success toast with custom styling and confetti effect
      toast.success("🎉 Ticket Updated Successfully!", {
        description: `"${ticketFormData.name}" has been updated with all your changes.`,
        duration: 4000,
        action: {
          label: "View Details",
          onClick: () => {
            router.push(`/organizer/${id}/events/${eventId}/tickets/${ticketId}`);
          },
        },
        style: {
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          border: "1px solid #065f46",
          color: "white",
        },
        className: "toast-success",
      });      // Create confetti effect
      createConfetti();      // Add haptic feedback for mobile devices
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]); // Success vibration pattern
      }

      // Play success sound
      playSuccessSound();

      // Navigate to ticket details page after a short delay
      setTimeout(() => {
        router.push(`/organizer/${id}/events/${eventId}/tickets/${ticketId}`);
      }, 1500);    } catch (err: any) {
      console.error("Error updating ticket:", err);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Show error toast with custom styling
      toast.error("❌ Update Failed", {
        description: err.message || "Failed to update ticket. Please try again.",
        duration: 5000,
        action: {
          label: "Retry",
          onClick: () => {
            handleUpdateTicket(new Event('submit') as any);
          },
        },
        style: {
          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          border: "1px solid #991b1b",
          color: "white",
        },        className: "toast-error",
      });
      
      // Add haptic feedback for mobile devices (error pattern)
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]); // Error vibration pattern
      }
      
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
                  <MagicButton
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </MagicButton>
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
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">              <div className="px-4 lg:px-6">
                <div className="flex items-center gap-2">
                  <MagicButton
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </MagicButton>
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
                  <MagicButton variant="outline" onClick={() => router.refresh()}>
                    Try Again
                  </MagicButton>
                  <MagicButton onClick={() => router.back()}>Back</MagicButton>
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
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">              <div className="px-4 lg:px-6">
                <div className="flex items-center gap-2">
                  <MagicButton
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </MagicButton>
                  <div>
                    <h1 className="text-2xl font-semibold">Edit Ticket</h1>
                    <p className="text-muted-foreground text-sm">
                      {event?.title}
                    </p>
                  </div>
                </div>
              </div><div className="px-4 lg:px-6">
              <MagicCard>
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
                    <div className="grid gap-4 py-4">                      <div className="grid gap-2">
                        <Label htmlFor="name">Ticket Name</Label>
                        <MagicInput
                          id="name"
                          name="name"
                          value={ticketFormData.name}
                          onChange={handleTicketFormChange}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <MagicTextarea
                          id="description"
                          name="description"
                          value={ticketFormData.description}
                          onChange={handleTicketFormChange}
                          rows={3}
                        />                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="price">Price</Label>
                          <MagicInput
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
                          <MagicInput
                            id="quantity"
                            name="quantity"
                            type="number"                            min="1"
                            value={ticketFormData.quantity}
                            onChange={handleTicketFormChange}
                            required
                          />
                          <p className="text-muted-foreground text-xs">
                            Total number of tickets available
                          </p>
                        </div>
                      </div>                      <div className="grid gap-2">
                        <Label htmlFor="maxPerPurchase">Max Per Purchase</Label>
                        <MagicInput
                          id="maxPerPurchase"
                          name="maxPerPurchase"
                          type="number"
                          min="1"
                          value={ticketFormData.maxPerPurchase}
                          onChange={handleTicketFormChange}
                          required
                        />
                        <p className="text-muted-foreground text-xs">
                          Maximum tickets per customer purchase
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
                        </Label>                      </div>
                    </div>                    <div className="flex justify-end gap-2">
                      <MagicButton
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                      >
                        Cancel
                      </MagicButton>
                      <MagicButton type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Updating..." : "Update Ticket"}
                      </MagicButton>
                    </div>
                  </form>
                </CardContent>
              </MagicCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
