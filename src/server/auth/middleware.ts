import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@prisma/client";
import { getDashboardRoute, isPublicRoute } from "./index";

/**
 * Middleware untuk memeriksa autentikasi dan otorisasi
 * Fungsi ini dapat digunakan di middleware.ts utama
 */
export async function authMiddleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = !!token;

  // Jika pengguna sudah login dan mencoba mengakses halaman publik, alihkan ke dashboard
  if (isPublicRoute(path) && isAuthenticated) {
    const dashboardRoute = getDashboardRoute(token.role as UserRole);
    return NextResponse.redirect(new URL(dashboardRoute, req.url));
  }

  // Jika pengguna belum login dan mencoba mengakses halaman yang memerlukan autentikasi, alihkan ke login
  if (!isPublicRoute(path) && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", encodeURI(req.url));
    return NextResponse.redirect(loginUrl);
  }

  if (path === "/" || path === "/dashboard") {
    const dashboardRoute = getDashboardRoute(token.role as UserRole);
    return NextResponse.redirect(new URL(dashboardRoute, req.url));
  }

  return NextResponse.next();
}

/**
 * Middleware untuk memeriksa peran pengguna
 * @param req - NextRequest object
 * @param allowedRoles - Array of allowed roles
 * @returns NextResponse or null if authorized
 */
export async function roleMiddleware(req: NextRequest, allowedRoles: UserRole[]) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", encodeURI(req.url));
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
  return roleMiddleware(req, [UserRole.BUYER, UserRole.ORGANIZER, UserRole.ADMIN]);
}