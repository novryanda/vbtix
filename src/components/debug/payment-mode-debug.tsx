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
            <strong>NEXT_PUBLIC_XENDIT_ENABLED:</strong> &quot;
            {xenditEnabled ?? "undefined"}&quot;
          </div>
          <div>
            <strong>Current Mode:</strong> {isTestMode ? "MOCK" : "LIVE"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
