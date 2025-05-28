"use client";

import {
  TrendingUpIcon,
  Calendar,
  Ticket,
  DollarSign,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";

import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useOrganizerDashboard } from "~/lib/api/hooks/organizer";
import { formatPrice } from "~/lib/utils";

export function SectionCards() {
  const params = useParams();
  const organizerId = params.id as string;
  const { data, isLoading, error } = useOrganizerDashboard(organizerId);

  // Show error message if there's an error
  if (error) {
    console.error("Error loading dashboard data:", error);
  }

  // Default values if data is loading or there's an error - using nullish coalescing
  const totalEvents = data?.data?.stats?.totalEvents ?? 0;
  const totalTicketsSold = data?.data?.stats?.totalTicketsSold ?? 0;
  const totalRevenue = data?.data?.stats?.totalRevenue ?? 0;
  const upcomingEventsCount = data?.data?.stats?.upcomingEventsCount ?? 0;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Total Events</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? "Loading..." : totalEvents.toLocaleString()}
          </CardTitle>
          <div className="absolute top-4 right-4">
            <Calendar className="text-primary size-5" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Badge variant="outline" className="rounded-sm px-1 py-0">
              <TrendingUpIcon className="mr-1 size-3" />
              <span>Active</span>
            </Badge>
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Tickets Sold</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? "Loading..." : totalTicketsSold.toLocaleString()}
          </CardTitle>
          <div className="absolute top-4 right-4">
            <Ticket className="text-primary size-5" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Badge variant="outline" className="rounded-sm px-1 py-0">
              <TrendingUpIcon className="mr-1 size-3" />
              <span>Active</span>
            </Badge>
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? "Loading..." : formatPrice(totalRevenue)}
          </CardTitle>
          <div className="absolute top-4 right-4">
            <DollarSign className="text-primary size-5" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Badge variant="outline" className="rounded-sm px-1 py-0">
              <TrendingUpIcon className="mr-1 size-3" />
              <span>Increasing</span>
            </Badge>
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Upcoming Events</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? "Loading..." : upcomingEventsCount.toLocaleString()}
          </CardTitle>
          <div className="absolute top-4 right-4">
            <Users className="text-primary size-5" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Badge variant="outline" className="rounded-sm px-1 py-0">
              <TrendingUpIcon className="mr-1 size-3" />
              <span>Scheduled</span>
            </Badge>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
