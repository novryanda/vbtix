"use client"

import { TrendingDownIcon, TrendingUpIcon, Users, Calendar, ClipboardCheck, UserCircle, LogOut } from "lucide-react"
import { useSession, signOut } from "next-auth/react"

import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
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
    const { data: session } = useSession();

    // Tampilkan pesan error jika terjadi kesalahan
    if (error) {
        console.error("Error loading dashboard data:", error);
    }

    // Ekstrak data dengan fallback ke nilai default
    const totalUsers = data?.totalUsers ?? 0;
    const totalEvents = data?.totalEvents ?? 0;
    const totalSales = data?.totalSales ?? 0;

    // Untuk pendingApprovals, kita bisa menggunakan nilai dummy sementara
    // karena sepertinya tidak ada di respons API
    const pendingApprovals = 0;

    // Informasi user yang sedang login
    const userName = session?.user?.name || "Guest";
    const userRole = session?.user?.role || "Unknown";

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
                    <CardDescription>Total Sales</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                        {isLoading ? "Loading..." : `Rp ${totalSales.toLocaleString()}`}
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
                        Revenue <TrendingUpIcon className="size-4" />
                    </div>
                    <div className="text-muted-foreground">Total sales from all events</div>
                </CardFooter>
            </Card>
            <Card className="@container/card">
                <CardHeader className="relative">
                    <CardDescription>Logged In As</CardDescription>
                    <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold">
                        {isLoading ? "Loading..." : userName}
                    </CardTitle>
                    <div className="absolute right-4 top-4">
                        <UserCircle className="size-5 text-primary" />
                    </div>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Role: <Badge variant="outline">{userRole}</Badge>
                    </div>
                    <div className="text-muted-foreground">Welcome to admin dashboard</div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => signOut({ callbackUrl: "/login" })}
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
