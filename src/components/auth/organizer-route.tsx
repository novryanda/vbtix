"use client";

import { UserRole } from "@prisma/client";
import { ProtectedRoute } from "./protected-route";

interface OrganizerRouteProps {
  children: React.ReactNode;
}

/**
 * Komponen untuk melindungi rute organizer
 */
export function OrganizerRoute({ children }: OrganizerRouteProps) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ORGANIZER, UserRole.ADMIN]}>
      {children}
    </ProtectedRoute>
  );
}
