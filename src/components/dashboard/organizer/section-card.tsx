"use client"

import { TrendingUpIcon, Calendar, Ticket, DollarSign, Users } from "lucide-react"
import { useSession } from "next-auth/react"

import { Badge } from "~/components/ui/badge"
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card"
import { useOrganizerDashboard } from "~/lib/api/hooks/organizer"

export function SectionCards() {
    const { data, isLoading, error } = useOrganizerDashboard();
    const { data: session } = useSession();

    // Show error message if there's an error
    if (error) {
        console.error("Error loading dashboard data:", error);
    }

    // Default values if data is loading or there's an error
    const totalEvents = data?.data?.stats?.totalEvents || 0;
    const totalTicketsSold = data?.data?.stats?.totalTicketsSold || 0;
    const totalRevenue = data?.data?.stats?.totalRevenue || 0;
    const upcomingEventsCount = data?.data?.stats?.upcomingEventsCount || 0;

    return (
        <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Total Events</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {isLoading ? "Loading..." : totalEvents.toLocaleString()}
                    </CardTitle>
                    <div className="absolute right-4 top-4">
                        <Calendar className="size-5 text-primary" />
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
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {isLoading ? "Loading..." : totalTicketsSold.toLocaleString()}
                    </CardTitle>
                    <div className="absolute right-4 top-4">
                        <Ticket className="size-5 text-primary" />
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
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {isLoading ? "Loading..." : `Rp ${totalRevenue.toLocaleString()}`}
                    </CardTitle>
                    <div className="absolute right-4 top-4">
                        <DollarSign className="size-5 text-primary" />
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
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {isLoading ? "Loading..." : upcomingEventsCount.toLocaleString()}
                    </CardTitle>
                    <div className="absolute right-4 top-4">
                        <Users className="size-5 text-primary" />
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
    )
}
