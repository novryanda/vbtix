"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Menu, Bell, ShoppingCart } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "~/components/ui/sheet";
import { ThemeSelector } from "~/components/ui/theme-selector";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "~/components/ui/navigation-menu";

export function BuyerTopNavbar() {
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
                <Link href="/events" className={navLinkClasses}>
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

          {/* Right side: Theme selector, cart, notifications */}
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
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex items-center justify-between md:hidden">
          <Logo size="small" />

          {/* Mobile Menu and Search */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              className={searchBtnClasses}
              onClick={toggleSearch}
            >
              <Search size={18} />
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className={searchBtnClasses}>
                  <Menu size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-blue-600 text-white">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                  <SheetDescription>
                    Mobile navigation menu for VBTix
                  </SheetDescription>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-4">
                  <Link href="/events" className={mobileNavLinkClasses}>
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
