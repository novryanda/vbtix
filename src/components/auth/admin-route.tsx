"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { getDashboardRoute } from "~/lib/auth";
import { LoadingSpinner } from "~/components/ui/loading-spinner"; // Pastikan komponen ini ada

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Komponen untuk melindungi rute admin
 * Hanya pengguna dengan role ADMIN yang dapat mengakses
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const isAdmin = session?.user?.role === UserRole.ADMIN;

  useEffect(() => {
    // Jika sudah selesai loading dan pengguna tidak terautentikasi, redirect ke login
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // Jika sudah selesai loading, terautentikasi, tapi bukan admin, redirect ke dashboard sesuai role
    if (!isLoading && isAuthenticated && !isAdmin) {
      const dashboardRoute = getDashboardRoute(session?.user?.role);
      router.push(dashboardRoute);
    }
  }, [isLoading, isAuthenticated, isAdmin, router, session?.user?.role]);

  // Tampilkan loading spinner saat sedang memeriksa status autentikasi
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Jika bukan admin, jangan tampilkan apa-apa (akan di-redirect)
  if (!isAdmin) {
    return null;
  }

  // Jika admin, tampilkan konten
  return <>{children}</>;
}
