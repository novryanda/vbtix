"use client";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { useAdminEventDetail } from "~/lib/api/hooks/admin";
import { EventDetailErrorState } from "~/components/dashboard/admin/event-detail-loading";
import { AdminRoute } from "~/components/auth/admin-route";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

// Define event status options
const EVENT_STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING_REVIEW", label: "Pending Review" },
  { value: "PUBLISHED", label: "Published" },
  { value: "REJECTED", label: "Rejected" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

// Define category options (example)
const CATEGORY_OPTIONS = [
  { value: "MUSIC", label: "Music" },
  { value: "SPORTS", label: "Sports" },
  { value: "ARTS", label: "Arts & Theater" },
  { value: "CONFERENCE", label: "Conference" },
  { value: "WORKSHOP", label: "Workshop" },
  { value: "OTHER", label: "Other" },
];

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  // Fetch event detail from API
  const {
    event,
    isLoading: isEventLoading,
    error: eventError,
  } = useAdminEventDetail(id);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    venue: "",
    address: "",
    city: "",
    province: "",
    country: "",
    category: "",
    description: "",
    status: "",
    startDate: new Date(),
    endDate: new Date(),
    organizerName: "",
    organizerId: "",
  });

  // Statistics state
  const [statistics, setStatistics] = useState({
    totalCapacity: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    totalTransactions: 0,
  });

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form data when event is loaded
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        venue: event.venue || "",
        address: event.address || "",
        city: event.city || "",
        province: event.province || "",
        country: event.country || "",
        category: event.category || "",
        description: event.description || "",
        status: event.status || "DRAFT",
        startDate: event.startDate ? new Date(event.startDate) : new Date(),
        endDate: event.endDate ? new Date(event.endDate) : new Date(),
        organizerName:
          event.organizer?.orgName || event.organizer?.user?.name || "",
        organizerId: event.organizerId || "",
      });

      if (event.statistics) {
        setStatistics({
          totalCapacity: event.statistics.totalCapacity || 0,
          totalTicketsSold: event.statistics.totalTicketsSold || 0,
          totalRevenue: event.statistics.totalRevenue || 0,
          totalTransactions: event.statistics.totalTransactions || 0,
        });
      }
    }
  }, [event]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle statistics input changes
  const handleStatisticsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Only allow numeric values
    const numericValue = value === "" ? 0 : parseInt(value, 10);

    if (!isNaN(numericValue)) {
      setStatistics((prev) => ({ ...prev, [name]: numericValue }));
    }
  };

  // Handle revenue input with Rupiah format
  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, "");

    if (numericValue === "" || !isNaN(parseInt(numericValue, 10))) {
      setStatistics((prev) => ({
        ...prev,
        totalRevenue: numericValue === "" ? 0 : parseInt(numericValue, 10),
      }));
    }
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle date changes
  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, [name]: date }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare data for API - only include fields defined in the updateEventSchema
      const updateData = {
        title: formData.title,
        venue: formData.venue,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        country: formData.country,
        category: formData.category,
        description: formData.description,
        status: formData.status,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
      };

      // Note: Statistics are displayed in the UI but not included in the update
      // as they're not part of the updateEventSchema

      // Call API to update event
      const response = await fetch(`/api/admin/events/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update event");
      }

      // Show success toast notification
      toast.success("Event updated successfully", {
        description: "The event has been updated.",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      });

      // Redirect to event detail page
      router.push(`/admin/events/${id}`);
    } catch (error: any) {
      console.error("Error updating event:", error);

      // Show error toast notification
      toast.error("Error updating event", {
        description:
          error?.message || "Failed to update event. Please try again.",
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isEventLoading) {
    return (
      <AdminRoute>
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-semibold">Edit Event</h1>
            </div>
            <div className="flex items-center justify-center p-8">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
            </div>
          </div>
        </div>
      </AdminRoute>
    );
  }

  // Error state
  if (eventError || !event) {
    return (
      <AdminRoute>
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-semibold">Edit Event</h1>
            </div>
            <EventDetailErrorState message="Failed to load event details. Please try again later." />
          </div>
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold">Edit Event</h1>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>Update your event information</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Event Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter event title"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter event description"
                        rows={5}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) =>
                            handleSelectChange("category", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORY_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) =>
                            handleSelectChange("status", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {EVENT_STATUS_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Location and Date Information */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="venue">Venue</Label>
                      <Input
                        id="venue"
                        name="venue"
                        value={formData.venue}
                        onChange={handleInputChange}
                        placeholder="Enter venue name"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Enter address"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Enter city"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="province">Province</Label>
                        <Input
                          id="province"
                          name="province"
                          value={formData.province}
                          onChange={handleInputChange}
                          placeholder="Enter province"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="Enter country"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.startDate ? (
                                format(formData.startDate, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.startDate}
                              onSelect={(date) =>
                                handleDateChange("startDate", date)
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.endDate ? (
                                format(formData.endDate, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.endDate}
                              onSelect={(date) =>
                                handleDateChange("endDate", date)
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organizer Information (Read-only) */}
                <div className="border-t pt-6">
                  <h3 className="mb-4 text-lg font-medium">
                    Organizer Information (Read-only)
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="organizerName">Organizer Name</Label>
                      <Input
                        id="organizerName"
                        value={formData.organizerName}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organizerId">Organizer ID</Label>
                      <Input
                        id="organizerId"
                        value={formData.organizerId}
                        readOnly
                        disabled
                      />
                    </div>
                  </div>
                </div>

                {/* Event Statistics (Read-only) */}
                <div className="border-t pt-6">
                  <h3 className="mb-4 text-lg font-medium">
                    Event Statistics (Read-only)
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="totalCapacity">Total Capacity</Label>
                      <Input
                        id="totalCapacity"
                        name="totalCapacity"
                        type="number"
                        value={statistics.totalCapacity}
                        onChange={handleStatisticsChange}
                        min="0"
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalTicketsSold">Tickets Sold</Label>
                      <Input
                        id="totalTicketsSold"
                        name="totalTicketsSold"
                        type="number"
                        value={statistics.totalTicketsSold}
                        onChange={handleStatisticsChange}
                        min="0"
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalRevenue">Revenue</Label>
                      <div className="relative">
                        <span className="absolute top-1/2 left-3 -translate-y-1/2">
                          Rp
                        </span>
                        <Input
                          id="totalRevenue"
                          name="totalRevenue"
                          className="pl-10"
                          value={statistics.totalRevenue.toLocaleString()}
                          onChange={handleRevenueChange}
                          readOnly
                          disabled
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="totalTransactions">Transactions</Label>
                      <Input
                        id="totalTransactions"
                        name="totalTransactions"
                        type="number"
                        value={statistics.totalTransactions}
                        onChange={handleStatisticsChange}
                        min="0"
                        readOnly
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t p-6">
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </AdminRoute>
  );
}
