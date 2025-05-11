"use client"

import { AppSidebar } from "~/components/dashboard/admin/app-sidebar"
import { ChartAreaInteractive } from "~/components/dashboard/admin/chart-area-interactive"
import { DataTable } from "~/components/dashboard/admin/data-table"
import { SectionCards } from "~/components/dashboard/admin/section-card"
import { SiteHeader } from "~/components/dashboard/admin/site-header"
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar"
import { AdminRoute } from "~/components/auth/admin-route"
import { useAdminEvents } from "~/lib/api/hooks"

export default function Page() {
  // Mengambil data events untuk tabel
  const { data, isLoading, error } = useAdminEvents();

  return (
    <AdminRoute>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive />
                </div>
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <DataTable data={data?.data || []} />
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AdminRoute>
  )
}
