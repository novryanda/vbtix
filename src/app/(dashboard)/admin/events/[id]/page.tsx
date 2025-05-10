"use client";

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Badge } from "~/components/ui/badge"
import { Separator } from "~/components/ui/separator"
import { Textarea } from "~/components/ui/textarea"
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock,
  MapPin,
  Pencil,
  Tag,
  Ticket,
  User,
  X
} from "lucide-react"
import Link from "next/link"
import { useAdminEventDetail, useAdminEventStatistics, useReviewEvent } from "~/lib/api/hooks"
import { EventDetailSkeleton, EventDetailErrorState } from "~/components/dashboard/admin/event-detail-loading"
import { formatDate, formatDateTime } from "~/lib/utils"
import { useState } from "react"
import { AdminRoute } from "~/components/auth/admin-route"

export default function AdminEventDetailPage({ params }: { params: { id: string } }) {
  const { data: event, isLoading: isEventLoading, error: eventError } = useAdminEventDetail(params.id);
  const { data: statistics, isLoading: isStatsLoading } = useAdminEventStatistics(params.id);
  const reviewEventMutation = useReviewEvent();
  const [feedback, setFeedback] = useState("");

  const handleApproveEvent = async () => {
    try {
      await reviewEventMutation.mutateAsync({
        id: params.id,
        status: "approved",
        feedback,
      });
    } catch (error) {
      console.error("Error approving event:", error);
    }
  };

  const handleRejectEvent = async () => {
    try {
      await reviewEventMutation.mutateAsync({
        id: params.id,
        status: "rejected",
        feedback,
      });
    } catch (error) {
      console.error("Error rejecting event:", error);
    }
  };

  if (isEventLoading) {
    return (
      <AdminRoute>
        <EventDetailSkeleton />
      </AdminRoute>
    );
  }

  if (eventError || !event) {
    return (
      <AdminRoute>
        <EventDetailErrorState message="Failed to load event details. Please try again later." />
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/events">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Event Details</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-5 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-2xl">{event.title}</CardTitle>
                <CardDescription className="mt-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{event.venue}</span>
                  </div>
                </CardDescription>
              </div>
              <StatusBadge status={event.status.toLowerCase() as any} />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Organizer</div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{event.organizer}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Date</div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span>{event.date}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Time</div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>19:00 - 22:00</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Category</div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span>Music</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {event.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Ticket Types</h3>
                <div className="space-y-4">
                  {ticketTypes.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <div className="font-medium">{ticket.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {ticket.remaining} of {ticket.quota} remaining
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">Rp {ticket.price.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          <Ticket className="inline h-3 w-3 mr-1" />
                          {ticket.sold} sold
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Event Details</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Created At</div>
                      <div>{formatDateTime(new Date(event.createdAt))}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
                      <div>{formatDateTime(new Date(event.updatedAt))}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Event ID</div>
                      <div>{event.id}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">Organizer ID</div>
                      <div>{event.organizerId}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="orders" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 text-muted-foreground">
                    <p>Order information will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6 text-muted-foreground">
                    <p>Analytics information will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" asChild>
                <Link href={`/admin/events/${event.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Event
                </Link>
              </Button>

              {event.status === "PENDING" && (
                <>
                  <Textarea
                    placeholder="Feedback for organizer (optional)"
                    className="mb-4"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                  <Button
                    variant="success"
                    className="w-full"
                    onClick={handleApproveEvent}
                    disabled={reviewEventMutation.isPending}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {reviewEventMutation.isPending ? "Processing..." : "Approve Event"}
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleRejectEvent}
                    disabled={reviewEventMutation.isPending}
                  >
                    <X className="mr-2 h-4 w-4" />
                    {reviewEventMutation.isPending ? "Processing..." : "Reject Event"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {event.status === "pending" && (
            <Card>
              <CardHeader>
                <CardTitle>Review Notes</CardTitle>
                <CardDescription>
                  Add notes when approving or rejecting this event
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea placeholder="Enter your review notes here..." className="min-h-[120px]" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button>Save Notes</Button>
              </CardFooter>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Event Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Tickets</span>
                <span className="font-medium">{isStatsLoading ? "Loading..." : statistics?.totalTickets || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tickets Sold</span>
                <span className="font-medium">{isStatsLoading ? "Loading..." : statistics?.soldTickets || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-medium">
                  {isStatsLoading ? "Loading..." : `Rp ${(statistics?.revenue || 0).toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Page Views</span>
                <span className="font-medium">{isStatsLoading ? "Loading..." : statistics?.viewCount || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

interface StatusBadgeProps {
  status: "draft" | "pending" | "published" | "rejected"
}

function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    draft: { label: "Draft", variant: "outline" as const },
    pending: { label: "Pending Review", variant: "warning" as const },
    published: { label: "Published", variant: "success" as const },
    rejected: { label: "Rejected", variant: "destructive" as const },
  }

  const config = statusConfig[status]

  return (
    <Badge variant={config.variant}>{config.label}</Badge>
    </AdminRoute>
  )
}