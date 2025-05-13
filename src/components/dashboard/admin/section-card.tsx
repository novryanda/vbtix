"use client";

import Link from "next/link";
import { TrendingUpIcon, Users, Calendar } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useAdminDashboard } from "~/lib/api/hooks";

export function SectionCards() {
  const { data, isLoading, error } = useAdminDashboard();

  // Display error message if there's an error
  if (error) {
    console.error("Error loading dashboard data:", error);
  }

  // Mock data for development
  const mockData = {
    totalUsers: 20,
    totalEvents: 10,
    totalSales: 0,
  };

  // Use mock data if there's an error or no data
  const dashboardData = error || !data ? mockData : data;

  // Extract data with fallback to mock values
  const totalUsers = dashboardData.totalUsers;
  const totalEvents = dashboardData.totalEvents;
  const totalSales = dashboardData.totalSales;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Link href="/admin/organizers" className="block">
        <Card className="@container/card cursor-pointer transition-all hover:shadow-md">
          <CardHeader className="relative">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {isLoading ? "Loading..." : totalUsers.toLocaleString()}
            </CardTitle>
            <div className="absolute top-4 right-4">
              <Users className="text-primary size-5" />
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
      </Link>
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
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? "Loading..." : `Rp ${totalSales.toLocaleString()}`}
          </CardTitle>
          <div className="absolute top-4 right-4">
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
          <div className="text-muted-foreground">
            Total sales from all events
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
