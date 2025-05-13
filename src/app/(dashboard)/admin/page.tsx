"use client";

import { AppSidebar } from "~/components/dashboard/admin/app-sidebar";
import { SiteHeader } from "~/components/dashboard/admin/site-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { AdminRoute } from "~/components/auth/admin-route";

export default function Page() {
  // Redirect to the dashboard page
  return (
    <AdminRoute>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {/* Redirect to dashboard page */}
                {typeof window !== "undefined" &&
                  (window.location.href = "/admin/dashboard")}
                <div className="flex items-center justify-center p-8">
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                  <span className="ml-2">Redirecting to dashboard...</span>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AdminRoute>
  );
}
