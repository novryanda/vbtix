"use client"

import * as React from "react"
import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "~/lib/hooks/use-mobile"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "~/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "~/components/ui/chart"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select"
import {
    ToggleGroup,
    ToggleGroupItem,
} from "~/components/ui/toggle-group"

// Sample chart data - replace with actual data from API
const chartData = [
    { date: "2024-04-01", tickets: 222, revenue: 15000000 },
    { date: "2024-04-02", tickets: 97, revenue: 8000000 },
    { date: "2024-04-03", tickets: 167, revenue: 12000000 },
    { date: "2024-04-04", tickets: 242, revenue: 18000000 },
    { date: "2024-04-05", tickets: 373, revenue: 25000000 },
    { date: "2024-04-06", tickets: 301, revenue: 20000000 },
    { date: "2024-04-07", tickets: 217, revenue: 16000000 },
    { date: "2024-04-08", tickets: 146, revenue: 10000000 },
    { date: "2024-04-09", tickets: 189, revenue: 14000000 },
    { date: "2024-04-10", tickets: 251, revenue: 19000000 },
    { date: "2024-04-11", tickets: 322, revenue: 22000000 },
    { date: "2024-04-12", tickets: 298, revenue: 21000000 },
    { date: "2024-04-13", tickets: 275, revenue: 20000000 },
    { date: "2024-04-14", tickets: 201, revenue: 15000000 },
]

export function ChartAreaInteractive() {
    const [timeRange, setTimeRange] = useState("30d")
    const [chartType, setChartType] = useState("tickets")
    const isMobile = useIsMobile()

    // Filter data based on time range
    const filteredData = React.useMemo(() => {
        const now = new Date()
        const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
        const startDate = new Date(now)
        startDate.setDate(now.getDate() - days)
        
        // For demo purposes, we're just returning all data
        // In a real app, you would filter based on the date
        return chartData
    }, [timeRange])

    // Configure chart based on selected type
    const chartConfig = React.useMemo<ChartConfig>(() => {
        return {
            tickets: {
                color: "indigo",
                label: "Tickets",
                formatter: (v: number) => `${v.toLocaleString()} tickets`,
            },
            revenue: {
                color: "emerald",
                label: "Revenue",
                formatter: (v: number) => `Rp ${(v / 1000000).toFixed(1)}M`,
            },
        }
    }, [])

    return (
        <Card className="@container/card">
            <CardHeader className="relative">
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>
                    <span className="@[540px]/card:block hidden">
                        {timeRange === "7d"
                            ? "Last 7 days"
                            : timeRange === "30d"
                            ? "Last 30 days"
                            : "Last 3 months"}
                    </span>
                    <span className="@[540px]/card:hidden">
                        {timeRange === "7d"
                            ? "7d"
                            : timeRange === "30d"
                            ? "30d"
                            : "90d"}
                    </span>
                </CardDescription>
                <div className="absolute right-4 top-4">
                    <ToggleGroup
                        type="single"
                        value={timeRange}
                        onValueChange={setTimeRange}
                        variant="outline"
                        className="@[767px]/card:flex hidden"
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
                    <Select
                        defaultValue={timeRange}
                        onValueChange={setTimeRange}
                        className="@[767px]/card:hidden"
                    >
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
                </div>
                <div className="h-[240px]">
                    <ChartContainer config={chartConfig}>
                        <AreaChart
                            data={filteredData}
                            index="date"
                            categories={[chartType]}
                            colors={[chartConfig[chartType as keyof typeof chartConfig].color as any]}
                            showLegend={false}
                            showGridLines={false}
                            showAnimation
                            curveType="monotone"
                            customTooltip={({ payload }) => {
                                if (!payload?.length) return null
                                const { date } = payload[0].payload
                                const value = payload[0].value as number
                                const config = chartConfig[chartType as keyof typeof chartConfig]
                                return (
                                    <ChartTooltip>
                                        <ChartTooltipContent
                                            date={new Date(date).toLocaleDateString()}
                                            value={value}
                                            formatter={config.formatter}
                                            label={config.label}
                                            color={config.color}
                                        />
                                    </ChartTooltip>
                                )
                            }}
                        />
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    )
}
