"use client";

import { AppSidebar } from "~/components/dashboard/organizer/app-sidebar";
import { ChartAreaInteractive } from "~/components/dashboard/organizer/chart-area-interactive";
import { DataTable } from "~/components/dashboard/organizer/data-table";
import { SectionCards } from "~/components/dashboard/organizer/section-card";
import { SiteHeader } from "~/components/dashboard/organizer/site-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { OrganizerRoute } from "~/components/auth/organizer-route";
import { useOrganizerEvents } from "~/lib/api/hooks/organizer";

export default function Page({ params }: { params: { id: string } }) {
  const organizerId = params.id;

  // Fetch events data for the table
  const { data, isLoading, error } = useOrganizerEvents(organizerId);

  return (
    <OrganizerRoute>
      <SidebarProvider>
        <AppSidebar organizerId={organizerId} variant="inset" />
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
                    <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                  </div>
                ) : (
                  <DataTable data={(data?.data as any) || []} />
                )}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </OrganizerRoute>
  );
}
