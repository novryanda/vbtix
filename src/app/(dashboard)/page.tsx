"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/lib/hooks/use-auth";
import { getDashboardRoute } from "~/config/dashboard";

/**
 * Dashboard page that redirects users to their role-specific dashboard
 * This is the central redirection handler after login
 */
export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Wait until auth state is loaded
    if (isLoading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Get the appropriate dashboard route based on user role
    const role = user?.role;
    const dashboardRoute = getDashboardRoute(role);

    // Redirect to the appropriate dashboard
    router.replace(dashboardRoute);
  }, [user, isLoading, isAuthenticated, router]);

  // Show loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Mengarahkan ke dashboard Anda...</h2>
        <p className="text-muted-foreground">Mohon tunggu sebentar.</p>
      </div>
    </div>
  );
}
