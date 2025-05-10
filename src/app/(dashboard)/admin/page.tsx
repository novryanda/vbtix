"use client";

import { AppSidebar } from "~/components/dashboard/admin/app-sidebar"
import { ChartAreaInteractive } from "~/components/dashboard/admin/chart-area-interactive"
import { DataTable } from "~/components/dashboard/admin/data-table"
import { SectionCards } from "~/components/dashboard/admin/section-card"
import { SiteHeader } from "~/components/dashboard/admin/site-header"
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar"
import { AdminRoute } from "~/components/auth/admin-route"
import { SectionCardsSkeleton, ChartSkeleton, DataTableSkeleton, ErrorState } from "~/components/dashboard/admin/loading-state"
import { useAdminDashboard } from "~/lib/api/hooks"

import data from "./data.json"

export default function AdminDashboardPage() {
    const { isLoading, error } = useAdminDashboard();

    return (
        <AdminRoute>
            <SidebarProvider>
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader />
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                                {error ? (
                                    <ErrorState message="Failed to load dashboard data. Please try again later." />
                                ) : (
                                    <>
                                        <SectionCards />
                                        <div className="px-4 lg:px-6">
                                            {isLoading ? <ChartSkeleton /> : <ChartAreaInteractive />}
                                        </div>
                                        {isLoading ? <DataTableSkeleton /> : <DataTable data={data} />}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </AdminRoute>
    )
}
