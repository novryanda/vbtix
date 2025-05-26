import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@prisma/client";

// Daftar rute publik yang tidak memerlukan autentikasi
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify",
  "/unauthorized",
];

// Memeriksa apakah rute adalah rute publik
function isPublicRoute(path: string) {
  // Cek apakah path cocok dengan salah satu rute publik
  if (publicRoutes.includes(path)) return true;

  // Cek apakah path dimulai dengan salah satu prefiks publik
  if (
    path.startsWith("/api/auth/") ||
    path.startsWith("/api/webhooks/") ||
    path.startsWith("/api/revalidate/") ||
    path.startsWith("/reset-password/") ||
    path.startsWith("/verify/") ||
    path.startsWith("/events/") || // Allow access to public event pages
    path.startsWith("/checkout") || // Allow access to checkout pages (with or without trailing slash)
    path.startsWith("/orders/") || // Allow access to public order pages
    path.startsWith("/tickets/") || // Allow access to public ticket pages
    path.startsWith("/profile") || // Allow access to public profile page
    path.startsWith("/api/public/") // Allow access to all public API endpoints
  ) {
    return true;
  }

  return false;
}

// Mendapatkan rute dashboard berdasarkan peran pengguna
function getDashboardRoute(role?: UserRole | string | null, userId?: string) {
  if (!role) return "/";

  switch (role) {
    case UserRole.ADMIN:
      return "/admin";
    case UserRole.ORGANIZER:
      // If userId is available, redirect to the organizer's dashboard
      return userId ? `/organizer/${userId}/dashboard` : "/organizer";
    case UserRole.BUYER:
    default:
      return "/";
  }
}

// Removed authMiddleware - functionality moved to main middleware

// Removed unused middleware functions - functionality moved to main middleware

export async function middleware(req: NextRequest) {
  try {
    const path = req.nextUrl.pathname;

    // Skip middleware for static files and API routes that don't need auth
    if (
      path.startsWith("/_next/") ||
      path.startsWith("/api/auth/") ||
      path.startsWith("/api/webhooks/") ||
      path.startsWith("/api/public/") ||
      path.includes(".")
    ) {
      return NextResponse.next();
    }

    // Get token once
    let token;
    try {
      token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });
    } catch (error) {
      console.error("Error getting token:", error);
      return NextResponse.next();
    }

    const isAuthenticated = !!token;

    // Handle public routes
    if (isPublicRoute(path)) {
      // Don't redirect authenticated users from public routes to avoid loops
      return NextResponse.next();
    }

    // Handle dashboard redirect
    if (path === "/dashboard") {
      if (isAuthenticated && token?.role) {
        const dashboardRoute = getDashboardRoute(
          token.role as UserRole,
          token.id as string,
        );
        return NextResponse.redirect(new URL(dashboardRoute, req.url));
      } else {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // Protect non-public routes
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }

    // Check role-based access
    if (path.startsWith("/admin") && token?.role !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (
      path.startsWith("/organizer") &&
      token?.role !== UserRole.ORGANIZER &&
      token?.role !== UserRole.ADMIN
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - api/webhooks (webhook routes)
     * - api/public (public API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api/auth|api/webhooks|api/public|_next/static|_next/image|favicon.ico|.*\\..*).+)",
    "/",
    "/dashboard",
  ],
};
