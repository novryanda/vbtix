"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useOrganizerEventDetail } from "~/lib/api/hooks/organizer";
import { OrganizerRoute } from "~/components/auth/organizer-route";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { ArrowLeft, CalendarDays, Clock, MapPin, Save } from "lucide-react";
import { ORGANIZER_ENDPOINTS } from "~/lib/api/endpoints";
import { EventStatus } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const organizerId = params.id as string;
  const eventId = params.eventId as string;

  const { data, isLoading, error, mutate } = useOrganizerEventDetail(
    organizerId,
    eventId,
  );
  const event = data?.data;

  // Initialize form data with default values
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    venue: "",
    city: "",
    province: "",
    category: "",
    status: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Populate form with event data when it's loaded
  useEffect(() => {
    if (event) {
      try {
        // Format dates safely
        let startDateStr = "";
        let startTimeStr = "";
        let endDateStr = "";
        let endTimeStr = "";

        if (event.startDate) {
          const date = new Date(event.startDate);
          const isoString = date.toISOString();
          startDateStr = isoString.substring(0, 10); // YYYY-MM-DD

          const hours = date.getHours().toString().padStart(2, "0");
          const minutes = date.getMinutes().toString().padStart(2, "0");
          startTimeStr = `${hours}:${minutes}`;
        } else {
          const now = new Date();
          startDateStr = now.toISOString().substring(0, 10);
          startTimeStr = "00:00";
        }

        if (event.endDate) {
          const date = new Date(event.endDate);
          const isoString = date.toISOString();
          endDateStr = isoString.substring(0, 10); // YYYY-MM-DD

          const hours = date.getHours().toString().padStart(2, "0");
          const minutes = date.getMinutes().toString().padStart(2, "0");
          endTimeStr = `${hours}:${minutes}`;
        } else {
          const now = new Date();
          endDateStr = now.toISOString().substring(0, 10);
          endTimeStr = "23:59";
        }

        // Update form data
        setFormData({
          title: event.title || "",
          description: event.description || "",
          startDate: startDateStr,
          startTime: startTimeStr,
          endDate: endDateStr,
          endTime: endTimeStr,
          venue: event.venue || "",
          city: event.city || "",
          province: event.province || "",
          category: event.category || "",
          status: event.status || EventStatus.DRAFT,
        });
      } catch (error) {
        console.error("Error formatting event dates:", error);
        // Set default values if there's an error
        const now = new Date();
        const defaultDate = now.toISOString().substring(0, 10);

        setFormData({
          title: event.title || "",
          description: event.description || "",
          startDate: defaultDate,
          startTime: "00:00",
          endDate: defaultDate,
          endTime: "23:59",
          venue: event.venue || "",
          city: event.city || "",
          province: event.province || "",
          category: event.category || "",
          status: event.status || EventStatus.DRAFT,
        });
      }
    }
  }, [event]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      // Combine date and time
      const startDateTime = new Date(
        `${formData.startDate}T${formData.startTime}`,
      );
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      // Validate dates
      if (endDateTime <= startDateTime) {
        throw new Error("End date must be after start date");
      }

      const data = {
        title: formData.title,
        description: formData.description,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        venue: formData.venue,
        city: formData.city,
        province: formData.province,
        category: formData.category,
        status: formData.status,
      };

      // Send request to update event
      const response = await fetch(
        ORGANIZER_ENDPOINTS.EVENT_DETAIL(organizerId, eventId),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update event");
      }

      // Refresh event data
      mutate();

      // Redirect to the event detail page
      router.push(`/organizer/${organizerId}/events/${eventId}`);
    } catch (err: any) {
      console.error("Error updating event:", err);
      setFormError(err.message || "Failed to update event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <OrganizerRoute>
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
                    <h1 className="text-2xl font-semibold">Edit Event</h1>
                  </div>
                </div>
                <div className="flex items-center justify-center p-8">
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </OrganizerRoute>
    );
  }

  // Error state
  if (error || !event) {
    return (
      <OrganizerRoute>
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
                    <h1 className="text-2xl font-semibold">Edit Event</h1>
                  </div>
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
                    <Button variant="outline" onClick={() => router.refresh()}>
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
            </div>
          </div>
        </div>
      </OrganizerRoute>
    );
  }

  // Main form
  return (
    <OrganizerRoute>
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
                  <h1 className="text-2xl font-semibold">Edit Event</h1>
                </div>
              </div>

              <div className="px-4 lg:px-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Details</CardTitle>
                    <CardDescription>
                      Update your event information
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSubmit}>
                    {formError && (
                      <div className="mx-6 mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500">
                        {formError}
                      </div>
                    )}
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Event Title</Label>
                        <Input
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={5}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Start Date</Label>
                          <div className="flex items-center gap-2">
                            <CalendarDays className="text-muted-foreground h-4 w-4" />
                            <Input
                              id="startDate"
                              name="startDate"
                              type="date"
                              value={formData.startDate}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="startTime">Start Time</Label>
                          <div className="flex items-center gap-2">
                            <Clock className="text-muted-foreground h-4 w-4" />
                            <Input
                              id="startTime"
                              name="startTime"
                              type="time"
                              value={formData.startTime}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">End Date</Label>
                          <div className="flex items-center gap-2">
                            <CalendarDays className="text-muted-foreground h-4 w-4" />
                            <Input
                              id="endDate"
                              name="endDate"
                              type="date"
                              value={formData.endDate}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endTime">End Time</Label>
                          <div className="flex items-center gap-2">
                            <Clock className="text-muted-foreground h-4 w-4" />
                            <Input
                              id="endTime"
                              name="endTime"
                              type="time"
                              value={formData.endTime}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="venue">Venue</Label>
                          <div className="flex items-center gap-2">
                            <MapPin className="text-muted-foreground h-4 w-4" />
                            <Input
                              id="venue"
                              name="venue"
                              value={formData.venue}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="province">Province</Label>
                          <Input
                            id="province"
                            name="province"
                            value={formData.province}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={handleStatusChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={EventStatus.DRAFT}>
                                Draft
                              </SelectItem>
                              <SelectItem value={EventStatus.PUBLISHED}>
                                Published
                              </SelectItem>
                              <SelectItem value={EventStatus.CANCELLED}>
                                Cancelled
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        <Save className="mr-2 h-4 w-4" />
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OrganizerRoute>
  );
}
