"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/navigation/app-sidebar";
import { SiteHeader } from "~/components/navigation/site-header";
import { AdminRoute } from "~/components/auth/admin-route";
import { OrganizerRoute } from "~/components/auth/organizer-route";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  // Determine if we're in admin or organizer section
  const isAdmin = pathname.startsWith("/admin");
  const isOrganizer = pathname.startsWith("/organizer");

  // Extract organizerId from path if in organizer section
  // Format: /organizer/[id]
  let organizerId: string | undefined = "";
  if (isOrganizer) {
    const pathParts = pathname.split("/");
    if (pathParts.length > 2) {
      organizerId = pathParts[2];
    }
  }

  // Render the appropriate layout based on the route
  if (isAdmin) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
          <SidebarProvider>
            <AppSidebar role="admin" variant="inset" />
            <SidebarInset>
              <SiteHeader />
              <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col">
                  <main className="flex-1 space-y-3 p-2 sm:space-y-4 sm:p-3 md:p-4 lg:p-6 xl:p-8 2xl:p-10 md:space-y-6">
                    <div className="container-responsive">
                      {children}
                    </div>
                  </main>
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </AdminRoute>
    );
  }  if (isOrganizer) {
    return (
      <OrganizerRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50/50 to-blue-50/30 dark:from-gray-900 dark:via-gray-900/50 dark:to-blue-900/30">
          <SidebarProvider>
            <AppSidebar
              role="organizer"
              organizerId={organizerId}
              variant="inset"
            />
            <SidebarInset>
              <SiteHeader />
              <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col">
                  <main className="flex-1 space-y-3 p-2 sm:space-y-4 sm:p-3 md:p-4 lg:p-6 xl:p-8 2xl:p-10 md:space-y-6">
                    <div className="container-responsive">
                      {children}
                    </div>
                  </main>
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </OrganizerRoute>
    );
  }

  // Default layout for other dashboard routes
  return (
    <SidebarProvider>
      <AppSidebar role="admin" variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col">
            <main className="flex-1 space-y-3 p-2 sm:space-y-4 sm:p-3 md:p-4 lg:p-6 xl:p-8 2xl:p-10 md:space-y-6">
              <div className="container-responsive">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
