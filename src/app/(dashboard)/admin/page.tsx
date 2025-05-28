"use client";

import { AdminRoute } from "~/components/auth/admin-route";
import { useAdminDashboardRedirect } from "~/lib/hooks/use-dashboard-redirect";
import { RedirectLoading } from "~/components/ui/redirect-loading";

export default function Page() {
  // Use the shared redirect hook for consistent behavior
  useAdminDashboardRedirect();

  // Show loading state while redirecting
  return (
    <AdminRoute>
      <RedirectLoading message="Redirecting to admin dashboard..." />
    </AdminRoute>
  );
}
