"use client";

import { Alert, AlertDescription } from "~/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function PaymentModeDebug() {
  const xenditEnabled = process.env.NEXT_PUBLIC_XENDIT_ENABLED;
  const isTestMode = xenditEnabled !== "true";

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">Payment Mode Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div>
            <strong>NEXT_PUBLIC_XENDIT_ENABLED:</strong> "{xenditEnabled || 'undefined'}"
          </div>
          <div>
            <strong>Is Test Mode:</strong> {isTestMode ? "Yes" : "No"}
          </div>
          <div>
            <strong>Current Mode:</strong> {isTestMode ? "TEST" : "PRODUCTION"}
          </div>
        </div>
        
        {isTestMode && (
          <Alert className="mt-3">
            <AlertDescription>
              Test mode is active. Mock payments will be used.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
