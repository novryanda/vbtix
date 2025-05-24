import { NextRequest, NextResponse } from "next/server";
import { handlePaymentCallback } from "~/server/api/checkout";
import { auth } from "~/server/auth";
import { z } from "zod";

// Validation schema for test payment completion
const testPaymentSchema = z.object({
  paymentId: z.string(),
  orderId: z.string(),
  success: z.boolean().default(true),
});

/**
 * POST /api/public/test-payment
 * Complete a test payment (for testing purposes only)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
          message: "Please log in to complete test payment",
        },
        { status: 401 },
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate request body
    const validatedData = testPaymentSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: validatedData.error.format(),
        },
        { status: 400 },
      );
    }

    const { paymentId, orderId, success: paymentSuccess } = validatedData.data;

    // Process test payment callback
    const result = await handlePaymentCallback({
      orderId,
      paymentId,
      status: "PENDING", // Will be overridden by mockStatus
      mockStatus: paymentSuccess ? "SUCCESS" : "FAILED",
      paymentReference: `test_ref_${Date.now()}`,
      callbackPayload: {
        test: true,
        completedAt: new Date().toISOString(),
        success: paymentSuccess,
      },
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: result.order.id,
          status: result.order.status,
          invoiceNumber: result.order.invoiceNumber,
        },
        payment: {
          id: result.payment.id,
          status: result.payment.status,
        },
      },
      message: paymentSuccess 
        ? "Test payment completed successfully!" 
        : "Test payment failed as requested.",
    });
  } catch (error: any) {
    console.error("Error processing test payment:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to process test payment" 
      },
      { 
        status: error.message === "Order or payment not found" ? 404 : 500 
      },
    );
  }
}

/**
 * GET /api/public/test-payment
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Test payment endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
