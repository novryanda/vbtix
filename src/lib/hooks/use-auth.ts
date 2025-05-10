import { useSession, signIn, signOut } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { AuthState, LoginCredentials } from "~/lib/types";

/**
 * Hook for accessing authentication state and methods
 */
export function useAuth(): AuthState & {
  login: (credentials?: LoginCredentials) => Promise<any>;
  logout: () => Promise<any>;
} {
  const { data: session, status } = useSession();

  return {
    user: session?.user || null,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    // Role-based checks
    isAdmin: session?.user?.role === UserRole.ADMIN,
    isOrganizer: session?.user?.role === UserRole.ORGANIZER,
    isBuyer: session?.user?.role === UserRole.BUYER,
    // Auth actions
    login: (credentials?: LoginCredentials) => {
      if (credentials) {
        return signIn("credentials", {
          email: credentials.email,
          password: credentials.password,
          redirect: true,
          callbackUrl: credentials.callbackUrl || "/",
        });
      }
      return signIn(undefined, { redirect: true, callbackUrl: "/" });
    },
    logout: () => signOut({ callbackUrl: "/" }),
  };
}