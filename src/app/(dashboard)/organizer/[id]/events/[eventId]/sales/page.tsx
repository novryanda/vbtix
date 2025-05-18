"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useOrganizerEventDetail,
  useEventSales,
} from "~/lib/api/hooks/organizer";
import { OrganizerRoute } from "~/components/auth/organizer-route";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ArrowLeft, BarChart, Download, AlertCircle } from "lucide-react";
import { formatCurrency } from "~/lib/utils";

export default function EventSalesPage({
  params,
}: {
  params: Promise<{ id: string; eventId: string }>;
}) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState("all");
  const [groupBy, setGroupBy] = useState("day");

  // Unwrap params with React.use()
  const { id, eventId } = React.use(params);

  // Fetch event details
  const {
    data: eventData,
    isLoading: isEventLoading,
    error: eventError,
  } = useOrganizerEventDetail(id, eventId);
  const event = eventData?.data as any;

  // Prepare date range parameters
  const getDateRangeParams = () => {
    const today = new Date();
    let startDate = undefined;

    switch (dateRange) {
      case "7d":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case "30d":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        break;
      case "90d":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 90);
        break;
      default:
        // "all" - no date filtering
        break;
    }

    return {
      eventId: eventId,
      startDate: startDate?.toISOString(),
      groupBy: groupBy as "day" | "week" | "month",
    };
  };

  // Fetch event sales data
  const {
    data: salesData,
    isLoading: isSalesLoading,
    error: salesError,
  } = useEventSales(id, getDateRangeParams());

  // Extract sales data for display
  const sales = salesData?.data as any;
  const salesItems = sales?.salesData || [];
  const totalRevenue = sales?.totalRevenue || 0;
  const totalTicketsSold = sales?.totalTicketsSold || 0;
  const totalSales = sales?.totalSales || 0;

  // Handle export data
  const handleExportData = () => {
    // Implementation for exporting data will go here
    alert("Export functionality will be implemented soon");
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
                  <h1 className="text-2xl font-semibold">Sales Reports</h1>
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
                  <h1 className="text-2xl font-semibold">Sales Reports</h1>
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
                  <Button onClick={() => router.push("/organizer/events")}>
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

  // Main content
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
                    <h1 className="text-2xl font-semibold">Sales Reports</h1>
                    <p className="text-muted-foreground text-sm">
                      {event?.title}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All time</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={groupBy} onValueChange={setGroupBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Group by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Daily</SelectItem>
                      <SelectItem value="week">Weekly</SelectItem>
                      <SelectItem value="month">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </div>

            <div className="px-4 lg:px-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Revenue</CardDescription>
                    <CardTitle className="text-2xl">
                      {formatCurrency(totalRevenue)}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Tickets Sold</CardDescription>
                    <CardTitle className="text-2xl">
                      {totalTicketsSold}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Orders</CardDescription>
                    <CardTitle className="text-2xl">{totalSales}</CardTitle>
                  </CardHeader>
                </Card>
              </div>
            </div>

            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales History</CardTitle>
                  <CardDescription>
                    Sales data for {event.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSalesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                    </div>
                  ) : salesError ? (
                    <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
                      Error loading sales data: {salesError.message}
                    </div>
                  ) : !sales || !salesItems.length ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                      <BarChart className="text-muted-foreground mb-2 h-8 w-8" />
                      <h3 className="mb-2 text-lg font-semibold">
                        No sales data yet
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        There are no sales recorded for this event yet.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Orders</TableHead>
                            <TableHead>Tickets Sold</TableHead>
                            <TableHead className="text-right">
                              Revenue
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {salesItems.map((item: any) => (
                            <TableRow key={item.date}>
                              <TableCell>{item.date}</TableCell>
                              <TableCell>{item.count}</TableCell>
                              <TableCell>{item.ticketsSold}</TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(item.revenue)}
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
