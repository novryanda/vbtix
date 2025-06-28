"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  CalendarIcon,
  HeartIcon,
  HistoryIcon,
  HomeIcon,
  LayoutDashboardIcon,
  SearchIcon,
  SettingsIcon,
  ShoppingCartIcon,
  TicketIcon,
  UserIcon,
  BellIcon,
  type LucideIcon,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { MagicCard } from "~/components/ui/magic-card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

// Define types for navigation data
interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string | number;
}

interface BuyerNavigationData {
  navMain: NavItem[];
  navSecondary: NavItem[];
}

// Function to generate buyer navigation data
const getBuyerNavigationData = (): BuyerNavigationData => ({
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: HomeIcon,
    },
    {
      title: "Browse Events",
      url: "/events",
      icon: CalendarIcon,
    },
    // {
    //   title: "My Tickets",
    //   url: "/my-tickets",
    //   icon: TicketIcon,
    // },
    // {
    //   title: "My Orders",
    //   url: "/orders",
    //   icon: ShoppingCartIcon,
    // },
    // {
    //   title: "Checkout",
    //   url: "/checkout",
    //   icon: HistoryIcon,
    // },
  ],
  navSecondary: [
    {
      title: "Profile",
      url: "/profile",
      icon: UserIcon,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: SettingsIcon,
    },
  ],
});

interface BuyerSidebarProps extends React.ComponentProps<typeof Sidebar> {}

export function BuyerSidebar({ ...props }: BuyerSidebarProps) {
  const { data: session } = useSession();

  // Use user data from session if available
  const userData = {
    name: session?.user?.name ?? "Guest",
    email: session?.user?.email ?? "guest@example.com",
    avatar: session?.user?.image ?? "/avatars/default.jpg",
  };

  // Generate navigation data for buyer
  const navData = getBuyerNavigationData();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <MagicCard 
              className="p-0 border-0 bg-transparent"
              gradientColor="rgba(34, 197, 94, 0.1)"
            >
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:h-auto data-[slot=sidebar-menu-button]:min-h-[5.5rem] data-[slot=sidebar-menu-button]:!p-6 hover:bg-sidebar-accent/50 transition-all duration-200"
              >
                <a href="/" className="flex items-center justify-center w-full">
                  <div className="relative w-full flex justify-center">
                    <img 
                      src="/desain_logo.png" 
                      alt="VBTix Logo" 
                      className="h-28 w-auto object-contain max-w-full scale-110"
                    />
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse" />
                  </div>
                </a>
              </SidebarMenuButton>
            </MagicCard>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <div className="space-y-2">
          <NavMain items={navData.navMain} />
        </div>
        <div className="mt-auto pt-6">
          <NavSecondary items={navData.navSecondary} className="mt-auto" />
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/50 p-2">
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
