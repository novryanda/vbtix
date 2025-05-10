import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";
import { AuthState, LoginCredentials } from "~/lib/types";
import { getDashboardRoute, getAuthErrorMessage } from "~/lib/auth-utils";

/**
 * Hook untuk mengakses state dan metode autentikasi
 *
 * Menyediakan:
 * - Informasi pengguna saat ini
 * - Status autentikasi
 * - Pemeriksaan peran
 * - Metode login dan logout
 */
export function useAuth(): AuthState & {
  login: (credentials?: LoginCredentials) => Promise<any>;
  logout: () => Promise<any>;
  redirectToDashboard: () => void;
  getErrorMessage: (error?: string | null) => string;
} {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  /**
   * Mengalihkan pengguna ke dashboard yang sesuai dengan peran mereka
   */
  const redirectToDashboard = () => {
    if (session?.user?.role) {
      const dashboardRoute = getDashboardRoute(session.user.role);
      router.push(dashboardRoute);
    } else {
      router.push("/");
    }
  };

  /**
   * Mendapatkan pesan error berdasarkan kode error
   */
  const getErrorMessage = (error?: string | null) => {
    return getAuthErrorMessage(error);
  };

  return {
    user: session?.user || null,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    // Pemeriksaan berbasis peran
    isAdmin: session?.user?.role === UserRole.ADMIN,
    isOrganizer: session?.user?.role === UserRole.ORGANIZER,
    isBuyer: session?.user?.role === UserRole.BUYER,
    // Tindakan autentikasi
    login: async (credentials?: LoginCredentials) => {
      if (credentials) {
        return signIn("credentials", {
          email: credentials.email,
          password: credentials.password,
          redirect: true,
          callbackUrl: credentials.callbackUrl || "/",
        });
      }
      return signIn("google", { redirect: true, callbackUrl: "/" });
    },
    logout: () => signOut({ callbackUrl: "/" }),
    // Pengalihan dashboard
    redirectToDashboard,
    // Mendapatkan pesan error
    getErrorMessage,
  };
}