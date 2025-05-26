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
  const login = async (
    email: string,
    password: string,
    callbackUrl?: string,
  ) => {
    console.log("[useAuth] Starting credentials login...", {
      email,
      callbackUrl,
      timestamp: new Date().toISOString(),
    });

    try {
      console.log("[useAuth] Calling signIn with credentials...");
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: callbackUrl || "/dashboard",
        redirect: true, // Let NextAuth handle the redirect
      });

      console.log("[useAuth] SignIn result:", result);

      // If we reach here, it means redirect: true didn't work
      // This should not happen normally, but handle it as fallback
      if (result?.error) {
        console.log("[useAuth] SignIn error:", result.error);
        return { success: false, error: result.error };
      }

      console.log("[useAuth] SignIn successful");
      return { success: true };
    } catch (error) {
      console.error("[useAuth] Login error:", error);
      return { success: false, error: "Terjadi kesalahan saat login" };
    }
  };

  /**
   * Fungsi untuk login dengan Google
   */
  const loginWithGoogle = async (callbackUrl?: string) => {
    const finalCallbackUrl = callbackUrl || "/dashboard";
    console.log("[useAuth] Starting Google login...", {
      callbackUrl: finalCallbackUrl,
      timestamp: new Date().toISOString(),
    });

    try {
      console.log("[useAuth] Calling signIn with Google provider...");
      await signIn("google", {
        callbackUrl: finalCallbackUrl,
        redirect: true,
      });
      console.log("[useAuth] Google signIn called successfully");
    } catch (error) {
      console.error("[useAuth] Google login error:", error);
      throw error;
    }
  };

  /**
   * Fungsi untuk logout
   */
  const logout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  /**
   * Fungsi untuk mengalihkan ke dashboard berdasarkan peran
   */
  const redirectToDashboard = () => {
    if (!user?.role) return;

    const dashboardRoute = getDashboardRoute(user.role, user.id);
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
