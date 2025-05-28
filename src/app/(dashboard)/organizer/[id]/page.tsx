"use client";

import { useParams } from "next/navigation";
import { useOrganizerDashboardRedirect } from "~/lib/hooks/use-dashboard-redirect";
import { RedirectLoading } from "~/components/ui/redirect-loading";

export default function Page() {
  const params = useParams();
  const organizerId = params.id as string;

  // Use the shared redirect hook for consistent behavior
  useOrganizerDashboardRedirect(organizerId);

  // Show loading state while redirecting
  return <RedirectLoading message="Redirecting to organizer dashboard..." />;
}
