"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";
import { getDashboardRoute } from "~/lib/auth";

/**
 * Hook untuk mengakses status autentikasi di sisi klien
 * Menyediakan informasi user, status loading, dan fungsi-fungsi autentikasi
 */
export const useAuth = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const user = session?.user;

  /**
   * Fungsi untuk login dengan kredensial (email/password)
   */
  const login = async (email: string, password: string, callbackUrl?: string) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: result.error };
      }

      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        redirectToDashboard();
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "Terjadi kesalahan saat login" };
    }
  };

  /**
   * Fungsi untuk login dengan Google
   */
  const loginWithGoogle = async (callbackUrl?: string) => {
    await signIn("google", { callbackUrl });
  };

  /**
   * Fungsi untuk logout
   */
  const logout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  /**
   * Fungsi untuk mengalihkan ke dashboard berdasarkan peran
   */
  const redirectToDashboard = () => {
    if (!user?.role) return;

    const dashboardRoute = getDashboardRoute(user.role);
    router.push(dashboardRoute);
  };

  /**
   * Memeriksa apakah pengguna memiliki peran tertentu
   */
  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user?.role) return false;

    if (Array.isArray(role)) {
      return role.includes(user.role);
    }

    return user.role === role;
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    loginWithGoogle,
    logout,
    redirectToDashboard,
    hasRole,
  };
};