"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  CalendarIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  TicketIcon,
  UsersIcon,
} from "lucide-react";

import { NavDocuments } from "~/components/dashboard/organizer/nav-document";
import { NavMain } from "~/components/dashboard/organizer/nav-main";
import { NavSecondary } from "~/components/dashboard/organizer/nav-secondary";
import { NavUser } from "~/components/dashboard/organizer/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

// Function to generate navigation data with organizerId
const getNavigationData = (organizerId: string) => ({
  user: {
    name: "organizer",
    email: "organizer@example.com",
    avatar: "/avatars/organizer.jpg",
  },
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

export function AppSidebar({
  organizerId,
  ...props
}: React.ComponentProps<typeof Sidebar> & { organizerId: string }) {
  const { data: session } = useSession();

  // Use user data from session if available
  const userData = {
    name: session?.user?.name || "Organizer",
    email: session?.user?.email || "organizer@example.com",
    avatar: session?.user?.image || "/avatars/default.jpg",
  };

  // Generate navigation data with organizerId
  const navData = getNavigationData(organizerId);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href={`/organizer/${organizerId}`}>
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">VBTix Organizer</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
        <NavDocuments items={navData.documents} />
        <NavSecondary items={navData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
