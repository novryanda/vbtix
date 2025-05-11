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

/**
 * Middleware untuk memeriksa autentikasi dan otorisasi
 */
export async function authMiddleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = !!token;

  // Jika pengguna sudah login dan mencoba mengakses halaman publik, alihkan ke dashboard
  if (isPublicRoute(path) && isAuthenticated && token && token.role) {
    const dashboardRoute = getDashboardRoute(token.role as UserRole);
    return NextResponse.redirect(new URL(dashboardRoute, req.url));
  }

  // Jika pengguna belum login dan mencoba mengakses halaman yang memerlukan autentikasi, alihkan ke login
  if (!isPublicRoute(path) && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    // Tambahkan callbackUrl sebagai query parameter untuk redirect kembali setelah login
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  if (path === "/" || path === "/dashboard") {
    if (isAuthenticated && token && token.role) {
      const dashboardRoute = getDashboardRoute(token.role as UserRole);
      return NextResponse.redirect(new URL(dashboardRoute, req.url));
    } else {
      // Redirect ke halaman login jika belum login
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

/**
 * Middleware untuk memeriksa peran pengguna
 * @param req - NextRequest object
 * @param allowedRoles - Array of allowed roles
 * @returns NextResponse or null if authorized
 */
export async function roleMiddleware(
  req: NextRequest,
  allowedRoles: UserRole[],
) {
  const path = req.nextUrl.pathname;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = token.role as UserRole;

  if (!allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    const dashboardRoute = getDashboardRoute(userRole);
    return NextResponse.redirect(new URL(dashboardRoute, req.url));
  }

  // User is authorized, continue
  return null;
}

/**
 * Middleware untuk rute admin
 */
export async function adminMiddleware(req: NextRequest) {
  return roleMiddleware(req, [UserRole.ADMIN]);
}

/**
 * Middleware untuk rute organizer
 */
export async function organizerMiddleware(req: NextRequest) {
  return roleMiddleware(req, [UserRole.ORGANIZER, UserRole.ADMIN]);
}

/**
 * Middleware untuk rute buyer
 */
export async function buyerMiddleware(req: NextRequest) {
  return roleMiddleware(req, [
    UserRole.BUYER,
    UserRole.ORGANIZER,
    UserRole.ADMIN,
  ]);
}

export async function middleware(req: NextRequest) {
  try {
    // Gunakan authMiddleware yang sudah ada untuk menangani autentikasi dan otorisasi
    return await authMiddleware(req);
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/login",
    "/register",
    "/verify-email",
    "/reset-password",
    "/admin/:path*",
    "/organizer/:path*",
    "/buyer/:path*",
  ],
};
