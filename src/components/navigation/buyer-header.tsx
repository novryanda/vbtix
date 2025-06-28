"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut, User, Bell, Settings, Search, ShoppingCart, TicketIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { ThemeSelector } from "~/components/ui/theme-selector";
import { Input } from "~/components/ui/input";
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
  buyer: "Buyer",
  events: "Events",
  tickets: "My Tickets",
  "my-tickets": "My Tickets",
  orders: "Orders",
  favorites: "Favorites",
  profile: "Profile",
  notifications: "Notifications",
  help: "Help",
  checkout: "Checkout",
  settings: "Settings",
};

interface BuyerHeaderProps {
  className?: string;
}

export function BuyerHeader({ className }: BuyerHeaderProps) {
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
        "sticky top-0 z-50 bg-gradient-to-r from-green-600 to-blue-500 text-white shadow-2xl backdrop-blur-xl border-b border-white/10 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear",
        className,
      )}
    >
      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        {/* Left side: Logo */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <section className="flex items-center">
            <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
              <img
                src="/desain_logo.png"
                alt="VBTix Logo"
                className="h-16 w-auto object-contain md:h-20 lg:h-24"
              />
            </Link>
          </section>

          {/* Search */}
          {/* <div className="relative hidden md:block">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/70" />
            <Input
              type="search"
              placeholder="Search events..."
              className="h-9 w-64 pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40"
            />
          </div> */}
        </div>

        {/* Center: Navigation Menu (Hidden on mobile) */}
        {/* <div className="hidden lg:flex items-center space-x-6">
          <Link
            href="/events"
            className="text-sm font-medium text-white/90 hover:text-white transition-colors duration-200"
          >
            Browse Events
          </Link>
          <Link
            href="/my-tickets"
            className="text-sm font-medium text-white/90 hover:text-white transition-colors duration-200"
          >
            My Tickets
          </Link>
          <Link
            href="/orders"
            className="text-sm font-medium text-white/90 hover:text-white transition-colors duration-200"
          >
            My Orders
          </Link>
        </div> */}

        {/* Right side: Theme selector, cart, notifications and user dropdown */}
        <div className="flex items-center gap-3">
          {/* Theme Selector */}
          <ThemeSelector variant="ghost" size="sm" className="text-white hover:bg-white/20 hover:text-white border-white/20" />

          {/* Search Button */}
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white hover:bg-white/20 hover:text-white relative">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-white hover:bg-white/20 hover:text-white relative">
            <Bell className="h-4 w-4" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User Dropdown or Login Button */}
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2 px-2 text-white hover:bg-white/20 hover:text-white">
                  <Avatar className="h-6 w-6 ring-2 ring-white/30">
                    <AvatarImage
                      src={session.user.image ?? ""}
                      alt={session.user.name ?? "User"}
                    />
                    <AvatarFallback className="bg-white/20 text-white">
                      {session.user.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-block">
                    {session.user.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-tickets">
                    <TicketIcon className="mr-2 h-4 w-4" />
                    <span>My Tickets</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-red-600 dark:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm" className="h-8 border-white/30 text-white hover:bg-white/20 hover:text-white hover:border-white/50">
                <User className="mr-2 h-4 w-4" />
                <span>Login</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
