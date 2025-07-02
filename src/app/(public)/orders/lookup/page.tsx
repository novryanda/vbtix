"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, ArrowLeft, Mail, Receipt } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { MagicInput } from "~/components/ui/magic-card";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { MagicCard } from "~/components/ui/magic-card";
import { toast } from "sonner";

// Validation schema
const lookupSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  email: z.string().email("Please enter a valid email address"),
});

type LookupFormValues = z.infer<typeof lookupSchema>;

export default function OrderLookupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LookupFormValues>({
    resolver: zodResolver(lookupSchema),
    defaultValues: {
      orderId: "",
      email: "",
    },
  });

  const onSubmit = async (data: LookupFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/public/orders/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to lookup order");
      }

      if (result.success) {
        // Store lookup data temporarily for the order detail page
        const lookupData = {
          orderId: data.orderId,
          email: data.email,
          sessionId: result.data.sessionId,
          isGuestOrder: result.data.isGuestOrder,
        };
        
        // Store in sessionStorage for the order detail page
        sessionStorage.setItem("order_lookup_data", JSON.stringify(lookupData));

        toast.success("Order found!", {
          description: "Redirecting to order details...",
        });

        // Redirect to order detail page
        router.push(`/orders/${data.orderId}`);
      } else {
        throw new Error(result.error || "Order not found");
      }
    } catch (err: any) {
      console.error("Error looking up order:", err);
      setError(err.message || "Failed to lookup order. Please try again.");
      toast.error("Order lookup failed", {
        description: err.message || "Please check your order ID and email.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cari Pesanan</h1>
            <p className="text-gray-600">
              Masukkan ID pesanan dan email untuk melihat detail pesanan Anda
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-md">
          <MagicCard className="p-0">
            <Card className="border-0 shadow-none">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Lookup Order</CardTitle>
                <p className="text-sm text-gray-600">
                  Enter your order details to view your order status and tickets
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Order ID Field */}
                  <div className="space-y-2">
                    <Label htmlFor="orderId" className="flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      Order ID
                    </Label>
                    <MagicInput
                      id="orderId"
                      type="text"
                      placeholder="Enter your order ID"
                      {...register("orderId")}
                      className={errors.orderId ? "border-red-500" : ""}
                    />
                    {errors.orderId && (
                      <p className="text-sm text-red-600">{errors.orderId.message}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <MagicInput
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      {...register("email")}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Find My Order
                      </>
                    )}
                  </Button>
                </form>

                {/* Help Text */}
                <div className="mt-6 rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-2 text-sm font-medium text-gray-900">
                    Need help finding your order?
                  </h3>
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li>• Check your email for the order confirmation</li>
                    <li>• Order ID is usually in the format: ORG-XXXXXXXXX-XXX</li>
                    <li>• Use the same email address you used when placing the order</li>
                    <li>• Contact support if you still can't find your order</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </MagicCard>
        </div>
      </div>
    </div>
  );
}
