import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@prisma/client";
import { getDashboardRoute } from "~/config/dashboard";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const path = req.nextUrl.pathname;

  // API authorization
  if (path.startsWith("/api/")) {
    // Public API endpoints that don't require authentication
    if (
      path.startsWith("/api/auth/") ||
      path.startsWith("/api/webhooks/") ||
      path.startsWith("/api/revalidate/")
    ) {
      return NextResponse.next();
    }

    // Check if user is authenticated for protected API endpoints
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Role-based API authorization
    if (path.startsWith("/api/admin/")) {
      // Only admin can access admin API
      if (token.role !== UserRole.ADMIN) {
        return NextResponse.json(
          { success: false, message: "Forbidden" },
          { status: 403 }
        );
      }
    } else if (path.startsWith("/api/organizer/")) {
      // Only organizers and admins can access organizer API
      if (token.role !== UserRole.ORGANIZER && token.role !== UserRole.ADMIN) {
        return NextResponse.json(
          { success: false, message: "Forbidden" },
          { status: 403 }
        );
      }
    }

    // All authenticated users can access buyer API
    return NextResponse.next();
  }

  // UI routes authorization
  // Check if user is authenticated for protected UI routes
  if (path.startsWith("/admin") || path.startsWith("/organizer") || path.startsWith("/buyer") ||
      path.startsWith("/dashboard") || path.startsWith("/events/create") ||
      path.startsWith("/tickets/my") || path.startsWith("/orders") ||
      path.startsWith("/profile") || path.startsWith("/settings")) {

    // If not authenticated, redirect to login
    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Role-based access control for UI routes
    if (path.startsWith("/admin")) {
      // Only admin can access admin routes
      if (token.role !== UserRole.ADMIN) {
        // Redirect to appropriate dashboard based on role
        const redirectUrl = getDashboardRoute(token.role as string);
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      }
    } else if (path.startsWith("/organizer")) {
      // Only organizers and admins can access organizer routes
      if (token.role !== UserRole.ORGANIZER && token.role !== UserRole.ADMIN) {
        return NextResponse.redirect(new URL("/buyer", req.url));
      }
    }
  }

  // Handle root path
  if (path === "/" && token) {
    // If user is authenticated and trying to access the root, redirect to their dashboard
    const redirectUrl = getDashboardRoute(token.role as string);
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  return NextResponse.next();
}

// Add the paths that should be protected by this middleware
export const config = {
  matcher: [
    "/api/:path*",
    "/admin/:path*",
    "/organizer/:path*",
    "/buyer/:path*",
    "/dashboard/:path*",
    "/events/create/:path*",
    "/tickets/my/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/",
  ],
};
