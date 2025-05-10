import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { UserRole } from "@prisma/client";
import { getDashboardRoute } from "~/server/services/auth.service";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const publicRoutes = ["/login", "/register", "/verify-email", "/reset-password"];
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET }); // Pass the secret here
  const isAuthenticated = !!token;

  if (publicRoutes.some(route => path.startsWith(route)) && isAuthenticated) {
    const dashboardRoute = getDashboardRoute(token.role as UserRole);
    return NextResponse.redirect(new URL(dashboardRoute, req.url));
  }

  if (!publicRoutes.some(route => path.startsWith(route)) && !isAuthenticated) {
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
