import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@prisma/client";

// Routes that don't require authentication
const PUBLIC_ROUTES = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify",
  "/unauthorized",
  "/debug",
  "/debug-session",
  "/debug-auth",
]);

// Route prefixes that don't require authentication
const PUBLIC_PREFIXES = [
  "/api/auth/",
  "/api/webhooks/",
  "/api/revalidate/",
  "/api/public/",
  "/api/test-db",
  "/api/health",
  "/reset-password/",
  "/verify/",
  "/events/",
  "/checkout",
  "/orders/",
  "/tickets/",
  "/profile",
  "/_next/",
  "/favicon.ico",
];

// Check if route is public (optimized for performance)
function isPublicRoute(path: string): boolean {
  // Fast lookup for exact matches
  if (PUBLIC_ROUTES.has(path)) return true;

  // Check prefixes
  return PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix));
}

// Performance tracking for debugging
const ENABLE_PERFORMANCE_LOGS = process.env.NODE_ENV === "development";

function logPerformance(message: string, startTime: number) {
  if (ENABLE_PERFORMANCE_LOGS) {
    console.log(`[Middleware] ${message}: ${Date.now() - startTime}ms`);
  }
}

export async function middleware(req: NextRequest) {
  const startTime = Date.now();
  const path = req.nextUrl.pathname;

  try {
    // Early return for static files and certain API routes
    if (path.includes(".") || path.startsWith("/_next/")) {
      return NextResponse.next();
    }

    // Check if route is public first (fastest check)
    if (isPublicRoute(path)) {
      logPerformance(`Public route ${path}`, startTime);
      return NextResponse.next();
    }

    // Get authentication token
    let token;
    const tokenStartTime = Date.now();

    try {
      token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });
      logPerformance(`Token fetch for ${path}`, tokenStartTime);
    } catch (error) {
      console.error(`[Middleware] Token error for ${path}:`, error);
      return NextResponse.next();
    }

    const isAuthenticated = !!token;

    // Handle dashboard redirect (special case)
    if (path === "/dashboard") {
      if (!isAuthenticated) {
        // Not authenticated - redirect to login
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", path);
        logPerformance(`Login redirect for ${path}`, startTime);
        return NextResponse.redirect(loginUrl);
      }

      // Let the dashboard page component handle the role-based redirect
      // This prevents middleware from causing 307 redirects
      if (ENABLE_PERFORMANCE_LOGS) {
        console.log(
          `[Middleware] Allowing dashboard page to handle redirect for ${token?.email} (${token?.role})`,
        );
      }
      logPerformance(`Dashboard access allowed for ${path}`, startTime);
      return NextResponse.next();
    }

    // Protect non-public routes - require authentication
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", path);
      logPerformance(`Auth required redirect for ${path}`, startTime);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based access control
    const userRole = token?.role as UserRole;

    // Admin routes - only admins allowed
    if (path.startsWith("/admin")) {
      if (userRole !== UserRole.ADMIN) {
        logPerformance(`Admin access denied for ${path}`, startTime);
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Organizer routes - organizers and admins allowed
    if (path.startsWith("/organizer")) {
      if (userRole !== UserRole.ORGANIZER && userRole !== UserRole.ADMIN) {
        logPerformance(`Organizer access denied for ${path}`, startTime);
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      // Additional check: ensure organizer can only access their own routes
      if (userRole === UserRole.ORGANIZER) {
        const pathParts = path.split("/");
        const requestedUserId = pathParts[2]; // /organizer/[userId]/...
        const tokenUserId = token?.id as string;

        if (requestedUserId && requestedUserId !== tokenUserId) {
          logPerformance(`Organizer ID mismatch for ${path}`, startTime);
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
      }
    }

    logPerformance(`Middleware completed for ${path}`, startTime);
    return NextResponse.next();
  } catch (error) {
    console.error(
      `[Middleware] Error processing ${req.nextUrl.pathname}:`,
      error,
    );
    // Fail open - allow request to continue
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Optimized matcher for better performance:
     * - Excludes static files, API routes, and assets
     * - Only processes routes that need authentication/authorization
     */
    "/((?!api/auth|api/webhooks|api/public|_next|favicon.ico|.*\\..*).*)",
  ],
};
