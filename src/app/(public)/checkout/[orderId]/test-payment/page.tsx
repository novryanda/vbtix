"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  ArrowLeft,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";

interface TestPaymentPageProps {
  params: Promise<{ orderId: string }>;
}

export default function TestPaymentPage({ params }: TestPaymentPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending");
  const [error, setError] = useState("");

  const paymentToken = searchParams.get("token");

  // Unwrap params
  useEffect(() => {
    const unwrapParams = async () => {
      const { orderId: id } = await params;
      setOrderId(id);
    };
    unwrapParams();
  }, [params]);

  const simulatePayment = async (success: boolean) => {
    setIsProcessing(true);
    setError("");

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call payment callback API to update order status
      const response = await fetch("/api/public/checkout/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          paymentId: paymentToken || `test_payment_${Date.now()}`,
          status: success ? "COMPLETED" : "FAILED",
          paymentReference: `test_ref_${Date.now()}`,
          callbackPayload: {
            test: true,
            timestamp: new Date().toISOString(),
            success,
          },
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to process payment");
      }

      setPaymentStatus(success ? "success" : "failed");

      if (success) {
        toast.success("Test payment successful!");
        // Redirect to success page after a short delay
        setTimeout(() => {
          router.push(`/checkout/success?orderId=${orderId}`);
        }, 1500);
      } else {
        toast.error("Test payment failed!");
      }
    } catch (err: any) {
      console.error("Error processing test payment:", err);
      setError(err.message || "Failed to process payment");
      setPaymentStatus("failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuccessPayment = () => simulatePayment(true);
  const handleFailedPayment = () => simulatePayment(false);

  const handleBackToOrder = () => {
    router.push(`/checkout/${orderId}`);
  };

  if (!orderId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center p-12">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleBackToOrder}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold">Test Payment</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="mx-auto max-w-md">
          {/* Test Mode Alert */}
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Test Mode:</strong> This is a simulated payment environment. 
              No real money will be charged.
            </AlertDescription>
          </Alert>

          {/* Payment Status */}
          {paymentStatus !== "pending" && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="text-center">
                  {paymentStatus === "success" ? (
                    <>
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h2 className="mb-2 text-xl font-bold text-green-600">
                        Payment Successful!
                      </h2>
                      <p className="text-gray-600">
                        Your test payment has been processed successfully.
                      </p>
                      <Badge className="mt-2" variant="default">
                        Redirecting to success page...
                      </Badge>
                    </>
                  ) : (
                    <>
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <XCircle className="h-8 w-8 text-red-600" />
                      </div>
                      <h2 className="mb-2 text-xl font-bold text-red-600">
                        Payment Failed!
                      </h2>
                      <p className="text-gray-600">
                        Your test payment simulation failed.
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Payment Simulation */}
          {paymentStatus === "pending" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Simulate Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Choose how you want to simulate the payment process:
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleSuccessPayment}
                    disabled={isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Simulate Successful Payment
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleFailedPayment}
                    disabled={isProcessing}
                    variant="destructive"
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Simulate Failed Payment
                      </>
                    )}
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500 text-center">
                    Order ID: {orderId}
                    {paymentToken && (
                      <>
                        <br />
                        Payment Token: {paymentToken}
                      </>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Back Button for Failed Payments */}
          {paymentStatus === "failed" && (
            <div className="mt-6">
              <Button
                onClick={handleBackToOrder}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Order
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
