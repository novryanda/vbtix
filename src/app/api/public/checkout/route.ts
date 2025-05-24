import { NextRequest, NextResponse } from "next/server";
import { handleInitiateCheckout } from "~/server/api/checkout";
import { auth } from "~/server/auth";
import { z } from "zod";

// Validation schema for checkout request
const checkoutSchema = z.object({
  orderId: z.string(),
  paymentMethod: z.string(),
  sessionId: z.string().optional(), // For guest access
  paymentMethodDetails: z
    .object({
      bankCode: z.string().optional(),
      type: z.string().optional(),
      redirectUrl: z.string().optional(),
    })
    .optional(),
});

/**
 * POST /api/public/checkout
 * Initiate checkout process (supports guest purchases)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication (optional for guest purchases)
    const session = await auth();

    // Parse request body
    const body = await request.json();
    console.log("Checkout API received:", body);

    // Validate request body first
    const validatedData = checkoutSchema.safeParse(body);

    if (!validatedData.success) {
      console.error("Checkout validation error:", validatedData.error.format());
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: validatedData.error.format(),
        },
        { status: 400 },
      );
    }

    const { orderId, paymentMethod, paymentMethodDetails, sessionId } =
      validatedData.data;

    // For guest users, we need either a session ID or authentication
    if (!session?.user && !sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication or session ID required for checkout",
          message:
            "Please provide a session ID or log in to proceed with checkout",
        },
        { status: 401 },
      );
    }

    // Initiate checkout
    const result = await handleInitiateCheckout({
      orderId,
      userId: session?.user?.id || null,
      sessionId: sessionId || undefined,
      paymentMethod,
      paymentMethodDetails,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl: result.checkoutUrl,
        paymentToken: result.paymentToken,
        paymentInstructions: result.paymentInstructions,
        isTestMode: result.isTestMode,
        gateway: result.gateway,
        order: {
          id: result.order.id,
          invoiceNumber: result.order.invoiceNumber,
          amount: Number(result.order.amount),
          status: result.order.status,
        },
      },
      message: result.isTestMode
        ? "Test checkout initiated successfully. Redirecting to test payment page."
        : "Checkout initiated successfully. Redirecting to payment gateway.",
    });
  } catch (error: any) {
    console.error("Error initiating checkout:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to initiate checkout",
      },
      {
        status:
          error.message === "Order not found"
            ? 404
            : error.message === "Only pending orders can be checked out"
              ? 400
              : 500,
      },
    );
  }
}
