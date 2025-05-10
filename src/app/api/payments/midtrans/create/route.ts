import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { getOrderById } from "~/server/services/order.service";
import { createMidtransPayment } from "~/server/integrations/payment/midtrans";
import { z } from "zod";

// Define validation schema
const createMidtransPaymentSchema = z.object({
  orderId: z.string(),
  customerDetails: z.object({
    firstName: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
});

/**
 * POST /api/payments/midtrans/create
 * Create a Midtrans payment for an order
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

    // Validate input data
    const result = createMidtransPaymentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.errors },
        { status: 400 }
      );
    }

    // Get the order
    const order = await getOrderById(result.data.orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if user owns the order
    if (order.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Create the Midtrans payment
    const paymentResult = await createMidtransPayment(order, result.data.customerDetails);

    if (!paymentResult.success) {
      return NextResponse.json(
        { success: false, error: paymentResult.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        token: paymentResult.token,
        redirectUrl: paymentResult.redirectUrl,
        paymentId: paymentResult.payment?.id,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/payments/midtrans/create:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
