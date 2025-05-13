"use client";

import { AppSidebar } from "~/components/dashboard/admin/app-sidebar";
import { SiteHeader } from "~/components/dashboard/admin/site-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { AdminRoute } from "~/components/auth/admin-route";

export default function OrganizersPage() {
  return (
    <AdminRoute>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <h1 className="text-2xl font-bold">Organizers</h1>
                  <p className="text-muted-foreground">
                    Manage organizers on the platform
                  </p>
                </div>
                {/* Konten halaman organizer akan diimplementasikan nanti */}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AdminRoute>
  );
}
