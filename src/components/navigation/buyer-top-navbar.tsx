"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  Search,
  Menu,
  User,
  Bell,
  ShoppingCart,
  LogOut,
  TicketIcon,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ThemeSelector } from "~/components/ui/theme-selector";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function BuyerTopNavbar() {
  const { data: session } = useSession();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  // CSS classes
  const navLinkClasses = "text-sm font-medium text-white hover:text-blue-100";
  const searchBtnClasses = "rounded-full text-white hover:bg-blue-700/50";
  const mobileNavLinkClasses =
    "py-2 text-lg font-medium text-white hover:text-blue-100";

  // Logo component
  const Logo = ({ size = "large" }: { size?: "large" | "small" }) => {
    const isLarge = size === "large";
    return (
      <Link href="/buyer" className="flex items-center space-x-2 sm:space-x-3">
        <div
          className={`flex ${isLarge ? "h-10 w-10" : "h-8 w-8"} items-center justify-center rounded-full bg-white shadow-inner`}
        >
          <span
            className={`${isLarge ? "text-xl" : "text-lg"} font-bold text-blue-600`}
          >
            VB
          </span>
        </div>
        <span
          className={`${isLarge ? "text-xl" : "text-lg"} font-bold text-white`}
        >
          VBTix
        </span>
      </Link>
    );
  };

  // Search bar component
  const SearchBar = () =>
    isSearchOpen ? (
      <div className="flex items-center overflow-hidden rounded-full bg-blue-700/80 backdrop-blur-sm">
        <Input
          className="border-0 bg-transparent text-white placeholder-blue-200 focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Search..."
          autoFocus
        />
        <Button
          variant="ghost"
          className="text-white hover:bg-blue-800"
          onClick={toggleSearch}
        >
          <Search size={20} />
        </Button>
      </div>
    ) : (
      <Button
        variant="ghost"
        className={searchBtnClasses}
        onClick={toggleSearch}
      >
        <Search size={isSearchOpen ? 20 : 18} />
      </Button>
    );

  // Profile component - shows login button or avatar based on auth state
  const ProfileComponent = ({
    size = "large",
  }: {
    size?: "large" | "small";
  }) => {
    const isLarge = size === "large";

    // If user is not authenticated, show login button
    if (!session) {
      return (
        <Link href="/login" className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-white bg-transparent text-white hover:bg-blue-700/20"
          >
            <User className="mr-2 h-4 w-4" />
            <span>Login</span>
          </Button>
        </Link>
      );
    }

    // If user is authenticated, show avatar with dropdown
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2 px-2 text-white"
          >
            <Avatar
              className={`${isLarge ? "h-9 w-9" : "h-8 w-8"} cursor-pointer border-2 border-white transition-all hover:border-blue-200`}
            >
              <AvatarImage
                src={session.user.image || "/avatars/default.jpg"}
                alt="Profile"
              />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                <User size={isLarge ? 18 : 16} />
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:inline-block">
              {session.user.name || "User"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/buyer/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/buyer/tickets">
              <TicketIcon className="mr-2 h-4 w-4" />
              <span>My Tickets</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/buyer/orders">
              <ShoppingCart className="mr-2 h-4 w-4" />
              <span>My Orders</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/buyer" })}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        {/* Desktop Header */}
        <div className="hidden items-center justify-between md:flex">
          <Logo />

          {/* Navigation */}
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList className="flex space-x-8">
              <NavigationMenuItem>
                <Link href="/buyer/events" className={navLinkClasses}>
                  Jelajah
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/buyer/about" className={navLinkClasses}>
                  About Us
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right side: Theme selector, cart, notifications and user dropdown */}
          <div className="flex items-center space-x-4">
            <ThemeSelector variant="ghost" size="sm" />

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-white"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="sr-only">Cart</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-white"
            >
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>

            <ProfileComponent />
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex items-center justify-between md:hidden">
          <Logo size="small" />

          {/* Mobile Menu, Search and Profile */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              className={searchBtnClasses}
              onClick={toggleSearch}
            >
              <Search size={18} />
            </Button>

            <ProfileComponent size="small" />

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className={searchBtnClasses}>
                  <Menu size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-blue-600 text-white">
                <nav className="mt-8 flex flex-col gap-4">
                  <Link
                    href="/buyer/profile"
                    className={`flex items-center gap-2 ${mobileNavLinkClasses}`}
                  >
                    <User size={20} />
                    Profil Saya
                  </Link>
                  <Link href="/buyer/events" className={mobileNavLinkClasses}>
                    Jelajah
                  </Link>
                  <Link href="/buyer/about" className={mobileNavLinkClasses}>
                    About Us
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
