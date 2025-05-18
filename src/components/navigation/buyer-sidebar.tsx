"use client";

import * as React from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  CalendarIcon,
  HomeIcon,
  TicketIcon,
  ShoppingCartIcon,
  UserIcon,
  HeartIcon,
  HelpCircleIcon,
  BellIcon,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

// Function to generate buyer navigation data
const getBuyerNavigationData = () => ({
  navMain: [
    {
      title: "Home",
      url: "/buyer",
      icon: HomeIcon,
    },
    {
      title: "Events",
      url: "/buyer/events",
      icon: CalendarIcon,
    },
    {
      title: "My Tickets",
      url: "/buyer/tickets",
      icon: TicketIcon,
    },
    {
      title: "Orders",
      url: "/buyer/orders",
      icon: ShoppingCartIcon,
    },
    {
      title: "Favorites",
      url: "/buyer/favorites",
      icon: HeartIcon,
    },
  ],
  navSecondary: [
    {
      title: "Profile",
      url: "/buyer/profile",
      icon: UserIcon,
    },
    {
      title: "Notifications",
      url: "/buyer/notifications",
      icon: BellIcon,
    },
    {
      title: "Help",
      url: "/buyer/help",
      icon: HelpCircleIcon,
    },
  ],
});

interface BuyerSidebarProps extends React.ComponentProps<typeof Sidebar> {}

export function BuyerSidebar({ ...props }: BuyerSidebarProps) {
  const { data: session } = useSession();

  // Use user data from session if available
  const userData = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "user@example.com",
    avatar: session?.user?.image || "/avatars/default.jpg",
  };

  // Generate navigation data
  const navData = getBuyerNavigationData();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/buyer" className="flex items-center gap-2">
                <div className="flex items-center">
                  <div className="relative">
                    <Image
                      src="/desain_logo.png"
                      alt="VBTix Logo"
                      width={32}
                      height={32}
                      className="object-contain"
                      priority
                    />
                  </div>
                  <span className="ml-1 text-lg font-semibold text-white">
                    VBTix
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
        <NavSecondary items={navData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
