"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export interface RedirectConfig {
  /** Target path to redirect to */
  targetPath: string;
  /** Whether to replace the current history entry (default: true) */
  replace?: boolean;
  /** Whether to check authentication before redirecting (default: false) */
  requireAuth?: boolean;
  /** Fallback path if authentication check fails */
  fallbackPath?: string;
}

/**
 * Custom hook for handling dashboard redirects in a clean and consistent way
 * 
 * @param config - Redirect configuration
 * @returns Object with redirect status and session data
 */
export function useDashboardRedirect(config: RedirectConfig) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    targetPath,
    replace = true,
    requireAuth = false,
    fallbackPath = "/login"
  } = config;

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  useEffect(() => {
    // Don't redirect while session is still loading
    if (isLoading) return;

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      const redirectMethod = replace ? router.replace : router.push;
      redirectMethod(fallbackPath);
      return;
    }

    // If authentication is not required OR user is authenticated, proceed with redirect
    if (!requireAuth || isAuthenticated) {
      const redirectMethod = replace ? router.replace : router.push;
      redirectMethod(targetPath);
    }
  }, [
    targetPath,
    replace,
    requireAuth,
    fallbackPath,
    isLoading,
    isAuthenticated,
    router
  ]);

  return {
    isLoading,
    isAuthenticated,
    session,
    isRedirecting: !isLoading
  };
}

/**
 * Hook for admin dashboard redirect
 */
export function useAdminDashboardRedirect() {
  return useDashboardRedirect({
    targetPath: "/admin/dashboard",
    replace: true,
    requireAuth: false // AdminRoute component handles auth
  });
}

/**
 * Hook for organizer dashboard redirect with dynamic ID
 */
export function useOrganizerDashboardRedirect(organizerId: string) {
  return useDashboardRedirect({
    targetPath: `/organizer/${organizerId}/dashboard`,
    replace: true,
    requireAuth: false
  });
}

/**
 * Hook for organizer redirect with session-based ID resolution
 */
export function useOrganizerRedirectWithSession() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  useEffect(() => {
    // Don't redirect while session is still loading
    if (isLoading) return;

    if (isAuthenticated && session?.user?.id) {
      // If user is logged in and has an organizerId, redirect to their dashboard
      router.replace(`/organizer/${session.user.id}/dashboard`);
    } else {
      // If not logged in, redirect to login
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, session?.user?.id, router]);

  return {
    isLoading,
    isAuthenticated,
    session,
    isRedirecting: !isLoading
  };
}
