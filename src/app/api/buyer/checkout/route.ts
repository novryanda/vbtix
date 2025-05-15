import { NextRequest, NextResponse } from "next/server";
import { handleInitiateCheckout } from "~/server/api/checkout";
import { auth } from "~/server/auth";
import { z } from "zod";

// Validation schema for checkout request
const checkoutSchema = z.object({
  orderId: z.string(),
  paymentMethod: z.string(),
});

/**
 * POST /api/buyer/checkout
 * Initiate checkout process
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate request body
    const validatedData = checkoutSchema.safeParse(body);
    
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

    const { orderId, paymentMethod } = validatedData.data;

    // Initiate checkout
    const result = await handleInitiateCheckout({
      orderId,
      userId: session.user.id,
      paymentMethod,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl: result.checkoutUrl,
        paymentToken: result.paymentToken,
        order: {
          id: result.order.id,
          invoiceNumber: result.order.invoiceNumber,
          amount: Number(result.order.amount),
          status: result.order.status,
        },
      },
      message: "Checkout initiated successfully. Redirecting to payment gateway.",
    });
  } catch (error: any) {
    console.error("Error initiating checkout:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to initiate checkout" 
      },
      { 
        status: error.message === "Order not found" ? 404 : 
                error.message === "Only pending orders can be checked out" ? 400 : 500 
      },
    );
  }
}
