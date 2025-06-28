"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface TestPaymentInstructionsProps {
  paymentId: string;
  orderId: string;
  instructions: string;
  onPaymentComplete?: (success: boolean) => void;
}

export function TestPaymentInstructions({
  paymentId,
  orderId,
  instructions,
  onPaymentComplete,
}: TestPaymentInstructionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const handleTestPayment = async (success: boolean) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/public/test-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId,
          orderId,
          success,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to process payment");
      }

      setCompleted(true);

      // Show success/failure toast
      if (success) {
        toast.success("Payment Successful!", {
          description: "Your transaction has been completed successfully.",
        });
      } else {
        toast.error("Payment Failed", {
          description: "Your transaction has been marked as failed.",
        });
      }

      onPaymentComplete?.(success);
    } catch (err: any) {
      console.error("Error processing payment:", err);
      setError(err.message || "Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  if (completed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Payment Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Payment has been completed successfully. You will be
              redirected shortly.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Payment Instructions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-gray-50 p-4">
          <pre className="font-mono text-sm whitespace-pre-wrap">
            {instructions}
          </pre>
        </div>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button
            onClick={() => handleTestPayment(true)}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Simulasi Pembayaran Berhasil
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => handleTestPayment(false)}
            disabled={isProcessing}
            className="flex-1"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Simulasi Pembayaran Gagal
          </Button>
        </div>

        <p className="text-muted-foreground text-center text-sm">
          Pilih salah satu tombol di atas untuk melanjutkan simulasi pembayaran.
        </p>
      </CardContent>
    </Card>
  );
}
