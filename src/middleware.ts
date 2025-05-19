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

// Buyer routes are public but can have enhanced features when logged in
const publicBuyerRoutes = ["/buyer", "/buyer/events", "/buyer/about"];

// Memeriksa apakah rute adalah rute publik
function isPublicRoute(path: string) {
  // Cek apakah path cocok dengan salah satu rute publik
  if (publicRoutes.includes(path)) return true;

  // Cek apakah path cocok dengan salah satu rute buyer publik
  if (publicBuyerRoutes.includes(path)) return true;

  // Cek apakah path dimulai dengan salah satu prefiks publik
  if (
    path.startsWith("/api/auth/") ||
    path.startsWith("/api/webhooks/") ||
    path.startsWith("/api/revalidate/") ||
    path.startsWith("/reset-password/") ||
    path.startsWith("/verify/") ||
    path.startsWith("/buyer/events/") // Allow access to individual event pages
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
      return "/buyer";
  }
}

/**
 * Middleware untuk memeriksa autentikasi dan otorisasi
 */
export async function authMiddleware(req: NextRequest) {
  try {
    const path = req.nextUrl.pathname;

    // Tambahkan pengecekan untuk NEXTAUTH_SECRET
    if (!process.env.NEXTAUTH_SECRET) {
      console.error("NEXTAUTH_SECRET is not defined");
      return NextResponse.next();
    }

    // Gunakan try/catch untuk getToken
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

    // Special handling for root path - always redirect to buyer page if not authenticated
    if (path === "/" && !isAuthenticated) {
      return NextResponse.redirect(new URL("/buyer", req.url));
    }

    // Jika pengguna sudah login dan mencoba mengakses halaman publik, alihkan ke dashboard
    if (isPublicRoute(path) && isAuthenticated && token && token.role) {
      const dashboardRoute = getDashboardRoute(
        token.role as UserRole,
        token.id as string,
      );
      return NextResponse.redirect(new URL(dashboardRoute, req.url));
    }

    // Jika pengguna belum login dan mencoba mengakses halaman yang memerlukan autentikasi, alihkan ke login
    if (!isPublicRoute(path) && !isAuthenticated) {
      const loginUrl = new URL("/login", req.url);
      // Tambahkan callbackUrl sebagai query parameter untuk redirect kembali setelah login
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }

    // Handle /dashboard path
    if (path === "/dashboard") {
      if (isAuthenticated && token && token.role) {
        const dashboardRoute = getDashboardRoute(
          token.role as UserRole,
          token.id as string,
        );
        return NextResponse.redirect(new URL(dashboardRoute, req.url));
      } else {
        // Redirect to buyer page instead of login
        return NextResponse.redirect(new URL("/buyer", req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Unexpected error in authMiddleware:", error);
    return NextResponse.next();
  }
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
  try {
    const path = req.nextUrl.pathname;

    // Tambahkan pengecekan untuk NEXTAUTH_SECRET
    if (!process.env.NEXTAUTH_SECRET) {
      console.error("NEXTAUTH_SECRET is not defined");
      return NextResponse.next();
    }

    // Gunakan try/catch untuk getToken
    let token;
    try {
      token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });
    } catch (error) {
      console.error("Error getting token in roleMiddleware:", error);
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }

    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }

    // Pastikan token.role ada sebelum menggunakannya
    if (!token.role) {
      console.error("Token exists but role is undefined");
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = token.role as UserRole;

    if (!allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on role
      const dashboardRoute = getDashboardRoute(userRole, token.id as string);
      return NextResponse.redirect(new URL(dashboardRoute, req.url));
    }

    // User is authorized, continue
    return null;
  } catch (error) {
    console.error("Unexpected error in roleMiddleware:", error);
    return NextResponse.next();
  }
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
 *
 * Buyer routes are special - they're public by default, but some features
 * may require authentication (like viewing tickets or orders)
 */
export async function buyerMiddleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Check if this is a public buyer route
  if (isPublicRoute(path)) {
    return NextResponse.next();
  }

  // For protected buyer routes (like /buyer/tickets or /buyer/orders)
  // we use the role middleware to ensure the user is authenticated
  return roleMiddleware(req, [
    UserRole.BUYER,
    UserRole.ORGANIZER,
    UserRole.ADMIN,
  ]);
}

export async function middleware(req: NextRequest) {
  try {
    // Tambahkan logging untuk debugging
    console.log(`Processing middleware for path: ${req.nextUrl.pathname}`);

    // Periksa apakah req.url valid
    if (!req.url) {
      console.error("req.url is undefined or null");
      return NextResponse.next();
    }

    const path = req.nextUrl.pathname;

    // Handle buyer routes specially
    if (path.startsWith("/buyer")) {
      return await buyerMiddleware(req);
    }

    // For all other routes, use the standard auth middleware
    return await authMiddleware(req);
  } catch (error) {
    console.error("Middleware error:", error);
    // Tambahkan detail error untuk debugging
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}, message: ${error.message}`);
      console.error(`Stack trace: ${error.stack}`);
    }
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
