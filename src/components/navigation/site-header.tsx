"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut, User, Bell, Settings } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { ThemeSelector } from "~/components/ui/theme-selector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";
import { UserRole } from "@prisma/client";

// Map of path segments to display names
const pathMap: Record<string, string> = {
  organizer: "Organizer",
  admin: "Admin",
  buyer: "Buyer",
  event: "My Events",
  events: "Events",
  tickets: "Tickets",
  "my-tickets": "My Tickets",
  attendees: "Attendees",
  analytics: "Analytics",
  settings: "Settings",
  dashboard: "Dashboard",
  organizers: "Organizers",
  orders: "Orders",
  checkout: "Checkout",
  profile: "Profile",
  favorites: "Favorites",
  help: "Help",
};

interface SiteHeaderProps {
  className?: string;
}

export function SiteHeader({ className }: SiteHeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // Parse the pathname to create breadcrumb segments
  const segments = pathname.split("/").filter(Boolean);
  const allSegments = segments.map((segment, index) => {
    // Create the href for this segment
    const href = `/${segments.slice(0, index + 1).join("/")}`;

    // Get a display name for this segment
    let name = pathMap[segment] ?? segment;

    // If it's a UUID or ID, try to get a better name
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        segment,
      )
    ) {
      name = "Details";
    }

    // Capitalize first letter
    name = name.charAt(0).toUpperCase() + name.slice(1);

    return { name, href };
  });

  return (
    <header
      className={cn(
        "flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
        className,
      )}
    >
      <div className="flex w-full items-center justify-between gap-1 px-3 sm:px-4 lg:gap-2 lg:px-6">
        {/* Left side: SidebarTrigger, Breadcrumb, and Search */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-1 sm:mx-2 data-[orientation=vertical]:h-4 hidden sm:block"
          />

          {/* Breadcrumb - responsive */}
          <nav className="flex text-sm text-gray-500 min-w-0 flex-1">
            <div className="flex items-center min-w-0">
              {/* Mobile: Show only current page */}
              <div className="sm:hidden">
                {allSegments.length > 0 && (
                  <span className="font-semibold text-gray-900 truncate">
                    {allSegments[allSegments.length - 1]?.name}
                  </span>
                )}
              </div>

              {/* Desktop: Show full breadcrumb */}
              <div className="hidden sm:flex items-center min-w-0">
                {allSegments.map((segment, index) => (
                  <span key={segment.href} className="flex items-center min-w-0">
                    {index === allSegments.length - 1 ? (
                      <span className="font-semibold text-gray-900 truncate">
                        {segment.name}
                      </span>
                    ) : (
                      <Link
                        href={segment.href}
                        className="text-gray-500 hover:underline truncate"
                      >
                        {segment.name}
                      </Link>
                    )}
                    {index < allSegments.length - 1 && (
                      <span className="mx-1 lg:mx-2 text-gray-400 flex-shrink-0">›</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </nav>
        </div>

        {/* Right side: Theme selector and user dropdown */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
          {/* Theme Selector - hidden on mobile */}
          <div className="hidden sm:block">
            <ThemeSelector variant="ghost" size="sm" />
          </div>

          {/* Notifications - smaller on mobile */}
          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full">
            <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User Dropdown */}
          {session?.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 sm:h-8 gap-1 sm:gap-2 px-1 sm:px-2">
                  <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                    <AvatarImage
                      src={session.user.image ?? ""}
                      alt={session.user.name ?? "User"}
                    />
                    <AvatarFallback className="text-xs">
                      {session.user.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-block text-sm">
                    {session.user.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {session?.user?.role === UserRole.ADMIN && (
                  <DropdownMenuItem
                    onClick={() => router.push("/admin/profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                )}
                {session?.user?.role === UserRole.ORGANIZER && (
                  <DropdownMenuItem
                    onClick={() => {
                      // Get organizer ID from pathname
                      const segments = pathname.split("/");
                      const organizerId = segments.find(
                        (segment, index) =>
                          segments[index - 1] === "organizer" &&
                          segment !== "dashboard",
                      );

                      if (organizerId) {
                        router.push(`/organizer/${organizerId}/profile`);
                      }
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                )}
                {session?.user?.role === UserRole.BUYER && (
                  <DropdownMenuItem
                    onClick={() => router.push("/buyer/profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    if (session?.user?.role === UserRole.ADMIN) {
                      router.push("/admin/settings");
                    } else if (session?.user?.role === UserRole.ORGANIZER) {
                      // Get organizer ID from pathname
                      const segments = pathname.split("/");
                      const organizerId = segments.find(
                        (segment, index) =>
                          segments[index - 1] === "organizer" &&
                          segment !== "dashboard",
                      );

                      if (organizerId) {
                        router.push(`/organizer/${organizerId}/settings`);
                      }
                    }
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
