"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganizerEventDetail } from "~/lib/api/hooks/organizer";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  ArrowLeft,
  Download,
  Search,
  User,
  AlertCircle,
} from "lucide-react";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { formatDate } from "~/lib/utils";

// Mock data for attendees - replace with actual API call later
interface Attendee {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  purchaseDate: string;
  checkedIn: boolean;
  checkInTime?: string;
}

export default function EventAttendeesPage({
  params,
}: {
  params: Promise<{ id: string; eventId: string }>;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Unwrap params with React.use()
  const { id, eventId } = React.use(params);

  // Fetch event details
  const {
    data: eventData,
    isLoading: isEventLoading,
    error: eventError,
  } = useOrganizerEventDetail(id, eventId);
  const event = eventData?.data;

  // Mock attendees data - replace with actual API call
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isAttendeesLoading, setIsAttendeesLoading] = useState(false);

  // Filter attendees based on search query
  const filteredAttendees = attendees.filter(
    (attendee) =>
      attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.ticketType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle export attendees
  const handleExportAttendees = () => {
    // Implement export functionality
    console.log("Export attendees");
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
                  <h1 className="text-2xl font-semibold">Event Attendees</h1>
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
                  <h1 className="text-2xl font-semibold">Event Attendees</h1>
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
                  <Button onClick={() => router.push(`/organizer/${id}/events`)}>
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
                    <h1 className="text-2xl font-semibold">Event Attendees</h1>
                    <p className="text-muted-foreground text-sm">
                      {event?.title}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleExportAttendees}
                  disabled={attendees.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Attendees
                </Button>
              </div>
            </div>

            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Attendees</CardTitle>
                  <CardDescription>
                    View and manage attendees for {event?.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="search"
                        placeholder="Search attendees by name, email, or ticket type..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {isAttendeesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                    </div>
                  ) : attendees.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                      <User className="text-muted-foreground mb-2 h-8 w-8" />
                      <h3 className="mb-2 text-lg font-semibold">
                        No attendees yet
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        There are no attendees for this event yet. Attendees will appear here when tickets are purchased.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Ticket Type</TableHead>
                            <TableHead>Purchase Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAttendees.map((attendee) => (
                            <TableRow key={attendee.id}>
                              <TableCell className="font-medium">
                                {attendee.name}
                              </TableCell>
                              <TableCell>{attendee.email}</TableCell>
                              <TableCell>{attendee.ticketType}</TableCell>
                              <TableCell>
                                {formatDate(attendee.purchaseDate)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    attendee.checkedIn ? "success" : "outline"
                                  }
                                >
                                  {attendee.checkedIn ? "Checked In" : "Not Checked In"}
                                </Badge>
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
    </div>
  );
}
