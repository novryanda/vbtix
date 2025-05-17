"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/navigation/app-sidebar";
import { SiteHeader } from "~/components/navigation/site-header";
import { BuyerSidebar } from "~/components/navigation/buyer-sidebar";
import { BuyerHeader } from "~/components/navigation/buyer-header";
import { AdminRoute } from "~/components/auth/admin-route";
import { OrganizerRoute } from "~/components/auth/organizer-route";
import { BuyerRoute } from "~/components/auth/buyer-route";
import { PublicBuyerRoute } from "~/components/auth/public-buyer-route";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  // Determine if we're in admin, organizer, or buyer section
  const isAdmin = pathname.startsWith("/admin");
  const isOrganizer = pathname.startsWith("/organizer");
  const isBuyer = pathname.startsWith("/buyer");

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
        <SidebarProvider>
          <AppSidebar role="admin" variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  {children}
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </AdminRoute>
    );
  }

  if (isOrganizer) {
    return (
      <OrganizerRoute>
        <SidebarProvider>
          <AppSidebar
            role="organizer"
            organizerId={organizerId}
            variant="inset"
          />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  {children}
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </OrganizerRoute>
    );
  }

  if (isBuyer) {
    // Public buyer pages
    const publicBuyerPages = ["/buyer", "/buyer/events", "/buyer/about"];
    const isPublicBuyerPage =
      publicBuyerPages.includes(pathname) ||
      pathname.startsWith("/buyer/events/");

    // For the main buyer page and other public pages, don't use the sidebar layout
    if (pathname === "/buyer") {
      return <PublicBuyerRoute>{children}</PublicBuyerRoute>;
    }

    // For other public buyer pages that need the sidebar
    if (isPublicBuyerPage) {
      return (
        <PublicBuyerRoute>
          <SidebarProvider>
            <BuyerSidebar variant="inset" />
            <SidebarInset>
              <BuyerHeader />
              <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                  <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    {children}
                  </div>
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </PublicBuyerRoute>
      );
    }

    // For protected buyer pages (tickets, orders, etc.), use the BuyerRoute with auth
    return (
      <BuyerRoute>
        <SidebarProvider>
          <BuyerSidebar variant="inset" />
          <SidebarInset>
            <BuyerHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  {children}
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </BuyerRoute>
    );
  }

  // Default layout for other dashboard routes
  return (
    <SidebarProvider>
      <AppSidebar role="admin" variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
