"use client";

import { AdminRoute } from "~/components/auth/admin-route";

export default function Page() {
  // Redirect to the dashboard page
  return (
    <AdminRoute>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Redirect to dashboard page */}
        {typeof window !== "undefined" &&
          (window.location.href = "/admin/dashboard")}
        <div className="flex items-center justify-center p-8">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <span className="ml-2">Redirecting to dashboard...</span>
        </div>
      </div>
    </AdminRoute>
  );
}
