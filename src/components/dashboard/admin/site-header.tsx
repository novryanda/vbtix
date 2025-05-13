"use client";

import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { SidebarTrigger } from "~/components/ui/sidebar";

// Map of path segments to display names
const pathMap: Record<string, string> = {
  organizer: "Organizer",
  admin: "Admin",
  event: "My Events",
  events: "Events",
  tickets: "Tickets",
  attendees: "Attendees",
  analytics: "Analytics",
  settings: "Settings",
  dashboard: "Dashboard",
  organizers: "Organizers",
};

export function SiteHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Generate breadcrumb segments and current page
  const { segments, currentPage } = useMemo(() => {
    const parts: string[] = pathname
      ? pathname.replace(/^\//, "").split("/")
      : [];

    if (
      parts.length > 0 &&
      (parts[0] === "organizer" || parts[0] === "admin")
    ) {
      // Special case for admin/dashboard
      if (
        parts.length === 2 &&
        parts[0] === "admin" &&
        parts[1] === "dashboard"
      ) {
        return {
          segments: [
            {
              name: "Admin",
              href: "/admin",
            },
          ],
          currentPage: "Dashboard",
        };
      }

      // Special case for admin/organizers
      if (
        parts.length === 2 &&
        parts[0] === "admin" &&
        parts[1] === "organizers"
      ) {
        return {
          segments: [
            {
              name: "Admin",
              href: "/admin",
            },
          ],
          currentPage: "Organizers",
        };
      }

      if (parts.length === 1) {
        return {
          segments: [],
          currentPage: parts[0] ? pathMap[parts[0]] || parts[0] : "Dashboard",
        };
      }

      const dashboardSegment = {
        name: parts[0] ? pathMap[parts[0]] || parts[0] : "Dashboard",
        href: `/${parts[0]}`,
      };

      if (parts.length > 2) {
        const middleSegments = parts.slice(1, -1).map((part, index) => {
          const path = `/${parts.slice(0, index + 2).join("/")}`;
          return {
            name: part ? pathMap[part] || part : "",
            href: path,
          };
        });

        const lastPart = parts[parts.length - 1];
        return {
          segments: [dashboardSegment, ...middleSegments],
          currentPage: lastPart ? pathMap[lastPart] || lastPart : "",
        };
      }

      return {
        segments: [dashboardSegment],
        currentPage: parts[1] ? pathMap[parts[1]] || parts[1] : "",
      };
    }

    if (parts.length === 1) {
      return {
        segments: [],
        currentPage: parts[0] ? pathMap[parts[0]] || parts[0] : "Home",
      };
    }

    const routeSegments = parts.slice(0, -1).map((part, index) => {
      const path = `/${parts.slice(0, index + 1).join("/")}`;
      return {
        name: part ? pathMap[part] || part : "",
        href: path,
      };
    });

    const lastPart = parts.length > 0 ? parts[parts.length - 1] : "";
    return {
      segments: routeSegments,
      currentPage: lastPart ? pathMap[lastPart] || lastPart : "Home",
    };
  }, [pathname]);

  const allSegments = useMemo(() => {
    const homeSegment = {
      name: "Home",
      href: "/",
    };

    // Add currentPage as the last segment
    const currentPageSegment = {
      name: currentPage,
      href: "#", // No need for a link as this is the active page
    };

    return [homeSegment, ...segments, currentPageSegment];
  }, [segments, currentPage]);

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        {/* Container untuk SidebarTrigger dan Breadcrumb */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          {/* Breadcrumb */}
          <nav className="flex text-sm text-gray-500">
            {allSegments.map((segment, index) => (
              <span key={segment.href} className="flex items-center">
                {index === allSegments.length - 1 ? (
                  // Halaman aktif tidak bisa diklik
                  <span className="font-semibold text-gray-900">
                    {segment.name}
                  </span>
                ) : (
                  // Breadcrumb lain bisa diklik
                  <a
                    href={segment.href}
                    className="text-gray-500 hover:underline"
                  >
                    {segment.name}
                  </a>
                )}
                {index < allSegments.length - 1 && (
                  <span className="mx-2 text-gray-400">›</span>
                )}
              </span>
            ))}
          </nav>
        </div>

        {session?.user && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground hidden text-sm md:inline-block">
              {session.user.name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="h-8 gap-1 px-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline-block">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
