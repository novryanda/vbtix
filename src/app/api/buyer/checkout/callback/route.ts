import { NextRequest, NextResponse } from "next/server";
import { handlePaymentCallback } from "~/server/api/checkout";
import { PaymentStatus } from "@prisma/client";
import { z } from "zod";

// Validation schema for payment callback
const paymentCallbackSchema = z.object({
  orderId: z.string(),
  paymentId: z.string(),
  status: z.nativeEnum(PaymentStatus),
  paymentReference: z.string().optional(),
  callbackPayload: z.any().optional(),
});

/**
 * POST /api/buyer/checkout/callback
 * Process payment callback
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request body
    const validatedData = paymentCallbackSchema.safeParse(body);
    
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

    const { orderId, paymentId, status, paymentReference, callbackPayload } = validatedData.data;

    // Process payment callback
    const result = await handlePaymentCallback({
      orderId,
      paymentId,
      status,
      paymentReference,
      callbackPayload,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: result.order.id,
          status: result.order.status,
        },
        payment: {
          id: result.payment.id,
          status: result.payment.status,
        },
      },
      message: `Payment ${status.toLowerCase()} processed successfully.`,
    });
  } catch (error: any) {
    console.error("Error processing payment callback:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to process payment callback" 
      },
      { 
        status: error.message === "Order or payment not found" ? 404 : 500 
      },
    );
  }
}
