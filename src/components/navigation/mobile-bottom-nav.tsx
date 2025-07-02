"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, TicketIcon, User, Calendar } from "lucide-react";
import { cn } from "~/lib/utils";
import { useSession } from "next-auth/react";

const navigation = [
    {
        name: "Home",
        href: "/",
        icon: Home,
    },
    {
        name: "Events",
        href: "/events",
        icon: Calendar,
    },
    {
        name: "Orders",
        href: "/my-orders",
        icon: Search,
    },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Don't show on auth pages or admin pages
  if (pathname.includes('/login') || pathname.includes('/admin') || pathname.includes('/dashboard')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-border/50 sm:hidden">
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset">
        {navigation.map((item) => {
          // Skip auth-required items if user is not logged in
          if (item.requireAuth && !session?.user) {
            return null;
          }

          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 min-w-0 flex-1 max-w-20",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 mb-1 transition-colors",
                isActive ? "text-primary" : "text-current"
              )} />
              <span className="truncate leading-none">
                {item.name}
              </span>
            </Link>
          );
        })}
        
        {/* Login button if not authenticated */}
        {!session?.user && (
          <Link
            href="/login"
            className="flex flex-col items-center justify-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 min-w-0 flex-1 max-w-20 text-muted-foreground hover:text-primary hover:bg-primary/5"
          >
            <User className="h-5 w-5 mb-1" />
            <span className="truncate leading-none">Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
