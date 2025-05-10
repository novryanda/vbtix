import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@prisma/client";
import { getDashboardRoute, isPublicRoute, publicRoutes } from "~/server/auth";

export async function middleware(req: NextRequest) {
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

export const config = {
  matcher: ["/", "/dashboard", "/login", "/register", "/verify-email", "/reset-password", "/admin/:path*", "/organizer/:path*", "/buyer/:path*"],
};
