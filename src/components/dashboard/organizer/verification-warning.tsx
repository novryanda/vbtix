"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";

interface VerificationWarningProps {
  organizerId: string;
  verificationDocs?: string | null;
}

export function VerificationWarning({
  organizerId,
  verificationDocs,
}: VerificationWarningProps) {
  const router = useRouter();

  const handleRedirect = () => {
    router.push(`/organizer/${organizerId}/verification`);
  };

  // If verification documents have been submitted but not yet approved
  if (verificationDocs) {
    return (
      <Alert className="mb-6 border-amber-200 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Verification Pending</AlertTitle>
        <AlertDescription className="text-amber-700">
          <p>
            Your verification documents have been submitted and are pending review by our team.
            Some features may be limited until your account is verified.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // If no verification documents have been submitted
  return (
    <Alert className="mb-6 border-red-200 bg-red-50">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-800">Account Not Verified</AlertTitle>
      <AlertDescription className="flex flex-col space-y-2 text-red-700">
        <p>
          Your organizer account is not verified. You cannot create or publish events until your account is verified.
        </p>
        <div>
          <Button 
            variant="outline" 
            className="mt-2 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleRedirect}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Verify Your Account
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
