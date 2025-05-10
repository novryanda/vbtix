import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@prisma/client";

// Daftar rute publik yang tidak memerlukan autentikasi
const publicRoutes = [
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
    path.startsWith("/verify/")
  ) {
    return true;
  }

  return false;
}

// Mendapatkan rute dashboard berdasarkan peran pengguna
function getDashboardRoute(role?: UserRole | string | null) {
  if (!role) return "/";

  switch (role) {
    case UserRole.ADMIN:
      return "/admin";
    case UserRole.ORGANIZER:
      return "/organizer";
    case UserRole.BUYER:
    default:
      return "/buyer";
  }
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  try {
    const token = await getToken({ req });
    const isAuthenticated = !!token;

    // Jika pengguna sudah login dan mencoba mengakses halaman publik, alihkan ke dashboard
    if (isPublicRoute(path) && isAuthenticated && token && token.role) {
      const dashboardRoute = getDashboardRoute(token.role as UserRole);
      return NextResponse.redirect(new URL(dashboardRoute, req.url));
    }

    // Jika pengguna belum login dan mencoba mengakses halaman yang memerlukan autentikasi, alihkan ke login
    if (!isPublicRoute(path) && !isAuthenticated) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    // Redirect root path to appropriate dashboard
    if (path === "/" || path === "/dashboard") {
      if (isAuthenticated && token && token.role) {
        const dashboardRoute = getDashboardRoute(token.role as UserRole);
        return NextResponse.redirect(new URL(dashboardRoute, req.url));
      } else {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }
  } catch (error) {
    console.error("Middleware error:", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard", "/login", "/register", "/verify-email", "/reset-password", "/admin/:path*", "/organizer/:path*", "/buyer/:path*"],
};
