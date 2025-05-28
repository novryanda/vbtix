"use client";

import { useOrganizerRedirectWithSession } from "~/lib/hooks/use-dashboard-redirect";
import { RedirectLoading } from "~/components/ui/redirect-loading";

export default function Page() {
  // Use the shared redirect hook with session-based logic
  const { isLoading } = useOrganizerRedirectWithSession();

  // Show loading state while redirecting
  return (
    <RedirectLoading
      message={
        isLoading ? "Loading..." : "Redirecting to organizer dashboard..."
      }
    />
  );
}
