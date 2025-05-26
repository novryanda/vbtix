"use client";

import * as React from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  CalendarIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  PartyPopperIcon,
  SearchIcon,
  SettingsIcon,
  TicketIcon,
  UsersIcon,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { NavDocuments } from "./nav-document";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

// Function to generate admin navigation data
const getAdminNavigationData = () => ({
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Events",
      url: "/admin/events",
      icon: PartyPopperIcon,
    },
    {
      title: "Organizers",
      url: "/admin/organizers",
      icon: UsersIcon,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: SettingsIcon,
    },
  ],
});

// Function to generate organizer navigation data with organizerId
const getOrganizerNavigationData = (organizerId: string) => ({
  navMain: [
    {
      title: "Dashboard",
      url: `/organizer/${organizerId}`,
      icon: LayoutDashboardIcon,
    },
    {
      title: "Events",
      url: `/organizer/${organizerId}/events`,
      icon: CalendarIcon,
    },
    {
      title: "Tickets",
      url: `/organizer/${organizerId}/tickets`,
      icon: TicketIcon,
    },
    {
      title: "Orders",
      url: `/organizer/${organizerId}/orders`,
      icon: ListIcon,
    },
    {
      title: "Analytics",
      url: `/organizer/${organizerId}/analytics`,
      icon: BarChartIcon,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: `/organizer/${organizerId}/settings`,
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircleIcon,
    },
    {
      title: "Search",
      url: "#",
      icon: SearchIcon,
    },
  ],
  documents: [
    {
      name: "Sales Reports",
      url: `/organizer/${organizerId}/reports/sales`,
      icon: DatabaseIcon,
    },
    {
      name: "Attendee Lists",
      url: `/organizer/${organizerId}/reports/attendees`,
      icon: ClipboardListIcon,
    },
    {
      name: "Inventory",
      url: `/organizer/${organizerId}/inventory`,
      icon: FileIcon,
    },
  ],
});

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role: "admin" | "organizer";
  organizerId?: string;
}

export function AppSidebar({
  role,
  organizerId = "",
  ...props
}: AppSidebarProps) {
  const { data: session } = useSession();

  // Use user data from session if available
  const userData = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "user@example.com",
    avatar: session?.user?.image || "/avatars/default.jpg",
  };

  // Generate navigation data based on role
  const navData =
    role === "admin"
      ? getAdminNavigationData()
      : getOrganizerNavigationData(organizerId);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={
                role === "admin"
                  ? "data-[slot=sidebar-menu-button]:h-auto data-[slot=sidebar-menu-button]:min-h-[3.5rem] data-[slot=sidebar-menu-button]:!p-0 data-[slot=sidebar-menu-button]:pl-0"
                  : "data-[slot=sidebar-menu-button]:!p-1.5"
              }
            >
              {role === "admin" ? (
                <a
                  href="/admin/dashboard"
                  className="ml-0 flex items-center gap-0 pl-0"
                >
                  <div className="ml-0 flex items-center pl-0">
                    <div className="relative ml-0">
                      <Image
                        src="/desain_logo.png"
                        alt="VBTix Logo"
                        width={96}
                        height={96}
                        className="object-contain"
                        priority
                      />
                    </div>
                    <span className="-ml-1 flex h-10 items-center text-xl font-semibold text-white">
                      ADMIN
                    </span>
                  </div>
                </a>
              ) : (
                <a href={`/organizer/${organizerId}`}>
                  <ArrowUpCircleIcon className="h-5 w-5" />
                  <span className="text-base font-semibold">
                    VBTix Organizer
                  </span>
                </a>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
        {role === "organizer" && (navData as any).documents && (
          <NavDocuments items={(navData as any).documents} />
        )}
        <NavSecondary items={navData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
