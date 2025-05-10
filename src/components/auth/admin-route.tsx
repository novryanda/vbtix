"use client";

import { UserRole } from "@prisma/client";
import { ProtectedRoute } from "./protected-route";

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Komponen untuk melindungi rute admin
 */
export function AdminRoute({ children }: AdminRouteProps) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
      {children}
    </ProtectedRoute>
  );
}
