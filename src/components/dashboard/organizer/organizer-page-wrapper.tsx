"use client";

import { ReactNode } from "react";
import { useParams } from "next/navigation";
import { VerificationWarning } from "./verification-warning";
import { useOrganizerSettings } from "~/lib/api/hooks/organizer";

interface OrganizerPageWrapperProps {
  children: ReactNode;
}

export function OrganizerPageWrapper({ children }: OrganizerPageWrapperProps) {
  const params = useParams();
  const organizerId = params?.id as string;
  
  // Fetch organizer settings to check verification status
  const { settings, isLoading } = useOrganizerSettings(organizerId);
  
  const showVerificationWarning = settings && !settings.verified;
  const verificationDocs = settings?.verificationDocs || null;

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Verification Warning */}
      {showVerificationWarning && organizerId && (
        <div className="px-4 lg:px-6">
          <VerificationWarning
            organizerId={organizerId}
            verificationDocs={verificationDocs}
          />
        </div>
      )}
      
      {/* Page Content */}
      {children}
    </div>
  );
}
