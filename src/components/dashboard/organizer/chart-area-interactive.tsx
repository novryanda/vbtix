"use client";

import * as React from "react";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "~/lib/hooks/use-mobile";
import { MagicCard } from "~/components/ui/magic-card";
import { useOrganizerSalesAnalytics } from "~/lib/api/hooks/organizer";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { ChartConfig } from "~/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";



export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = useState("30d");
  const [chartType, setChartType] = useState("tickets");
  const isMobile = useIsMobile();
  const params = useParams();
  const organizerId = params.id as string;

  // Fetch real sales analytics data
  const { salesData, isLoading, error } = useOrganizerSalesAnalytics(organizerId, timeRange);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);
  // Use only real data
  const filteredData = React.useMemo(() => {
    if (error || !salesData || salesData.length === 0) {
      // Return empty array if no real data is available
      return [];
    }

    // Transform real data to match chart format
    return salesData.map(item => ({
      date: item.date,
      tickets: item.tickets,
      revenue: item.revenue,
    }));
  }, [salesData, error]);
  // Configure chart based on selected type
  const chartConfig: ChartConfig = {
    tickets: {
      color: "blue",
      label: "Tickets",
    },
    revenue: {
      color: "blue",
      label: "Revenue",
    },
  };
  return (
    <MagicCard 
      className="border-0 bg-background/50 backdrop-blur-sm shadow-xl"
      gradientColor="rgba(34, 197, 94, 0.1)"
    >
      <CardHeader className="relative pb-6">
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            {isLoading ? (
              <div className="h-8 w-48 bg-muted animate-pulse rounded-lg"></div>
            ) : (
              "Ringkasan Penjualan"
            )}
          </CardTitle>
          <CardDescription className="text-base">
            {isLoading ? (
              <div className="h-5 w-64 bg-muted animate-pulse rounded-lg"></div>
            ) : (              <>
                <span className="hidden @[540px]/card:block">
                  {error || !salesData || salesData.length === 0 ? "Data tidak tersedia" :
                   `Penjualan untuk ${timeRange === "7d" ? "7 hari" : timeRange === "30d" ? "30 hari" : "3 bulan"} terakhir`}
                </span>
                <span className="@[540px]/card:hidden">
                  {timeRange === "7d" ? "7h" : timeRange === "30d" ? "30h" : "3bl"}
                </span>
              </>
            )}
          </CardDescription>
        </div>
        <div className="absolute top-4 right-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d" className="h-8 px-2.5">
              Last 3 months
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" className="h-8 px-2.5">
              Last 30 days
            </ToggleGroupItem>
            <ToggleGroupItem value="7d" className="h-8 px-2.5">
              Last 7 days
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="h-8 w-[120px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-4">
            <ToggleGroup
              type="single"
              size="sm"
              value={chartType}
              onValueChange={setChartType}
              variant="outline"
            >
              <ToggleGroupItem value="tickets">Tickets</ToggleGroupItem>
              <ToggleGroupItem value="revenue">Revenue</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>        <div className="h-[240px]">
          {filteredData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <p className="text-lg font-medium">Tidak ada data tersedia</p>
                <p className="text-sm">Data penjualan akan muncul setelah ada transaksi</p>
              </div>
            </div>
          ) : (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-full w-full"
            >
              <AreaChart data={filteredData}>
                <defs>
                  <linearGradient id="fillTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-tickets)"
                      stopOpacity={1.0}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-tickets)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-revenue)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-revenue)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("id-ID", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      });
                    }}
                    indicator="dot"
                  />
                }
              />
                {chartType === "tickets" ? (
                  <Area
                    dataKey="tickets"
                    type="natural"
                    fill="url(#fillTickets)"
                    stroke="var(--color-tickets)"
                  />
                ) : (
                  <Area
                    dataKey="revenue"
                    type="natural"
                    fill="url(#fillRevenue)"
                    stroke="var(--color-revenue)"                />
                )}
              </AreaChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </MagicCard>
  );
}
