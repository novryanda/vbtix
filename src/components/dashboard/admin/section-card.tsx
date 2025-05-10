import { TrendingDownIcon, TrendingUpIcon, Users, Calendar, ClipboardCheck } from "lucide-react"

import { Badge } from "~/components/ui/badge"
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card"
import { useAdminDashboard } from "~/lib/api/hooks"

export function SectionCards() {
    const { data, isLoading, error } = useAdminDashboard();

    // Default values if data is not loaded yet
    const totalUsers = data?.totalUsers ?? 0;
    const totalEvents = data?.totalEvents ?? 0;
    const totalOrders = data?.totalOrders ?? 0;
    const pendingApprovals = data?.pendingApprovals ?? 0;

    return (
        <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Total Users</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {isLoading ? "Loading..." : totalUsers.toLocaleString()}
                    </CardTitle>
                    <div className="absolute right-4 top-4">
                        <Users className="size-5 text-primary" />
                    </div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Registered users
                    </div>
                    <div className="text-muted-foreground">
                        Total users on the platform
                    </div>
                </CardFooter>
            </Card>
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
                        Published events
                    </div>
                    <div className="text-muted-foreground">
                        Events available on the platform
                    </div>
                </CardFooter>
            </Card>
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Total Orders</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {isLoading ? "Loading..." : totalOrders.toLocaleString()}
                    </CardTitle>
                    <div className="absolute right-4 top-4">
                        <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                            <TrendingUpIcon className="size-3" />
                            +12.5%
                        </Badge>
                    </div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Ticket orders <TrendingUpIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Total orders processed</div>
                </CardFooter>
            </Card>
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Pending Approvals</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {isLoading ? "Loading..." : pendingApprovals.toLocaleString()}
                    </CardTitle>
                    <div className="absolute right-4 top-4">
                        <ClipboardCheck className="size-5 text-primary" />
                    </div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Awaiting review
                    </div>
                    <div className="text-muted-foreground">Events pending approval</div>
                </CardFooter>
            </Card>
        </div>
    )
}
