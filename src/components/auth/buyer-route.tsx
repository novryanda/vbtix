"use client";

import { UserRole } from "@prisma/client";
import { ProtectedRoute } from "./protected-route";

interface BuyerRouteProps {
  children: React.ReactNode;
}

/**
 * Komponen untuk melindungi rute buyer
 */
export function BuyerRoute({ children }: BuyerRouteProps) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.ORGANIZER, UserRole.ADMIN]}>
      {children}
    </ProtectedRoute>
  );
}
