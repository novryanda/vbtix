"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/lib/hooks/use-auth";
import { UserRole } from "@prisma/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * Higher-Order Component untuk melindungi rute yang memerlukan autentikasi
 * dan/atau peran tertentu
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Tunggu hingga status autentikasi dimuat
    if (isLoading) return;

    // Jika tidak terautentikasi, alihkan ke halaman login
    if (!isAuthenticated) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Jika ada peran yang diizinkan dan pengguna tidak memiliki peran yang diperlukan
    if (allowedRoles && allowedRoles.length > 0 && user?.role) {
      if (!allowedRoles.includes(user.role)) {
        // Alihkan ke halaman yang sesuai berdasarkan peran pengguna
        switch (user.role) {
          case UserRole.ADMIN:
            router.replace("/admin");
            break;
          case UserRole.ORGANIZER:
            router.replace("/organizer");
            break;
          case UserRole.BUYER:
          default:
            router.replace("/buyer");
            break;
        }
      }
    }
  }, [isLoading, isAuthenticated, user, router, allowedRoles]);

  // Tampilkan loading state saat memeriksa autentikasi
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Memuat...</h2>
          <p className="text-muted-foreground">Mohon tunggu sebentar.</p>
        </div>
      </div>
    );
  }

  // Jika tidak terautentikasi, tampilkan loading state saat mengalihkan
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Mengalihkan ke halaman login...</h2>
          <p className="text-muted-foreground">Anda perlu login untuk mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  // Jika ada peran yang diizinkan dan pengguna tidak memiliki peran yang diperlukan
  if (allowedRoles && allowedRoles.length > 0 && user?.role) {
    if (!allowedRoles.includes(user.role)) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Akses Ditolak</h2>
            <p className="text-muted-foreground">
              Anda tidak memiliki izin untuk mengakses halaman ini.
            </p>
          </div>
        </div>
      );
    }
  }

  // Jika terautentikasi dan memiliki peran yang diperlukan, tampilkan konten
  return <>{children}</>;
}
