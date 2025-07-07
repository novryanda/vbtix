import { NextRequest, NextResponse } from "next/server";
import { handlePaymentCallback } from "~/server/api/checkout";
import { PaymentStatus } from "@prisma/client";

/**
 * POST /api/test/payment-email-flow
 * Test the complete payment callback and email flow
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, testSuccess = true } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    console.log(`🧪 Testing payment email flow for order: ${orderId}`);

    // Simulate payment callback
    const result = await handlePaymentCallback({
      orderId,
      paymentId: `test_payment_${Date.now()}`,
      status: testSuccess ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
      paymentReference: `test_ref_${Date.now()}`,
      callbackPayload: {
        test: true,
        timestamp: new Date().toISOString(),
        success: testSuccess,
      },
    });

    console.log(`✅ Payment callback processed successfully`);
    console.log(`📧 Email should have been sent if payment was successful`);

    return NextResponse.json({
      success: true,
      message: "Payment email flow test completed",
      data: {
        orderId,
        orderStatus: result.order.status,
        paymentStatus: result.payment.status,
        emailSent: testSuccess ? "Should be sent" : "Not sent (payment failed)",
      },
    });
  } catch (error: any) {
    console.error("❌ Payment email flow test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Test failed",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/test/payment-email-flow
 * Get test instructions
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Payment Email Flow Test Endpoint",
    instructions: {
      description: "Test the complete payment callback and email delivery flow",
      usage: {
        method: "POST",
        body: {
          orderId: "string (required) - The order ID to test",
          testSuccess: "boolean (optional) - Whether to simulate successful payment (default: true)",
        },
      },
      example: {
        curl: `curl -X POST http://localhost:3000/api/test/payment-email-flow \\
  -H "Content-Type: application/json" \\
  -d '{"orderId": "your-order-id", "testSuccess": true}'`,
      },
      notes: [
        "This endpoint simulates a payment callback",
        "If testSuccess is true, it will trigger QR code generation and email sending",
        "Check your email configuration in .env file",
        "Monitor console logs for detailed flow information",
      ],
    },
  });
}
