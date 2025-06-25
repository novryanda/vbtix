"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { useIsMobile } from "~/lib/hooks/use-mobile";
import { MagicCard } from "~/components/ui/magic-card";
import { useAdminVisitorAnalytics } from "~/lib/api/hooks/admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
    color: "hsl(210, 100%, 50%)", // Blue color
  },
  mobile: {
    label: "Mobile",
    color: "hsl(220, 100%, 60%)", // Lighter blue color
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("30d");

  // Fetch real visitor analytics data
  const { visitorData, isLoading, error } = useAdminVisitorAnalytics(timeRange);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);
  // Use real data if available, otherwise show loading or empty state
  const filteredData = React.useMemo(() => {
    if (isLoading) {
      return []; // Show loading state
    }
    
    if (error || !visitorData || visitorData.length === 0) {
      console.warn("No visitor data available:", error);
      return []; // Return empty array instead of mock data
    }

    // Use real data from API
    return visitorData;
  }, [visitorData, error, isLoading, timeRange]);
  return (
    <MagicCard 
      className="border-0 bg-background/50 backdrop-blur-sm shadow-xl"
      gradientColor="rgba(148, 163, 184, 0.1)"
    >
      <CardHeader className="relative pb-6">
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent">
            {isLoading ? (
              <div className="h-8 w-48 bg-muted animate-pulse rounded-lg"></div>
            ) : (
              "Statistik Pengunjung"
            )}
          </CardTitle>          <CardDescription className="text-base">
            {isLoading ? (
              <div className="h-5 w-64 bg-muted animate-pulse rounded-lg"></div>
            ) : (
              <>
                <span className="hidden @[540px]/card:block">
                  {error || !visitorData || visitorData.length === 0 ? 
                    "Data pengunjung tidak tersedia" :
                    `Aktivitas pengunjung untuk ${timeRange === "7d" ? "7 hari" : timeRange === "30d" ? "30 hari" : "3 bulan"} terakhir`}
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
            <ToggleGroupItem value="90d" className="h-8 px-3 rounded-lg bg-background/50 hover:bg-accent/50">
              3 Bulan
            </ToggleGroupItem>
            <ToggleGroupItem value="30d" className="h-8 px-3 rounded-lg bg-background/50 hover:bg-accent/50">
              30 Hari
            </ToggleGroupItem>
            <ToggleGroupItem value="7d" className="h-8 px-3 rounded-lg bg-background/50 hover:bg-accent/50">
              7 Hari
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 @[767px]/card:hidden rounded-xl border-border/50 bg-background/50"
              aria-label="Select a value"
            >
              <SelectValue placeholder="3 bulan terakhir" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50 bg-background/90 backdrop-blur-sm">
              <SelectItem value="90d" className="rounded-lg">
                3 bulan terakhir
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                30 hari terakhir
              </SelectItem>              <SelectItem value="7d" className="rounded-lg">
                7 hari terakhir
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">Tidak ada data tersedia</p>
              <p className="text-sm">Data pengunjung akan muncul setelah ada aktivitas</p>
            </div>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-desktop)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-desktop)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-mobile)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-mobile)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={true}
                tickMargin={8}
                minTickGap={32}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={40}
                stroke="hsl(var(--muted-foreground))"
                domain={[0, 'dataMax + 5']}
                allowDecimals={false}
                tickCount={6}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(1)}k`;
                  }
                  return value.toString();
                }}
              />
              <ChartTooltip
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
              <Area
                dataKey="mobile"
                type="monotone"
                fill="url(#fillMobile)"
                stroke="var(--color-mobile)"
                strokeWidth={2}
                stackId="a"
                connectNulls={false}
              />
              <Area
                dataKey="desktop"
                type="monotone"
                fill="url(#fillDesktop)"
                stroke="var(--color-desktop)"
                strokeWidth={2}
                stackId="a"
                connectNulls={false}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </MagicCard>
  );
}
